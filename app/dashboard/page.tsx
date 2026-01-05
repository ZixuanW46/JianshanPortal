"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Application } from "@/lib/types";
import { dbService } from "@/lib/db-service";
import { Button } from "@/components/ui/button";
import { Check, Clock, FileText, Calendar, Mail, Loader2, ArrowRight, CreditCard, Download, Flag, PenTool, User, Eye, FilePen } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Components ---

// Helper for formatting dates (Beijing Time)
function formatDate(dateStr?: string) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Shanghai'
    });
}

// Helper for relative time
function getRelativeTime(dateStr?: string) {
    if (!dateStr) return '';
    const now = new Date();
    const updated = new Date(dateStr);
    const diff = now.getTime() - updated.getTime();

    // milliseconds conversion
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
        return `更新于 ${Math.max(1, minutes)} 分钟前`;
    }

    if (hours < 24) {
        return `更新于 ${Math.max(1, hours)} 小时前`;
    }

    if (days < 7) {
        return `更新于 ${days} 天前`;
    }

    if (days < 30) {
        const weeks = Math.floor(days / 7);
        return `更新于 ${weeks} 周前`;
    }

    const months = Math.floor(days / 30);
    return `更新于 ${months} 月前`;
}

// Helper for expected decision date
function getExpectedDecisionDateText(dateStr?: string) {
    if (!dateStr) return '预计申请提交后1个月内';

    const date = new Date(dateStr);
    // Add 15 days
    date.setDate(date.getDate() + 15);
    // Add 1 month to get to the "farther" month
    date.setMonth(date.getMonth() + 1);

    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        timeZone: 'Asia/Shanghai'
    }) + '前';
}

