"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useBackground } from "@/lib/use-background";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Smartphone, MessagesSquare } from "lucide-react";
import { isAdmin } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const { login, sendSmsCode, loginWithCode } = useAuth();
    const backgroundImage = useBackground();
    const [loading, setLoading] = useState(false);

    // Login Method State: 'password' | 'code'
    const [loginMethod, setLoginMethod] = useState<'password' | 'code'>('password');

    // Form States
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState("");

    // Timer State
    const [countdown, setCountdown] = useState(0);

    const handleGetCode = async () => {
        if (!mobile) {
            setError("请输入手机号");
            return;
        }
        if (countdown > 0) return;

        try {
            await sendSmsCode(mobile);
            // Start countdown only on success
            setCountdown(60);
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (e: any) {
            setError(e.message || "发送验证码失败");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (loginMethod === 'password') {
                await login(mobile, password);
                // Router push handled in calling code or effect, but usually we just redirect here for confidence
                // But auth context usually sets user state.
                // Assuming login promise resolves on success.
            } else {
                if (!code) throw new Error("请输入验证码");
                await loginWithCode(mobile, code);
            }

            // Check if logging in as admin (simulated check on mobile string or actual user object check in context)
            // For now we rely on the router push below or the updated state.
            // We can check isAdmin(mobile) as a heuristic before user state updates if needed, 
            // but basically we just redirect to dashboard.
            // Ideally we should wait for user state to update, but login awaits so it should be fine.

            // Simple redirect logic
            if (isAdmin(mobile)) {
                router.push("/admin/dashboard");
            } else {
                router.push("/dashboard");
            }

        } catch (error: any) {
            console.error("Login failed", error);
            setError(error.message || "登录失败，请检查账号或密码/验证码");
        } finally {
            setLoading(false);
        }
    };

    const renderForm = (isMobileLayout: boolean) => (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Login Method Toggle Tabs */}
            <div className="flex p-1 bg-gray-100/80 rounded-xl mb-2">
                <button
                    type="button"
                    onClick={() => { setLoginMethod('password'); setError(''); }}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMethod === 'password'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    密码登录
                </button>
                <button
                    type="button"
                    onClick={() => { setLoginMethod('code'); setError(''); }}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMethod === 'code'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    验证码登录
                </button>
            </div>

            {/* Mobile Number Input */}
            <div className="grid gap-2">
                <Label htmlFor={`${isMobileLayout ? 'm-' : ''}mobile`} className="font-semibold text-primary/90">手机号</Label>
                <div className="relative group">
                    <Input
                        id={`${isMobileLayout ? 'm-' : ''}mobile`}
                        type="tel"
                        placeholder="请输入手机号"
                        className={`pl-11 h-12 border-primary/10 bg-white/50 focus:bg-white/80 transition-all focus-visible:ring-primary/20 placeholder:text-muted-foreground/60 ${isMobileLayout ? 'text-[12px] rounded-xl' : ''}`}
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                    />
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/70 pointer-events-none group-focus-within:text-primary transition-colors" />
                </div>
            </div>

            {/* Password Input (Only for Password Method) */}
            {loginMethod === 'password' && (
                <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor={`${isMobileLayout ? 'm-' : ''}password`} className="font-semibold text-primary/90">密码</Label>
                        <Link href="/forgot-password" className="text-xs font-semibold text-muted-foreground/80 hover:text-primary transition-colors">
                            忘记密码？
                        </Link>
                    </div>
                    <div className="relative group">
                        <Input
                            id={`${isMobileLayout ? 'm-' : ''}password`}
                            type="password"
                            placeholder="请输入密码"
                            className={`pl-11 h-12 border-primary/10 bg-white/50 focus:bg-white/80 transition-all focus-visible:ring-primary/20 placeholder:text-muted-foreground/60 ${isMobileLayout ? 'text-[12px] rounded-xl' : ''}`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/70 pointer-events-none group-focus-within:text-primary transition-colors" />
                    </div>
                </div>
            )}

            {/* Verification Code Input (Only for Code Method) */}
            {loginMethod === 'code' && (
                <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor={`${isMobileLayout ? 'm-' : ''}code`} className="font-semibold text-primary/90">验证码</Label>
                        <div className="text-xs font-semibold text-transparent select-none">
                            忘记密码？
                        </div>
                    </div>
                    <div className="relative flex gap-2">
                        <div className="relative group flex-1">
                            <Input
                                id={`${isMobileLayout ? 'm-' : ''}code`}
                                type="text"
                                placeholder="输入验证码"
                                className={`pl-11 h-12 border-primary/10 bg-white/50 focus:bg-white/80 transition-all focus-visible:ring-primary/20 placeholder:text-muted-foreground/60 ${isMobileLayout ? 'text-[12px] rounded-xl' : ''}`}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                            />
                            <MessagesSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/70 pointer-events-none group-focus-within:text-primary transition-colors" />
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGetCode}
                            disabled={countdown > 0}
                            className={`h-12 w-[100px] font-bold bg-white/60 hover:bg-white text-primary hover:text-primary/80 border border-primary/10 hover:border-primary/20 shadow-sm hover:shadow-md transition-all ${isMobileLayout ? 'text-[12px] rounded-xl' : 'rounded-md'}`}
                        >
                            {countdown > 0 ? `${countdown}s` : '获取验证码'}
                        </Button>
                    </div>
                </div>
            )}

            <Button
                type="submit"
                disabled={loading}
                className={`mt-2 h-12 w-full font-bold tracking-wide border-none shadow-lg hover:shadow-xl outline-none ring-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all ${isMobileLayout ? 'text-[12px] rounded-xl' : ''}`}
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                登录
            </Button>
        </form>
    );

    return (
        <div className="min-h-screen w-full bg-white lg:p-6 flex items-center justify-center">

            {/* =======================
                MOBILE LAYOUT (lg:hidden)
               ======================= */}
            <div className="lg:hidden flex flex-col w-full h-[100dvh] overflow-hidden bg-white">

                {/* Top "Poster" Section */}
                <div className="relative h-[40vh] w-full bg-slate-900 shrink-0 overflow-hidden">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover"
                        style={{
                            backgroundImage: `url('${backgroundImage || "/login-bg.jpg"}')`,
                            backgroundPosition: "68% 35%" // Slightly top-right from center
                        }}
                    />
                    {/* Dark Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Badge - Top Left */}
                    <div className="absolute top-8 left-8 z-10">
                        <div className="inline-flex items-center justify-center px-[16px] py-[8px] rounded-[32px] bg-[#818181]/40 backdrop-blur-[4px] border border-[#CCC]/40 w-fit">
                            <span className="text-white text-xs font-medium tracking-wide">见山学院 2026</span>
                        </div>
                    </div>

                    {/* Marketing Text Content - Bottom Left */}
                    <div className="absolute bottom-14 left-8 space-y-4 z-10">
                        {/* Title */}
                        <h1 className="text-white text-xl font-black leading-tight drop-shadow-sm">
                            一个由你和
                            <span className="text-[#FFB800]">剑桥国际学者</span><br />
                            共同构建的无国界微型大学
                        </h1>

                        {/* Subtitle */}
                        <p className="text-white/80 text-xs font-light tracking-wide">
                            在此解锁学科探索的无限可能
                        </p>
                    </div>
                </div>

                {/* Bottom "Boarding Pass" Login Section */}
                <div className="flex-1 bg-white rounded-t-[32px] -mt-8 relative z-20 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] isolate overflow-hidden flex flex-col">
                    {/* Scrollable Content Container */}
                    <div className="w-full h-full overflow-y-auto px-8 pt-10 pb-8">
                        {/* Mobile Login Form */}
                        <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
                            <div className="text-left w-full space-y-2">
                                {/* Mobile Header Logo/Title */}
                                <h2 className="text-2xl font-bold text-gray-900">学生登录</h2>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-[12px] font-medium border border-red-100">
                                    {error}
                                </div>
                            )}

                            {renderForm(true)}



                            <div className="text-center mt-2 pb-6">
                                <p className="text-[12px] text-gray-500">
                                    还没有账号？{' '}
                                    <Link href="/register" className="text-primary font-bold hover:underline">
                                        立即注册
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* =======================
                DESKTOP LAYOUT (hidden lg:block)
               ======================= */}
            <div className="hidden lg:block relative w-full lg:h-[calc(100vh-3rem)] lg:rounded-[2rem] overflow-hidden bg-primary/95 group/design-root shadow-2xl">
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
                    style={{ backgroundImage: `url('${backgroundImage || "/login-bg.jpg"}')` }}
                />
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Grid Layout for Content */}
                <div className="relative z-10 w-full h-full grid grid-cols-2 p-16 gap-8">

                    {/* Left Column - Marketing Text (Bottom aligned) */}
                    <div className="flex flex-col justify-end items-start space-y-6">
                        {/* Badge */}
                        <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/10">
                            <span className="text-white font-medium text-lg tracking-wide">见山学院 2026</span>
                        </div>

                        {/* Main Title */}
                        <h1 className="text-white text-5xl xl:text-6xl font-black leading-tight tracking-tight drop-shadow-md">
                            一个由你和<br />
                            <span className="text-accent">剑桥国际学者</span><br />
                            共同构建的<br />
                            无国界微型大学
                        </h1>

                        {/* Subtitle */}
                        <p className="text-gray-200 text-lg font-light tracking-wide opacity-90">
                            在此解锁学科探索的无限可能
                        </p>
                    </div>

                    {/* Right Column - Login Card (Centered) */}
                    <div className="flex items-center justify-end h-full overflow-hidden">
                        <div className="w-full max-w-[480px] h-full bg-white/80 backdrop-blur-[5px] border border-white/40 shadow-xl rounded-[32px] p-10 relative overflow-y-auto scrollbar-hide">
                            {/* Card Content */}
                            <div className="flex flex-col gap-8 min-h-min">
                                <div className="flex flex-col gap-2 items-center text-center">
                                    {/* Desktop Logo */}
                                    <div className="relative w-[60px] h-[90px] hover:opacity-80 transition-opacity cursor-pointer mt-2 mb-2">
                                        <Link href="/">
                                            <Image
                                                src="/jianshan-login-logo.png"
                                                alt="Jianshan Logo"
                                                fill
                                                className="object-contain"
                                                priority
                                            />
                                        </Link>
                                    </div>

                                    <div className="text-left w-full mt-4">
                                        <h2 className="text-primary tracking-tight text-2xl font-bold leading-tight">学生登录</h2>
                                        <p className="text-muted-foreground/80 text-sm font-normal mt-2">
                                            欢迎来到见山申请门户，请登录。
                                        </p>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50/80 backdrop-blur-sm text-red-600 px-4 py-3 rounded-md text-sm font-medium border border-red-100">
                                        {error}
                                    </div>
                                )}

                                {renderForm(false)}

                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground/80">
                                        还没有账号？{' '}
                                        <Link href="/register" className="text-primary font-bold hover:text-primary/80 transition-colors">
                                            立即注册
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
