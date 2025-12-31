"use client"

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Tent, Menu, X, User as UserIcon, LogOut, LayoutDashboard, HelpCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    // Hide Navbar on specific pages (Login, Register, Welcome) if design dictates full custom layout
    // User requested "Login interface... no full width footer". Doesn't say no navbar.
    // However, usually login/register/welcome are standalone. 
    // Based on provided designs, they have their own headers.
    // Let's exclude Navbar from /login, /register, /welcome, /acceptance.
    const hiddenPaths = ['/login', '/register'];
    if (hiddenPaths.some(path => pathname === path || pathname === `${path}/`)) return null;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white">
            <div className="container px-4 md:px-8 flex h-18 items-center justify-between mx-auto max-w-7xl">
                <div className="flex items-center gap-2 md:gap-4">
                    <Link href={isAdmin ? "/admin/dashboard" : "/"} className="flex items-center gap-2">
                        <Image
                            src="/logo_black.png"
                            alt="Jianshan Academy Logo"
                            width={32}
                            height={32}
                            className="h-13 w-auto"
                        />
                        <div className="h-6 w-px bg-gray-300 mx-2" />
                        <span className="font-medium text-lg text-foreground">
                            {isAdmin ? "Admin Portal" : "Student Portal"}
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-6">
                    {/* Desktop Nav Items */}

                    {/* Admin Links */}
                    {isAdmin && (
                        <Link
                            href="/admin/dashboard"
                            className={cn("text-sm font-medium transition-colors hover:text-primary hidden sm:block", pathname.startsWith('/admin') ? "text-primary" : "text-muted-foreground")}
                        >
                            Dashboard
                        </Link>
                    )}

                    {/* Standard User Links - Only show if NOT admin */}
                    {!isAdmin && (
                        <Link
                            href="/faq"
                            className={cn("text-sm font-medium transition-colors hover:text-primary hidden sm:block", pathname === '/faq' ? "text-primary" : "text-muted-foreground")}
                        >
                            FAQ
                        </Link>
                    )}

                    {user ? (
                        <>
                            {/* Username link */}
                            <button
                                className="text-sm font-medium text-muted-foreground hover:text-primary hidden sm:flex items-center gap-2"
                                onClick={() => { }} // Profile TODO
                            >
                                <UserIcon className="h-4 w-4" />
                                {user.name || (isAdmin ? 'Admin' : 'Student')}
                            </button>

                            <Button
                                variant="ghost"
                                className="text-muted-foreground hover:bg-transparent hover:text-destructive hidden sm:flex px-2"
                                onClick={() => logout()}
                                title="Log Out"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </>
                    ) : (
                        <div className="hidden sm:flex items-center gap-4">
                            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary">
                                Log in
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="flex items-center justify-center p-2 sm:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="sm:hidden absolute top-18 left-0 right-0 border-b bg-white/95 backdrop-blur-md shadow-lg animate-in slide-in-from-top-2 fade-in duration-200 z-40">
                    <nav className="flex flex-col">
                        {!isAdmin && (
                            <Link
                                href="/faq"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-3 px-6 py-4 text-base font-medium text-foreground bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                <div className="p-1 bg-gray-100 rounded-md">
                                    <HelpCircle className="h-4 w-4" />
                                </div>
                                FAQ
                            </Link>
                        )}

                        {isAdmin && (
                            <Link
                                href="/admin/dashboard"
                                onClick={() => setIsMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-6 py-4 text-base font-medium bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors",
                                    pathname.startsWith('/admin') ? "text-primary" : "text-foreground"
                                )}
                            >
                                <div className="p-1 bg-gray-100 rounded-md">
                                    <LayoutDashboard className="h-4 w-4" />
                                </div>
                                Dashboard
                            </Link>
                        )}

                        {user ? (
                            <>
                                <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                        Signed in as
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-primary/10 rounded-full">
                                            <UserIcon className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="font-medium text-foreground">
                                            {user.name || (isAdmin ? 'Admin' : 'Student')}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 px-6 py-4 text-base font-medium text-destructive bg-white hover:bg-red-50 transition-colors w-full text-left"
                                >
                                    <div className="p-1 bg-red-50 rounded-md">
                                        <LogOut className="h-4 w-4" />
                                    </div>
                                    Log out
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-3 px-6 py-4 text-base font-medium text-primary bg-white hover:bg-gray-50 transition-colors"
                            >
                                <div className="p-1 bg-primary/10 rounded-md">
                                    <UserIcon className="h-4 w-4" />
                                </div>
                                Log in
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
