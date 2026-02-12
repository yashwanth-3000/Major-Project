'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    Upload,
    Send,
    Brain,
    Sun,
    Moon,
    FileText,
    MessageSquare,
    Stethoscope,
    ShieldCheck,
    Sparkles,
    Activity,
    HeartPulse,
    Microscope,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

type Message = {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    mode?: ChatMode
}

type ChatMode = 'report' | 'general'

const reportSuggestions = [
    {
        icon: <Microscope className="w-5 h-5" />,
        label: 'Analyze an X-ray report',
        prompt: 'I have a chest X-ray report that shows opacification in the right lower lobe. Can you help me understand what this means?',
    },
    {
        icon: <Activity className="w-5 h-5" />,
        label: 'Explain pneumonia symptoms',
        prompt: 'What are the common symptoms of pneumonia and when should I seek medical attention?',
    },
    {
        icon: <ShieldCheck className="w-5 h-5" />,
        label: 'Understanding Grad-CAM hotspots',
        prompt: 'My X-ray analysis highlights hotspot regions in the lower lobes. What do these Grad-CAM activations mean?',
    },
    {
        icon: <HeartPulse className="w-5 h-5" />,
        label: 'Detection confidence score',
        prompt: 'How does the AI detection confidence score work? What does 92% confidence mean for my diagnosis?',
    },
]

const generalSuggestions = [
    {
        icon: <HeartPulse className="w-5 h-5" />,
        label: 'Boost my immunity',
        prompt: 'What are the best ways to naturally strengthen my immune system?',
    },
    {
        icon: <Activity className="w-5 h-5" />,
        label: 'Manage a cold or flu',
        prompt: 'I have a cold with a sore throat and mild fever. What should I do to recover faster?',
    },
    {
        icon: <ShieldCheck className="w-5 h-5" />,
        label: 'Prevention for elderly',
        prompt: 'What are the best ways to prevent respiratory infections for elderly family members?',
    },
    {
        icon: <Microscope className="w-5 h-5" />,
        label: 'Healthy lifestyle tips',
        prompt: 'What daily habits can I adopt to improve my overall health and wellness?',
    },
]

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://pneumoai-api-production.up.railway.app'

