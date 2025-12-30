"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, MessagesSquare } from "lucide-react";
import { isAdmin } from "@/lib/utils";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await login(email, password);

            // Check if logging in as admin
            if (isAdmin(email)) {
                router.push("/admin/dashboard");
            } else {
                router.push("/dashboard");
            }
        } catch (error: any) {
            console.error("Login failed", error);
            setError("用户名或密码错误，请重试。");
        } finally {
            setLoading(false);
        }
    };

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
                            backgroundImage: "url('/login-bg.jpg')",
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

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="mobile-email" className="font-semibold text-gray-700 text-[12px]">用户名 / 邮箱</Label>
                                    <div className="relative group">
                                        <Input
                                            id="mobile-email"
                                            type="text"
                                            placeholder="用户名 / 邮箱"
                                            className="pl-11 h-12 border-gray-200 bg-gray-50 focus:bg-white transition-all focus-visible:ring-primary/20 placeholder:text-gray-400 rounded-xl text-[12px]"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="mobile-password" className="font-semibold text-gray-700 text-[12px]">密码</Label>
                                        <Link href="#" className="text-[12px] font-semibold text-gray-400 hover:text-primary transition-colors">
                                            忘记密码？
                                        </Link>
                                    </div>
                                    <div className="relative group">
                                        <Input
                                            id="mobile-password"
                                            type="password"
                                            placeholder="请输入密码"
                                            className="pl-11 h-12 border-gray-200 bg-gray-50 focus:bg-white transition-all focus-visible:ring-primary/20 placeholder:text-gray-400 rounded-xl text-[12px]"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="mt-2 h-12 w-full bg-primary hover:bg-primary/90 text-white font-bold text-[12px] rounded-xl shadow-lg outline-none border-none ring-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                                >
                                    {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                    登录
                                </Button>
                            </form>

                            <div className="relative flex py-1 items-center">
                                <div className="flex-grow border-t border-gray-100"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] uppercase font-medium tracking-wider">其他登录方式</span>
                                <div className="flex-grow border-t border-gray-100"></div>
                            </div>

                            <Button
                                variant="default"
                                className="h-12 w-full bg-[#07C160] hover:bg-[#06ad56] text-white font-bold gap-2 rounded-xl text-[12px] outline-none border-none ring-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            >
                                <MessagesSquare className="h-4 w-4" />
                                微信登录
                            </Button>

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
                    style={{ backgroundImage: "url('/login-bg.jpg')" }}
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
                        <div className="w-full max-w-[480px] h-full bg-white/60 backdrop-blur-md border border-white/40 shadow-xl rounded-[2rem] p-10 relative overflow-y-auto scrollbar-hide">
                            {/* Card Content */}
                            <div className="flex flex-col gap-8 min-h-min">
                                <div className="flex flex-col gap-2 items-center text-center">
                                    {/* Desktop Logo */}
                                    <div className="relative w-[60px] h-[90px]">
                                        <Image
                                            src="/jianshan-login-logo.png"
                                            alt="Jianshan Logo"
                                            fill
                                            className="object-contain"
                                            priority
                                        />
                                    </div>

                                    <div className="text-left w-full mt-4">
                                        <h2 className="text-primary tracking-tight text-3xl font-bold leading-tight">学生登录</h2>
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

                                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="font-semibold text-primary/90">用户名 / 邮箱</Label>
                                        <div className="relative group">
                                            <Input
                                                id="email"
                                                type="text"
                                                placeholder="用户名 / 邮箱"
                                                className="pl-11 h-12 border-primary/10 bg-white/50 focus:bg-white/80 transition-all focus-visible:ring-primary/20 placeholder:text-muted-foreground/60"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/70 pointer-events-none group-focus-within:text-primary transition-colors" />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="password" className="font-semibold text-primary/90">密码</Label>
                                            <Link href="#" className="text-xs font-semibold text-muted-foreground/80 hover:text-primary transition-colors">
                                                忘记密码？
                                            </Link>
                                        </div>
                                        <div className="relative group">
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="请输入密码"
                                                className="pl-11 h-12 border-primary/10 bg-white/50 focus:bg-white/80 transition-all focus-visible:ring-primary/20 placeholder:text-muted-foreground/60"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/70 pointer-events-none group-focus-within:text-primary transition-colors" />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="mt-2 h-12 w-full bg-primary hover:bg-primary/90 text-white font-bold tracking-wide border-none shadow-lg hover:shadow-xl outline-none ring-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                                    >
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        登录
                                    </Button>
                                </form>

                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-primary/10"></div>
                                    <span className="flex-shrink-0 mx-4 text-muted-foreground/70 text-xs uppercase font-semibold tracking-wider">其他登录方式</span>
                                    <div className="flex-grow border-t border-primary/10"></div>
                                </div>

                                <Button
                                    variant="default"
                                    className="h-12 w-full bg-[#07C160] hover:bg-[#06ad56] text-white font-bold gap-3 shadow-md hover:shadow-lg outline-none border-none ring-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                                >
                                    <MessagesSquare className="h-5 w-5" />
                                    微信登录
                                </Button>

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
