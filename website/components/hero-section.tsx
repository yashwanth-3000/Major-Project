'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronRight, Menu, X, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <h1
                                        className="mt-8 max-w-5xl mx-auto text-balance text-4xl font-bold leading-[1.2] md:text-5xl lg:mt-12 xl:text-6xl">
                                        AI-Powered Pneumonia Detection
                                    </h1>
                                    <p
                                        className="mx-auto mt-6 max-w-3xl text-balance text-base md:text-lg leading-relaxed text-muted-foreground font-light">
                                        Enhance diagnostic interpretability with GenAI and ResNet-152. Advanced deep learning for accurate pneumonia detection with explainable AI for clinical decision support.
                                    </p>
                                </AnimatedGroup>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-10 flex flex-col items-center justify-center gap-3 md:flex-row">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="rounded-xl px-6 bg-primary hover:bg-primary/90 font-medium">
                                        <Link href="/chat">
                                            <span className="text-nowrap">Try Diagnostic AI</span>
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="outline"
                                        className="rounded-xl px-6 border-primary/30 hover:bg-primary/10">
                                        <Link href="#features">
                                            <span className="text-nowrap">View Features</span>
                                        </Link>
                                    </Button>
                                </AnimatedGroup>
                            </div>
                        </div>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                                <div
                                    aria-hidden
                                    className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                                />
                                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                                    {/* App Screen Mockup */}
                                    <div className="aspect-15/8 relative rounded-2xl bg-gradient-to-br from-muted/50 to-background border border-border/50 overflow-hidden">
                                        {/* Mock Chat Interface */}
                                        <div className="h-full flex flex-col p-6">
                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-medical/20 border border-primary/30 flex items-center justify-center">
                                                        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-primary" stroke="currentColor" strokeWidth="2">
                                                            <path d="M12 2a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                                                            <path d="M12 9v13" />
                                                            <path d="M8 22h8" />
                                                            <path d="M5 16h14" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="h-3 w-24 bg-primary/20 rounded mb-2" />
                                                        <div className="h-2 w-16 bg-muted-foreground/10 rounded" />
                                                    </div>
                                                </div>
                                                <div className="w-2 h-2 rounded-full bg-medical animate-pulse" />
                                            </div>
                                            
                                            {/* Messages */}
                                            <div className="flex-1 space-y-4 overflow-hidden">
                                                <div className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-medical/20 border border-primary/30 flex-shrink-0" />
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-4 w-3/4 bg-muted/30 rounded-lg" />
                                                        <div className="h-4 w-1/2 bg-muted/30 rounded-lg" />
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 flex-row-reverse">
                                                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex-shrink-0" />
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-4 w-2/3 bg-primary/10 rounded-lg ml-auto" />
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-medical/20 border border-primary/30 flex-shrink-0" />
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-4 w-full bg-muted/30 rounded-lg" />
                                                        <div className="h-4 w-4/5 bg-muted/30 rounded-lg" />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Input Area */}
                                            <div className="mt-4 pt-4 border-t border-border/50">
                                                <div className="flex gap-2 mb-2">
                                                    <div className="h-6 w-20 bg-muted/20 rounded" />
                                                    <div className="h-6 w-24 bg-muted/20 rounded" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="flex-1 h-12 bg-muted/20 rounded-xl" />
                                                    <div className="w-12 h-12 bg-primary/20 rounded-xl" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
                <section className="bg-background pb-16 pt-16 md:pb-24" id="features">
                    <div className="m-auto max-w-6xl px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-3">Key Achievements</h2>
                            <p className="text-muted-foreground text-base font-light">Proven results in medical image analysis</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center p-6 rounded-xl border border-primary/20 bg-muted/20 hover:border-primary/30 transition-colors duration-300">
                                <div className="text-4xl font-bold text-primary mb-2">95.13%</div>
                                <div className="text-sm text-muted-foreground font-medium">Validation Accuracy</div>
                            </div>
                            <div className="text-center p-6 rounded-xl border border-primary/20 bg-muted/20 hover:border-primary/30 transition-colors duration-300">
                                <div className="text-4xl font-bold text-medical mb-2">ResNet-152</div>
                                <div className="text-sm text-muted-foreground font-medium">Deep Learning Model</div>
                            </div>
                            <div className="text-center p-6 rounded-xl border border-primary/20 bg-muted/20 hover:border-primary/30 transition-colors duration-300">
                                <div className="text-4xl font-bold text-warning mb-2">Grad-CAM</div>
                                <div className="text-sm text-muted-foreground font-medium">Visualization Method</div>
                            </div>
                            <div className="text-center p-6 rounded-xl border border-primary/20 bg-muted/20 hover:border-primary/30 transition-colors duration-300">
                                <div className="text-4xl font-bold text-primary mb-2">GenAI</div>
                                <div className="text-sm text-muted-foreground font-medium">Explainable Results</div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}

const menuItems = [
    { name: 'Features', href: '#features' },
    { name: 'Methodology', href: '#methodology' },
    { name: 'Results', href: '#results' },
    { name: 'Chat', href: '/chat' },
]

const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    const { theme, toggleTheme, mounted } = useTheme()

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-2 group">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2">
                                <Logo />
                            </Link>

                            <div className="flex items-center gap-2 lg:hidden">
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
                                <button
                                    onClick={() => setMenuState(!menuState)}
                                    aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                    className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5">
                                    <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                    <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                                </button>
                            </div>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit md:items-center">
                                {mounted && (
                                    <button
                                        onClick={toggleTheme}
                                        aria-label="Toggle theme"
                                        className="hidden lg:flex p-2 rounded-lg hover:bg-muted transition-colors"
                                    >
                                        {theme === 'dark' ? (
                                            <Sun className="w-5 h-5 text-foreground" />
                                        ) : (
                                            <Moon className="w-5 h-5 text-foreground" />
                                        )}
                                    </button>
                                )}
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className={cn(isScrolled && 'lg:hidden')}>
                                    <Link href="#">
                                        <span>Login</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className={cn(isScrolled && 'lg:hidden')}>
                                    <Link href="#">
                                        <span>Sign Up</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}>
                                    <Link href="#">
                                        <span>Get Started</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}

const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-medical flex items-center justify-center">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="w-5 h-5 text-white"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 2a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M12 9v13" />
                        <path d="M8 22h8" />
                        <path d="M5 16h14" />
                        <circle cx="12" cy="12" r="1" fill="currentColor" />
                    </svg>
                </div>
            </div>
            <span className="text-lg font-bold">
                <span className="text-foreground">Pneumo</span>
                <span className="text-primary">AI</span>
            </span>
        </div>
    )
}