export default function ChatPage() {
    const { theme, toggleTheme, mounted } = useTheme()
    const [chatMode, setChatMode] = useState<ChatMode>('report')
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const messagesContainerRef = useRef<HTMLDivElement>(null)

    const isWelcomeScreen = messages.length === 0

    const modePlaceholder =
        chatMode === 'report'
            ? 'Describe your report findings or ask about pneumonia detection...'
            : 'Ask about symptoms, prevention, or general wellness...'

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    const handleSend = async (text?: string) => {
        const messageText = text || input.trim()
        if (!messageText) return
        const selectedMode = chatMode

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: messageText,
            timestamp: new Date(),
            mode: selectedMode,
        }

        setMessages((prev) => [...prev, userMessage])
        setInput('')
        setIsTyping(true)

        try {
            const res = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: messageText,
                    mode: selectedMode,
                }),
            })

            if (!res.ok) throw new Error(`Server error: ${res.status}`)

            const data = await res.json()

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
                mode: selectedMode,
            }
            setMessages((prev) => [...prev, aiResponse])
        } catch (err) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content:
                    '**Connection Error**\n\nCould not reach the PneumoAI backend. Make sure the API server is running:\n\n```\npython -m gen_ai --serve\n```\n\n> The server should be available at http://localhost:8000',
                timestamp: new Date(),
                mode: selectedMode,
            }
            setMessages((prev) => [...prev, errorMsg])
        } finally {
            setIsTyping(false)
        }
    }

    const activeSuggestions = chatMode === 'report' ? reportSuggestions : generalSuggestions

    const handleSuggestionClick = (suggestion: (typeof reportSuggestions)[number]) => {
        handleSend(suggestion.prompt)
    }

    const handleImageUpload = async () => {
        setIsUploading(true)
        setIsTyping(true)

        // For now, send a descriptive message about the upload through the report workflow
        const uploadQuery =
            'I am uploading a chest X-ray image for pneumonia detection analysis. ' +
            'Please analyze the image for pneumonia indicators, provide the detection ' +
            'confidence score, describe the Grad-CAM hotspot regions, and explain what ' +
            'the results mean in plain language.'

        try {
            const res = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: uploadQuery,
                    mode: 'report',
                }),
            })

            if (!res.ok) throw new Error(`Server error: ${res.status}`)

            const data = await res.json()

            const uploadMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
                mode: 'report',
            }
            setMessages((prev) => [...prev, uploadMessage])
        } catch {
            const errorMsg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content:
                    '**Connection Error**\n\nCould not reach the PneumoAI backend for image analysis. Make sure the API server is running.',
                timestamp: new Date(),
                mode: 'report',
            }
            setMessages((prev) => [...prev, errorMsg])
        } finally {
            setIsTyping(false)
            setIsUploading(false)
        }
    }

    const renderMessageContent = (content: string) => {
        const lines = content.split('\n')
        return lines.map((line, i) => {
            if (line.trim() === '') return <br key={i} />

            // Blockquote
            if (line.startsWith('> ')) {
                return (
                    <blockquote
                        key={i}
                        className="border-l-2 border-primary/40 pl-4 my-2 text-muted-foreground italic"
                    >
                        {renderInlineFormatting(line.slice(2))}
                    </blockquote>
                )
            }

            // Bullet points
            if (line.startsWith('• ') || line.startsWith('- ')) {
                return (
                    <div key={i} className="flex gap-2.5 my-1">
                        <span className="text-primary/70 mt-0.5 select-none">•</span>
                        <span>{renderInlineFormatting(line.slice(2))}</span>
                    </div>
                )
            }

            return (
                <p key={i} className="my-0.5">
                    {renderInlineFormatting(line)}
                </p>
            )
        })
    }

    const renderInlineFormatting = (text: string) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/g)
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={i} className="font-semibold text-foreground">
                        {part.slice(2, -2)}
                    </strong>
                )
            }
            return <span key={i}>{part}</span>
        })
    }

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
            {/* Background Decorations */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute -top-[400px] -right-[300px] w-[800px] h-[800px] rounded-full bg-primary/[0.03] blur-3xl" />
                <div className="absolute -bottom-[400px] -left-[300px] w-[800px] h-[800px] rounded-full bg-medical/[0.03] blur-3xl" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                            >
                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                                <span className="text-sm font-medium hidden sm:inline">Back</span>
                            </Link>
                            <div className="h-5 w-px bg-border/70 hidden sm:block" />
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-medical flex items-center justify-center">
                                    <Stethoscope className="w-4 h-4 text-white" />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-sm font-semibold leading-tight">
                                        <span className="text-foreground">Pneumo</span>
                                        <span className="text-primary">AI</span>
                                    </h1>
                                    <p className="text-[11px] text-muted-foreground leading-tight">
                                        Diagnostic Assistant
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {mounted && (
                                <button
                                    onClick={toggleTheme}
                                    aria-label="Toggle theme"
                                    aria-pressed={theme === 'dark'}
                                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-muted/40 border border-border/70 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                                >
                                    {theme === 'dark' ? (
                                        <Sun className="w-4 h-4 text-foreground" />
                                    ) : (
                                        <Moon className="w-4 h-4 text-foreground" />
                                    )}
                                </button>
                            )}
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-medical/10 border border-medical/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-medical animate-pulse" />
                                <span className="text-xs font-medium text-medical">Online</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Chat Area */}
            <main className="flex-1 overflow-hidden flex flex-col max-w-5xl w-full mx-auto relative z-[1]">
                {/* Messages Container */}
                <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto px-4 sm:px-6"
                >
                    {isWelcomeScreen ? (
                        /* Welcome Screen */
                        <div className="flex flex-col items-center justify-center min-h-full py-12 sm:py-20">
                            <div className="text-center max-w-2xl mx-auto mb-10">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-medical/20 border border-primary/20 mb-6">
                                    <Sparkles className="w-7 h-7 text-primary" />
                                </div>
                                <h2 className="font-heading text-2xl sm:text-3xl font-semibold mb-3 text-foreground">
                                    How can I help you today?
                                </h2>
                                <p className="text-muted-foreground text-sm sm:text-base font-light leading-relaxed max-w-lg mx-auto">
                                    I can analyze medical X-ray reports, explain pneumonia detection
                                    results, or answer general health questions.
                                </p>
                            </div>

                            {/* Suggestion Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                                {activeSuggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="group text-left p-4 rounded-2xl border border-border/70 bg-muted/20 hover:bg-muted/40 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.15)]"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors">
                                                {suggestion.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground mb-1">
                                                    {suggestion.label}
                                                </p>
                                                <p className="text-xs text-muted-foreground line-clamp-2 font-light leading-relaxed">
                                                    {suggestion.prompt}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Messages */
                        <div className="py-6 space-y-1">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        'flex gap-3 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500',
                                        message.role === 'user'
                                            ? 'flex-row-reverse'
                                            : 'flex-row'
                                    )}
                                >
                                    {/* Avatar */}
                                    <div
                                        className={cn(
                                            'flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center',
                                            message.role === 'assistant'
                                                ? 'bg-gradient-to-br from-primary/15 to-medical/15 border border-primary/20'
                                                : 'bg-muted/50 border border-border/70'
                                        )}
                                    >
                                        {message.role === 'assistant' ? (
                                            <Brain className="w-4 h-4 text-primary" />
                                        ) : (
                                            <span className="text-xs font-semibold text-muted-foreground">
                                                Y
                                            </span>
                                        )}
                                    </div>

                                    {/* Message Content */}
                                    <div
                                        className={cn(
                                            'flex-1 max-w-[85%] sm:max-w-[75%]',
                                            message.role === 'user'
                                                ? 'flex flex-col items-end'
                                                : ''
                                        )}
                                    >
                                        {/* Role Label */}
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-xs font-medium text-muted-foreground">
                                                {message.role === 'assistant'
                                                    ? 'PneumoAI'
                                                    : 'You'}
                                            </span>
                                            {message.mode && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground/70 bg-muted/30 rounded-md px-1.5 py-0.5">
                                                    {message.mode === 'report' ? (
                                                        <FileText className="w-2.5 h-2.5" />
                                                    ) : (
                                                        <MessageSquare className="w-2.5 h-2.5" />
                                                    )}
                                                    {message.mode === 'report'
                                                        ? 'Report'
                                                        : 'General'}
                                                </span>
                                            )}
                                            <span className="text-[10px] text-muted-foreground/50">
                                                {message.timestamp.toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>

                                        {/* Bubble */}
                                        <div
                                            className={cn(
                                                'rounded-2xl px-4 py-3 text-[14px] leading-relaxed',
                                                message.role === 'assistant'
                                                    ? 'bg-muted/30 border border-border/50 text-foreground font-light'
                                                    : 'bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/25 text-foreground font-light'
                                            )}
                                        >
                                            {message.role === 'assistant'
                                                ? renderMessageContent(message.content)
                                                : message.content}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="flex gap-3 py-4 animate-in fade-in duration-300">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-primary/15 to-medical/15 border border-primary/20 flex items-center justify-center">
                                        <Brain className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-muted-foreground mb-1.5 block">
                                            PneumoAI
                                        </span>
                                        <div className="inline-flex items-center gap-1.5 rounded-2xl bg-muted/30 border border-border/50 px-5 py-3.5">
                                            <span className="typing-dot w-2 h-2 rounded-full bg-primary/60" />
                                            <span
                                                className="typing-dot w-2 h-2 rounded-full bg-primary/60"
                                                style={{ animationDelay: '0.15s' }}
                                            />
                                            <span
                                                className="typing-dot w-2 h-2 rounded-full bg-primary/60"
                                                style={{ animationDelay: '0.3s' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="border-t border-border/50 bg-background/80 backdrop-blur-xl">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
                        {/* Mode Toggle + Upload */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="inline-flex items-center rounded-xl bg-muted/30 border border-border/70 p-0.5 gap-0.5">
                                <button
                                    type="button"
                                    onClick={() => setChatMode('report')}
                                    aria-pressed={chatMode === 'report'}
                                    className={cn(
                                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all duration-200',
                                        chatMode === 'report'
                                            ? 'bg-background text-foreground border border-border/80 shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Read Reports</span>
                                    <span className="sm:hidden">Reports</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setChatMode('general')}
                                    aria-pressed={chatMode === 'general'}
                                    className={cn(
                                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all duration-200',
                                        chatMode === 'general'
                                            ? 'bg-background text-foreground border border-border/80 shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">General Health</span>
                                    <span className="sm:hidden">Health</span>
                                </button>
                            </div>

                            {chatMode === 'report' && (
                                <button
                                    onClick={handleImageUpload}
                                    disabled={isUploading}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-muted/30 border border-border/70 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Upload X-ray</span>
                                    <span className="sm:hidden">Upload</span>
                                </button>
                            )}
                        </div>

                        {/* Input Field */}
                        <div className="relative flex items-center gap-2">
                            <div className="relative flex-1 rounded-2xl border border-border/70 bg-muted/15 transition-all duration-200 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 focus-within:bg-muted/25">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSend()
                                        }
                                    }}
                                    placeholder={modePlaceholder}
                                    className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none placeholder:text-muted-foreground/50 font-light pr-12"
                                />
                                <Button
                                    type="button"
                                    onClick={() => handleSend()}
                                    disabled={!input.trim()}
                                    aria-label="Send message"
                                    size="sm"
                                    className={cn(
                                        'absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl p-0',
                                        'bg-gradient-to-br from-primary to-medical text-primary-foreground border border-primary/20',
                                        'shadow-[0_4px_12px_-4px_hsl(var(--primary)/0.5)] transition-all duration-200',
                                        'hover:shadow-[0_6px_16px_-4px_hsl(var(--primary)/0.6)] hover:-translate-y-[52%]',
                                        'active:-translate-y-1/2',
                                        'disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-[-50%] disabled:bg-muted disabled:border-border/70 disabled:text-muted-foreground'
                                    )}
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>

                        {/* Hint */}
                        <p className="text-[11px] text-muted-foreground/60 text-center mt-3 font-light">
                            {chatMode === 'report'
                                ? 'Report mode analyzes medical X-ray findings with AI assistance.'
                                : 'Health mode provides general wellness guidance.'}
                            {' '}Powered by CrewAI multi-agent workflows.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
