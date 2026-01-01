"use client"

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Application } from "@/lib/mock-api";
import { dbService } from "@/lib/db-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowRight, Save, CheckCircle2, AlertCircle, Quote, Sparkles, BrainCircuit, Rocket, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { Card, CardContent } from "@/components/ui/card";
import { IdeaOptionCard } from "@/components/apply/IdeaOptionCard";

// Sub-component for clean layout
function Section({ number, title, titleEn, description, children }: { number: string, title: string, titleEn: string, description?: string, children: React.ReactNode }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (!cardRef.current || !textRef.current) return;
            const rect = cardRef.current.getBoundingClientRect();
            const viewHeight = window.innerHeight;
            const center = viewHeight / 2;
            const elementCenter = rect.top + rect.height / 2;

            // Calculate distance from center (0 = at center)
            const dist = Math.abs(center - elementCenter);

            // Calculate intensity (0 to 1)
            // Full intensity at center, fades out as it moves away
            // Range: within 60% of viewport height
            let intensity = 1 - (dist / (viewHeight * 0.5));
            intensity = Math.max(0.05, Math.min(intensity, 0.4)); // Cap max opacity at 0.4, min at 0.05

            textRef.current.style.opacity = intensity.toString();
        };

        window.addEventListener('scroll', handleScroll);
        // Initial call
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <Card ref={cardRef} className="overflow-hidden border-0 shadow-sm bg-white/80 backdrop-blur-sm ring-1 ring-slate-200/50 group hover:ring-[#E1B168]/30 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 fill-mode-both">
            {/* Gradient Bar Restored */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary/80 to-primary/40" />

            <div className="relative p-6 sm:p-8 md:p-10">
                {/* Background Number - Moved to Left, Scroll-driven Opacity */}
                <div
                    ref={textRef}
                    className="absolute top-0 left-0 -mt-6 -ml-4 text-9xl font-black text-[#E1B168] select-none pointer-events-none z-0 transition-opacity duration-100 ease-out font-sans"
                    style={{ opacity: 0.05 }}
                >
                    {number}
                </div>

                {/* Header - Aligned Left (Removed pl-4) */}
                <div className="relative z-10 mb-8 pb-4 border-b border-dashed border-slate-200">
                    <div className="flex items-baseline gap-2 flex-wrap mb-1">
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h3>
                        <span className="text-lg font-medium text-slate-400 font-serif italic">{titleEn}</span>
                    </div>
                    {description && <p className="text-slate-500 text-sm mt-1">{description}</p>}
                </div>

                {/* Content */}
                <div className="relative z-10">
                    {children}
                </div>
            </div>
        </Card>
    );
}

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

    // Array handler for multi-select (e.g. goals, interests)
    const handleArrayToggle = (section: string, field: string, item: string, max: number = 3) => {
        if (!app) return;
        // @ts-ignore
        const currentArr: string[] = app[section]?.[field] || [];
        let newArr = [...currentArr];

        if (newArr.includes(item)) {
            newArr = newArr.filter(i => i !== item);
        } else {
            if (newArr.length < max) {
                newArr.push(item);
            } else {
                // Optional: Alert max reached
                return;
            }
        }
        handleChange(section, field, newArr);
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

                <form onSubmit={handlePreSubmit} className="space-y-8">

                    {/* Part 1: Basic Info */}
                    <Section number="01" title="先认识一下你" titleEn="Basic Info" description="请确保姓名与身份证/护照一致">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>姓名 (中文)</Label>
                                <Input
                                    value={app.personalInfo.name || ''}
                                    onChange={e => handleChange('personalInfo', 'name', e.target.value)}
                                    placeholder="请输入您的中文姓名" disabled={isReadonly}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>英文名 (如果有)</Label>
                                <Input
                                    value={app.personalInfo.englishName || ''}
                                    onChange={e => handleChange('personalInfo', 'englishName', e.target.value)}
                                    placeholder="English Name" disabled={isReadonly}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>性别</Label>
                                <Select disabled={isReadonly} value={app.personalInfo.gender} onValueChange={v => handleChange('personalInfo', 'gender', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择性别" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">男 Male</SelectItem>
                                        <SelectItem value="female">女 Female</SelectItem>
                                        <SelectItem value="other">其他 Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>出生年月</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            disabled={isReadonly}
                                            className={cn(
                                                "w-full justify-start text-left font-normal bg-transparent hover:bg-transparent hover:text-foreground",
                                                !app.personalInfo.birthDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {app.personalInfo.birthDate ? format(new Date(app.personalInfo.birthDate), "PPP", { locale: zhCN }) : <span>选择日期</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={app.personalInfo.birthDate ? new Date(app.personalInfo.birthDate.replace(/-/g, '/')) : undefined}
                                            onSelect={(date: Date | undefined) => date && handleChange('personalInfo', 'birthDate', format(date, 'yyyy-MM-dd'))}
                                            initialFocus
                                            locale={zhCN}
                                            captionLayout="dropdown"
                                            fromYear={1900}
                                            toYear={new Date().getFullYear()}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label className="block">是否中国国籍</Label>
                                <div className="flex items-center gap-3">
                                    <div
                                        onClick={() => !isReadonly && handleChange('personalInfo', 'nationality', '中国')}
                                        className={cn(
                                            "cursor-pointer px-4 h-9 rounded-md border text-sm font-medium transition-all flex-1 flex items-center justify-center",
                                            app.personalInfo.nationality === '中国'
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-primary/50"
                                        )}
                                    >
                                        是
                                    </div>
                                    <div
                                        onClick={() => !isReadonly && handleChange('personalInfo', 'nationality', '')}
                                        className={cn(
                                            "cursor-pointer px-4 h-9 rounded-md border text-sm font-medium transition-all flex-1 flex items-center justify-center",
                                            app.personalInfo.nationality !== '中国' && app.personalInfo.nationality !== undefined
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-primary/50"
                                        )}
                                    >
                                        否
                                    </div>
                                </div>
                            </div>

                            {app.personalInfo.nationality === '中国' ? (
                                <div className="space-y-2">
                                    <Label>身份证号</Label>
                                    <Input
                                        value={app.personalInfo.idNumber || ''}
                                        onChange={e => handleChange('personalInfo', 'idNumber', e.target.value)}
                                        placeholder="请输入18位身份证号"
                                        disabled={isReadonly}
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label>国籍</Label>
                                        <Input
                                            value={app.personalInfo.nationality === '中国' ? '' : (app.personalInfo.nationality || '')}
                                            onChange={e => handleChange('personalInfo', 'nationality', e.target.value)}
                                            placeholder="请输入您的国籍"
                                            disabled={isReadonly}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>护照号</Label>
                                        <Input
                                            value={app.personalInfo.idNumber || ''}
                                            onChange={e => handleChange('personalInfo', 'idNumber', e.target.value)}
                                            placeholder="请输入护照号码"
                                            disabled={isReadonly}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </Section>

                    {/* Part 2: Contact Info */}
                    <Section number="02" title="怎么联系你" titleEn="Contact" description="便于我们发送录取通知及重要信息">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>手机号</Label>
                                {user?.phone_number ? (
                                    <>
                                        <Input value={user.phone_number} disabled className="bg-slate-100/50" />
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3 text-green-600" /> 注册手机号，不可修改
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <Input
                                            value={app.personalInfo.phone || ''}
                                            onChange={e => handleChange('personalInfo', 'phone', e.target.value)}
                                            disabled={isReadonly}
                                            placeholder="请输入您的手机号"
                                        />
                                        <p className="text-xs text-muted-foreground">请填写您的联系电话</p>
                                    </>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>电子邮箱</Label>
                                <Input
                                    value={app.personalInfo.email || ''}
                                    onChange={e => handleChange('personalInfo', 'email', e.target.value)}
                                    placeholder="example@email.com" disabled={isReadonly}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>微信号</Label>
                                <Input
                                    value={app.personalInfo.wechatId || ''}
                                    onChange={e => handleChange('personalInfo', 'wechatId', e.target.value)}
                                    placeholder="WeChat ID" disabled={isReadonly}
                                />
                            </div>
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                                <div className="md:col-span-2 text-sm font-semibold text-orange-800 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" /> 紧急联系人 (必填)
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-orange-900/80">紧急联系人姓名</Label>
                                    <Input
                                        value={app.personalInfo.emergencyContactName || ''}
                                        onChange={e => handleChange('personalInfo', 'emergencyContactName', e.target.value)}
                                        placeholder="父母或监护人姓名" disabled={isReadonly} className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-orange-900/80">紧急联系人电话</Label>
                                    <Input
                                        value={app.personalInfo.emergencyContactPhone || ''}
                                        onChange={e => handleChange('personalInfo', 'emergencyContactPhone', e.target.value)}
                                        placeholder="联系电话" disabled={isReadonly} className="bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Part 3: Education */}
                    <Section number="03" title="关于你的学业" titleEn="Education" description="你的学术旅程">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>就读学校</Label>
                                    <Input
                                        value={app.personalInfo.school || ''}
                                        onChange={e => handleChange('personalInfo', 'school', e.target.value)}
                                        placeholder="School Name" disabled={isReadonly}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>就读年级</Label>
                                    <Select disabled={isReadonly} value={app.personalInfo.grade} onValueChange={v => handleChange('personalInfo', 'grade', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(g => (
                                                <SelectItem key={g} value={g}>{g}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>最感兴趣的学科大类 (最多选3个)</Label>
                                <div className="flex flex-wrap gap-2">
                                    {['人文社科', '自然科学', '工程技术', '艺术设计', '商业经济', '数学统计', '医学健康', '其他'].map(sub => {
                                        const isSelected = (app.personalInfo.interests || []).includes(sub);
                                        return (
                                            <button
                                                type="button"
                                                key={sub}
                                                disabled={isReadonly}
                                                onClick={() => handleArrayToggle('personalInfo', 'interests', sub)}
                                                className={cn(
                                                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                                        : "bg-white text-slate-600 border-slate-200 hover:border-primary/50 hover:bg-slate-50"
                                                )}
                                            >
                                                {sub}
                                            </button>
                                        )
                                    })}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    已选: {(app.personalInfo.interests || []).join(', ')}
                                </p>
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label>英语语言能力证明</Label>
                                <p className="text-sm text-muted-foreground mb-2">
                                    请提供雅思/托福/多邻国成绩，或上传最近一学期期末英语成绩单。
                                </p>
                                <div className="p-0">
                                    <FileUpload
                                        value={app.personalInfo.englishProficiency}
                                        onChange={(val) => handleChange('personalInfo', 'englishProficiency', val)}
                                        disabled={isReadonly}
                                        folder="scores"
                                    />
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Part 4: Thoughts */}
                    <Section number="04" title="让我们看见你的想法" titleEn="Your Ideas" description="在见山学院，这里没有标准答案，只有闪光的想法；我们珍视你独特的观察力、幽默感与思维深度。以下问题旨在帮助我们看见一个鲜活、真实、充满好奇心的你。请放飞想象，打破常规，我们渴望了解到你最真实、有趣的想法。">
                        <div className="space-y-8">
                            {/* Q1: 3 choose 1 */}
                            <div className="space-y-4">
                                <Label className="text-base text-slate-900">Q1. 请在以下问题中选择一个进行回答：</Label>

                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        {
                                            id: '1',
                                            icon: Rocket,
                                            title: "穿越时空的礼物",
                                            description: "给古人一件现代科技产品",
                                            fullText: "李白拿着录音笔（防止醉酒忘词），诸葛亮刷着天气预报 App（为了草船借箭），杨贵妃在等无人机送荔枝，秦始皇沉迷于玩《我的世界》…… 如果你可以给任何一位历史人物一件现代科技产品，你会选谁、选什么？为什么你觉得他们会相见恨晚？",
                                            image: "/assets/images/apply/history-tech.png"
                                        },
                                        {
                                            id: '2',
                                            icon: BrainCircuit,
                                            title: "智齿的建议",
                                            description: "如果身体部位会说话",
                                            fullText: "如果智齿真的拥有“智慧”，它会给你什么人生建议？",
                                            image: "/assets/images/apply/wisdom-tooth.png"
                                        },
                                        {
                                            id: '3',
                                            icon: Sparkles,
                                            title: "2050年的新职业",
                                            description: "预见未来的工作",
                                            fullText: "想象一个2050年可能存在、但今天还不存在的职业。这个职业是做什么的？为什么那时候会需要它？",
                                            image: "/assets/images/apply/future-career.png"
                                        }
                                    ].map((opt) => (
                                        <IdeaOptionCard
                                            key={opt.id}
                                            id={opt.id}
                                            title={opt.title}
                                            description={opt.description}
                                            fullText={opt.fullText}
                                            icon={opt.icon}
                                            imagePath={opt.image}
                                            isSelected={app.essays?.q1Option === opt.id}
                                            onSelect={(id) => !isReadonly && handleChange('essays', 'q1Option', id)}
                                        />
                                    ))}
                                </div>

                                {app.essays?.q1Option && (
                                    <div className="animate-in fade-in slide-in-from-top-4 duration-500 pt-2">
                                        <div className="flex justify-end items-center mb-2">

                                            <span className={cn(
                                                "text-xs transition-colors",
                                                (app.essays.q1Content || '').length > 500 ? "text-red-500 font-bold" : "text-slate-400"
                                            )}>
                                                建议500字以内 ({(app.essays.q1Content || '').length}/500)
                                            </span>
                                        </div>
                                        <Textarea
                                            value={app.essays.q1Content || ''}
                                            onChange={e => handleChange('essays', 'q1Content', e.target.value)}
                                            placeholder="提示：你可以使用 AI 工具辅助激发灵感，但我们同时希望看到经过你思考后的表达。"
                                            className="min-h-[200px] text-base leading-relaxed p-4 bg-white/50 focus:bg-white transition-colors border-primary/20 focus:border-primary"
                                            disabled={isReadonly}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Q2: English Question */}
                            <div className="space-y-4 pt-6 border-t border-slate-100">
                                <Label className="text-base text-slate-900 flex items-center gap-2">
                                    Q2. 请用英文回答以下问题：
                                </Label>
                                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/60 relative overflow-hidden">
                                    {/* Decorative bg for Q2 */}
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Quote className="h-16 w-16 text-slate-400 rotate-180" />
                                    </div>

                                    <p className="relative z-10 text-slate-700 font-medium italic leading-relaxed font-serif text-lg">
                                        "We'll spend a whole week together this summer. What's something about you — a quirk, a passion, a story, a dream — that you'd want us to know early on which could really help us to understand the "real" you?"
                                    </p>
                                </div>
                                <div>
                                    <div className="flex justify-end items-center mb-2">

                                        <span className={cn(
                                            "text-xs transition-colors",
                                            ((app.essays.q2Content || '').trim().split(/\s+/).filter(Boolean).length) > 500 ? "text-red-500 font-bold" : "text-slate-400"
                                        )}>
                                            Suggested length: 500 words ({(app.essays.q2Content || '').trim().split(/\s+/).filter(Boolean).length}/500)
                                        </span>
                                    </div>
                                    <Textarea
                                        value={app.essays.q2Content || ''}
                                        onChange={e => handleChange('essays', 'q2Content', e.target.value)}
                                        placeholder="Please answer in English..."
                                        className="min-h-[150px] font-sans"
                                        disabled={isReadonly}
                                    />
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* Part 5: Last Details */}
                    <Section number="05" title="最后几件小事" titleEn="Final Steps" description="保障你的夏令营体验">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>健康状况申报</Label>
                                    <Input
                                        value={app.misc?.healthCondition || ''}
                                        onChange={e => handleChange('misc', 'healthCondition', e.target.value)}
                                        placeholder="无 / 过敏史 / 长期服药" disabled={isReadonly}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>饮食习惯</Label>
                                    <Input
                                        value={app.misc?.dietaryRestrictions || ''}
                                        onChange={e => handleChange('misc', 'dietaryRestrictions', e.target.value)}
                                        placeholder="无 / 素食 / 清真 / 忌口" disabled={isReadonly}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>你是通过什么了解到的见山学院？</Label>
                                <Select disabled={isReadonly} value={app.misc?.referralSource} onValueChange={v => handleChange('misc', 'referralSource', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="请选择" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="wechat">微信公众号</SelectItem>
                                        <SelectItem value="friend">朋友推荐</SelectItem>
                                        <SelectItem value="school">学校老师/升学指导</SelectItem>
                                        <SelectItem value="poster">线下海报</SelectItem>
                                        <SelectItem value="other">其他</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label>最期待从见山学院获得什么？(多选 Max 3)</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {['结识志同道合的朋友', '提升英语能力', '体验创新课程', '丰富背景履历', '明确未来方向', '纯粹好玩'].map(g => {
                                        const isSelected = (app.misc?.goals || []).includes(g);
                                        return (
                                            <div
                                                key={g}
                                                onClick={() => !isReadonly && handleArrayToggle('misc', 'goals', g)}
                                                className={cn(
                                                    "cursor-pointer px-4 py-3 rounded-lg border flex items-center justify-between transition-all",
                                                    isSelected ? "bg-primary/5 border-primary" : "bg-white border-slate-200 hover:bg-slate-50"
                                                )}
                                            >
                                                <span className={cn("text-sm font-medium", isSelected ? "text-primary" : "text-slate-600")}>{g}</span>
                                                {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Terms Moved to Standalone Section */}
                        </div>
                    </Section>

                    {/* Part 6: Terms & Submit */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-start gap-4">
                                <Checkbox
                                    id="terms-standalone"
                                    disabled={isReadonly}
                                    checked={app.misc?.agreedToTerms || false}
                                    onCheckedChange={(c) => handleChange('misc', 'agreedToTerms', c === true)}
                                    className="mt-1"
                                />
                                <div className="grid gap-2 leading-none">
                                    <label
                                        htmlFor="terms-standalone"
                                        className="text-base font-semibold text-slate-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        确认并提交
                                    </label>
                                    <p className="text-sm text-slate-500 leading-normal">
                                        本人承诺上述填写的所有信息均真实有效。如果被录取，本人同意遵守见山学院夏令营的各项规章制度，积极参与课程与活动。
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-end justify-end gap-4 pt-4">
                            <p className="text-sm text-slate-400 pb-1">
                                请确认信息无误后提交，提交后将无法修改。
                            </p>
                            <Button
                                type="submit"
                                size="lg"
                                className="bg-primary hover:bg-primary/90 text-white min-w-[240px] h-12 text-base border-none shadow-none focus-visible:ring-0"
                                disabled={isReadonly || saving || !app.misc?.agreedToTerms}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        提交中...
                                    </>
                                ) : (
                                    <>
                                        提交申请 <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>

                <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>确认提交申请？</DialogTitle>
                            <DialogDescription>
                                提交后，你的申请信息将被锁定，无法再进行修改。请确保所有信息填写无误。
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-2">
                            <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                收到提交后，招生委员会将在 3-5 个工作日内完成初审。
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>再检查一下</Button>
                            <Button onClick={confirmSubmit} className="bg-primary text-white hover:bg-primary/90">确认提交</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
