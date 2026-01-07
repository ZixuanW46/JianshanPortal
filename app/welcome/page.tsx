"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function WelcomePage() {
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = '/images/welcome-bg.webp';
        img.onload = () => setImageLoaded(true);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-16 animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col items-center bg-card rounded-xl p-8 md:p-12 shadow-sm border w-full max-w-[640px]">
                {/* Illustration with fade-in loading */}
                <div
                    className="rounded-xl w-full aspect-[2/1] mb-8 relative overflow-hidden group border"
                    style={{ backgroundColor: '#1f495b' }}
                >
                    <div
                        className={`absolute inset-0 bg-center bg-no-repeat bg-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        style={{ backgroundImage: "url('/images/welcome-bg.webp')" }}
                    />
                    <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors duration-500"></div>
                </div>

                <div className="flex flex-col items-center gap-4 text-center max-w-[480px]">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
                        <CheckCircle className="h-4 w-4" />
                        Registration Complete
                    </div>
                    <h1 className="text-primary text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mt-2">
                        欢迎来到见山学院
                    </h1>
                    <p className="text-muted-foreground text-base md:text-lg font-normal leading-relaxed">
                        您的账号已注册成功。下一步，请完善您的申请表以完成报名流程。我们期待您的加入！
                    </p>

                    <div className="flex flex-col w-full gap-4 mt-8 items-center">
                        <Link href="/apply" className="group relative flex w-full max-w-[320px] items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-accent hover:bg-accent/90 text-primary text-base font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                            <span className="mr-2">填写申请</span>
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <p className="text-xs text-muted-foreground">
                            大约需要 15-30 分钟
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
