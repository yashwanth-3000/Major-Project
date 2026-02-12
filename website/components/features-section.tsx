'use client'

import React from 'react'
import { Brain, Eye, Network, Sparkles } from 'lucide-react'

const features = [
    {
        icon: Network,
        title: 'ResNet-152 Architecture',
        description: 'Deep CNN with skip connections preventing vanishing gradient problems in very deep networks, ensuring robust feature extraction.',
    },
    {
        icon: Brain,
        title: 'Global Average Pooling',
        description: 'Reduces parameters to zero while preserving spatial information, avoiding overfitting and maintaining model performance.',
    },
    {
        icon: Eye,
        title: 'Grad-CAM Visualization',
        description: 'Global Max Pooling enables class activation mapping to highlight discriminative regions and explain model decisions.',
    },
    {
        icon: Sparkles,
        title: 'GenAI Integration',
        description: 'Generative AI provides detailed, user-friendly explanations making results accessible to clinicians and patients.',
    },
]

export function FeaturesSection() {
    return (
        <section className="py-16 md:py-24 relative overflow-hidden" id="methodology">
            <div className="relative max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Advanced Methodology
                    </h2>
                    <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto font-light">
                        Combining state-of-the-art deep learning with explainable AI for reliable medical diagnostics
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-xl border border-primary/20 bg-muted/20 hover:border-primary/30 transition-colors duration-300"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                                    <feature.icon className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed font-light">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Technical Details */}
                <div className="mt-16 p-8 rounded-2xl border border-primary/20 bg-muted/20">
                    <h3 className="text-xl font-bold mb-6 text-center">Technical Implementation</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h4 className="text-base font-semibold text-primary">Architecture Details</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span className="font-light">Pretrained ResNet-152 with residual blocks</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span className="font-light">Skip connections for gradient flow</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span className="font-light">Global Average Pooling layer replacement</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span className="font-light">Global Max Pooling for CAM generation</span>
                                </li>
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-base font-semibold text-medical">AI Integration</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="text-medical mt-0.5">•</span>
                                    <span className="font-light">Grad-CAM heatmap generation</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-medical mt-0.5">•</span>
                                    <span className="font-light">GenAI natural language explanations</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-medical mt-0.5">•</span>
                                    <span className="font-light">Clinical decision support system</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-medical mt-0.5">•</span>
                                    <span className="font-light">Real-world deployment readiness</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

