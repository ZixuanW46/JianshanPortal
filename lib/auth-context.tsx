"use client"

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useRouter } from "next/navigation";
import { auth } from '@/lib/cloudbase';
import { isAdmin } from '@/lib/utils';

// Define a simplified User type based on CloudBase user or just use any
// Cloudbase user typically has uid, email, specific to login type
export type User = any;

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    login: (email: string, password?: string) => Promise<void>;
    register: (email: string, name?: string) => Promise<void>;
    logout: () => Promise<void>;
    sendSmsCode: (mobile: string) => Promise<void>;
    loginWithCode: (mobile: string, code: string) => Promise<void>;
    registerWithMobile: (mobile: string, code: string, password?: string) => Promise<void>;
    loginWithWechat: () => Promise<void>;
    handleWechatCallback: (code: string, state: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Store verification info for SMS login
    const verificationInfoRef = useRef<any>(null);

    // Derived state for admin check.
    const isUserAdmin = user && (isAdmin(user.email) || isAdmin(user.username) || (user.phone_number && isAdmin(user.phone_number)));

    useEffect(() => {
        // 监听登录状态变化
        if (!auth) {
            setLoading(false);
            return;
        }

        // @ts-ignore - cloudbase types might be missing or incomplete in this context
        const authStateListener = (auth as any).onLoginStateChanged((loginState: any) => {
            if (loginState) {
                // 已登录
                setUser(loginState.user);
            } else {
                // 未登录
                setUser(null);
            }
            setLoading(false);
        });

        return () => {
            // 清理监听器 (if supported by SDK, otherwise just ignore)
        };
    }, []);

    const login = async (emailOrUsername: string, password?: string) => {
        if (!password) {
            throw new Error("Password is required for password login");
        }

        if (!auth) {
            console.warn("Auth not initialized");
            return;
        }

        // Logic to handle mobile number login (convert to username u+mobile)
        let loginUsername = emailOrUsername;
        // Check if input is exactly 11 digits
        if (/^\d{11}$/.test(emailOrUsername)) {
            loginUsername = `u${emailOrUsername}`;
        }

        setLoading(true);
        try {
            // Use CloudBase signIn (can support username/password or email/password depending on config)
            await (auth as any).signIn({
                username: loginUsername,
                password: password
            });
        } catch (error) {
            console.error("CloudBase login failed:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const sendSmsCode = async (mobile: string) => {
        if (!auth) throw new Error("Auth not initialized");

        // Ensure +86 prefix for CN numbers if not present, AND INCLUDE A SPACE
        // Regex requires: ^\+[1-9][0-9]{0,3}\s[0-9]{4,20}$
        let phone = mobile;
        if (!mobile.startsWith('+')) {
            // Default to CN +86
            phone = `+86 ${mobile}`;
        } else {
            // If user entered +86138..., we need to ensure space. 
            // Simple heuristic: if no space, split country code. 
            // But simpler to just assume input is just digits 138... for now as per UI.
            // If input has +, assume user knows what they are doing or try to fix it.
            // For safety, let's just focus on the common case of pure digits.
            if (!mobile.includes(' ')) {
                // Try to split? Too complex. Let's just assume valid input or basic formatting.
            }
        }

        // Current UI input is just digits.
        if (!mobile.startsWith('+')) {
            phone = `+86 ${mobile}`;
        }

        try {
            // @ts-ignore
            const info = await (auth as any).getVerification({
                phone_number: phone
            });
            verificationInfoRef.current = info;
            console.log("Verification code sent to", phone);
        } catch (error) {
            console.error("Failed to send SMS:", error);
            throw error;
        }
    };

    const loginWithCode = async (mobile: string, code: string) => {
        if (!auth) throw new Error("Auth not initialized");
        if (!verificationInfoRef.current) {
            throw new Error("请先获取验证码");
        }

        // Must match the format used in sendSmsCode
        let phone = mobile;
        if (!mobile.startsWith('+')) {
            phone = `+86 ${mobile}`;
        }

        setLoading(true);
        try {
            // @ts-ignore
            await (auth as any).signInWithSms({
                verificationInfo: verificationInfoRef.current,
                verificationCode: code,
                phoneNum: phone
            });
        } catch (error) {
            console.error("SMS login failed:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const registerWithMobile = async (mobile: string, code: string, password?: string) => {
        if (!auth) throw new Error("Auth not initialized");
        if (!verificationInfoRef.current) {
            throw new Error("请先获取验证码");
        }

        // Must match the format used in sendSmsCode
        let phone = mobile;
        if (!mobile.startsWith('+')) {
            phone = `+86 ${mobile}`;
        }

        setLoading(true);
        try {
            const verification = verificationInfoRef.current;

            // Step 1: Verify the code to get a verification token
            // @ts-ignore
            const verifyResult = await (auth as any).verify({
                verification_id: verification.verification_id,
                verification_code: code
            });

            const token = verifyResult.verification_token;

            if (verification.is_user) {
                // User already exists, log them in
                // @ts-ignore
                await (auth as any).signIn({
                    username: phone,
                    verification_token: token
                });

                // If password was provided, try to update it for the existing user
                if (password) {
                    try {
                        const currentUser = (auth as any).currentUser;
                        if (currentUser) {
                            await currentUser.updatePassword(password);
                            console.log("Password updated for existing user");
                        }
                    } catch (e) {
                        console.warn("Failed to update password for existing user:", e);
                    }
                }
            } else {
                // New user: Sign up (creates user and logs in)
                // @ts-ignore
                await (auth as any).signUp({
                    phone_number: phone,
                    verification_code: code,
                    verification_token: token,
                    password: password,
                    username: `u${mobile}`, // Prefix with 'u' to satisfy regex ^[a-z][0-9a-z_-]{5,24}$
                    // We can set a default username or other fields if needed
                    // name: "手机用户", 
                });
                console.log("User registered with password");
            }

        } catch (error) {
            console.error("Mobile registration/login failed:", error);
            throw error; // Re-throw to be handled by the UI
        } finally {
            setLoading(false);
        }
    };

    const loginWithWechat = async () => {
        if (!auth) throw new Error("Auth not initialized");

        setLoading(true);
        try {
            const providerId = "wx_open"; // 微信开放平台
            // Use current origin + callback path for redirect
            // e.g., http://localhost:3000/auth/callback or https://jianshan.com/auth/callback
            const providerUri = `${window.location.origin}/auth/callback`;
            const state = `wx_open_${Date.now()}`; // Random state

            // @ts-ignore
            const { uri } = await (auth as any).genProviderRedirectUri({
                provider_id: providerId,
                provider_redirect_uri: providerUri,
                state: state,
                // other_params: {} 
            });

            console.log("Redirecting to WeChat login:", uri);
            // Redirect to the generated WeChat login page
            window.location.href = uri;

        } catch (error) {
            console.error("Failed to init WeChat login:", error);
            setLoading(false); // Only set loading false if we fail. If success, we redirect away.
            throw error;
        }
    };

    const handleWechatCallback = async (code: string, state: string) => {
        if (!auth) throw new Error("Auth not initialized");

        setLoading(true);
        try {
            // 1. Exchange code for token
            // @ts-ignore
            const res = await (auth as any).grantProviderToken({
                provider_id: "wx_open",
                // IMPORTANT: Must match the URI used in genProviderRedirectUri
                provider_redirect_uri: `${window.location.origin}/auth/callback`,
                provider_code: code,
            });

            const { provider_token } = res;

            // 2. Sign in with the token
            // @ts-ignore
            await (auth as any).signInWithProvider({
                provider_token,
            });

            // 3. User listener (onLoginStateChanged) will trigger and update user state + router redirect if needed
            // But we can also manually push to dashboard here if we want to be explicit, 
            // though Page component usually handles redirection on user state change.
            router.replace('/dashboard');

        } catch (error) {
            console.error("WeChat callback failed:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Legacy register method (disabled or adapted)
    const register = async (email: string, name?: string) => {
        console.warn("Please use registerWithMobile");
        throw new Error("Please use registerWithMobile");
    };

    const logout = async () => {
        setLoading(true);
        try {
            if (auth) {
                await (auth as any).signOut();
            }
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAdmin: !!isUserAdmin,
            login,
            register,
            logout,
            sendSmsCode,
            loginWithCode,
            registerWithMobile,
            loginWithWechat,
            handleWechatCallback
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
