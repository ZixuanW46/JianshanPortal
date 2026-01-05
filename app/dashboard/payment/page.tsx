"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { dbService } from "@/lib/db-service";
import { Application } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, ChevronLeft, MapPin, Calendar, User, FileText, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function PaymentPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [app, setApp] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApp = async () => {
            if (!user) return;
            // @ts-ignore
            const uid = user.uid || user.id || user._id;
            try {
                const myApp = await dbService.getMyApplication(uid);
                setApp(myApp);
                if (!myApp) {
                    router.replace("/dashboard");
                }
            } catch (err) {
                console.error("Error fetching app:", err);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            if (!user) {
                router.push("/login");
            } else {
                fetchApp();
            }
        }
    }, [user, authLoading, router]);

    const handlePayment = async () => {
        if (!app || !user) return;

        try {
            setLoading(true);
            const { callFunction } = await import("@/lib/cloudbase");

            if (!callFunction) {
                throw new Error("SDK not initialized");
            }

            // @ts-ignore
            const uid = user.uid || user.id || user._id;

            // Detect mobile device
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            );

            // Call Cloud Function to get Alipay URL
            const res = await callFunction({
                name: "create-alipay-order",
                data: {
                    userId: uid,
                    amount: 0.1, // Fixed amount for now as per UI
                    subject: "2026 见山夏令营学费 Jianshan Summer Camp Tuition",
                    returnUrl: window.location.origin + "/dashboard/payment/success",
                    isMobile: isMobile
                }
            });

            console.log("Payment Init Res:", res);

            if (res.result && res.result.code === 0) {
                const { payUrl } = res.result.data;
                // Redirect to Alipay
                if (payUrl) {
                    window.location.href = payUrl;
                }
            } else {
                alert("创建支付订单失败，请稍后重试。\n" + (res.result?.message || (res as any).message || "未知错误"));
            }

        } catch (err: any) {
            console.error("Payment Error:", err);
            alert("支付启动失败: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!app) return null;

    return (
        <div className="min-h-screen bg-[#F8F9FB] py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header / Back */}
                <div className="flex items-center gap-2 mb-8">
                    <Button variant="ghost" size="sm" asChild className="pl-0 hover:bg-transparent hover:text-primary">
                        <Link href="/dashboard" className="flex items-center gap-1 text-muted-foreground transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                            返回 Dashboard
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col gap-2 mb-6">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">学费缴纳 Camp Payment</h1>
                    <p className="text-slate-500">确认订单信息并完成支付以锁定您的名额</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">

                    {/* Event Banner */}
                    <div className="bg-slate-900 text-white p-8 relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-start gap-6">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-white/90 mb-4 border border-white/10">
                                    <ShieldCheck className="h-3 w-3" />
                                    官方认证 Official Camp
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold mb-2">2026 见山夏令营</h2>
                                <p className="text-white/60 text-sm font-medium tracking-wide uppercase">Jianshan Academy Summer Camp 2026</p>
                            </div>
                            <div className="text-right md:text-right flex flex-col items-start md:items-end">
                                <span className="text-sm text-white/50 mb-1">应付金额 Total</span>
                                <span className="text-3xl font-bold text-[#E1B168]">¥ 7,899</span>
                            </div>
                        </div>

                        {/* Decorative Circles */}
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-primary/20 blur-2xl"></div>
                    </div>

                    {/* Details Section */}
                    <div className="p-6 md:p-8 space-y-8">

                        {/* Grid Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Camp Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2">营地信息 Camp Info</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">2026年7月6日 - 7月12日</p>
                                            <p className="text-xs text-slate-500">7天6晚</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">上海赫贤学校</p>
                                            <p className="text-xs text-slate-500">HD Shanghai School</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Student Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2">学生信息 Student Info</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <User className="h-5 w-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{app.personalInfo?.name || "未填写"}</p>
                                            <p className="text-xs text-slate-500">申请人姓名</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FileText className="h-5 w-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{app.personalInfo?.idNumber || "未填写"}</p>
                                            <p className="text-xs text-slate-500">身份证/护照号</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Inclusions */}
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 mb-4">费用包含 & 不包含</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                        <span className="text-sm text-slate-600">学生宿舍 (7月5日入住，12日搬出)</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                        <span className="text-sm text-slate-600">所有课程物料 (Materials)</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                        <span className="text-sm text-slate-600">全额课时费 (Tuition)</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <XCircle className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                        <span className="text-sm text-slate-500">餐费 (可自行点外卖)</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <XCircle className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                        <span className="text-sm text-slate-500">往返交通费 (Transportation)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action */}
                        <div className="pt-4">
                            <Button
                                size="lg"
                                className="w-full h-14 text-lg font-bold shadow-lg shadow-blue-900/20 active:scale-[0.99] transition-all"
                                onClick={handlePayment}
                            >
                                <span className="mr-2">支付宝付款</span>
                                <span className="font-normal opacity-90 mx-1">|</span>
                                <span className="ml-1 text-xl">¥ 7,899</span>
                            </Button>
                            <p className="text-center text-xs text-slate-400 mt-4">
                                点击按钮将跳转至支付宝收银台。支付成功后请保留支付凭证。
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
