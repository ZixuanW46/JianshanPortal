"use client"

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Loader2, XCircle, Home, AlertTriangle, HelpCircle, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { callFunction } from "@/lib/cloudbase";
import confetti from "canvas-confetti";

// Floating decorative dots background
function FloatingDots() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full z-0 opacity-60">
            {[...Array(30)].map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full w-2 h-2 opacity-70 blur-[0.5px]"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        backgroundColor: i % 2 === 0 ? '#1f495b' : '#E1B168',
                        animation: `float ${3 + Math.random() * 5}s ease-in-out infinite`
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
            `}</style>
        </div>
    );
}

// Typewriter effect component with onComplete callback
function TypewriterText({ text, delay = 0, onComplete }: { text: string; delay?: number; onComplete?: () => void }) {
    const [displayText, setDisplayText] = useState("");
    const [started, setStarted] = useState(false);
    const hasCompleted = useRef(false);

    useEffect(() => {
        const startTimer = setTimeout(() => setStarted(true), delay);
        return () => clearTimeout(startTimer);
    }, [delay]);

    useEffect(() => {
        if (!started) return;
        hasCompleted.current = false;
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                setDisplayText(text.slice(0, i + 1));
                i++;
            } else {
                clearInterval(interval);
                if (!hasCompleted.current) {
                    hasCompleted.current = true;
                    onComplete?.();
                }
            }
        }, 50);
        return () => clearInterval(interval);
    }, [started, text]);

    return <span>{displayText}</span>;
}

function PaymentStatusContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const outTradeNo = searchParams.get("out_trade_no");

    const [status, setStatus] = useState<'checking' | 'success' | 'failed'>('checking');
    const [message, setMessage] = useState("正在确认支付结果...");
    const pollCount = useRef(0);

    // Animation states
    const [titleComplete, setTitleComplete] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const [countdown, setCountdown] = useState(5);

    // Reset animation states when status changes to success
    useEffect(() => {
        if (status === 'success') {
            setTitleComplete(false);
            setShowButton(false);
        }
    }, [status]);

    // Trigger confetti on success
    useEffect(() => {
        if (status === 'success') {
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 20 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [status]);

    // Countdown and redirect for no outTradeNo
    useEffect(() => {
        if (!outTradeNo && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (!outTradeNo && countdown === 0) {
            router.push('/dashboard');
        }
    }, [outTradeNo, countdown, router]);

    // Payment status polling
    useEffect(() => {
        if (!outTradeNo) return;

        const checkStatus = async () => {
            if (pollCount.current > 20) {
                setStatus('failed');
                setMessage("支付确认超时，请稍后在 Dashboard 查看状态。如果已扣款，请联系客服。");
                return;
            }

            try {
                if (!callFunction) return;

                const { result } = await callFunction({
                    name: "query-payment-status",
                    data: { outTradeNo }
                });

                if (result) {
                    if (result.code === 0) {
                        const paymentStatus = result.data?.status;

                        if (paymentStatus === 'PAID') {
                            setStatus('success');
                            pollCount.current = 100;
                            return;
                        } else if (paymentStatus === 'PENDING') {
                            // Continue polling
                        } else if (paymentStatus === 'CLOSED' || paymentStatus === 'EXPIRED') {
                            setStatus('failed');
                            setMessage("订单已关闭或过期，请重新发起支付");
                            pollCount.current = 100;
                            return;
                        } else {
                            console.warn("Unknown order status:", paymentStatus);
                        }
                    } else if (result.code === 404) {
                        setStatus('failed');
                        setMessage("订单不存在，请检查订单号或联系客服");
                        pollCount.current = 100;
                        return;
                    } else if (result.code === 500) {
                        console.warn("Server error:", result.message);
                        if (pollCount.current > 5) {
                            setStatus('failed');
                            setMessage("服务器查询失败，请稍后在 Dashboard 查看状态");
                            pollCount.current = 100;
                            return;
                        }
                    } else {
                        console.warn("Query function returned error:", result);
                    }
                }

            } catch (err) {
                console.warn("Status check failed:", err);
                if (pollCount.current > 5) {
                    setStatus('failed');
                    setMessage("网络连接失败，请检查网络后在 Dashboard 查看状态");
                    pollCount.current = 100;
                    return;
                }
            }

            pollCount.current++;
            setTimeout(checkStatus, 3000);
        };

        checkStatus();
    }, [outTradeNo]);

    // No outTradeNo - show friendly error with redirect
    if (!outTradeNo) {
        return (
            <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4">
                <div className="bg-card rounded-xl p-8 md:p-12 shadow-sm border w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
                            <HelpCircle className="h-8 w-8 text-amber-500" />
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold uppercase tracking-wider border border-amber-200">
                            <AlertTriangle className="h-3 w-3" />
                            页面访问异常
                        </div>
                        <h1 className="text-primary text-2xl md:text-3xl font-extrabold leading-tight tracking-tight">
                            缺少订单信息
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                            此页面需要通过正常支付流程访问。如果您已完成支付，请前往 Dashboard 查看订单状态。
                        </p>

                        <div className="flex flex-col w-full gap-4 mt-6 items-center">
                            <Link href="/dashboard" className="group relative flex w-full max-w-[280px] items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-accent hover:bg-accent/90 text-primary text-base font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                                <Home className="h-5 w-5 mr-2" />
                                <span>返回 Dashboard</span>
                                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <p className="text-xs text-muted-foreground">
                                {countdown > 0 ? `${countdown} 秒后自动跳转...` : '正在跳转...'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4 relative">
            {status === 'success' && <FloatingDots />}

            <div className={`relative z-10 ${status === 'success' ? 'w-full max-w-[640px]' : 'w-full max-w-md'}`}>
                {status === 'checking' && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">正在确认支付...</h2>
                            <p className="text-sm text-slate-500 mt-2">请勿关闭页面，这通常需要几秒钟</p>
                            <p className="text-xs text-slate-400 mt-4">订单号: {outTradeNo}</p>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center bg-card rounded-xl p-8 md:p-12 shadow-sm border w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Illustration with brightness animation */}
                        <div
                            className="bg-center bg-no-repeat bg-cover rounded-xl w-full aspect-[2/1] mb-8 relative overflow-hidden group border animate-in fade-in duration-1000"
                            style={{
                                backgroundImage: "url('/images/welcome-bg.webp')",
                                animation: "brighten 1.5s ease-out forwards"
                            }}
                        >
                            <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors duration-500"></div>
                        </div>

                        <div className="flex flex-col items-center gap-4 text-center max-w-[480px]">
                            {/* Badge */}
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
                                <CheckCircle className="h-4 w-4" />
                                Payment Successful
                            </div>
                            <h1 className="text-primary text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mt-2">
                                <TypewriterText
                                    text="欢迎加入见山学院"
                                    delay={300}
                                    onComplete={() => setTitleComplete(true)}
                                />
                            </h1>
                            {titleComplete && (
                                <p className="text-muted-foreground text-base md:text-lg font-normal leading-relaxed animate-in fade-in duration-300">
                                    <TypewriterText
                                        text="您的名额已成功锁定。我们将尽快发送确认邮件至您的邮箱，请注意查收。期待和你在夏天的相遇！"
                                        delay={0}
                                        onComplete={() => setShowButton(true)}
                                    />
                                </p>
                            )}

                            {/* Button with delayed appearance */}
                            <div className={`flex flex-col w-full gap-4 mt-8 items-center transition-all duration-500 ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                <Link href="/dashboard" className="group relative flex w-full max-w-[320px] items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-accent hover:bg-accent/90 text-primary text-base font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                                    <span className="mr-2">返回 Dashboard</span>
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <p className="text-xs text-muted-foreground">
                                    查看报名状态和后续步骤
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">状态确认失败</h2>
                            <p className="text-sm text-slate-500 mt-2">{message}</p>
                        </div>
                        <div className="pt-4">
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/dashboard">
                                    <Home className="w-4 h-4 mr-2" />
                                    返回 Dashboard 查看
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Global styles for animations */}
            <style jsx global>{`
                @keyframes brighten {
                    0% { filter: brightness(0.3); }
                    100% { filter: brightness(1); }
                }
            `}</style>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
                    <p className="mt-4 text-slate-500">Loading payment status...</p>
                </div>
            </div>
        }>
            <PaymentStatusContent />
        </Suspense>
    );
}
