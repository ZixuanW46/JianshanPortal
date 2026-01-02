"use client"

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

// Separate component that uses useSearchParams
function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { handleWechatCallback } = useAuth();
    const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code) {
            setStatus("error");
            setErrorMessage("Missing authorization code");
            return;
        }

        const processCallback = async () => {
            try {
                await handleWechatCallback(code, state || "");
                setStatus("success");
                // Redirect handled in handleWechatCallback or here
                router.replace("/dashboard");
            } catch (error: any) {
                console.error("Callback processing failed", error);
                setStatus("error");
                setErrorMessage(error.message || "登录失败");
                // Optional: redirect back to login after delay
                setTimeout(() => router.replace("/login"), 3000);
            }
        };

        processCallback();
    }, [searchParams, handleWechatCallback, router]);

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white">
            <div className="text-center space-y-4">
                {status === "processing" && (
                    <>
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                        <p className="text-gray-500">正在处理登录...</p>
                    </>
                )}
                {status === "success" && (
                    <>
                        <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                        <p className="text-green-600 font-medium">登录成功，正在跳转...</p>
                    </>
                )}
                {status === "error" && (
                    <>
                        <div className="h-10 w-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="text-red-600 font-medium">登录失败: {errorMessage}</p>
                        <p className="text-sm text-gray-400">即将返回登录页...</p>
                    </>
                )}
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen w-full flex items-center justify-center bg-white">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
