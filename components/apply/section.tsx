"use client";

import React, { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";

export function Section({ number, title, titleEn, description, children }: { number: string, title: string, titleEn: string, description?: string, children: React.ReactNode }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (!cardRef.current || !textRef.current) return;
            const rect = cardRef.current.getBoundingClientRect();
            const viewHeight = window.innerHeight;
            const center = viewHeight / 2;
            const elementCenter = rect.top + rect.height / 2;

            // Calculate distance from center (0 = at center)
            const dist = Math.abs(center - elementCenter);

            // Calculate intensity (0 to 1)
            // Full intensity at center, fades out as it moves away
            // Range: within 60% of viewport height
            let intensity = 1 - (dist / (viewHeight * 0.5));
            intensity = Math.max(0.05, Math.min(intensity, 0.4)); // Cap max opacity at 0.4, min at 0.05

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
