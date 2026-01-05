"use client";

import React, { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";

export function Section({ number, title, titleEn, description, children }: { number: string, title: string, titleEn: string, description?: string, children: React.ReactNode }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (!cardRef.current || !textRef.current) return;

            // Use the card's top area (where the number is displayed)
            const cardRect = cardRef.current.getBoundingClientRect();
            const viewHeight = window.innerHeight;
            const center = viewHeight / 2;
            // Number is at the top of the card, use top + some offset for number center
            const numberApproxCenter = cardRect.top + 60; // ~60px from card top

            // Calculate distance from viewport center
            const dist = Math.abs(center - numberApproxCenter);

            // Calculate intensity
            // Peak intensity at center (0.3), fades out linearly as it moves away
            const maxOpacity = 0.3;
            const minOpacity = 0.05;
            // The distance at which opacity drops to 0 (before clamping)
            // viewHeight * 0.5 means it hits 0 exactly at the viewport edge if centered perfectly
            // viewHeight * 0.6 makes it fade a bit slower
            const range = viewHeight * 0.5;

            let intensity = maxOpacity * (1 - dist / range);
            intensity = Math.max(minOpacity, intensity); // Cap min opacity at 0.05

            textRef.current.style.opacity = intensity.toString();
        };

        window.addEventListener('scroll', handleScroll);
        // Initial call
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <Card ref={cardRef} className="overflow-hidden border-0 shadow-sm bg-white/80 backdrop-blur-sm ring-1 ring-slate-200/50 group hover:ring-[#E1B168]/30 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 fill-mode-both">
            {/* Gradient Bar Restored */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary/80 to-primary/40" />

            <div className="relative p-6 sm:p-8 md:p-10">
                {/* Background Number - Moved to Left, Scroll-driven Opacity */}
                <div
                    ref={textRef}
                    className="absolute top-0 left-0 -mt-6 -ml-4 text-9xl font-black text-[#E1B168] select-none pointer-events-none z-0 transition-opacity duration-100 ease-out font-sans"
                    style={{ opacity: 0.05 }}
                >
                    {number}
                </div>

                {/* Header - Aligned Left (Removed pl-4) */}
                <div className="relative z-10 mb-8 pb-4 border-b border-dashed border-slate-200">
                    <div className="flex items-baseline gap-2 flex-wrap mb-1">
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h3>
                        <span className="text-lg font-medium text-slate-400 font-serif italic">{titleEn}</span>
                    </div>
                    {description && <p className="text-slate-500 text-sm mt-1">{description}</p>}
                </div>

                {/* Content */}
                <div className="relative z-10">
                    {children}
                </div>
            </div>
        </Card>
    );
}
