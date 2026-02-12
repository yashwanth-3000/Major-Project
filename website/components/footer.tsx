import React from 'react'
import Link from 'next/link'

export function Footer() {
    return (
        <footer className="border-t border-border/50 bg-muted/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="font-bold text-lg mb-4">About the Project</h3>
                        <p className="text-sm text-muted-foreground font-light leading-relaxed">
                            College major project focused on enhancing diagnostic interpretability with GenAI and ResNet-152 for accurate pneumonia detection.
                        </p>
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors font-light">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="#methodology" className="text-muted-foreground hover:text-primary transition-colors font-light">
                                    Methodology
                                </Link>
                            </li>
                            <li>
                                <Link href="#results" className="text-muted-foreground hover:text-primary transition-colors font-light">
                                    Results
                                </Link>
                            </li>
                            <li>
                                <Link href="/chat" className="text-muted-foreground hover:text-primary transition-colors font-light">
                                    Try Demo
                                </Link>
                            </li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-lg mb-4">Technology</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground font-light">
                            <li>• ResNet-152 Deep Learning</li>
                            <li>• Global Average Pooling</li>
                            <li>• Grad-CAM Visualization</li>
                            <li>• Generative AI Integration</li>
                        </ul>
                    </div>
                </div>
                
                <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground font-light">
                    <p>AI-Powered Pneumonia Detection System • College Major Project • {new Date().getFullYear()}</p>
                </div>
            </div>
        </footer>
    )
}

