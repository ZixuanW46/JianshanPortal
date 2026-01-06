"use client"

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, ChevronRight, Home, AlertTriangle, HelpCircle, ArrowRight, CheckCircle, Sparkles, PartyPopper } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

type PaymentStatus = 'checking' | 'success' | 'failed' | 'no_param';

// 模拟订单号
const MOCK_OUT_TRADE_NO = "DEV_TEST_20260105161500";

// Floating decorative dots background (same as acceptance page)
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
function TypewriterText({ text, delay = 0, className = "", onComplete }: { text: string; delay?: number; className?: string; onComplete?: () => void }) {
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

    return <span className={className}>{displayText}</span>;
}

function PaymentStatusPreview({ status, message }: { status: PaymentStatus; message: string }) {
    const [countdown, setCountdown] = useState(5);
    const [showButton, setShowButton] = useState(false);
    const [titleComplete, setTitleComplete] = useState(false);

    // Reset states when status changes
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

    // Countdown for no_param status
    useEffect(() => {
        if (status === 'no_param' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [status, countdown]);

    // Reset countdown when switching to no_param
    useEffect(() => {
        if (status === 'no_param') {
            setCountdown(5);
        }
    }, [status]);

    // 参数错误状态
    if (status === 'no_param') {
        return (
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
        );
    }

    return (
        <>
            {status === 'success' && <FloatingDots />}

            <div className={`w-full max-w-[640px] relative z-10 ${status === 'success' ? '' : 'max-w-md'}`}>
                {status === 'checking' && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">正在确认支付...</h2>
                            <p className="text-sm text-slate-500 mt-2">请勿关闭页面，这通常需要几秒钟</p>
                            <p className="text-xs text-slate-400 mt-4">订单号: {MOCK_OUT_TRADE_NO}</p>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center bg-card rounded-xl p-8 md:p-12 shadow-sm border w-full max-w-[640px] animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Illustration with brightness animation */}
                        <div
                            className="bg-center bg-no-repeat bg-cover rounded-xl w-full aspect-[2/1] mb-8 relative overflow-hidden group border animate-in fade-in duration-1000"
                            style={{
                                backgroundImage: "url('/images/welcome-bg.jpg')",
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
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(31, 73, 91, 0.4); }
                    50% { box-shadow: 0 0 20px 4px rgba(31, 73, 91, 0.2); }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 2s ease-in-out infinite;
                }
            `}</style>
        </>
    );
}

export default function PaymentDevPreviewPage() {
    const [currentStatus, setCurrentStatus] = useState<PaymentStatus>('checking');
    const [errorMessage, setErrorMessage] = useState("支付确认超时，请稍后在 Dashboard 查看状态。如果已扣款，请联系客服。");

    const statusOptions: { value: PaymentStatus; label: string; icon: React.ReactNode; color: string; description?: string }[] = [
        {
            value: 'no_param',
            label: '参数错误 No Param',
            icon: <HelpCircle className="w-4 h-4" />,
            color: 'bg-slate-500 hover:bg-slate-600 text-white',
            description: '当 URL 缺少 out_trade_no 参数时'
        },
        {
            value: 'checking',
            label: '确认中 Checking',
            icon: <Loader2 className="w-4 h-4" />,
            color: 'bg-blue-500 hover:bg-blue-600 text-white',
            description: '正在轮询查询支付状态'
        },
        {
            value: 'success',
            label: '成功 Success',
            icon: <CheckCircle2 className="w-4 h-4" />,
            color: 'bg-green-500 hover:bg-green-600 text-white',
            description: '支付已确认成功'
        },
        {
            value: 'failed',
            label: '失败 Failed',
            icon: <XCircle className="w-4 h-4" />,
            color: 'bg-red-500 hover:bg-red-600 text-white',
            description: '支付确认超时或失败'
        },
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FB] relative">
            {/* Dev Tools Floating Panel */}
            <div className="fixed top-4 right-4 z-50 bg-slate-900 rounded-2xl shadow-2xl p-4 space-y-4 max-w-xs">
                <div className="flex items-center gap-2 text-amber-400 border-b border-slate-700 pb-3">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-bold text-sm">DEV 测试工具</span>
                </div>

                <div className="space-y-2">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">切换状态</p>
                    <div className="flex flex-col gap-2">
                        {statusOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setCurrentStatus(option.value)}
                                className={`
                                    flex flex-col items-start gap-1 px-3 py-2 rounded-lg text-sm font-medium
                                    transition-all duration-200 text-left
                                    ${currentStatus === option.value
                                        ? option.color + ' ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-2">
                                    {option.icon}
                                    {option.label}
                                </div>
                                {option.description && (
                                    <span className={`text-xs ${currentStatus === option.value ? 'opacity-80' : 'text-slate-500'}`}>
                                        {option.description}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {currentStatus === 'failed' && (
                    <div className="space-y-2 pt-2 border-t border-slate-700">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">错误消息</p>
                        <select
                            className="w-full bg-slate-700 text-white text-sm rounded-lg px-3 py-2 border-0 focus:ring-2 focus:ring-blue-500"
                            value={errorMessage}
                            onChange={(e) => setErrorMessage(e.target.value)}
                        >
                            <option value="支付确认超时，请稍后在 Dashboard 查看状态。如果已扣款，请联系客服。">⏱️ 轮询超时 (pollCount {'>'} 20)</option>
                            <option value="订单不存在，请检查订单号或联系客服">🔍 订单不存在 (code: 404)</option>
                            <option value="订单已关闭或过期，请重新发起支付">🚫 订单已关闭/过期 (CLOSED/EXPIRED)</option>
                            <option value="服务器查询失败，请稍后在 Dashboard 查看状态">💥 服务器错误 (code: 500)</option>
                            <option value="网络连接失败，请检查网络后在 Dashboard 查看状态">📡 网络错误 (catch)</option>
                        </select>
                    </div>
                )}

                <div className="pt-2 border-t border-slate-700">
                    <p className="text-xs text-slate-500 text-center">
                        ⚠️ 仅供开发测试使用
                    </p>
                </div>
            </div>

            {/* Main Preview Area */}
            <div className="flex items-center justify-center min-h-screen p-4">
                <PaymentStatusPreview status={currentStatus} message={errorMessage} />
            </div>
        </div>
    );
}
