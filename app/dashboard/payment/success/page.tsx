"use client"

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { dbService } from "@/lib/db-service";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { db, callFunction } from "@/lib/cloudbase";

function PaymentStatusContent() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const outTradeNo = searchParams.get("out_trade_no");

    const [status, setStatus] = useState<'checking' | 'success' | 'failed'>('checking');
    const [message, setMessage] = useState("正在确认支付结果...");
    const pollCount = useRef(0);

    useEffect(() => {
        if (!outTradeNo) {
            setStatus('failed');
            setMessage("无效的订单号");
            return;
        }

        const checkStatus = async () => {
            if (pollCount.current > 20) { // Poll for ~40-60 seconds
                setStatus('failed');
                setMessage("支付确认为超时，请稍后在 Dashboard 查看状态。如果已扣款，请联系客服。");
                return;
            }

            try {
                if (!callFunction) return;

                // Call Cloud Function to Sync & Query
                const { result } = await callFunction({
                    name: "query-payment-status",
                    data: { outTradeNo }
                });

                if (result && result.code === 0) {
                    if (result.data.status === 'PAID') {
                        setStatus('success');
                        pollCount.current = 100; // Stop polling

                        // Force refresh user profile/application status if needed
                        // But since we navigate to dashboard, it triggers re-fetch usually
                        return;
                    }
                    // If PENDING, loop continues
                } else {
                    console.warn("Query function returned error:", result);
                }

            } catch (err) {
                console.warn("Status check failed:", err);
            }

            pollCount.current++;
            setTimeout(checkStatus, 3000); // Poll every 3s (Cloud Function is slower than local DB read)
        };

        checkStatus();

    }, [outTradeNo]);

    if (!outTradeNo) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-500">参数错误</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center space-y-6">

                {status === 'checking' && (
                    <>
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">正在确认支付...</h2>
                            <p className="text-sm text-slate-500 mt-2">请勿关闭页面，这通常需要几秒钟</p>
                            <p className="text-xs text-slate-400 mt-4">订单号: {outTradeNo}</p>
                        </div>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-300">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">支付成功！</h2>
                            <p className="text-sm text-slate-500 mt-2">Payment Successful</p>
                            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                                <p className="text-sm text-slate-700">您的名额已锁定</p>
                                <p className="text-xs text-slate-500 mt-1">我们将尽快发送确认邮件至您的邮箱</p>
                            </div>
                        </div>
                        <div className="pt-4 flex flex-col gap-3">
                            <Button asChild size="lg" className="w-full font-bold">
                                <Link href="/dashboard">
                                    返回 Dashboard <ChevronRight className="w-4 h-4 ml-1" />
                                </Link>
                            </Button>
                        </div>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">状态确认超时</h2>
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
                    </>
                )}
            </div>
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
