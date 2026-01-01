"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Application } from "@/lib/mock-api";
import { dbService } from "@/lib/db-service";
import { Button } from "@/components/ui/button";
import { Loader2, Save, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ApplicationForm } from "@/components/apply/application-form";

export default function ApplyPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [app, setApp] = useState<Application | null>(null);

    // Initial Data Fetch
    useEffect(() => {
        const fetchApp = async () => {
            if (!user) return;
            const uid = user.uid || user.id || user._id;
            try {
                let myApp = await dbService.getMyApplication(uid);
                if (!myApp) {
                    console.log("Creating new draft for:", uid);
                    myApp = await dbService.createApplication(uid, user.email || '');
                }
                // Ensure deep objects exist (migration safety)
                if (!myApp.misc) myApp.misc = { healthCondition: '', dietaryRestrictions: '', referralSource: '', goals: [], agreedToTerms: false };
                if (!myApp.essays) myApp.essays = {}; // Init if missing
                if (!myApp.personalInfo.nationality) myApp.personalInfo.nationality = '中国';


                setApp(myApp);
            } catch (err: any) {
                console.error("Error loading application:", err);
                alert("加载申请表失败，请刷新重试。" + (err.message || ""));
            } finally {
                setLoading(false);
            }
        };
        fetchApp();
    }, [user]);

    // Auth Redirect
    useEffect(() => {
        if (!authLoading && !user) router.push("/login");
    }, [authLoading, user, router]);

    // Handle Change Helper
    const handleChange = (section: keyof Application | string, field: string, value: any) => {
        if (!app) return;
        setApp(prev => {
            if (!prev) return null;
            // @ts-ignore - Dynamic key access
            const sectionData = prev[section] || {};
            return {
                ...prev,
                [section]: {
                    ...sectionData,
                    [field]: value
                }
            };
        });
    };

    // transactional update for immediate save (e.g. file upload)
    const handleAndSave = async (section: keyof Application | string, field: string, value: any) => {
        if (!app || !user) return;

        // 1. Calculate new state locally
        // @ts-ignore
        const currentData = app[section] || {};
        const newApp = {
            ...app,
            [section]: {
                ...currentData,
                [field]: value
            }
        };

        // 2. Update React State
        setApp(newApp);

        // 3. Save to DB strictly with the new app object
        setSaving(true);
        try {
            const uid = user.uid || user.id || user._id;
            await dbService.saveApplication(uid, newApp);
        } catch (err) {
            console.error("Auto-save failed", err);
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!user || !app) return;
        setSaving(true);
        try {
            const uid = user.uid || user.id || user._id;
            await dbService.saveApplication(uid, app);
            // Show success feedback
        } catch (err) {
            console.error("Save failed:", err);
            alert("保存失败，请重试");
        } finally {
            setSaving(false);
        }
    };

    const [showSubmitDialog, setShowSubmitDialog] = useState(false);

    const handlePreSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !app) return;

        // Basic Validation
        if (!app.misc?.agreedToTerms) {
            alert("请同意各项条款后提交。");
            return;
        }

        setShowSubmitDialog(true);
    };

    const confirmSubmit = async () => {
        if (!user || !app) return;
        setShowSubmitDialog(false);
        setSaving(true);
        try {
            const uid = user.uid || user.id || user._id;
            // Ensure data is saved first
            await dbService.saveApplication(uid, app);
            await dbService.submitApplication(uid);
            router.push("/dashboard");
        } catch (err) {
            console.error("Submit failed:", err);
            alert("提交失败，请联系管理员。");
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading || !app) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const isReadonly = app.status !== 'draft';

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-primary/20">
            {/* Header / Nav */}
            <div className="bg-white border-b sticky top-[var(--nav-height-current,64px)] z-40 bg-white/80 backdrop-blur-md transition-[top] duration-300">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-primary transition-colors" onClick={() => router.push('/dashboard')}>
                        <span className="text-sm font-medium">← 返回主页</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {isReadonly ? (
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                                {app.status === 'submitted' ? '已提交 Pending Review' : app.status}
                            </span>
                        ) : (
                            <>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="text-muted-foreground hover:text-primary"
                                >
                                    <Save className="h-4 w-4 mr-1" /> 保存
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 pb-32">
                <div className="mb-10 text-center space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        开启你的见山之旅
                    </h1>
                    <p className="text-slate-500 text-lg">
                        请认真填写以下信息，让我们更全面地了解独一无二的你。
                    </p>
                </div>

                <form onSubmit={handlePreSubmit}>
                    <ApplicationForm
                        app={app}
                        onChange={handleChange}
                        isReadonly={isReadonly}
                        onSubmit={handlePreSubmit}
                        onAutoSave={handleSave}
                        onFieldSave={handleAndSave}
                        saving={saving}
                        userPhone={user?.phone_number}
                    />
                </form>

                <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>确认提交申请？</DialogTitle>
                            <DialogDescription>
                                提交后你的申请将被锁定，无法再进行修改。请确保所有信息填写无误。
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-1">
                            <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                收到提交后，招生委员会将在 15 个工作日内完成初审。
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>再检查一下</Button>
                            <Button onClick={confirmSubmit}>确认提交</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}


