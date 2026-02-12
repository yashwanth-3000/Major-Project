'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, Send, Image as ImageIcon, FileText, Zap, Brain, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

type Message = {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

export default function ChatPage() {
    const { theme, toggleTheme, mounted } = useTheme()
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I\'m your AI diagnostic assistant powered by ResNet-152 and GenAI. I can help analyze chest X-rays for pneumonia detection with 95.13% accuracy. Upload an X-ray image or ask me about the diagnostic process.',
            timestamp: new Date(),
        },
    ])
    const [input, setInput] = useState('')
    const [isUploading, setIsUploading] = useState(false)

    const handleSend = () => {
        if (!input.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput('')

        // Simulate AI response
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'I\'m a demonstration interface. In the full system, I would analyze your query using our trained ResNet-152 model and provide detailed explanations using GenAI. The actual implementation will connect to our backend API for real-time diagnostics.',
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, aiResponse])
        }, 1000)
    }

    const handleImageUpload = () => {
        setIsUploading(true)
        // Simulate upload
        setTimeout(() => {
            const uploadMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: '🔬 Image analysis in progress...\n\n**Preliminary Results:**\n• Image quality: Excellent\n• Detection confidence: 92.3%\n• Classification: Pneumonia detected\n• Affected region: Right lower lobe\n\n**Grad-CAM Visualization:** Heatmap shows focused attention on the infected region, confirming model decision-making transparency.\n\n**Recommendation:** Consult with a healthcare professional for detailed evaluation and treatment planning.',
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, uploadMessage])
            setIsUploading(false)
        }, 2500)
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-lg">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="text-sm font-medium">Back to Home</span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-3">
                            {mounted && (
                                <button
                                    onClick={toggleTheme}
                                    aria-label="Toggle theme"
                                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                                >
                                    {theme === 'dark' ? (
                                        <Sun className="w-5 h-5 text-foreground" />
                                    ) : (
                                        <Moon className="w-5 h-5 text-foreground" />
                                    )}
                                </button>
                            )}
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-medical/10 border border-medical/30">
                                <div className="w-2 h-2 rounded-full bg-medical animate-pulse" />
                                <span className="text-xs font-medium text-medical">AI Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Chat Area */}
            <main className="flex-1 overflow-hidden flex flex-col max-w-6xl w-full mx-auto">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 space-y-6">
                    {messages.map((message, index) => (
                        <div
                            key={message.id}
                            className={cn(
                                'flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500',
                                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                            )}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Avatar */}
                            <div
                                className={cn(
                                    'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
                                    message.role === 'assistant'
                                        ? 'bg-gradient-to-br from-primary/20 to-medical/20 border border-primary/30'
                                        : 'bg-gradient-to-br from-muted to-muted/50 border border-border'
                                )}
                            >
                                {message.role === 'assistant' ? (
                                    <Brain className="w-5 h-5 text-primary" />
                                ) : (
                                    <span className="text-sm font-semibold">You</span>
                                )}
                            </div>

                            {/* Message Bubble */}
                            <div
                                className={cn(
                                    'flex-1 max-w-2xl',
                                    message.role === 'user' ? 'flex justify-end' : ''
                                )}
                            >
                                <div
                                    className={cn(
                                        'rounded-2xl px-6 py-4 shadow-sm',
                                        message.role === 'assistant'
                                            ? 'bg-muted/30 border border-border/50 backdrop-blur-sm'
                                            : 'bg-primary/10 border border-primary/30'
                                    )}
                                >
                                    <p className="text-foreground leading-relaxed whitespace-pre-line font-light">
                                        {message.content}
                                    </p>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        {message.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {isUploading && (
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary/20 to-medical/20 border border-primary/30">
                                <Brain className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 max-w-2xl">
                                <div className="rounded-2xl px-6 py-4 bg-muted/30 border border-border/50 backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        <span className="text-foreground font-light">Analyzing X-ray image...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="border-t border-border/50 bg-background/80 backdrop-blur-lg">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <button
                                onClick={handleImageUpload}
                                disabled={isUploading}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Upload className="w-4 h-4" />
                                Upload X-ray
                            </button>
                            <button
                                onClick={() => setInput('Explain how ResNet-152 works')}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 text-sm font-medium"
                            >
                                <FileText className="w-4 h-4" />
                                How it works?
                            </button>
                            <button
                                onClick={() => setInput('What is Grad-CAM visualization?')}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 text-sm font-medium"
                            >
                                <Zap className="w-4 h-4" />
                                Explain Grad-CAM
                            </button>
                        </div>

                        {/* Input Field */}
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask about pneumonia detection or upload an X-ray image..."
                                    className="w-full px-6 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground/50 font-light"
                                />
                            </div>
                            <Button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                size="lg"
                                className="rounded-2xl px-6 bg-primary hover:bg-primary/90 disabled:opacity-50 shadow-lg shadow-primary/25"
                            >
                                <Send className="w-5 h-5" />
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground text-center mt-4 font-light">
                            This is a demonstration interface. Results are simulated for educational purposes.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}

