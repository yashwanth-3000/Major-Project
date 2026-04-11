# -*- coding: utf-8 -*-
"""Yash_Pytorch_Xray_Pneumonia_Detection_project_fixed.py

Pneumonia Detection using Chest X-Ray Images with PyTorch
"""

# ============================================================================
# CONFIGURATION SETTINGS
# ============================================================================
EVALUATE_MODEL = "no"  # Set to "yes" to evaluate model accuracy, "no" to skip
# ============================================================================

# Import packages for project
import os
import torch
import torchvision
import torch.nn as nn
import torch.optim as optim
import torchvision.transforms as transforms
from torch.utils.data import DataLoader
from torchvision import models
import numpy as np
import matplotlib.pyplot as plt
import copy
import time
from PIL import Image as PILImage
import scipy.ndimage as nd
import glob
from skimage.io import imread
from PIL import Image
import itertools
from collections import OrderedDict

print("="*70)
print("PNEUMONIA DETECTION USING CHEST X-RAY IMAGES")
print("="*70)
print("\n[STEP 1] Initializing dataset paths and transforms...")

# --- Dataset creation ---
# Set base path relative to current directory
base_path = os.path.join(os.path.dirname(__file__), "chest_xray")
categories = ['train', 'val', 'test']
print(f"Base dataset path: {base_path}")

# Define transforms for data augmentation
print("Setting up data augmentation transforms...")
transformers = {
    'train': transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(20),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
    ]),
    'val': transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
    ]),
    'test': transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
    ]),
}
print("Transforms configured successfully!")

# Create datasets
print("\n[STEP 2] Loading datasets...")
dset = {}
for c in categories:
    folder = os.path.join(base_path, c)
    if not os.path.exists(folder):
        print(f"WARNING: folder not found: {folder}")
        continue
    print(f"Loading {c} dataset from: {folder}")
    dset[c] = torchvision.datasets.ImageFolder(folder, transform=transformers[c])
    print(f"  -> Loaded {len(dset[c])} images from {c}")

if 'train' in dset:
    print(f'\nDataset classes found: {dset["train"].classes}')
else:
    print("WARNING: No training dataset found!")

# Calculate dataset sizes
dataset_sizes = {x: len(dset[x]) for x in categories if x in dset}

print("\nDataset sizes:")
for x in categories:
    if x in dataset_sizes:
        print(f'  {x}: {dataset_sizes[x]} images')

