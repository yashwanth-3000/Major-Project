# AI-Powered Pneumonia Detection System

A modern web interface for our college major project: **Enhance Diagnostic Interpretability with GenAI**. Built with Next.js 14, React, TypeScript, and Tailwind CSS.

## Project Overview

This system integrates ResNet-152 deep learning model with Generative AI to detect pneumonia from chest X-rays with 95.13% accuracy, providing explainable and user-friendly diagnostic insights.

## Features

- 🧠 **ResNet-152 Integration**: Advanced CNN with Global Average Pooling
- 💬 **AI Chat Interface**: Interactive diagnostic assistant with GenAI
- 🎨 **Beautiful UI**: Modern, animated design with distinctive aesthetics
- 🔍 **Grad-CAM Visualization**: Heatmap generation for explainability
- 📱 **Fully Responsive**: Works seamlessly on all devices
- 🌓 **Light/Dark Mode**: Toggle between light and dark themes with persistent preference
- 🎭 **Smooth Animations**: Professional micro-interactions
- 🎯 **TypeScript**: Complete type safety
- 🎨 **Custom Design**: Unique typography (Crimson Pro + IBM Plex Sans) with teal/cyan medical color scheme

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
website/
├── app/                          # Next.js app directory
│   ├── chat/                    # Chat page route
│   │   └── page.tsx            # Chat interface page
│   ├── globals.css             # Global styles with custom theme
│   ├── layout.tsx              # Root layout with custom fonts
│   └── page.tsx                # Home page
├── components/                  # React components
│   ├── ui/                     # UI components
│   │   ├── button.tsx          # Button component
│   │   └── animated-group.tsx  # Animation wrapper
│   ├── hero-section.tsx        # Hero section with header
│   ├── features-section.tsx    # Methodology section
│   ├── results-section.tsx     # Results & next steps
│   └── footer.tsx              # Footer component
├── lib/                         # Utility functions
│   └── utils.ts                # Helper utilities
└── public/                      # Static assets
```

## Key Components

### 1. Home Page
- Hero section with project overview
- Key achievements (95.13% accuracy, ResNet-152, Grad-CAM, GenAI)
- Methodology & Features section with floating animations
- Current results & next phase roadmap
- Footer with project information

### 2. Chat Interface (`/chat`)
- Interactive AI diagnostic assistant
- Image upload simulation for X-ray analysis
- Real-time chat responses
- Simulated pneumonia detection results
- Quick action buttons for common queries
- User-friendly explanations

## Technologies Used

- **Next.js 14** - React framework with App Router
- **React 18** - UI library with hooks
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first CSS framework with custom medical theme
- **Framer Motion** - Smooth animations for enhanced UX
- **Lucide React** - Beautiful, consistent icon library
- **Crimson Pro** - Distinctive serif font for headings
- **IBM Plex Sans** - Technical, readable font for body text

## Design Philosophy

This project follows a distinctive aesthetic approach:
- **Unique Typography**: Crimson Pro (headings) + IBM Plex Sans (body) - avoiding generic fonts
- **Medical Color Scheme**: Deep teal/cyan with emerald green and amber accents
- **Layered Backgrounds**: Gradients, patterns, and depth instead of flat colors
- **Meaningful Animations**: Float effects, glow animations, and staggered reveals
- **Dark-First Design**: Professional dark theme suitable for medical applications

## Project Details

### Methodology
- **ResNet-152**: Deep CNN with residual skip connections
- **Global Average Pooling**: Reduces overfitting, preserves spatial info
- **Global Max Pooling**: Enables class activation mapping
- **Grad-CAM**: Visualizes model decision-making process
- **GenAI**: Provides natural language explanations

### Results
- ✅ **95.13% Validation Accuracy**
- ✅ **Heatmap Visualization Working**
- ✅ **Explainable AI System**
- ✅ **Reliable Medical Classification**

### Next Phase
- Integrate interactive AI agents
- Real-time diagnostic deployment
- Clinical validation
- Mobile application development

## Build

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## License

MIT

