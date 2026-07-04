import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { WorkflowProvider } from "@/context/WorkflowContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "ScaleProposal AI",
    description: "Hybrid Multi-Agent Proposal Generator",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (

        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable}`}
        >

            <body>

                <WorkflowProvider>

                    {children}

                </WorkflowProvider>

            </body>

        </html>

    );

}