'use client'

import React from 'react'
import { CheckCircle2, TrendingUp } from 'lucide-react'

const achievements = [
    'Successfully built and trained a ResNet-152 model for pneumonia detection using chest X-rays',
    'Achieved a high validation accuracy of 95.13%, proving model effectiveness',
    'Heatmap visualizations (Grad-CAM) confirm the model focuses correctly on infected lung regions',
    'Demonstrated a reliable and explainable AI system for medical image classification',
    'Current work establishes a strong base for real-time diagnostic applications',
]

const nextSteps = [
    'Integrate AI agents for interactive, explainable, and user-friendly medical assistance',
    'Deploy real-time diagnostic capabilities for clinical environments',
    'Expand dataset with diverse patient populations for improved generalization',
    'Clinical validation and regulatory compliance pathway',
    'Mobile application development for point-of-care diagnostics',
]

export function ResultsSection() {
    return (
        <section className="py-16 md:py-24 relative overflow-hidden" id="results">
            <div className="relative max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Current Results */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-medical/10 border border-medical/30 mb-4">
                            <CheckCircle2 className="w-4 h-4 text-medical" />
                            <span className="text-xs font-medium text-medical">Current Phase Complete</span>
                        </div>
                        
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Proven Results
                        </h2>
                        
                        <p className="text-base md:text-lg text-muted-foreground mb-8 font-light">
                            Our system has demonstrated exceptional performance in pneumonia detection with explainable AI capabilities.
                        </p>

                        <div className="space-y-3">
                            {achievements.map((achievement, index) => (
                                <div
                                    key={index}
                                    className="flex gap-3 p-3 rounded-lg border border-medical/20 bg-medical/5 hover:border-medical/30 transition-colors duration-300"
                                >
                                    <CheckCircle2 className="w-4 h-4 text-medical flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-foreground font-light leading-relaxed">{achievement}</p>
                                </div>
                            ))}
                        </div>

                        {/* Metrics Highlight */}
                        <div className="mt-8 p-6 rounded-xl bg-medical/10 border border-medical/30">
                            <div className="text-center">
                                <div className="text-5xl font-bold text-medical mb-2">95.13%</div>
                                <p className="text-base text-muted-foreground font-medium">Validation Accuracy Achieved</p>
                                <p className="text-xs text-muted-foreground mt-1 font-light">
                                    Exceeding industry standards for medical image classification
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Next Phase */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/10 border border-warning/30 mb-4">
                            <TrendingUp className="w-4 h-4 text-warning" />
                            <span className="text-xs font-medium text-warning">Next Phase</span>
                        </div>
                        
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Future Development
                        </h2>
                        
                        <p className="text-base md:text-lg text-muted-foreground mb-8 font-light">
                            Building upon our strong foundation to create a comprehensive clinical diagnostic platform.
                        </p>

                        <div className="space-y-3">
                            {nextSteps.map((step, index) => (
                                <div
                                    key={index}
                                    className="flex gap-3 p-4 rounded-lg border border-primary/20 bg-muted/20 hover:border-primary/30 transition-colors duration-300"
                                >
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                                        <span className="text-xs font-bold text-primary">{index + 1}</span>
                                    </div>
                                    <p className="text-sm text-foreground font-light leading-relaxed pt-0.5">{step}</p>
                                </div>
                            ))}
                        </div>

                        {/* CTA Box */}
                        <div className="mt-8 p-6 rounded-xl bg-primary/10 border border-primary/30">
                            <h3 className="text-lg font-bold mb-2">Ready to Experience It?</h3>
                            <p className="text-sm text-muted-foreground mb-4 font-light">
                                Try our interactive AI diagnostic assistant and see the technology in action.
                            </p>
                            <a
                                href="/chat"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors duration-300"
                            >
                                Launch Diagnostic Chat
                                <TrendingUp className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

