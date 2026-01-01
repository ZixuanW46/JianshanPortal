"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, FileText, CheckCircle2, Loader2, AlertCircle, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import app, { storage } from '@/lib/cloudbase';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface FileUploadProps {
    value?: string;
    onChange: (url: string) => void;
    disabled?: boolean;
    folder?: string;
    userId?: string;
    onUploadSuccess?: () => void;
}

export function FileUpload({ value, onChange, disabled, folder = "appEnglishLevelProf", userId, onUploadSuccess }: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Resolve preview URL
    useEffect(() => {
        const resolveUrl = async () => {
            if (!value) {
                setPreviewUrl(null);
                return;
            }

            if (value.startsWith('http')) {
                setPreviewUrl(value);
                return;
            }

            if (value.startsWith('cloud://')) {
                if (!app) {
                    return;
                }
                try {
                    const res = await app.getTempFileURL({
                        fileList: [value]
                    });

                    if (res.fileList && res.fileList.length > 0) {
                        const fileResult = res.fileList[0];
                        // check if file resolution was successful
                        if (fileResult.tempFileURL) {
                            setPreviewUrl(fileResult.tempFileURL);
                        } else {
                            console.warn("CloudBase resolved URL but returned no tempFileURL:", fileResult);
                        }
                    }
                } catch (err: any) {
                    // Suppress empty error objects which can happen with some SDK failures
                    if (err && (Object.keys(err).length > 0 || err.message)) {
                        console.error("Failed to resolve file URL:", err);
                    }
                }
            }
        };

        resolveUrl();
    }, [value]);

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
            if (!storage) {
                throw new Error("CloudBase storage not initialized");
            }

            // Generate unique path
            const ext = file.name.split('.').pop();
            // Use userId in path if available, otherwise just timestamp
            const userPath = userId ? `${userId}/` : '';
            const cloudPath = `${folder}/${userPath}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

            const res = await storage({
                cloudPath,
                filePath: file as any // JS SDK expects File object here
            });

            // Store the FileID
            onChange(res.fileID);
            if (onUploadSuccess) {
                // Determine extension of uploaded file to check if it's pdf? 
                // Actually, just trigger save.
                onUploadSuccess();
            }

        } catch (err: any) {
            console.error("Upload failed", err);
            setError("上传失败，请重试: " + (err.message || "Unknown error"));
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleClear = () => {
        onChange('');
        setError(null);
        setPreviewUrl(null);
        setIsPreviewOpen(false);
    };

    /* Helper: Extract file name from ID if possible */
    const getFileName = (path: string) => {
        if (path.startsWith('cloud://')) {
            const parts = path.split('/');
            return parts[parts.length - 1] || "Uploaded File";
        }
        return path.split('/').pop() || "Uploaded File";
    };

    const isPdf = getFileName(value || '').toLowerCase().endsWith('.pdf');

    const handlePreviewClick = () => {
        if (!previewUrl) return;
        if (isPdf) {
            // If PDF, just trigger download in new tab
            window.open(previewUrl, '_blank');
        } else {
            // If Image, open preview modal
            setIsPreviewOpen(true);
        }
    };

    return (
        <div className="w-full">
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6">
                    <DialogHeader>
                        <DialogTitle className="truncate pr-8">{getFileName(value || '')}</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 min-h-[500px] bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center relative">
                        {previewUrl && !isPdf ? (
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="max-w-full max-h-[80vh] object-contain"
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <p>Loading preview...</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

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
                <div
                    className={cn(
                        "relative border rounded-xl p-4 bg-white flex items-center gap-3 shadow-sm group transition-all",
                        previewUrl ? "cursor-pointer hover:border-primary/50 hover:shadow-md" : ""
                    )}
                    onClick={handlePreviewClick}
                >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium truncate transition-colors", previewUrl ? "text-primary underline-offset-4 group-hover:underline" : "text-slate-900")}>
                            {getFileName(value)}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> 上传成功
                            </p>
                            {previewUrl && (
                                <p className="text-xs text-slate-400">
                                    {isPdf ? "点击下载" : "点击预览"}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {previewUrl && (
                            <>
                                {/* Show Eye icon ONLY if NOT PDF */}
                                {!isPdf && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsPreviewOpen(true)}
                                        className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                                        title="预览文件"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                )}
                                <a
                                    href={previewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                                    title="下载文件"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Download className="h-4 w-4" />
                                </a>
                            </>
                        )}

                        {!disabled && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleClear}
                                className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                title="移除文件"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
