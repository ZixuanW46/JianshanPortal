"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Hide Navbar/Footer on Landing Page and Forgot Password Page
    // (Login/Register typically also hide these, but sticking to request)
    // Hide Navbar/Footer on Landing Page, Login, Register, and Forgot Password pages
    const shouldHideLayout =
        pathname === "/" ||
        pathname === "/login" ||
        pathname === "/register" ||
        pathname?.startsWith("/forgot-password");

    return (
        <>
            {!shouldHideLayout && <Navbar />}
            <main className="flex-1">
                {children}
            </main>
            {!shouldHideLayout && <Footer />}
        </>
    );
}
