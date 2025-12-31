"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Application } from "@/lib/mock-api"; // Keeping type definition
import { dbService } from "@/lib/db-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowRight, Save, Tent, User, GraduationCap, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";




export default function ApplyPage() {
    const { user, loading: authLoading } = useAuth();

    const statusMap: Record<string, string> = {
        draft: '草稿',
        submitted: '已提交',
        under_review: '审核中',
        decision_released: '结果已出',
        enrolled: '已录取',
        rejected: '未录取',
        waitlisted: '候补名单',
    };
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [app, setApp] = useState<Application | null>(null);

    // Status check
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [authLoading, user, router]);

    // Load Data
    useEffect(() => {
        const fetchApp = async () => {
            if (!user) return;
            // Standardize ID usage. CloudBase 'user' typically has 'uid'.
            // Fallback to 'id' or '_id' if needed, but 'uid' is best for consistency with auth.
            const uid = user.uid || user.id || user._id; // Ensure we get a valid string

            console.log("Fetching application for user:", uid);

            try {
                // Use cloud DB service
                // This now THROWS on permission error, and returns NULL on clean "not found".
                let myApp = await dbService.getMyApplication(uid);

                if (!myApp) {
                    console.log("No application found. Creating new draft for:", uid);
                    // createApplication uses .set(id), so it is idempotent.
                    // If two requests hit this, they write the same data to the same ID. No duplicates.
                    // Pass user.email to be stored for notifications
                    myApp = await dbService.createApplication(uid, user.email);
                    console.log("Created new application:", myApp);
                } else {
                    console.log("Found existing application:", myApp);
                }
                setApp(myApp);
            } catch (err: any) {
                console.error("Error fetching/creating application:", err);
                // If permission denied, explicit alert
                // If permission denied, explicit alert
                if (err.message && err.message.includes('CloudBase Permission Denied')) {
                    alert("Account Setup Error: Database permission denied. Please contact the administrator.");
                } else if (err.code === 'DATABASE_PERMISSION_DENIED') {
                    alert("Database Permission Denied. Please contact administrator.");
                } else {
                    alert("Failed to load application. " + (err.message || "Unknown error"));
                }
            } finally {
                setLoading(false);
            }
        };
        fetchApp(); // Don't wait for 'if (user)' inside effect, check inside func but trigger on [user]
    }, [user]);

    // Handle Input Change (Deep update helper)
    const handleChange = (section: keyof Application | string, field: string, value: string) => {
        if (!app) return;

        setApp(prev => {
            if (!prev) return null;
            // Handle nested objects like personalInfo.firstName
            if (section === 'personalInfo' || section === 'essays') {
                return {
                    ...prev,
                    [section]: {
                        ...prev[section as 'personalInfo' | 'essays'],
                        [field]: value
                    }
                }
            }
            return prev;
        });
    };

    const handleSave = async () => {
        if (!user || !app) return;
        const uid = user.uid || user.id || user._id;
        console.log("Saving draft for:", uid);
        setSaving(true);
        try {
            await dbService.saveApplication(uid, app);
            console.log("Draft saved successfully");
            router.push("/dashboard");
        } catch (err) {
            console.error("Failed to save draft:", err);
            alert("Failed to save draft. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !app) return;
        const uid = user.uid || user.id || user._id;
        console.log("Submitting application for:", uid);
        setSaving(true);
        try {
            // Perform validation here if needed
            // Also ensure latest data is saved before submit status change
            await dbService.saveApplication(uid, app);
            await dbService.submitApplication(uid);
            console.log("Application submitted successfully");
            router.push("/dashboard");
        } catch (err) {
            console.error("Failed to submit application:", err);
            alert("Failed to submit application. Please try again or contact support.");
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading || !app) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const isReadonly = app.status !== 'draft';

    return (
        <div className="min-h-screen bg-background">
            {/* Header logic is in main Navbar, but we add a sub-header context if needed, 
          though the design has a unified header. We'll stick to the page content. */}

            <div className="flex flex-1 justify-center py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col w-full max-w-5xl gap-6">

                    {/* Breadcrumb */}
                    <nav className="flex items-center text-sm font-medium">
                        <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer" onClick={() => router.push('/dashboard')}>主页</span>
                        <span className="mx-2 text-muted-foreground">/</span>
                        <span className="text-primary font-semibold">申请表</span>
                    </nav>

                    <div className="flex flex-col gap-2">
                        <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-primary">
                            学生申请表
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            请填写以下详细信息以注册即将到来的夏令营。
                        </p>
                        {isReadonly && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-lg flex items-center gap-2 mt-2">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="font-medium">申请已提交。状态：{statusMap[app.status] || app.status}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col rounded-xl bg-card border shadow-sm overflow-hidden">
                        {/* Progress Bar Visual (Static for now or calculated) */}
                        <div className="h-1.5 w-full bg-muted">
                            <div className="h-full w-2/3 bg-accent rounded-r-full shadow-sm"></div>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col">

                            {/* Section 1: Personal Info */}
                            <div className="p-6 md:p-8 border-b">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-md">1</span>
                                    <h3 className="text-xl font-bold text-foreground">个人信息</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="grid gap-2">
                                        <Label>名 (First Name)</Label>
                                        <Input
                                            value={app.personalInfo.firstName}
                                            onChange={(e) => handleChange('personalInfo', 'firstName', e.target.value)}
                                            placeholder="输入名"
                                            disabled={isReadonly}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>姓 (Last Name)</Label>
                                        <Input
                                            value={app.personalInfo.lastName}
                                            onChange={(e) => handleChange('personalInfo', 'lastName', e.target.value)}
                                            placeholder="输入姓"
                                            disabled={isReadonly}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>电话号码</Label>
                                        <Input
                                            value={app.personalInfo.phone}
                                            onChange={(e) => handleChange('personalInfo', 'phone', e.target.value)}
                                            placeholder="+86 ..."
                                            disabled={isReadonly}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>电子邮箱</Label>
                                        <Input
                                            value={app.personalInfo.email || ''}
                                            onChange={(e) => handleChange('personalInfo', 'email', e.target.value)}
                                            placeholder="student@example.com"
                                            disabled={isReadonly}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>微信号</Label>
                                        <Input
                                            value={app.personalInfo.wechatId || ''}
                                            onChange={(e) => handleChange('personalInfo', 'wechatId', e.target.value)}
                                            placeholder="WeChat ID"
                                            disabled={isReadonly}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Education (Merged logic for simplicity given mock data structure) */}
                            <div className="p-6 md:p-8 border-b">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-md">2</span>
                                    <h3 className="text-xl font-bold text-foreground">教育背景</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="grid gap-2 md:col-span-2">
                                        <Label>所在学校</Label>
                                        <Input
                                            value={app.personalInfo.school}
                                            onChange={(e) => handleChange('personalInfo', 'school', e.target.value)}
                                            placeholder="输入学校名称"
                                            disabled={isReadonly}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>年级</Label>
                                        <Select
                                            disabled={isReadonly}
                                            value={app.personalInfo.grade}
                                            onValueChange={(val) => handleChange('personalInfo', 'grade', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="选择年级" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Grade 9">Grade 9</SelectItem>
                                                <SelectItem value="Grade 10">Grade 10</SelectItem>
                                                <SelectItem value="Grade 11">Grade 11</SelectItem>
                                                <SelectItem value="Grade 12">Grade 12</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Essays */}
                            <div className="p-6 md:p-8 bg-primary/5 dark:bg-primary/10">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-md">3</span>
                                    <h3 className="text-xl font-bold text-foreground">夏令营详情</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="grid gap-2">
                                        <Label>您为什么想参加见山夏令营？</Label>
                                        <Textarea
                                            className="h-32 resize-none bg-background"
                                            placeholder="告诉我们您的兴趣和目标..."
                                            value={app.essays.question1}
                                            onChange={(e) => handleChange('essays', 'question1', e.target.value)}
                                            disabled={isReadonly}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>医疗状况或饮食限制</Label>
                                        <Textarea
                                            className="h-24 resize-none bg-background"
                                            placeholder="请列出任何过敏、药物或饮食需求..."
                                            value={app.essays.question2}
                                            onChange={(e) => handleChange('essays', 'question2', e.target.value)}
                                            disabled={isReadonly}
                                        />
                                    </div>

                                    <div className="flex items-start gap-3 mt-2">
                                        <Checkbox id="terms" disabled={isReadonly} />
                                        <Label htmlFor="terms" className="text-sm text-muted-foreground font-normal leading-normal">
                                            本人同意<a href="#" className="text-primary font-bold hover:text-accent hover:underline">条款与条件</a>并确认所填信息真实有效。
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 p-6 md:px-8 md:py-6 bg-card border-t sticky bottom-0 z-10">
                                {isReadonly ? (
                                    <div className="text-muted-foreground text-sm">申请状态为 {statusMap[app.status] || app.status}。已锁定修改。</div>
                                ) : (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="w-full sm:w-auto bg-slate-100 text-slate-600 border-2 border-slate-200 font-bold hover:bg-slate-200 hover:text-slate-800 hover:border-slate-300"
                                        >
                                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            保存草稿
                                        </Button>
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <span className="text-xs font-medium text-muted-foreground hidden sm:block">
                                                上次保存于 {new Date(app.lastUpdatedAt).toLocaleTimeString('zh-CN', { timeZone: 'Asia/Shanghai' })}
                                            </span>
                                            <Button
                                                type="submit"
                                                disabled={saving}
                                                className="w-full sm:w-auto font-bold gap-2"
                                            >
                                                提交申请
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
