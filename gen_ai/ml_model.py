"""ML inference wrapper – ResNet-152 + Grad-CAM for pneumonia detection.

The model is lazily loaded on the first call to ``run_inference()``.
If PyTorch is not installed, ``TORCH_AVAILABLE`` is ``False`` and the
rest of the pipeline falls back to Vision-only mode.
"""

from __future__ import annotations

import base64
import io
import os

import numpy as np

try:
    import torch
    import torch.nn as nn
    from PIL import Image as PILImage
    from torchvision import models, transforms

    _weights_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "models", "best_pneumonia_model.pth"
    )
    TORCH_AVAILABLE = os.path.exists(_weights_path)
except ImportError:
    TORCH_AVAILABLE = False

_model = None
_device = None


# ------------------------------------------------------------------
# Model loading (singleton)
# ------------------------------------------------------------------

def _get_model():
    global _model, _device
    if _model is not None:
        return _model, _device

    from collections import OrderedDict

    device = torch.device("cpu")

    class _PneumoniaNet(nn.Module):
        def __init__(self):
            super().__init__()
            self.model = models.resnet152(weights=None)
            n = self.model.fc.in_features
            self.model.fc = nn.Sequential(nn.Linear(n, 2), nn.LogSoftmax(dim=1))

        def forward(self, x):
            return self.model(x)

    weights_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "models", "best_pneumonia_model.pth"
    )
    if not os.path.exists(weights_path):
        raise FileNotFoundError(f"Model weights not found at {weights_path}")

    net = _PneumoniaNet()
    state = torch.load(weights_path, map_location=device, weights_only=True)
    if any(k.startswith("module.") for k in state):
        state = OrderedDict((k.replace("module.", ""), v) for k, v in state.items())
    net.model.load_state_dict(state, strict=False)
    net.eval().to(device)

    _model, _device = net, device
    return _model, _device


# ------------------------------------------------------------------
# Grad-CAM
# ------------------------------------------------------------------

class _GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.gradients = self.activations = None
        self._hooks = [
            target_layer.register_forward_hook(self._fwd),
            target_layer.register_full_backward_hook(self._bwd),
        ]

    def _fwd(self, _m, _i, out):
        self.activations = out.detach()

    def _bwd(self, _m, _gi, go):
        if go[0] is not None:
            self.gradients = go[0].detach()

    def generate(self, tensor, target_class=None):
        output = self.model(tensor)
        if target_class is None:
            target_class = output.argmax(dim=1).item()
        self.model.zero_grad()
        output[0, target_class].backward(retain_graph=True)

        grads = self.gradients[0].cpu().numpy()
        acts = self.activations[0].cpu().numpy()
        weights = np.mean(grads, axis=(1, 2))

        cam = sum(w * acts[i] for i, w in enumerate(weights))
        cam = np.maximum(cam, 0).astype(np.float32)
        lo, hi = cam.min(), cam.max()
        return (cam - lo) / max(hi - lo, 1e-8), output

    def remove(self):
        for h in self._hooks:
            h.remove()


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

_REGIONS = [
    ("right upper lobe", (slice(None, None), slice(None, None))),
    ("right middle lobe", (slice(None, None), slice(None, None))),
    ("right lower lobe", (slice(None, None), slice(None, None))),
    ("left upper lobe", (slice(None, None), slice(None, None))),
    ("left middle lobe", (slice(None, None), slice(None, None))),
    ("left lower lobe", (slice(None, None), slice(None, None))),
]


def _region_activations(cam: np.ndarray) -> dict[str, float]:
    h, w = cam.shape
    h3, w2 = h // 3, w // 2
    return {
        "right upper lobe": round(float(cam[:h3, :w2].mean()) * 100, 1),
        "right middle lobe": round(float(cam[h3: 2 * h3, :w2].mean()) * 100, 1),
        "right lower lobe": round(float(cam[2 * h3:, :w2].mean()) * 100, 1),
        "left upper lobe": round(float(cam[:h3, w2:].mean()) * 100, 1),
        "left middle lobe": round(float(cam[h3: 2 * h3, w2:].mean()) * 100, 1),
        "left lower lobe": round(float(cam[2 * h3:, w2:].mean()) * 100, 1),
    }


def _heatmap_b64(original: np.ndarray, cam: np.ndarray) -> str:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots(figsize=(5, 5), dpi=150)
    gray = original[:, :, 0] if original.ndim == 3 else original
    ax.imshow(gray, cmap="gray")
    p5, p95 = np.percentile(cam, 5), np.percentile(cam, 95)
    norm = np.clip((cam - p5) / max(p95 - p5, 1e-6), 0, 1)
    ax.imshow(norm, cmap="jet", alpha=0.45, interpolation="bilinear")
    ax.axis("off")
    plt.tight_layout(pad=0)

    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight", pad_inches=0)
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode()


# ------------------------------------------------------------------
# Public API
# ------------------------------------------------------------------

def run_inference(image_bytes: bytes) -> dict:
    """Run ResNet-152 + Grad-CAM on a chest X-ray.

    Returns
    -------
    dict
        classification, confidence, hotspot_regions,
        hotspot_description, heatmap_base64
    """
    if not TORCH_AVAILABLE:
        raise ImportError("PyTorch is not installed")

    model, device = _get_model()

    img = PILImage.open(io.BytesIO(image_bytes)).convert("RGB")
    original = np.array(img)
    oh, ow = original.shape[:2]

    xform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.5] * 3, [0.5] * 3),
    ])
    tensor = xform(img).unsqueeze(0).to(device)
    tensor.requires_grad = True

    resnet = model.model if hasattr(model, "model") else model
    gcam = _GradCAM(model, resnet.layer4)

    try:
        ps = torch.exp(model(tensor))
        pred = int(ps.argmax(dim=1).item())
        conf = float(ps.max().item()) * 100

        cam, _ = gcam.generate(tensor, target_class=pred)

        cam_pil = PILImage.fromarray((cam * 255).astype(np.uint8), "L")
        cam_full = np.array(cam_pil.resize((ow, oh), PILImage.BILINEAR)).astype(np.float32) / 255.0

        label = "PNEUMONIA" if pred == 1 else "NORMAL"
        regions = _region_activations(cam_full)
        top = sorted(regions.items(), key=lambda x: x[1], reverse=True)
        parts = [f"{k} ({v}%)" for k, v in top if v > 15]
        desc = f"Primary hotspot regions: {', '.join(parts[:4])}" if parts else "No significant hotspot activation"

        return {
            "classification": label,
            "confidence": round(conf, 1),
            "hotspot_regions": regions,
            "hotspot_description": desc,
            "heatmap_base64": _heatmap_b64(original, cam_full),
        }
    finally:
        gcam.remove()
        tensor.requires_grad = False
