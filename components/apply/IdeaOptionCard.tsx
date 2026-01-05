"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface IdeaOptionCardProps {
    id: string;
    title: string;
    description: string;
    fullText: string;
    icon: LucideIcon;
    imagePath: string;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export function IdeaOptionCard({
    id,
    title,
    description,
    fullText,
    icon: Icon,
    imagePath,
    isSelected,
    onSelect,
}: IdeaOptionCardProps) {
    return (
        <motion.div
            layout
            onClick={() => onSelect(id)}
            className={cn(
                "relative overflow-hidden rounded-xl border-2 cursor-pointer transition-colors duration-500",
                isSelected ? "border-primary" : "border-slate-100 hover:border-primary/40 bg-white"
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Background Image Layer */}
            <motion.div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: `url(${imagePath})` }}
                initial={{ opacity: 0 }}
                animate={{
                    opacity: isSelected ? 0.35 : 0,
                    filter: isSelected ? "blur(0px)" : "blur(10px)",
                    scale: isSelected ? 1 : 1.1
                }}
                transition={{ duration: 0.8 }}
            />

            {/* Overlay Gradient for Text Readability when Selected */}
            <motion.div
                className={cn("absolute inset-0 z-0 bg-gradient-to-r", isSelected ? "from-white/90 via-white/70 to-white/40" : "from-transparent to-transparent")}
                animate={{ opacity: isSelected ? 1 : 0 }}
            />

            <div className="relative z-10 p-5 sm:p-6">
                <div className="flex items-start gap-4">
                    {/* Icon Circle */}
                    <motion.div
                        layout
                        className={cn(
                            "p-3 rounded-full shrink-0 transition-colors duration-300",
                            isSelected ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-slate-100 text-slate-500 hover:bg-primary/10 hover:text-primary"
                        )}
                    >
                        <Icon className="h-6 w-6" />
                    </motion.div>

                    <div className="flex-1 space-y-2">
                        {/* Title & Short Desc */}
                        <div>
                            <motion.h4
                                layout
                                className={cn(
                                    "font-black text-lg sm:text-x",
                                    isSelected ? "text-primary drop-shadow-sm" : "text-slate-800"
                                )}
                            >
                                {title}
                            </motion.h4>
                            {!isSelected && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-slate-500 text-sm mt-1 font-medium"
                                >
                                    {description}
                                </motion.p>
                            )}
                        </div>

                        {/* Full Text - Expanded */}
                        <AnimatePresence>
                            {isSelected && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                >
                                    <p className="text-slate-600 text-sm leading-relaxed font-medium pt-2 border-t border-primary/20 mt-2">
                                        {fullText}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Checkmark Indicator */}
                    <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300",
                        isSelected ? "border-primary bg-primary scale-110" : "border-slate-200"
                    )}>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
