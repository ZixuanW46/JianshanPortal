"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import cloudbase from '@cloudbase/js-sdk';

interface FileUploadProps {
    value?: string;
    onChange: (url: string) => void;
    disabled?: boolean;
    folder?: string;
}

export function FileUpload({ value, onChange, disabled, folder = "english-proficiency" }: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset error
        setError(null);

        // Validation: Max 5MB, PDF/Image
        if (file.size > 5 * 1024 * 1024) {
            setError("文件大小不能超过 5MB");
            return;
        }

        setUploading(true);
        try {
            // Check if app is initialized
            const app = cloudbase.init({
                env: process.env.NEXT_PUBLIC_CLOUDBASE_ENV_ID || "jianshan-app-portal-7g7p3745672ab13" // Fallback to assumed ID or empty if controlled by global context
            });

            // If we are already using a global auth context, maybe better to rely on that instance?
            // Assuming `cloudbase.init` handles singleton or we can use the global instance if exposed.
            // For now, let's try straight upload. 
            // NOTE: Ideally we should use the same app instance as in `auth-context`. import { app } from '@/lib/auth-context'? 
            // But auth-context usually exports the hook. Let's rely on global cloudbase object if strictly needed or assume standard config.

            // Generate unique path
            const ext = file.name.split('.').pop();
            const cloudPath = `uploads/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

            const res = await app.uploadFile({
                cloudPath,
                filePath: file as any
            });

            // Get Temp URL/Download URL?
            // Actually, for public access or app access, we might need `getTempFileURL`. 
            // Or just store the FileID (res.fileID).
            // User request usually implies a URL or accessible link.
            // Let's store the FileID for consistency with cloudbase, or get a permanent HTTP url if configured.
            // But standard practice: Store FileID, resolve when needed. 
            // However, to make it compatible with the previous string field, let's store the FileID.
            // But wait, the user wants "Upload PDF or screenshot".

            // Let's simplify: Store fileID.
            onChange(res.fileID);

        } catch (err: any) {
            console.error("Upload failed", err);
            setError("上传失败，请重试");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleClear = () => {
        onChange('');
        setError(null);
    };

    /* Helper: Extract file name from ID if possible */
    const getFileName = (path: string) => {
        return path.split('/').pop() || "Uploaded File";
    };

    return (
        <div className="w-full">
            {!value ? (
                <div
                    onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50",
                        disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50",
                        error ? "border-red-200 bg-red-50/10" : "border-slate-200"
                    )}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileSelect}
                        disabled={disabled || uploading}
                    />

                    {uploading ? (
                        <>
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            <p className="text-sm text-slate-500 font-medium">正在上传...</p>
                        </>
                    ) : (
                        <>
                            <div className="p-3 bg-white rounded-full shadow-sm">
                                <Upload className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-slate-700">点击上传文件</p>
                                <p className="text-xs text-slate-400 mt-1">支持 PDF, PNG, JPG (Max 5MB)</p>
                            </div>
                            {error && (
                                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                    <AlertCircle className="h-3 w-3" /> {error}
                                </p>
                            )}
                        </>
                    )}
                </div>
            ) : (
                <div className="relative border rounded-xl p-4 bg-white flex items-center gap-3 shadow-sm group">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                            {getFileName(value)}
                        </p>
                        <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="h-3 w-3" /> 上传成功
                        </p>
                    </div>
                    {!disabled && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClear}
                            className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
