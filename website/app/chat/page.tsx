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
    X,
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
    image?: string
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
    const [chatMode, setChatMode] = useState<ChatMode>('general')
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [filePreview, setFilePreview] = useState('')
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

    const clearFile = () => {
        if (filePreview) URL.revokeObjectURL(filePreview)
        setSelectedFile(null)
        setFilePreview('')
    }

    const handleUploadSubmit = async () => {
        if (!selectedFile) return
        const preview = filePreview
        setShowUploadModal(false)
        setIsUploading(true)
        setIsTyping(true)

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: 'Uploaded chest X-ray for dual AI analysis',
            timestamp: new Date(),
            mode: 'report',
            image: preview,
        }
        setMessages((prev) => [...prev, userMsg])

        try {
            const formData = new FormData()
            formData.append('file', selectedFile)

            const res = await fetch(`${API_BASE}/analyze-xray`, {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) throw new Error(`Server error: ${res.status}`)

            const data = await res.json()

            let header = ''
            if (data.ml_classification) {
                header = `**ML Classification: ${data.ml_classification} (${data.ml_confidence}% confidence)**\n`
                if (data.ml_hotspot_description) header += `${data.ml_hotspot_description}\n\n`
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: header + data.combined_analysis,
                timestamp: new Date(),
                mode: 'report',
                image: data.heatmap_image
                    ? `data:image/png;base64,${data.heatmap_image}`
                    : undefined,
            }
            setMessages((prev) => [...prev, aiMsg])
        } catch {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content:
                    '**Analysis Error**\n\nCould not analyze the X-ray. Make sure the backend server is running with the ML model loaded.',
                timestamp: new Date(),
                mode: 'report',
            }
            setMessages((prev) => [...prev, errorMsg])
        } finally {
            setIsTyping(false)
            setIsUploading(false)
            clearFile()
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
        <div className="h-dvh bg-background flex flex-col relative overflow-hidden">
            {/* Background Decorations */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute -top-[400px] -right-[300px] w-[800px] h-[800px] rounded-full bg-primary/[0.03] blur-3xl" />
                <div className="absolute -bottom-[400px] -left-[300px] w-[800px] h-[800px] rounded-full bg-medical/[0.03] blur-3xl" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2 sm:py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 sm:gap-4">
                            <Link
                                href="/"
                                className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                            >
                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                                <span className="text-sm font-medium hidden sm:inline">Back</span>
                            </Link>
                            <div className="h-5 w-px bg-border/70 hidden sm:block" />
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary to-medical flex items-center justify-center">
                                    <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
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

                        <div className="flex items-center gap-1.5 sm:gap-2">
                            {mounted && (
                                <button
                                    onClick={toggleTheme}
                                    aria-label="Toggle theme"
                                    aria-pressed={theme === 'dark'}
                                    className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-muted/40 border border-border/70 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                                >
                                    {theme === 'dark' ? (
                                        <Sun className="w-4 h-4 text-foreground" />
                                    ) : (
                                        <Moon className="w-4 h-4 text-foreground" />
                                    )}
                                </button>
                            )}
                            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-medical/10 border border-medical/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-medical animate-pulse" />
                                <span className="text-xs font-medium text-medical hidden sm:inline">Online</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Chat Area */}
            <main className="flex-1 min-h-0 overflow-hidden flex flex-col max-w-5xl w-full mx-auto relative z-[1]">
                {/* Messages Container */}
                <div
                    ref={messagesContainerRef}
                    className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-6"
                >
                    {isWelcomeScreen ? (
                        /* Welcome Screen */
                        <div className="flex flex-col items-center justify-center min-h-full py-6 sm:py-20">
                            <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-10">
                                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-medical/20 border border-primary/20 mb-3 sm:mb-6">
                                    <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
                                </div>
                                <h2 className="font-heading text-xl sm:text-3xl font-semibold mb-1.5 sm:mb-3 text-foreground">
                                    How can I help you today?
                                </h2>
                                <p className="text-muted-foreground text-xs sm:text-base font-light leading-relaxed max-w-lg mx-auto px-2 sm:px-0">
                                    I can analyze medical X-ray reports, explain pneumonia detection
                                    results, or answer general health questions.
                                </p>
                            </div>

                            {/* Suggestion Cards */}
                            <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full max-w-2xl">
                                {activeSuggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="group text-left p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-border/70 bg-muted/20 hover:bg-muted/40 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.15)]"
                                    >
                                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5">
                                                {suggestion.icon}
                                            </div>
                                            <div className="flex-1 min-w-0 text-center sm:text-left">
                                                <p className="text-[11px] sm:text-sm font-medium text-foreground mb-0 sm:mb-1 leading-tight">
                                                    {suggestion.label}
                                                </p>
                                                <p className="hidden sm:block text-xs text-muted-foreground line-clamp-2 font-light leading-relaxed">
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
                        <div className="py-3 sm:py-6 space-y-0.5 sm:space-y-1">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        'flex gap-2 py-2 sm:gap-3 sm:py-4 animate-in fade-in slide-in-from-bottom-4 duration-500',
                                        message.role === 'user'
                                            ? 'flex-row-reverse'
                                            : 'flex-row'
                                    )}
                                >
                                    {/* Avatar */}
                                    <div
                                        className={cn(
                                            'flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center',
                                            message.role === 'assistant'
                                                ? 'bg-gradient-to-br from-primary/15 to-medical/15 border border-primary/20'
                                                : 'bg-muted/50 border border-border/70'
                                        )}
                                    >
                                        {message.role === 'assistant' ? (
                                            <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                        ) : (
                                            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">
                                                Y
                                            </span>
                                        )}
                                    </div>

                                    {/* Message Content */}
                                    <div
                                        className={cn(
                                            'flex-1 max-w-[88%] sm:max-w-[75%]',
                                            message.role === 'user'
                                                ? 'flex flex-col items-end'
                                                : ''
                                        )}
                                    >
                                        {/* Role Label */}
                                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
                                            <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">
                                                {message.role === 'assistant'
                                                    ? 'PneumoAI'
                                                    : 'You'}
                                            </span>
                                            {message.mode && (
                                                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground/70 bg-muted/30 rounded-md px-1.5 py-0.5">
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
                                            <span className="text-[9px] sm:text-[10px] text-muted-foreground/50">
                                                {message.timestamp.toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>

                                        {/* Image attachment */}
                                        {message.image && (
                                            <div className="mb-1.5 rounded-lg sm:rounded-xl overflow-hidden border border-border/50 max-w-[280px] sm:max-w-xs">
                                                <img
                                                    src={message.image}
                                                    alt={message.role === 'assistant' ? 'Grad-CAM heatmap overlay' : 'Uploaded X-ray'}
                                                    className="w-full h-auto object-contain bg-black"
                                                />
                                                {message.role === 'assistant' && (
                                                    <div className="px-2 py-1 bg-muted/40 text-[10px] sm:text-[11px] text-muted-foreground text-center font-medium">
                                                        Grad-CAM Hotspot Overlay
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Bubble */}
                                        <div
                                            className={cn(
                                                'rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 text-[13px] sm:text-[14px] leading-relaxed',
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
                                <div className="flex gap-2 py-2 sm:gap-3 sm:py-4 animate-in fade-in duration-300">
                                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/15 to-medical/15 border border-primary/20 flex items-center justify-center">
                                        <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                    </div>
                                    <div>
                                        <span className="text-[11px] sm:text-xs font-medium text-muted-foreground mb-1 sm:mb-1.5 block">
                                            PneumoAI
                                        </span>
                                        <div className="inline-flex items-center gap-1.5 rounded-xl sm:rounded-2xl bg-muted/30 border border-border/50 px-4 py-2.5 sm:px-5 sm:py-3.5">
                                            <span className="typing-dot w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary/60" />
                                            <span
                                                className="typing-dot w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary/60"
                                                style={{ animationDelay: '0.15s' }}
                                            />
                                            <span
                                                className="typing-dot w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary/60"
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
                <div className="border-t border-border/50 bg-background/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
                    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-2 sm:py-4">
                        {/* Mode Toggle + Upload */}
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="inline-flex items-center rounded-xl bg-muted/30 border border-border/70 p-0.5 gap-0.5">
                                <button
                                    type="button"
                                    onClick={() => { setChatMode('report'); setMessages([]) }}
                                    aria-pressed={chatMode === 'report'}
                                    className={cn(
                                        'inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-[10px] text-[11px] sm:text-xs font-medium transition-all duration-200',
                                        chatMode === 'report'
                                            ? 'bg-background text-foreground border border-border/80 shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span className="hidden sm:inline">Read Reports</span>
                                    <span className="sm:hidden">Reports</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setChatMode('general'); setMessages([]) }}
                                    aria-pressed={chatMode === 'general'}
                                    className={cn(
                                        'inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-[10px] text-[11px] sm:text-xs font-medium transition-all duration-200',
                                        chatMode === 'general'
                                            ? 'bg-background text-foreground border border-border/80 shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span className="hidden sm:inline">General Health</span>
                                    <span className="sm:hidden">Health</span>
                                </button>
                            </div>

                            {chatMode === 'report' && (
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    disabled={isUploading}
                                    className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-medium bg-muted/30 border border-border/70 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Upload className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span className="hidden sm:inline">Upload X-ray</span>
                                    <span className="sm:hidden">Upload</span>
                                </button>
                            )}
                        </div>

                        {/* Input Field */}
                        <div className="relative flex items-center gap-2">
                            <div className="relative flex-1 rounded-xl sm:rounded-2xl border border-border/70 bg-muted/15 transition-all duration-200 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 focus-within:bg-muted/25">
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
                                    className="w-full bg-transparent px-3 py-2.5 sm:px-4 sm:py-3 text-[13px] sm:text-sm focus:outline-none placeholder:text-muted-foreground/50 font-light pr-11 sm:pr-12"
                                />
                                <Button
                                    type="button"
                                    onClick={() => handleSend()}
                                    disabled={!input.trim()}
                                    aria-label="Send message"
                                    size="sm"
                                    className={cn(
                                        'absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl p-0',
                                        'bg-gradient-to-br from-primary to-medical text-primary-foreground border border-primary/20',
                                        'shadow-[0_4px_12px_-4px_hsl(var(--primary)/0.5)] transition-all duration-200',
                                        'hover:shadow-[0_6px_16px_-4px_hsl(var(--primary)/0.6)] hover:-translate-y-[52%]',
                                        'active:-translate-y-1/2',
                                        'disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-[-50%] disabled:bg-muted disabled:border-border/70 disabled:text-muted-foreground'
                                    )}
                                >
                                    <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                </Button>
                            </div>
                        </div>

                        {/* Hint - hidden on mobile */}
                        <p className="hidden sm:block text-[11px] text-muted-foreground/60 text-center mt-3 font-light">
                            {chatMode === 'report'
                                ? 'Report mode analyzes medical X-ray findings with AI assistance.'
                                : 'Health mode provides general wellness guidance.'}
                            {' '}Powered by CrewAI multi-agent workflows.
                        </p>
                    </div>
                </div>
            </main>

            {/* Upload X-ray Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-background border border-border border-b-0 sm:border-b rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md sm:mx-4 p-4 sm:p-6 animate-in slide-in-from-bottom duration-300 max-h-[85dvh] overflow-y-auto pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-6">
                        {/* Drag handle - mobile only */}
                        <div className="sm:hidden flex justify-center mb-3">
                            <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary/20 to-medical/20 border border-primary/20 flex items-center justify-center">
                                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm sm:text-base font-semibold text-foreground">X-ray Analysis</h3>
                                    <p className="text-[11px] sm:text-xs text-muted-foreground">Upload a chest X-ray for AI analysis</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setShowUploadModal(false); clearFile() }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors"
                            >
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>

                        {/* File Drop Zone */}
                        <div className="mb-4 sm:mb-5">
                            {filePreview ? (
                                <div className="relative rounded-xl overflow-hidden border border-border/70">
                                    <img src={filePreview} alt="X-ray preview" className="w-full h-44 sm:h-56 object-contain bg-black" />
                                    <button
                                        onClick={clearFile}
                                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5 text-white" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-36 sm:h-48 rounded-xl border-2 border-dashed border-border/70 hover:border-primary/40 bg-muted/10 hover:bg-muted/20 transition-all cursor-pointer">
                                    <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground/40 mb-2" />
                                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">Drop X-ray image here</span>
                                    <span className="text-[10px] sm:text-xs text-muted-foreground/60 mt-1">or tap to browse</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0]
                                            if (f) {
                                                setSelectedFile(f)
                                                setFilePreview(URL.createObjectURL(f))
                                            }
                                        }}
                                    />
                                </label>
                            )}
                        </div>

                        {/* Info Banner */}
                        <div className="mb-4 p-2.5 sm:p-3 rounded-lg bg-primary/5 border border-primary/10">
                            <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                                <strong className="text-foreground">Dual Analysis:</strong>{' '}
                                Your X-ray will be analyzed by the ResNet-152 ML model
                                (Grad-CAM hotspots) and GPT-4o Vision (radiological assessment)
                                simultaneously, then combined for a comprehensive report.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2.5 sm:gap-3">
                            <button
                                onClick={() => { setShowUploadModal(false); clearFile() }}
                                className="flex-1 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-border/70 text-muted-foreground hover:bg-muted/30 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUploadSubmit}
                                disabled={!selectedFile}
                                className="flex-1 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-gradient-to-br from-primary to-medical text-white border border-primary/20 shadow-[0_4px_12px_-4px_hsl(var(--primary)/0.4)] hover:shadow-[0_6px_16px_-4px_hsl(var(--primary)/0.5)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Analyze X-ray
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
