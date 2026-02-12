import type { Metadata } from "next";
import { Crimson_Pro, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const crimsonPro = Crimson_Pro({ 
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "600", "700"],
});

const ibmPlexSans = IBM_Plex_Sans({ 
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "AI-Powered Pneumonia Detection | Diagnostic Interpretability with GenAI",
  description: "Advanced ResNet-152 deep learning system with GenAI integration for accurate pneumonia detection from chest X-rays with 95.13% accuracy and explainable AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${ibmPlexSans.variable} ${crimsonPro.variable} font-body antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

