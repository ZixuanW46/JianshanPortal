"use client";

import React from "react";
import { Application } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowRight, CheckCircle2, AlertCircle, Quote, Sparkles, BrainCircuit, Rocket, CalendarIcon, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileUpload } from "@/components/ui/file-upload";
import { IdeaOptionCard } from "@/components/apply/IdeaOptionCard";
import { Section } from "@/components/apply/section";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ApplicationFormProps {
    app: Application;
    onChange: (section: keyof Application | string, field: string, value: any) => void;
    isReadonly?: boolean;
    onSubmit?: (e: React.FormEvent) => void;
    onAutoSave?: () => void;
    onFieldSave?: (section: string, field: string, value: any) => Promise<void>;
    saving?: boolean;
    userPhone?: string; // To display locked phone number
}

export function ApplicationForm({ app, onChange, isReadonly = false, onSubmit, onAutoSave, onFieldSave, saving = false, userPhone }: ApplicationFormProps) {

    const [isHostSchoolNo, setIsHostSchoolNo] = React.useState(false);

    // Helper for array toggle
    const handleArrayToggle = (section: string, field: string, item: string, max: number = 3) => {
        if (isReadonly) return;
        // @ts-ignore
        const currentArr: string[] = app[section]?.[field] || [];
        let newArr = [...currentArr];

        if (newArr.includes(item)) {
            newArr = newArr.filter(i => i !== item);
        } else {
            if (newArr.length < max) {
                newArr.push(item);
            } else {
                return;
            }
        }
        onChange(section, field, newArr);
    };

    return (
        <div className="space-y-8">
            {/* Part 1: Basic Info */}
            {/* Part 1: Camp Selection */}
            <Section number="01" title="选择营地" titleEn="Camp Selection" description="请选择您要报名的营地">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shanghai Card */}
                    <div
                        onClick={() => !isReadonly && onChange('personalInfo', 'camp', 'shanghai')}
                        className={cn(
                            "group cursor-pointer relative overflow-hidden rounded-2xl border-2 transition-all duration-300 h-[240px]",
                            app.personalInfo.camp === 'shanghai'
                                ? "border-primary shadow-lg"
                                : "border-slate-100 bg-white hover:border-primary/30 hover:shadow-md"
                        )}
                    >
                        {/* Selected Checkmark */}
                        {app.personalInfo.camp === 'shanghai' && (
                            <div className="absolute top-4 right-4 z-30 bg-white rounded-full p-1 shadow-sm animate-in fade-in zoom-in duration-300">
                                <CheckCircle2 className="w-6 h-6 text-primary fill-primary/10" />
                            </div>
                        )}

                        {/* Background Layer - Cool Art (Visible on Select) */}
                        <div
                            className={cn(
                                "absolute inset-0 z-0 transition-opacity duration-500",
                                app.personalInfo.camp === 'shanghai' ? "opacity-100" : "opacity-0"
                            )}
                        >
                            <div className="absolute inset-0 bg-blue-600 mix-blend-multiply opacity-90 z-10" />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/assets/camp-shanghai-bg.png"
                                alt=""
                                className="w-full h-full object-cover grayscale opacity-60 scale-100"
                            />
                        </div>

                        {/* Background Layer - Line Art (Visible on Default) */}
                        <div
                            className={cn(
                                "absolute bottom-2 right-0 w-38 h-38 z-0 transition-opacity",
                                app.personalInfo.camp === 'shanghai'
                                    ? "opacity-0 duration-0"
                                    : "opacity-30 grayscale group-hover:opacity-50 duration-400 delay-300"
                            )}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/assets/camp-shanghai.png" alt="" className="w-full h-full object-contain" />
                        </div>

                        <div className="p-8 relative z-20 h-full flex flex-col justify-between">
                            <div>
                                <h3
                                    className={cn(
                                        "text-4xl font-black tracking-tighter mb-2 transition-colors duration-300",
                                        app.personalInfo.camp === 'shanghai' ? "text-white" : "text-slate-900"
                                    )}
                                    style={{ fontFamily: 'var(--font-heading)' }} // Assuming a heading font variable exists, or fallback
                                >
                                    Shanghai
                                </h3>
                                <div className={cn(
                                    "text-lg font-medium transition-colors duration-300",
                                    app.personalInfo.camp === 'shanghai' ? "text-blue-100" : "text-slate-500"
                                )}>
                                    上海
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className={cn(
                                    "text-sm font-medium transition-colors duration-300 flex items-center gap-2",
                                    app.personalInfo.camp === 'shanghai' ? "text-white" : "text-slate-600"
                                )}>

                                    <span>地点：上海赫贤学校</span>
                                </div>
                                <div className={cn(
                                    "text-sm font-medium transition-colors duration-300 flex items-center gap-2",
                                    app.personalInfo.camp === 'shanghai' ? "text-blue-100" : "text-slate-400"
                                )}>

                                    <span>时间：2026年7月6日 - 7月12日</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hangzhou Card */}
                    <div
                        onClick={() => !isReadonly && onChange('personalInfo', 'camp', 'hangzhou')}
                        className={cn(
                            "group cursor-pointer relative overflow-hidden rounded-2xl border-2 transition-all duration-300 h-[240px]",
                            app.personalInfo.camp === 'hangzhou'
                                ? "border-teal-500 shadow-lg"
                                : "border-slate-100 bg-white hover:border-teal-500/30 hover:shadow-md"
                        )}
                    >
                        {/* Selected Checkmark */}
                        {app.personalInfo.camp === 'hangzhou' && (
                            <div className="absolute top-4 right-4 z-30 bg-white rounded-full p-1 shadow-sm animate-in fade-in zoom-in duration-300">
                                <CheckCircle2 className="w-6 h-6 text-teal-600 fill-teal-50" />
                            </div>
                        )}

                        {/* Background Layer - Cool Art (Visible on Select) */}
                        <div
                            className={cn(
                                "absolute inset-0 z-0 transition-opacity duration-500",
                                app.personalInfo.camp === 'hangzhou' ? "opacity-100" : "opacity-0"
                            )}
                        >
                            <div className="absolute inset-0 bg-teal-600 mix-blend-multiply opacity-90 z-10" />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/assets/camp-hangzhou-bg.png"
                                alt=""
                                className="w-full h-full object-cover grayscale opacity-60 scale-100"
                            />
                        </div>

                        {/* Background Layer - Line Art (Visible on Default) */}
                        <div
                            className={cn(
                                "absolute bottom-2 right-2 w-32 h-32 z-0 transition-opacity",
                                app.personalInfo.camp === 'hangzhou'
                                    ? "opacity-0 duration-0"
                                    : "opacity-30 grayscale group-hover:opacity-50 duration-400 delay-300"
                            )}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/assets/camp-hangzhou-line.png" alt="" className="w-full h-full object-contain" />
                        </div>

                        <div className="p-8 relative z-20 h-full flex flex-col justify-between">
                            <div>
                                <h3
                                    className={cn(
                                        "text-4xl font-black tracking-tighter mb-2 transition-colors duration-300",
                                        app.personalInfo.camp === 'hangzhou' ? "text-white" : "text-slate-900"
                                    )}
                                    style={{ fontFamily: 'var(--font-heading)' }}
                                >
                                    Hangzhou
                                </h3>
                                <div className={cn(
                                    "text-lg font-medium transition-colors duration-300",
                                    app.personalInfo.camp === 'hangzhou' ? "text-teal-100" : "text-slate-500"
                                )}>
                                    杭州
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className={cn(
                                    "text-sm font-medium transition-colors duration-300 flex items-center gap-2",
                                    app.personalInfo.camp === 'hangzhou' ? "text-white" : "text-slate-600"
                                )}>

                                    <span>地点：杭州橄榄树学校</span>
                                </div>
                                <div className={cn(
                                    "text-sm font-medium transition-colors duration-300 flex items-center gap-2",
                                    app.personalInfo.camp === 'hangzhou' ? "text-teal-100" : "text-slate-400"
                                )}>

                                    <span>时间：2026年8月2日 - 8月8日</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Part 2: Basic Info */}
            <Section number="02" title="先认识一下你" titleEn="Basic Info" description="请确保姓名与身份证/护照一致">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>姓名 (中文)</Label>
                        <Input
                            value={app.personalInfo.name || ''}
                            onChange={e => onChange('personalInfo', 'name', e.target.value)}
                            placeholder="请输入您的中文姓名" disabled={isReadonly}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>英文名 (如果有)</Label>
                        <Input
                            value={app.personalInfo.englishName || ''}
                            onChange={e => onChange('personalInfo', 'englishName', e.target.value)}
                            placeholder="English Name" disabled={isReadonly}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>性别</Label>
                        <Select disabled={isReadonly} value={app.personalInfo.gender} onValueChange={v => onChange('personalInfo', 'gender', v)}>
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
                                    onSelect={(date: Date | undefined) => date && onChange('personalInfo', 'birthDate', format(date, 'yyyy-MM-dd'))}
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
                                onClick={() => !isReadonly && onChange('personalInfo', 'nationality', '中国')}
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
                                onClick={() => !isReadonly && onChange('personalInfo', 'nationality', '')}
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
                                onChange={e => onChange('personalInfo', 'idNumber', e.target.value)}
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
                                    onChange={e => onChange('personalInfo', 'nationality', e.target.value)}
                                    placeholder="请输入您的国籍"
                                    disabled={isReadonly}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>护照号</Label>
                                <Input
                                    value={app.personalInfo.idNumber || ''}
                                    onChange={e => onChange('personalInfo', 'idNumber', e.target.value)}
                                    placeholder="请输入护照号码"
                                    disabled={isReadonly}
                                />
                            </div>
                        </>
                    )}
                </div>
            </Section>

            {/* Part 2: Contact Info */}
            {/* Part 3: Contact Info */}
            <Section number="03" title="怎么联系你" titleEn="Contact" description="便于我们发送录取通知及重要信息">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>电子邮箱</Label>
                        <Input
                            value={app.personalInfo.email || ''}
                            onChange={e => onChange('personalInfo', 'email', e.target.value)}
                            placeholder="example@email.com" disabled={isReadonly}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>微信号</Label>
                        <Input
                            value={app.personalInfo.wechatId || ''}
                            onChange={e => onChange('personalInfo', 'wechatId', e.target.value)}
                            placeholder="学生微信号" disabled={isReadonly}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>紧急联系人姓名</Label>
                        <Input
                            value={app.personalInfo.emergencyContactName || ''}
                            onChange={e => onChange('personalInfo', 'emergencyContactName', e.target.value)}
                            placeholder="父母或监护人姓名" disabled={isReadonly}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>紧急联系人电话</Label>
                        <Input
                            value={app.personalInfo.emergencyContactPhone || ''}
                            onChange={e => onChange('personalInfo', 'emergencyContactPhone', e.target.value)}
                            placeholder="联系电话" disabled={isReadonly}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>紧急联系人微信号</Label>
                        <Input
                            value={app.personalInfo.emergencyContactWechat || ''}
                            onChange={e => onChange('personalInfo', 'emergencyContactWechat', e.target.value)}
                            placeholder="父母或监护人微信号" disabled={isReadonly}
                        />
                    </div>
                </div>
            </Section>

            {/* Part 3: Education */}
            {/* Part 4: Education */}
            < Section number="04" title="关于你的学业" titleEn="Education" description="你的学术旅程" >
                <div className="space-y-6">
                    {(() => {
                        const camp = app.personalInfo.camp;
                        let hostSchoolName = '';
                        let hostSchoolLabel = '';
                        if (camp === 'shanghai') {
                            hostSchoolName = '上海赫贤学校';
                            hostSchoolLabel = '上海赫贤';
                        }
                        if (camp === 'hangzhou') {
                            hostSchoolName = '杭州橄榄树学校';
                            hostSchoolLabel = '杭州橄榄树';
                        }

                        // Determine render state
                        const isHostSchool = !!hostSchoolName && app.personalInfo.school === hostSchoolName;
                        const showInput = isHostSchoolNo || (!!app.personalInfo.school && !isHostSchool && !!hostSchoolName);

                        return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Slot 1: School Question or Standard Input */}
                                <div className="space-y-2">
                                    {!hostSchoolName ? (
                                        <>
                                            <Label>就读学校</Label>
                                            <Input
                                                value={app.personalInfo.school || ''}
                                                onChange={e => onChange('personalInfo', 'school', e.target.value)}
                                                placeholder="School Name" disabled={isReadonly}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <Label className="text-sm text-slate-900 font-medium leading-snug">
                                                是否为{hostSchoolLabel}本校学生？
                                            </Label>
                                            <div className="flex items-center gap-4 h-10">
                                                <RadioGroup
                                                    disabled={isReadonly}
                                                    value={isHostSchool ? 'yes' : (showInput ? 'no' : undefined)}
                                                    onValueChange={(val) => {
                                                        if (val === 'yes') {
                                                            onChange('personalInfo', 'school', hostSchoolName);
                                                            setIsHostSchoolNo(false);
                                                        } else {
                                                            if (isHostSchool) {
                                                                onChange('personalInfo', 'school', '');
                                                            }
                                                            setIsHostSchoolNo(true);
                                                        }
                                                    }}
                                                    className="flex space-x-4"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="yes" id="school-yes" />
                                                        <Label htmlFor="school-yes" className="font-normal cursor-pointer">是</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="no" id="school-no" />
                                                        <Label htmlFor="school-no" className="font-normal cursor-pointer">否</Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Slot 2: School Input (Conditional) */}
                                {hostSchoolName && showInput && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <Label>就读学校</Label>
                                        <Input
                                            value={app.personalInfo.school || ''}
                                            onChange={e => onChange('personalInfo', 'school', e.target.value)}
                                            placeholder="请输入就读学校名称"
                                            disabled={isReadonly}
                                            autoFocus
                                        />
                                    </div>
                                )}

                                {/* Slot 3 (or 2): Grade */}
                                <div className="space-y-2">
                                    <Label>就读年级</Label>
                                    <Select disabled={isReadonly} value={app.personalInfo.grade} onValueChange={v => onChange('personalInfo', 'grade', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(g => (
                                                <SelectItem key={g} value={g}>{g}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        );
                    })()}

                    <div className="space-y-3">
                        <Label>最感兴趣的学科大类 (最多选3个)</Label>
                        <div className="space-y-4">
                            {[
                                { name: '自然科学', items: ['数学', '物理', '化学', '生物', '医学'] },
                                { name: '技术工程', items: ['计算机', '工程', '材料学'] },
                                { name: '社会经济', items: ['经济学', '商科/金融', '社会学', '政治学', '法律', '教育学', '心理学'] },
                                { name: '人文艺术', items: ['哲学', '历史', '艺术/设计'] }
                            ].map((group) => (
                                <div key={group.name} className="space-y-2">
                                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                                        {group.name}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {group.items.map(sub => {
                                            const isSelected = (app.personalInfo.interests || []).includes(sub);
                                            return (
                                                <button
                                                    type="button"
                                                    key={sub}
                                                    disabled={isReadonly}
                                                    onClick={() => handleArrayToggle('personalInfo', 'interests', sub)}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 border",
                                                        isSelected
                                                            ? "bg-primary text-white border-primary shadow-sm"
                                                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                                    )}
                                                >
                                                    {sub}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* Other Option Standalone */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    disabled={isReadonly}
                                    onClick={() => handleArrayToggle('personalInfo', 'interests', '其他')}
                                    className={cn(
                                        "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 border",
                                        (app.personalInfo.interests || []).includes('其他')
                                            ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50 border-dashed"
                                    )}
                                >
                                    其他
                                </button>
                            </div>
                        </div>
                        {/* Conditional Input for '其他' */}
                        {(app.personalInfo.interests || []).includes('其他') && (
                            <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label className="text-sm text-slate-600 mb-1.5 block">请输入其他感兴趣的学科：</Label>
                                <Input
                                    value={app.personalInfo.otherInterest || ''}
                                    onChange={e => onChange('personalInfo', 'otherInterest', e.target.value)}
                                    placeholder="例如：天文学、建筑学..."
                                    disabled={isReadonly}
                                    autoFocus
                                />
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground pt-2">
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
                                onChange={(val) => {
                                    if (onFieldSave) {
                                        onFieldSave('personalInfo', 'englishProficiency', val);
                                    } else {
                                        onChange('personalInfo', 'englishProficiency', val);
                                    }
                                }}
                                disabled={isReadonly}
                                folder="appEnglishLevelProf"
                                userId={app.userId}
                            // onUploadSuccess is no longer needed for save as onFieldSave handles it
                            />
                        </div>
                    </div>
                </div>
            </Section >

            {/* Part 4: Thoughts */}
            {/* Part 5: Thoughts */}
            < Section number="05" title="让我们看见你的想法" titleEn="Your Ideas" description="在见山学院，这里没有标准答案，只有闪光的想法；我们珍视你独特的观察力、幽默感与思维深度。以下问题旨在帮助我们看见一个鲜活、真实、充满好奇心的你。请放飞想象，打破常规，我们渴望了解到你最真实、有趣的想法。" >
                <div className="space-y-8">
                    {/* Q1: 3 choose 1 */}
                    <div className="space-y-4">
                        <Label className="text-base text-slate-900">Q1. 请在以下问题中选择一个进行回答（选中以展开问题）：</Label>

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
                                    onSelect={(id) => !isReadonly && onChange('essays', 'q1Option', id)}
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
                                    onChange={e => onChange('essays', 'q1Content', e.target.value)}
                                    placeholder="请在这里回答你选择的问题... 期待看到你有趣的想法！"
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
                                onChange={e => onChange('essays', 'q2Content', e.target.value)}
                                placeholder="Please answer in English..."
                                className="min-h-[150px] font-sans"
                                disabled={isReadonly}
                            />
                        </div>
                    </div>
                </div>
            </Section >

            {/* Part 5: Last Details */}
            {/* Part 6: Last Details */}
            < Section number="06" title="最后几件小事" titleEn="Final Steps" description="保障你的夏令营体验" >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label>是否有特殊健康状况申报？</Label>
                            <RadioGroup
                                disabled={isReadonly}
                                value={(app.misc?.healthCondition === '无' || app.misc?.healthCondition == null) ? 'no' : 'yes'}
                                onValueChange={(val) => {
                                    if (val === 'no') {
                                        onChange('misc', 'healthCondition', '无');
                                    } else {
                                        onChange('misc', 'healthCondition', '');
                                    }
                                }}
                                className="flex space-x-4 mb-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no" id="health-no" />
                                    <Label htmlFor="health-no" className="font-normal cursor-pointer">无</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="yes" id="health-yes" />
                                    <Label htmlFor="health-yes" className="font-normal cursor-pointer">有需要申报的情况</Label>
                                </div>
                            </RadioGroup>
                            {app.misc?.healthCondition !== '无' && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <Input
                                        value={app.misc?.healthCondition}
                                        onChange={e => onChange('misc', 'healthCondition', e.target.value)}
                                        placeholder="请具体描述（如过敏史、长期服药等）"
                                        disabled={isReadonly}
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <Label>是否有特殊饮食习惯？</Label>
                            <RadioGroup
                                disabled={isReadonly}
                                value={(app.misc?.dietaryRestrictions === '无' || app.misc?.dietaryRestrictions == null) ? 'no' : 'yes'}
                                onValueChange={(val) => {
                                    if (val === 'no') {
                                        onChange('misc', 'dietaryRestrictions', '无');
                                    } else {
                                        onChange('misc', 'dietaryRestrictions', '');
                                    }
                                }}
                                className="flex space-x-4 mb-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no" id="diet-no" />
                                    <Label htmlFor="diet-no" className="font-normal cursor-pointer">无</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="yes" id="diet-yes" />
                                    <Label htmlFor="diet-yes" className="font-normal cursor-pointer">有特殊饮食习惯</Label>
                                </div>
                            </RadioGroup>
                            {app.misc?.dietaryRestrictions !== '无' && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <Input
                                        value={app.misc?.dietaryRestrictions}
                                        onChange={e => onChange('misc', 'dietaryRestrictions', e.target.value)}
                                        placeholder="请具体描述（如素食、清真、忌口等）"
                                        disabled={isReadonly}
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>你是通过什么了解到的见山学院？</Label>
                        <Select disabled={isReadonly} value={app.misc?.referralSource} onValueChange={v => onChange('misc', 'referralSource', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="请选择" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="wechat">微信公众号</SelectItem>
                                <SelectItem value="friend">朋友推荐</SelectItem>
                                <SelectItem value="school">学校老师/升学指导</SelectItem>
                                <SelectItem value="poster">小红书</SelectItem>
                                <SelectItem value="other">其他</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label>最期待从见山学院获得什么？(多选，最多两项)</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {['锻炼英语口语能力', '明确未来选课方向', '丰富履历助力升学', '和剑桥学长姐交流', '体验创新通识课程', '结识志同道合伙伴'].map(g => {
                                const isSelected = (app.misc?.goals || []).includes(g);
                                return (
                                    <div
                                        key={g}
                                        onClick={() => {
                                            if (!isReadonly) {
                                                const currentGoals = app.misc?.goals || [];
                                                if (isSelected) {
                                                    handleArrayToggle('misc', 'goals', g);
                                                } else {
                                                    if (currentGoals.length < 2) {
                                                        handleArrayToggle('misc', 'goals', g);
                                                    }
                                                }
                                            }
                                        }}
                                        className={cn(
                                            "cursor-pointer px-4 py-3 rounded-lg border flex items-center justify-between transition-all",
                                            isSelected ? "bg-primary/5 border-primary" : "bg-white border-slate-200 hover:bg-slate-50",
                                            (!isSelected && (app.misc?.goals || []).length >= 2) && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <span className={cn("text-sm font-medium", isSelected ? "text-primary" : "text-slate-600")}>{g}</span>
                                        {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </Section >

            {/* WeChat Follow Section - Standalone */}
            {/* WeChat Follow Section - Split Card Design */}
            <div className="mt-8 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Top Section: Checkbox - Light Background */}
                <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100">
                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="wechat-follow-check"
                            disabled={isReadonly}
                            checked={app.misc?.hasFollowedWechatOfficialAccount || false}
                            onCheckedChange={(c) => onChange('misc', 'hasFollowedWechatOfficialAccount', c === true)}
                            className="mt-1"
                        />
                        <div className="grid gap-1.5 leading-none">
                            <label
                                htmlFor="wechat-follow-check"
                                className="text-base font-medium text-slate-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                我已关注公众号
                            </label>
                            <p className="text-sm text-slate-500">
                                确认已扫描下方二维码关注公众号
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: QR Code & Info - White Background */}
                <div className="bg-white p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                    {/* QR Code - Clean & Small */}
                    <div className="shrink-0 w-24 h-24 bg-white rounded-lg border border-slate-200 p-2 shadow-sm">
                        <div className="w-full h-full border border-slate-100 rounded bg-white flex items-center justify-center overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/assets/wechat-qrcode.jpg"
                                alt="见山学院公众号"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <div className="space-y-1 text-center md:text-left flex-1">
                        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 w-fit mx-auto md:mx-0 mb-2">
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Official Channel</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                            关注「见山JSA」官方公众号
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            第一时间获取申请进度、营地动态、导师阵容及课题发布等重要信息。
                        </p>
                    </div>
                </div>
            </div>

            {/* Part 6: Terms & Submit - Only show submit area if onSubmit is provided (Apply Page needs it, Admin doesn't) */}
            {
                onSubmit && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-start gap-4">
                                <Checkbox
                                    id="terms-standalone"
                                    disabled={isReadonly}
                                    checked={app.misc?.agreedToTerms || false}
                                    onCheckedChange={(c) => onChange('misc', 'agreedToTerms', c === true)}
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
                                type="button"
                                onClick={onSubmit}
                                size="lg"
                                className="min-w-[240px] h-12 text-base border-none shadow-none focus-visible:ring-0"
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
                )
            }
        </div >
    );
}