function ProgressTimeline({ app }: { app: Application }) {
    const { status, registeredAt, submittedAt, decisionReleasedAt, enrolledAt } = app;
    // Current Logic:
    // Registration: Always Check
    // Application Submitted: Check if submitted+, else Future
    // Under Review: Check if decision+, Active Pulse if under_review, Future if submitted only.
    // Final Decision: Check/Flag(Color) if decision+, Future if under_review or before.

    const isSubmitted = status !== 'draft';
    const isUnderReview = ['under_review', 'decision_released', 'enrolled', 'paid', 'accepted', 'rejected', 'waitlisted'].includes(status);
    const isDecisionReleased = ['decision_released', 'enrolled', 'paid', 'accepted', 'rejected', 'waitlisted'].includes(status);
    const isEnrolled = ['enrolled', 'paid'].includes(status);
    const isPaid = status === 'paid';



    return (
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-foreground mb-6">申请进度 Progress Timeline</h3>
            <div className="grid grid-cols-[40px_1fr] gap-x-4">

                {/* --- Step 1: Registration --- */}
                {/* Icon Column */}
                <div className="flex flex-col items-center gap-1 pt-1">
                    <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white">
                        <Check size={20} className="text-white" strokeWidth={3} />
                    </div>
                    {/* Vertical Line */}
                    <div className="w-[2px] bg-primary h-full min-h-[40px]"></div>
                </div>
                {/* Text Column */}
                <div className="flex flex-col pb-8">
                    <p className="text-base font-bold leading-normal text-foreground">注册</p>
                    <p className="text-sm text-muted-foreground font-normal leading-normal">
                        {registeredAt ? `完成于 ${formatDate(registeredAt)}` : "已完成"}
                    </p>
                </div>

                {/* --- Step 2: Filling Application (New) --- */}
                {/* Icon Column */}
                <div className="flex flex-col items-center gap-1 pt-1">
                    {isSubmitted ? (
                        // Completed
                        <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white z-10">
                            <Check size={20} className="text-white" strokeWidth={3} />
                        </div>
                    ) : (
                        // Active (Draft) - Yellow Pulse
                        <div className="size-8 rounded-full border-[3px] border-accent bg-white relative z-10 shadow-[0_0_15px_rgba(225,177,104,0.4)] flex items-center justify-center">
                            <div className="size-2.5 bg-accent rounded-full animate-pulse"></div>
                        </div>
                    )}
                    {/* Vertical Line */}
                    <div className={cn(
                        "w-[2px] h-full min-h-[40px]",
                        isSubmitted ? "bg-primary" : "bg-muted"
                    )}></div>
                </div>
                {/* Text Column */}
                <div className="flex flex-col pb-8 pt-1">
                    <p className={cn("text-base font-bold leading-normal")}>
                        填写申请
                    </p>
                    <p className="text-sm text-muted-foreground font-normal leading-normal">
                        {isSubmitted ? "已完成" : "进行中..."}
                    </p>
                </div>

                {/* --- Step 3: Application Submitted --- */}
                {/* Icon Column */}
                <div className="flex flex-col items-center gap-1 pt-1">
                    {/* Top connector adjustment if needed, but the previous line flows into this */}
                    {/* 
                       Logic for Icon:
                       - If Submitted: Check (Primary)
                       - If Not: Future (Gray) - (Though realistic user only sees this if submitted usually)
                     */}
                    {isSubmitted ? (
                        <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white z-10">
                            <Check size={20} className="text-white" strokeWidth={3} />
                        </div>
                    ) : (
                        <div className="size-8 rounded-full bg-muted border-2 border-border flex items-center justify-center text-muted-foreground z-10">
                            <div className="h-2 w-2 rounded-full bg-muted-foreground/30"></div>
                        </div>
                    )}
                    {/* Vertical Line: Submitted -> Under Review */}
                    {/* If next step (Under Review) is active or done, line should be primary? 
                        Reference: "Registration" -> "App Submitted" line is primary.
                        "App Submitted" -> "Under Review" line is primary ONLY if "Under Review" is reached.
                    */}
                    <div className={cn(
                        "w-[2px] h-full min-h-[40px]",
                        isUnderReview ? "bg-primary" : "bg-muted" // Or bg-slate-200
                    )}></div>
                </div>
                {/* Text Column */}
                <div className="flex flex-col pb-8 pt-1">
                    <p className={cn("text-base font-bold leading-normal", !isSubmitted && "text-muted-foreground")}>申请已提交</p>
                    <p className="text-sm text-muted-foreground font-normal leading-normal">
                        {isSubmitted ? `提交于 ${formatDate(submittedAt)}` : "待提交"}
                    </p>
                </div>

                {/* --- Step 3: Under Review --- */}
                {/* Icon Column */}
                <div className="flex flex-col items-center gap-1 pt-1">
                    {isDecisionReleased ? (
                        // Completed
                        <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white z-10">
                            <Check size={20} className="text-white" strokeWidth={3} />
                        </div>
                    ) : isUnderReview ? (
                        // Active Pulse
                        <div className="size-8 rounded-full border-[3px] border-accent bg-white relative z-10 shadow-[0_0_15px_rgba(225,177,104,0.4)] flex items-center justify-center">
                            <div className="size-2.5 bg-accent rounded-full animate-pulse"></div>
                        </div>
                    ) : (
                        // Future
                        <div className="size-8 rounded-full bg-muted border-2 border-border flex items-center justify-center text-muted-foreground z-10">
                            <div className="h-2 w-2 rounded-full bg-muted-foreground/30"></div>
                        </div>
                    )}

                    {/* Vertical Line: Under Review -> Decision */}
                    <div className={cn(
                        "w-[2px] h-full min-h-[40px]",
                        isDecisionReleased ? "bg-primary" : "bg-muted"
                    )}></div>
                </div>
                {/* Text Column */}
                <div className="flex flex-col pb-8 pt-1">
                    <p className={cn(
                        "text-base font-bold leading-normal",
                        isUnderReview && !isDecisionReleased ? "text-primary dark:text-accent" : // Active color
                            !isUnderReview ? "text-muted-foreground" : "text-foreground"
                    )}>
                        审核中
                    </p>
                    <p className="text-sm text-muted-foreground font-normal leading-normal">
                        {isUnderReview && !isDecisionReleased ? "招生团队正在审核中" :
                            isDecisionReleased ? "审核已完成" : "等待审核"}
                    </p>
                </div>

                {/* --- Step 4: Final Decision --- */}
                {/* Icon Column */}
                <div className="flex flex-col items-center gap-1 pt-1">
                    {/* Line from top is handled by previous block */}

                    {/* Icon */}
                    {isDecisionReleased ? (
                        isEnrolled ? (
                            <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white z-10">
                                <Check size={20} className="text-white" strokeWidth={3} />
                            </div>
                        ) : (
                            // Decision Out but not enrolled (Action Required) -> Active Glow State
                            <div className="size-8 rounded-full bg-[#FFF8E6] border-[3px] border-[#E1B168] relative z-10 shadow-[0_0_15px_rgba(225,177,104,0.6)] flex items-center justify-center text-[#E1B168]">
                                <Flag size={16} className="text-[#E1B168] fill-[#E1B168] animate-pulse" />
                            </div>
                        )
                    ) : (
                        // Future
                        <div className="size-8 rounded-full bg-muted border-2 border-border flex items-center justify-center text-muted-foreground z-10">
                            <Flag size={18} />
                        </div>
                    )}

                    {/* Line to next? Only if Enrolled state exists as a step */}
                    {isEnrolled && <div className="w-[2px] bg-primary h-full min-h-[40px]"></div>}
                </div>
                {/* Text Column */}
                <div className={cn("flex flex-col pt-1", isEnrolled ? "pb-8" : "pb-0")}>
                    <p className={cn(
                        "text-base font-bold leading-normal",
                        isDecisionReleased ? "text-foreground" : "text-muted-foreground"
                    )}>
                        最终决定
                    </p>
                    <p className="text-sm text-muted-foreground font-normal leading-normal">
                        {isDecisionReleased
                            ? (decisionReleasedAt ? `结果已发布于 ${formatDate(decisionReleasedAt)}` : "结果已出")
                            : `预计${getExpectedDecisionDateText(submittedAt)}通知`}
                    </p>
                </div>

                {/* --- Optional Step 5: Offer Accepted & Payment --- */}
                {(isEnrolled || isPaid) && (
                    <>
                        {/* Icon Column - Enrolled */}
                        <div className="flex flex-col items-center gap-1 pt-0">
                            {/* Line from top */}

                            {/* Icon */}
                            <div className="size-8 rounded-full bg-green-50 border-[3px] border-green-600 relative z-10 shadow-[0_0_15px_rgba(22,163,74,0.6)] flex items-center justify-center text-green-600">
                                <Check size={20} className="text-green-600" strokeWidth={3} />
                            </div>
                            {/* Vertical Line to Paid */}
                            <div className={cn(
                                "w-[2px] h-full min-h-[40px]",
                                isPaid ? "bg-green-600" : "bg-muted"
                            )}></div>
                        </div>
                        {/* Text Column - Enrolled */}
                        <div className="flex flex-col pb-8 pt-1">
                            <p className="text-base font-bold leading-normal text-green-700">
                                接受录取
                            </p>
                            <p className="text-sm text-muted-foreground font-normal leading-normal">
                                {enrolledAt ? `完成于 ${formatDate(enrolledAt)}` : "已完成"}
                            </p>
                        </div>

                        {/* Icon Column - Payment */}
                        <div className="flex flex-col items-center gap-1 pt-0">
                            {isPaid ? (
                                <div className="size-8 rounded-full bg-green-600 text-white flex items-center justify-center z-10 shadow-lg shadow-green-200">
                                    <Check size={20} strokeWidth={3} />
                                </div>
                            ) : (
                                <div className="size-8 rounded-full border-[3px] border-green-600 bg-white relative z-10 animate-pulse flex items-center justify-center">
                                    <CreditCard size={14} className="text-green-600" />
                                </div>
                            )}
                        </div>
                        {/* Text Column - Payment */}
                        <div className="flex flex-col pb-1 pt-1">
                            <p className={cn(
                                "text-base font-bold leading-normal",
                                isPaid ? "text-green-700" : "text-foreground"
                            )}>
                                学费缴纳
                            </p>
                            <p className="text-sm text-muted-foreground font-normal leading-normal">
                                {isPaid ? (app.payment?.paidAt ? `支付于 ${formatDate(app.payment.paidAt)}` : "支付成功") : "等待支付..."}
                            </p>
                            {isPaid && <p className="text-sm font-bold text-green-600 mt-1">夏天见！☀️</p>}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}


function ApplicationDetails({ app, user }: { app: Application, user: any }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-[#F9FAFC]">
                <h3 className="text-sm font-bold tracking-wider text-muted-foreground">申请信息 Application Information</h3>
            </div>
            <div className="p-5 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                        <p className="text-xs uppercase font-bold text-muted-foreground">申请人姓名</p>
                        <p className="text-sm font-medium">{app.personalInfo?.name || <span className="italic text-muted-foreground">未填写</span>}</p>
                    </div>
                </div>
                <div className="h-px bg-border w-full"></div>
                <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                        <p className="text-xs uppercase font-bold text-muted-foreground">申请编号</p>
                        <p className="text-sm font-medium">#{app.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                </div>
                <div className="h-px bg-border w-full"></div>
                <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                        <p className="text-xs uppercase font-bold text-muted-foreground">提交日期</p>
                        <p className="text-sm font-medium">{app.submittedAt ? formatDate(app.submittedAt) : 'N/A'}</p>
                    </div>
                </div>

                {app.payment?.status === 'paid' && (
                    <>
                        <div className="h-px bg-border w-full"></div>
                        <div className="flex items-start gap-3">
                            <CreditCard className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <p className="text-xs uppercase font-bold text-green-600">支付信息</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    订单号: <span className="font-mono">{app.payment.orderId || 'N/A'}</span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    支付时间: {formatDate(app.payment.paidAt)}
                                </p>
                                <p className="text-sm font-bold text-green-700 mt-1">
                                    ¥ {app.payment.amount || '7899'}
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <div className="p-4 border-t bg-[#F9FAFC]">
                {app.status === 'draft' ? (
                    <Button variant="outline" className="w-full font-bold" asChild>
                        <Link href="/apply">
                            <FilePen className="mr-2 h-4 w-4" strokeWidth={2.5} />
                            编辑申请
                        </Link>
                    </Button>
                ) : (
                    <Button variant="outline" className="w-full font-bold" asChild>
                        <Link href="/apply">
                            <Eye className="mr-2 h-4 w-4" strokeWidth={2.5} />
                            查看完整申请
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { user, loading: authLoading, isAdmin } = useAuth();
    const router = useRouter();
    const [app, setApp] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);

    // Initial auth check checks
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/");
            } else if (isAdmin) {
                // Admin redirect
                router.replace("/admin/dashboard");
            }
        }
    }, [authLoading, user, isAdmin, router]);

    // Data Load
    useEffect(() => {
        const fetchApp = async () => {
            if (!user) return;
            const uid = user.uid || user.id || user._id;
            console.log("Dashboard fetching app for:", uid);
            try {
                let myApp = await dbService.getMyApplication(uid);

                // Auto-sync payment status if user might have paid but notification was missed
                if (myApp && myApp.status === 'enrolled' && myApp.payment?.status !== 'paid') {
                    console.log("[Dashboard] Enrolled but not paid - syncing payment status...");
                    try {
                        const { callFunction } = await import("@/lib/cloudbase");
                        if (callFunction) {
                            const syncResult = await callFunction({
                                name: "query-payment-status",
                                data: { userId: uid }
                            });
                            console.log("[Dashboard] Payment sync result:", syncResult);

                            // If sync found payment was made, re-fetch the application
                            if (syncResult?.result?.code === 0 && syncResult.result.data?.status === 'PAID') {
                                console.log("[Dashboard] Payment confirmed! Re-fetching application...");
                                myApp = await dbService.getMyApplication(uid);
                            }
                        }
                    } catch (syncErr) {
                        console.warn("[Dashboard] Payment sync failed (non-critical):", syncErr);
                    }
                }

                setApp(myApp);

                // If no app (shouldn't happen if registered), redirect or handle.
                // For real flow, usually user clicks Apply first.
                // If dashboard is home, maybe show "Start Application".
                // Current flow: if no app, redirect to welcome?
                // But welcome says "Registration Complete".
                // If myApp is null, we should probably redirect to welcome or show "Empty".
                if (!myApp) {
                    console.log("No app found on dashboard, redirecting to welcome");
                    router.replace("/welcome");
                    return;
                }
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchApp();
    }, [user, router]);

    // Helper to advance state for demo
    const handleAdvance = async () => {
        if (!user || !app) return;
        setLoading(true);
        const uid = user.uid || user.id || user._id;
        try {
            await dbService.advanceStatus(uid, app.status);
            // Re-fetch to see changes
            const updated = await dbService.getMyApplication(uid);
            setApp(updated);
        } finally {
            setLoading(false);
        }
    };

    // Helper to rollback state for demo - DISABLED for now in DB mode
    const handleRollback = async () => {
        // Not implemented in DB service yet
        console.warn("Rollback not implemented");
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user || !app) return null;

    // --- RENDER BASED ON STATUS ---

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12">

            {/* Header Area */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-black text-foreground">申请状态 Application Status</h1>
                    <p className="text-muted-foreground text-lg">追踪您的夏令营申请进度。</p>
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Main Content */}
                <div className="lg:col-span-8 flex flex-col gap-8">

                    <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border relative overflow-hidden group">
                        {/* Dynamic Backgrounds based on status */}
                        <div className={cn(
                            "absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl transition-all duration-700",
                            (app.status === 'enrolled' || app.status === 'paid') ? "bg-green-500/10" : "bg-accent/10"
                        )} />

                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                {app.status === 'paid' ? (
                                    <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-bold uppercase">已完成所有流程</span>
                                ) : app.status === 'enrolled' ? (
                                    <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-bold uppercase">已录取 - 待缴费</span>
                                ) : app.status === 'decision_released' ? (
                                    <span className="px-3 py-1 rounded-full bg-accent text-primary text-xs font-bold uppercase">申请进度已更新</span>
                                ) : (
                                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary dark:text-accent text-xs font-bold uppercase">申请进行中</span>
                                )}
                                <span className="text-xs text-muted-foreground">{getRelativeTime(app.lastUpdatedAt)}</span>
                            </div>

                            {/* MAIN STATUS TEXT */}
                            {app.status === 'paid' ? (
                                <>
                                    <h2 className="text-2xl md:text-3xl font-bold leading-tight text-green-600">支付成功！夏天见！☀️</h2>
                                    <p className="text-muted-foreground leading-relaxed">
                                        您已成功缴纳学费，名额已锁定。我们非常期待在 2026 见山夏令营与您相见！
                                        <br />
                                        更多入营指南将在营期开始前通过邮件发送给您。
                                    </p>
                                    <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row gap-4">
                                        <Button variant="outline" size="lg">
                                            下载录取通知书 <Download className="ml-2 h-5 w-5" />
                                        </Button>
                                    </div>
                                </>
                            ) : app.status === 'enrolled' ? (
                                <>
                                    <h2 className="text-2xl md:text-3xl font-bold leading-tight">录取成功，已接受 Offer！ 🎉</h2>
                                    <p className="text-muted-foreground leading-relaxed">
                                        恭喜！您已接受我们的录取通知。请完成学费缴纳以锁定您的名额。
                                    </p>
                                    <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row gap-4">
                                        <Button size="lg" asChild>
                                            <Link href="/dashboard/payment">
                                                前往缴费 <CreditCard className="ml-2 h-5 w-5" />
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="lg">
                                            下载录取通知书 <Download className="ml-2 h-5 w-5" />
                                        </Button>
                                    </div>
                                </>
                            ) : app.status === 'decision_released' ? (
                                <>
                                    <h2 className="text-2xl md:text-3xl font-bold leading-tight">申请结果已发布 🔔</h2>
                                    <p className="text-muted-foreground leading-relaxed">
                                        招生团队已完成您的申请审核。请点击下方查看结果。
                                    </p>
                                    <div className="mt-4 pt-4 border-t flex gap-4">
                                        <Button size="lg" asChild>
                                            <Link href="/acceptance">
                                                查看申请结果 <ArrowRight className="h-5 w-5" />
                                            </Link>
                                        </Button>
                                    </div>
                                </>
                            ) : app.status === 'draft' ? (
                                // Draft State
                                <>
                                    <h2 className="text-2xl md:text-3xl font-bold leading-tight">申请进行中 ✍️</h2>
                                    <p className="text-muted-foreground leading-relaxed">
                                        请尽快完成您的申请表以确保名额。我们期待审核您的申请！
                                    </p>
                                    <div className="mt-4 pt-4 border-t flex gap-4">
                                        <Button size="lg" asChild>
                                            <Link href="/apply">
                                                继续申请 <ArrowRight className="h-5 w-5" />
                                            </Link>
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                // Default: Submitted or Under Review
                                <>
                                    <h2 className="text-2xl md:text-3xl font-bold leading-tight">您的申请正在审核中 👀</h2>
                                    <p className="text-muted-foreground leading-relaxed">
                                        我们已收到您的所有文件。您预计将在{getExpectedDecisionDateText(app.submittedAt)}收到回复。
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <ProgressTimeline app={app} />

                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <ApplicationDetails app={app} user={user} />

                    {/* Contact Card */}
                    <div className="bg-primary rounded-xl p-6 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">需要帮助?</h3>
                            <p className="text-sm text-white/80 mb-4 opacity-90">请优先查看<Link href="/faq" className="mx-1 font-bold hover:underline cursor-pointer">常见问题Q&A</Link>页面；若问题仍未解决，欢迎您联系我们的招生团队。</p>
                            <Button size="sm" className="w-full sm:w-auto" asChild>
                                <a href="mailto:admissions@jianshan.com">
                                    <Mail className="mr-1 h-4 w-4" />
                                    邮件联系
                                </a>
                            </Button>
                        </div>
                        {/* Background Icon Decoration */}
                        <div className="absolute -right-6 -bottom-10 opacity-10 rotate-12 text-white pointer-events-none">
                            <Mail className="h-[120px] w-[120px]" />
                        </div>
                    </div>

                    {/* DEV TOOL: Advance State */}

                    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                        {app.status !== 'enrolled' && (
                            <Button onClick={handleAdvance} size="sm" className="shadow-xl bg-red-600 hover:bg-red-700 text-white border-2 border-white">
                                [DEV] Advance State
                            </Button>
                        )}
                        {/* Rollback disabled for now
                        {(app.status === 'decision_released' || app.status === 'enrolled') && (
                            <Button onClick={handleRollback} size="sm" className="shadow-xl bg-blue-600 hover:bg-blue-700 text-white border-2 border-white">
                                [DEV] Previous State
                            </Button>
                        )}
                        */}
                        <Button onClick={async () => {
                            if (!user) return;
                            const uid = user.uid || user.id || user._id;
                            setLoading(true);
                            await dbService.resetApplication(uid);
                            router.push("/welcome");
                        }} size="sm" className="shadow-xl bg-slate-800 hover:bg-slate-900 text-white border-2 border-white">
                            [DEV] Reset / Clear App
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}
