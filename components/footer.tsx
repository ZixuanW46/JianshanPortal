"use client"

import { usePathname } from "next/navigation";

export function Footer() {
    const pathname = usePathname();

    // Hide footer on specific standalone pages
    const hiddenPaths = ['/login', '/register', '/welcome', '/acceptance'];
    // Handle trailing slashes likely caused by trailingSlash: true in next.config.ts
    if (hiddenPaths.some(path => pathname === path || pathname === `${path}/`)) return null;

    return (
        <footer className="border-t bg-white">
            <div className="container px-4 md:px-8 py-8 mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Jianshan Academy. All rights reserved.
                    </p>
                    <div className="flex gap-6 items-center">
                        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            沪ICP备2025150971号-2
                        </a>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            Privacy Policy
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