# --- DataLoaders ---
print("\n[STEP 3] Setting up device and data loaders...")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")
if device.type == 'cuda':
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    print(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")

num_workers = 0  # Set to 0 for Windows/Mac compatibility, use 4+ for Linux
pin_memory = True if device.type == 'cuda' else False

print("Creating data loaders...")
dataloaders = {
    x: DataLoader(dset[x], batch_size=32, shuffle=(x == 'train'), 
                 num_workers=num_workers, pin_memory=pin_memory)
    for x in ['train', 'val', 'test'] if x in dset
}
print(f'Data loaders created for: {list(dataloaders.keys())}')
for x in dataloaders:
    print(f"  {x}: {len(dataloaders[x])} batches (batch size: 32)")

# --- Build Model ---
class Model(nn.Module):
    def __init__(self, num_classes=2):
        super(Model, self).__init__()
        # Use ResNet-152 with pretrained weights
        self.model = models.resnet152(weights='DEFAULT')  # Use 'weights' instead of deprecated 'pretrained'
        # Freeze all parameters except the final layer
        for params in self.model.parameters():
            params.requires_grad = False
        # Replace the final classifier
        num_features = self.model.fc.in_features
        self.model.fc = nn.Sequential(
            nn.Linear(num_features, num_classes),
            nn.LogSoftmax(dim=1)
        )

    def forward(self, x):
        return self.model(x)

    def fit(self, dataloaders, num_epochs, device=None):
        if device is None:
            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        print(f"\nMoving model to {device}...")
        self.model = self.model.to(device)
        optimizer = optim.Adam(self.model.fc.parameters(), lr=0.001)
        scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=4, gamma=0.1)
        criterion = nn.NLLLoss()
        print(f"Optimizer: Adam (lr=0.001)")
        print(f"Loss function: NLLLoss")
        since = time.time()

        best_model_wts = copy.deepcopy(self.model.state_dict())
        best_acc = 0.0
        
        print(f"\nStarting training for {num_epochs} epoch(s)...")
        for epoch in range(1, num_epochs + 1):
            print(f"\n{'='*60}")
            print(f"EPOCH {epoch}/{num_epochs}")
            print(f"{'='*60}")

            for phase in ['train', 'val']:
                if phase not in dataloaders:
                    print(f"Skipping {phase} phase (no data loader)")
                    continue
                    
                if phase == 'train':
                    self.model.train()
                    print(f"\n[TRAINING PHASE]")
                else:
                    self.model.eval()
                    print(f"\n[VALIDATION PHASE]")

                running_loss = 0.0
                running_corrects = 0
                batch_count = 0
                total_batches = len(dataloaders[phase])

                for batch_idx, (inputs, labels) in enumerate(dataloaders[phase]):
                    inputs = inputs.to(device)
                    labels = labels.to(device)
                    
                    optimizer.zero_grad()

                    with torch.set_grad_enabled(phase == 'train'):
                        outputs = self.model(inputs)
                        _, preds = torch.max(outputs, 1)
                        loss = criterion(outputs, labels)

                        if phase == 'train':
                            loss.backward()
                            optimizer.step()
                            # Call scheduler.step() after optimizer.step() to avoid warning
                            if batch_idx == 0:  # Only step scheduler once per epoch
                                scheduler.step()

                    running_loss += loss.item() * inputs.size(0)
                    running_corrects += torch.sum(preds == labels.data)
                    batch_count += 1
                    
                    # Print progress every 10 batches
                    if (batch_idx + 1) % 10 == 0 or (batch_idx + 1) == total_batches:
                        print(f"  Batch {batch_idx + 1}/{total_batches} - Loss: {loss.item():.4f} - Progress: {100*(batch_idx+1)/total_batches:.1f}%")

                epoch_loss = running_loss / dataset_sizes[phase]
                epoch_acc = running_corrects.double() / dataset_sizes[phase]
                print(f"\n{phase.upper()} Results:")
                print(f"  Loss: {epoch_loss:.4f}")
                print(f"  Accuracy: {epoch_acc:.4f} ({epoch_acc*100:.2f}%)")
                print(f"  Correct: {running_corrects.item()}/{dataset_sizes[phase]}")

                if phase == 'val' and epoch_acc > best_acc:
                    best_acc = epoch_acc
                    best_model_wts = copy.deepcopy(self.model.state_dict())
                    print(f"  -> New best validation accuracy! Saving model weights...")

        time_elapsed = time.time() - since
        print(f"\n{'='*60}")
        print(f"Training completed!")
        print(f"Total time: {time_elapsed // 60:.0f}m {time_elapsed % 60:.0f}s")
        print(f"Best validation accuracy: {best_acc:.4f} ({best_acc*100:.2f}%)")
        print(f"{'='*60}")

        self.model.load_state_dict(best_model_wts)
        return self  # Return self (Model instance) instead of just the model

# --- Model creation or loading ---
print("\n[STEP 4] Setting up model...")
model_save_dir = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(model_save_dir, exist_ok=True)
model_save_path = os.path.join(model_save_dir, "best_pneumonia_model.pth")

# Check if model already exists - ALWAYS USE SAVED MODEL IF AVAILABLE
if os.path.exists(model_save_path):
    print(f"\n[INFO] ✓ Found existing trained model at: {model_save_path}")
    print("[INFO] Loading pre-trained model (skipping training)...")
    
    num_classes = len(dset['train'].classes) if 'train' in dset else 2
    print(f"Initializing model architecture with {num_classes} classes...")
    model = Model(num_classes=num_classes)
    model.model = model.model.to(device)
    
    # Load the saved model
    print("Loading model weights...")
    state = torch.load(model_save_path, map_location=device)
    # If saved from DataParallel the keys may start with 'module.'
    if any(k.startswith('module.') for k in state.keys()):
        print("Removing 'module.' prefix from state dict keys...")
        new_state = OrderedDict()
        for k, v in state.items():
            new_state[k.replace('module.', '')] = v
        state = new_state
    
    try:
        model.model.load_state_dict(state, strict=False)
        print("✓ Model loaded successfully from saved checkpoint!")
        model_ft = model
        print(f"[INFO] Using pre-trained model with {sum(p.numel() for p in model_ft.model.parameters())} parameters")
    except Exception as e:
        print(f"⚠ Warning: Failed to load full state_dict: {e}")
        print("Training new model instead...")
        model_ft = model.fit(dataloaders, num_epochs=20, device=device)
        torch.save(model_ft.model.state_dict(), model_save_path)
        print(f'✓ New model saved to {model_save_path}')
else:
    print(f"\n[INFO] No existing model found. Training new model...")
    print(f"Model will be saved to: {model_save_path}")
    
    num_classes = len(dset['train'].classes) if 'train' in dset else 2
    print(f"Number of classes: {num_classes}")
    print("Initializing ResNet-152 model with pretrained weights...")
    model = Model(num_classes=num_classes)
    print("Model architecture created successfully!")
    
    model_ft = model.fit(dataloaders, num_epochs=20, device=device)

    # Save the trained model
    print(f"\n[STEP 5] Saving trained model...")
    torch.save(model_ft.model.state_dict(), model_save_path)  # Save the ResNet model's state dict
    print(f'✓ Model saved successfully to {model_save_path}')

# Image loader for predictions
loader = transforms.Compose([
    transforms.Resize((224, 224)), 
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

def image_loader(image_name):
    image = PILImage.open(image_name).convert("RGB")
    image = loader(image).float()
    image = image.unsqueeze(0)
    return image

# --- Check accuracy ---
def check_accuracy(loader, model, device):
    num_correct = 0
    num_samples = 0
    model.eval()
    total_batches = len(loader)
    processed_batches = 0

    print(f"  Processing {total_batches} batches...")
    with torch.no_grad():
        for batch_idx, (x, y) in enumerate(loader):
            x = x.to(device)
            y = y.to(device)
            scores = model(x)
            _, predictions = scores.max(1)
            num_correct += (predictions == y).sum().item()
            num_samples += predictions.size(0)
            processed_batches += 1
            
            # Print progress every 20 batches
            if (batch_idx + 1) % 20 == 0 or (batch_idx + 1) == total_batches:
                current_acc = float(num_correct) / float(num_samples) * 100
                print(f"    Progress: {batch_idx + 1}/{total_batches} batches - Current accuracy: {current_acc:.2f}%")
        
        accuracy = float(num_correct) / float(num_samples) * 100
        print(f'\n  Final Results:')
        print(f'    Correct predictions: {num_correct} / {num_samples}')
        print(f'    Accuracy: {accuracy:.2f}%')
    model.train()
    return accuracy

# --- Check accuracy on train and test sets ---
model_ft.eval()

if EVALUATE_MODEL.lower() == "yes":
    print("\n[STEP 6] Evaluating model accuracy...")
    print("Model set to evaluation mode")

    if 'train' in dataloaders:
        print("\nEvaluating on training set...")
        check_accuracy(dataloaders['train'], model_ft, device)
    if 'test' in dataloaders:
        print("\nEvaluating on test set...")
        check_accuracy(dataloaders['test'], model_ft, device)
else:
    print("\n[STEP 6] Evaluation skipped (EVALUATE_MODEL = 'no')")
    print("Set EVALUATE_MODEL = 'yes' at the top of the file to enable evaluation")

# --- Improved Grad-CAM Implementation (more accurate localization) ---
class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        self.hooks = []
        
        # Register hooks
        self.hook_layers()
    
    def hook_layers(self):
        def backward_hook(module, grad_in, grad_out):
            # grad_out is a tuple, take the first element
            if grad_out[0] is not None:
                self.gradients = grad_out[0].detach()
        
        def forward_hook(module, input, output):
            self.activations = output.detach()
        
        self.hooks.append(self.target_layer.register_forward_hook(forward_hook))
        self.hooks.append(self.target_layer.register_full_backward_hook(backward_hook))
    
    def generate_cam(self, input_image, target_class=None):
        # Forward pass
        output = self.model(input_image)
        
        if target_class is None:
            target_class = output.argmax(dim=1).item()
        else:
            target_class = int(target_class)
        
        # Backward pass to get gradients
        self.model.zero_grad()
        
        # Get the score for the target class
        score = output[0, target_class]
        score.backward(retain_graph=True)
        
        # Get gradients and activations
        if self.gradients is None or self.activations is None:
            raise RuntimeError("Failed to capture gradients or activations")
        
        gradients = self.gradients  # Shape: [batch, channels, height, width]
        activations = self.activations  # Shape: [batch, channels, height, width]
        
        # Remove batch dimension
        gradients = gradients[0].cpu().numpy()  # [C, H, W]
        activations = activations[0].cpu().numpy()  # [C, H, W]
        
        # Compute weights: global average pooling of gradients (Grad-CAM formula)
        # Take mean over height and width dimensions
        weights = np.mean(gradients, axis=(1, 2))  # [C]
        
        # Weighted combination of activation maps
        cam = np.zeros(activations.shape[1:], dtype=np.float32)  # [H, W]
        for i, w in enumerate(weights):
            cam += w * activations[i, :, :]
        
        # Apply ReLU (only positive contributions)
        cam = np.maximum(cam, 0)
        
        # Normalize to [0, 1] for better visualization
        cam_min = np.min(cam)
        cam_max = np.max(cam)
        if cam_max > cam_min:
            cam = (cam - cam_min) / (cam_max - cam_min)
        else:
            cam = np.zeros_like(cam)
        
        return cam, output
    
    def remove_hooks(self):
        for hook in self.hooks:
            hook.remove()

# --- predict_img with Grad-CAM (more accurate localization) ---
def predict_img(path, model_ft, image_loader_func=None, mean=None, std=None):
    """Return (original_img, class_activation (H,W) aligned to original, pred (int), confidence)."""
    if image_loader_func is None:
        image_loader_func = image_loader

    device = next(model_ft.parameters()).device

    # Load original image first to preserve dimensions
    original_img = imread(path)
    original_h, original_w = original_img.shape[:2]

    # Load image tensor and move to device
    img_tensor = image_loader_func(path).to(device)
    img_tensor.requires_grad = True  # Need gradients for Grad-CAM

    # Get the ResNet model
    resnet_model = model_ft.model if hasattr(model_ft, 'model') else model_ft
    
    # Get the last convolutional layer (layer4)
    if not hasattr(resnet_model, 'layer4'):
        raise RuntimeError("Model does not have layer4 attribute")
    
    target_layer = resnet_model.layer4
    
    # Create Grad-CAM
    grad_cam = GradCAM(model_ft, target_layer)
    
    try:
        # Need to enable gradients - but use eval mode for batch norm consistency
        model_ft.eval()
        
        # Forward pass with gradients enabled
        logps = model_ft(img_tensor)
        ps = torch.exp(logps)

        pred = int(ps.argmax(dim=1).cpu().item())
        confidence = ps.max().item() * 100

        # Generate Grad-CAM
        cam, _ = grad_cam.generate_cam(img_tensor, target_class=pred)
        
        # cam is now (H, W) in feature map size
        feat_h, feat_w = cam.shape
        
        # Resize CAM to match original image dimensions using better interpolation
        zoom_factor_h = original_h / feat_h
        zoom_factor_w = original_w / feat_w
        class_activation = nd.zoom(cam, (zoom_factor_h, zoom_factor_w), order=2)
        
        # Ensure exact match
        if class_activation.shape[0] != original_h or class_activation.shape[1] != original_w:
            class_activation = nd.zoom(class_activation, 
                                      (original_h / class_activation.shape[0], 
                                       original_w / class_activation.shape[1]), 
                                      order=1)

        # Return original image (as numpy array for compatibility)
        if len(original_img.shape) == 2:  # Grayscale
            original_img_rgb = np.stack([original_img] * 3, axis=-1)
        else:
            original_img_rgb = original_img

        return original_img_rgb, class_activation, pred, confidence
    finally:
        grad_cam.remove_hooks()
        img_tensor.requires_grad = False

# --- Load test images ---
print("\n[STEP 7] Loading test images for prediction...")
test_dir = os.path.join(os.path.dirname(__file__), "Data_sample")
image_list = []
if os.path.exists(test_dir):
    print(f"Searching for images in: {test_dir}")
    for filename in glob.glob(os.path.join(test_dir, '*.jpeg')):
        image_list.append(filename)
    print(f"✓ Found {len(image_list)} test images")
else:
    print(f"⚠ Test directory not found: {test_dir}")

# --- Plot input images with predictions side by side ---
def plot_input_with_predictions(image_list, model_ft, max_images=16, output_dir=None):
    if len(image_list) == 0:
        print("No images to plot")
        return
    
    n_images = min(len(image_list), max_images)
    print(f"Creating grid with {n_images} image pairs (original | prediction)...")
    
    # Each row has 2 columns: original and prediction
    cols = 2
    rows = n_images
    fig, axes = plt.subplots(rows, cols, figsize=(12, 6 * rows))
    
    if rows == 1:
        axes = axes.reshape(1, -1)
    
    for i in range(n_images):
        try:
            img_path = image_list[i]
            name = os.path.basename(img_path).split(".")[0]
            
            # Left side: Original image
            try:
                original_img = imread(img_path)
                axes[i, 0].imshow(original_img, cmap='gray')
                axes[i, 0].set_title(f"Original: {name}", fontsize=10)
                axes[i, 0].axis('off')
            except Exception as e:
                axes[i, 0].text(0.5, 0.5, f"Error loading\n{name}", 
                              ha='center', va='center')
                axes[i, 0].axis('off')
            
            # Right side: Prediction with CAM
            try:
                original_img_cam, class_activation, pred, confidence = predict_img(img_path, model_ft)
                pred_int = int(pred)
                
                # Normalize CAM using percentile-based normalization for better visualization
                cam = class_activation.astype(np.float32)
                
                # Remove bottom 5% and top 95% to focus on meaningful activations
                cam_min = np.percentile(cam, 5)
                cam_max = np.percentile(cam, 95)
                
                if cam_max - cam_min > 1e-6:
                    cam_norm = np.clip((cam - cam_min) / (cam_max - cam_min), 0, 1)
                else:
                    cam_norm = np.zeros_like(cam)
                
                # Use 'hot' or 'jet' colormap for better visibility
                # Ensure original image is grayscale for X-ray
                if len(original_img_cam.shape) == 3 and original_img_cam.shape[2] == 3:
                    # If RGB, convert to grayscale for display
                    axes[i, 1].imshow(original_img_cam[:, :, 0], cmap='gray')
                else:
                    axes[i, 1].imshow(original_img_cam, cmap='gray')
                
                # Overlay CAM with better blending
                axes[i, 1].imshow(cam_norm, cmap='jet', alpha=0.5, interpolation='bilinear')
                
                # Get class name
                classes = dset.get('test', {}).classes if 'test' in dset else dset.get('train', {}).classes if 'train' in dset else None
                try:
                    class_name = classes[pred_int] if classes is not None and pred_int < len(classes) else f"Class {pred_int}"
                except Exception:
                    class_name = f"Class {pred_int}"
                
                axes[i, 1].set_title(f"Prediction: {class_name} ({confidence:.1f}%)", fontsize=10)
                axes[i, 1].axis('off')
                
                if (i + 1) % 5 == 0:
                    print(f"  Processed {i + 1}/{n_images} images...")
                    
            except Exception as e:
                axes[i, 1].text(0.5, 0.5, f"Error predicting\n{name}\n{str(e)[:30]}", 
                              ha='center', va='center', fontsize=8)
                axes[i, 1].axis('off')
                print(f"  Error processing {name}: {e}")
        
        except Exception as e:
            print(f"Error with image {i}: {e}")
            axes[i, 0].axis('off')
            axes[i, 1].axis('off')
    
    plt.tight_layout()
    
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, "original_vs_predictions_grid.png")
        plt.savefig(output_path, dpi=150, bbox_inches='tight')
        print(f"✓ Combined grid saved to: {output_path}")
        plt.close(fig)
    else:
        plt.show()
        print("✓ Images plotted successfully")

if len(image_list) > 0:
    # Create output directory first
    output_dir = os.path.join(os.path.dirname(__file__), "predictions_output")
    os.makedirs(output_dir, exist_ok=True)
    print("\n[STEP 7.5] Creating combined grid (original | prediction)...")
    plot_input_with_predictions(image_list, model_ft, max_images=len(image_list), output_dir=output_dir)

# --- predict_image (improved) - saves to file instead of showing ---
def predict_image(image_path, model_ft, output_dir):
    print(f"\n  Processing: {os.path.basename(image_path)}")
    original_img, class_activation, pred, confidence = predict_img(image_path, model_ft)
    pred_int = int(pred)

    # Normalize CAM using percentile-based normalization for better visualization
    cam = class_activation.astype(np.float32)
    
    # Use percentile normalization to remove outliers
    cam_min = np.percentile(cam, 5)
    cam_max = np.percentile(cam, 95)
    
    if cam_max - cam_min > 1e-6:
        cam_norm = np.clip((cam - cam_min) / (cam_max - cam_min), 0, 1)
    else:
        cam_norm = np.zeros_like(cam)

    # Create figure and save instead of showing
    fig, ax = plt.subplots(figsize=(6, 6))
    
    # Display original image (grayscale for X-ray)
    if len(original_img.shape) == 3 and original_img.shape[2] == 3:
        ax.imshow(original_img[:, :, 0], cmap='gray')
    else:
        ax.imshow(original_img, cmap='gray')
    
    # Overlay CAM with better blending
    ax.imshow(cam_norm, cmap='jet', alpha=0.5, interpolation='bilinear')
    
    # Get class name safely
    classes = dset.get('test', {}).classes if 'test' in dset else dset.get('train', {}).classes if 'train' in dset else None
    try:
        class_name = classes[pred_int] if classes is not None and pred_int < len(classes) else f"Class {pred_int}"
    except Exception:
        class_name = f"Class {pred_int}"
    
    ax.set_title(f"Prediction: {class_name} ({confidence:.1f}%)")
    ax.axis('off')
    plt.tight_layout()
    
    # Save the image
    output_filename = os.path.basename(image_path).replace('.jpeg', '_prediction.png').replace('.jpg', '_prediction.png')
    output_path = os.path.join(output_dir, output_filename)
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    plt.close(fig)  # Close figure to free memory

    print(f"    ✓ Prediction: {class_name} ({confidence:.1f}%)")
    print(f"    ✓ Saved to: {output_path}")
    return pred_int

# Predict on test images if available (individual files)
if len(image_list) > 0:
    print(f"\n[STEP 8] Saving individual prediction images...")
    
    # Create output directory for saving predictions
    output_dir = os.path.join(os.path.dirname(__file__), "predictions_output")
    os.makedirs(output_dir, exist_ok=True)
    
    # Process all images for individual files
    num_images = len(image_list)
    print(f"Processing {num_images} images for individual prediction files...")
    
    for idx, img_path in enumerate(image_list, 1):
        if idx % 5 == 0 or idx == num_images:
            print(f"  Progress: {idx}/{num_images} images processed...")
        try:
            pred = predict_image(img_path, model_ft, output_dir)
        except Exception as e:
            print(f"  ✗ Error predicting on {os.path.basename(img_path)}: {e}")
            import traceback
            traceback.print_exc()
    print(f"\n✓ All individual predictions saved to: {output_dir}")
else:
    print("\n[STEP 8] Skipped - No test images found")

# --- Confusion Matrix ---
def plot_confusion_matrix(cm, classes, title='Confusion matrix', cmap=plt.cm.Blues):
    plt.imshow(cm, interpolation='nearest', cmap=cmap)
    plt.title(title)
    plt.colorbar()
    tick_marks = np.arange(len(classes))
    plt.xticks(tick_marks, classes, rotation=45)
    plt.yticks(tick_marks, classes)

    fmt = '.0f'
    thresh = cm.max() / 2.
    for i, j in itertools.product(range(cm.shape[0]), range(cm.shape[1])):
        plt.text(j, i, format(cm[i, j], fmt), 
                horizontalalignment="center", 
                color="white" if cm[i, j] > thresh else "black")

    plt.tight_layout()
    plt.ylabel('True label')
    plt.xlabel('Predicted label')
    plt.show()

# Example usage (uncomment to generate confusion matrix):
# from sklearn.metrics import confusion_matrix
# y_true = []
# y_pred = []
# model.eval()
# with torch.no_grad():
#     for inputs, labels in dataloaders['test']:
#         inputs = inputs.to(device)
#         outputs = model(inputs)
#         _, preds = torch.max(outputs, 1)
#         y_true.extend(labels.cpu().numpy())
#         y_pred.extend(preds.cpu().numpy())
# 
# cm = confusion_matrix(y_true, y_pred)
# classes = dset['test'].classes if 'test' in dset else ['NORMAL', 'PNEUMONIA']
# plot_confusion_matrix(cm, classes)

print("\n" + "="*70)
print("CODE EXECUTION COMPLETED SUCCESSFULLY!")
print("="*70)
print("\nSummary:")
print(f"  - Model saved at: {model_save_path}")
print(f"  - Device used: {device}")
if 'train' in dset:
    print(f"  - Classes: {dset['train'].classes}")
if len(image_list) > 0:
    print(f"  - Test images processed: {len(image_list)}")
print("\n" + "="*70)
