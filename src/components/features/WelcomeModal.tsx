"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { trackLogin, trackSignup } from "@/lib/analytics";
import { useAuthContext } from "@/components/providers/AuthProvider";

const SESSION_KEY = "buk_welcome_seen";

type Tab = "login" | "signup" | "install";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// ── Schemas ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});
type SignupFormValues = z.infer<typeof signupSchema>;

// ── Login form ────────────────────────────────────────────────────────────────

function LoginForm({
  onSuccess,
  onSwitchToSignup,
}: {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
}) {
  const [authError, setAuthError] = React.useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError("");
    try {
      await signInWithEmail(data.email, data.password);
      trackLogin({ method: "email" });
      onSuccess();
    } catch {
      setAuthError("Incorrect email or password. Please try again.");
    }
  };

  const handleGoogle = async () => {
    setAuthError("");
    try {
      await signInWithGoogle();
      trackLogin({ method: "google" });
      onSuccess();
    } catch {
      setAuthError("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] text-[#5f5f5d] leading-relaxed">
        Save your favourite spots, add new ones, and personalise your experience.
      </p>

      <Button type="button" variant="ghost" className="w-full gap-2" onClick={handleGoogle}>
        <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.2H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.6 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.8z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.6 6.5 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8H5.9C9.2 35.6 16.1 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.2H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.2C42.7 35 44 30 44 24c0-1.3-.1-2.6-.4-3.8z" />
        </svg>
        Continue with Google
      </Button>

      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-passive" />
        <span className="text-[12px] text-[#5f5f5d]">or</span>
        <div className="flex-1 border-t border-passive" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Input {...register("email")} type="email" placeholder="Email address" disabled={isSubmitting} />
          {errors.email && (
            <span className="text-[11px] text-[#dc2626] px-1">{errors.email.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Input {...register("password")} type="password" placeholder="Password" disabled={isSubmitting} />
          {errors.password && (
            <span className="text-[11px] text-[#dc2626] px-1">{errors.password.message}</span>
          )}
        </div>
        {authError && (
          <span className="text-[11px] text-[#dc2626] text-center">{authError}</span>
        )}
        <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="text-center text-[12px] text-[#5f5f5d]">
        No account yet?{" "}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-[#1c1c1c] underline underline-offset-2 hover:opacity-70"
        >
          Sign up free
        </button>
      </p>
    </div>
  );
}

// ── Signup form ───────────────────────────────────────────────────────────────

function SignupForm({
  onSuccess,
  onSwitchToLogin,
}: {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}) {
  const [authError, setAuthError] = React.useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupFormValues) => {
    setAuthError("");
    try {
      await signUpWithEmail(data.email, data.password);
      trackSignup({ method: "email" });
      onSuccess();
    } catch (error: unknown) {
      const code = (error as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        setAuthError("Email already registered. Try logging in.");
      } else {
        setAuthError("Failed to create account. Please try again.");
      }
    }
  };

  const handleGoogle = async () => {
    setAuthError("");
    try {
      await signInWithGoogle();
      trackSignup({ method: "google" });
      onSuccess();
    } catch {
      setAuthError("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] text-[#5f5f5d] leading-relaxed">
        Join the BudgetUK community — save spots, vote, and share your discoveries.
      </p>

      <Button type="button" variant="ghost" className="w-full gap-2" onClick={handleGoogle}>
        <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.2H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.6 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.8z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.6 6.5 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8H5.9C9.2 35.6 16.1 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.2H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.2C42.7 35 44 30 44 24c0-1.3-.1-2.6-.4-3.8z" />
        </svg>
        Continue with Google
      </Button>

      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-passive" />
        <span className="text-[12px] text-[#5f5f5d]">or</span>
        <div className="flex-1 border-t border-passive" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Input {...register("email")} type="email" placeholder="Email address" disabled={isSubmitting} />
          {errors.email && (
            <span className="text-[11px] text-[#dc2626] px-1">{errors.email.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Input
            {...register("password")}
            type="password"
            placeholder="Password (min. 8 characters)"
            disabled={isSubmitting}
          />
          {errors.password && (
            <span className="text-[11px] text-[#dc2626] px-1">{errors.password.message}</span>
          )}
        </div>
        {authError && (
          <span className="text-[11px] text-[#dc2626] text-center">{authError}</span>
        )}
        <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create free account"}
        </Button>
      </form>

      <p className="text-center text-[12px] text-[#5f5f5d]">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-[#1c1c1c] underline underline-offset-2 hover:opacity-70"
        >
          Log in
        </button>
      </p>
    </div>
  );
}

// ── Install tab ───────────────────────────────────────────────────────────────

function InstallTab({
  deferredPrompt,
}: {
  deferredPrompt: React.MutableRefObject<BeforeInstallPromptEvent | null>;
}) {
  const [platform, setPlatform] = React.useState<"ios" | "android" | "desktop">("desktop");
  const [canInstall, setCanInstall] = React.useState(false);
  const [installed, setInstalled] = React.useState(false);

  React.useEffect(() => {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) {
      setPlatform("ios");
    } else if (/Android/.test(ua)) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }
    setCanInstall(!!deferredPrompt.current);

    // Re-check after a tick (the prompt event may arrive just after render)
    const t = setTimeout(() => setCanInstall(!!deferredPrompt.current), 800);
    return () => clearTimeout(t);
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      deferredPrompt.current = null;
    }
  };

  if (installed) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-[28px]">
          ✓
        </div>
        <p className="text-[15px] font-semibold text-[#1c1c1c]">App installed!</p>
        <p className="text-[13px] text-[#5f5f5d] text-center leading-relaxed">
          Find BudgetUK on your home screen or desktop for quick access.
        </p>
      </div>
    );
  }

  const benefits = [
    { icon: "⚡", text: "Instant launch" },
    { icon: "📶", text: "Works offline" },
    { icon: "🔔", text: "Spot updates" },
    { icon: "🏪", text: "No App Store" },
  ];

  const iosSteps = [
    { n: "1", text: "Open this page in Safari (not Chrome)" },
    { n: "2", text: "Tap the Share button (⎙) at the bottom of the screen" },
    { n: "3", text: 'Scroll down and tap "Add to Home Screen"' },
    { n: "4", text: 'Tap "Add" in the top-right corner' },
  ];

  const androidSteps = [
    { n: "1", text: "Open this page in Chrome" },
    { n: "2", text: "Tap the ⋮ menu in the top-right corner" },
    { n: "3", text: '"Add to Home screen" → tap "Add"' },
  ];

  const desktopSteps = [
    { n: "1", text: "Open this page in Chrome or Edge" },
    { n: "2", text: "Look for the ⊕ icon in the address bar" },
    { n: "3", text: "Or open the ⋮ browser menu → Install BudgetUK" },
    { n: "4", text: 'Click "Install" to confirm' },
  ];

  const steps =
    platform === "ios" ? iosSteps : platform === "android" ? androidSteps : desktopSteps;

  const platformLabel =
    platform === "ios"
      ? "iPhone / iPad"
      : platform === "android"
        ? "Android"
        : "PC / Mac";

  return (
    <div className="flex flex-col gap-5">
      {/* Benefits grid */}
      <div className="grid grid-cols-2 gap-2">
        {benefits.map(({ icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-2 bg-[#f0ede6] rounded-[8px] px-3 py-2.5"
          >
            <span className="text-[15px]">{icon}</span>
            <span className="text-[12px] text-[#1c1c1c] font-medium">{text}</span>
          </div>
        ))}
      </div>

      {/* Native install button — shown when browser supports it */}
      {canInstall && (
        <button
          onClick={handleInstall}
          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-[#1c1c1c] text-[#fcfbf8] rounded-[10px] text-[14px] font-semibold hover:bg-[#3a3a3a] transition-colors"
        >
          Install BudgetUK — Free
        </button>
      )}

      {/* Step-by-step instructions */}
      <div className="flex flex-col gap-3">
        <p className="text-[13px] font-semibold text-[#1c1c1c]">
          How to install on {platformLabel}:
        </p>
        {steps.map(({ n, text }) => (
          <div key={n} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1c1c1c] text-[#fcfbf8] text-[11px] font-bold flex items-center justify-center mt-0.5">
              {n}
            </span>
            <p className="text-[13px] text-[#5f5f5d] leading-relaxed">{text}</p>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-[#5f5f5d] text-center">
        Free, no App Store required. Works on any device.
      </p>
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────

export function WelcomeModal() {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("login");
  const { user, loading } = useAuthContext();
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (loading) return;
    if (typeof window === "undefined") return;

    // Show once per session
    if (sessionStorage.getItem(SESSION_KEY)) return;

    // Already installed as PWA
    if (window.matchMedia?.("(display-mode: standalone)").matches) return;

    // Capture the install prompt so InstallTab can use it
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Show after a brief delay so the page has time to paint
    const timer = setTimeout(() => {
      setActiveTab(user ? "install" : "login");
      setVisible(true);
    }, 900);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, [loading, user]);

  const handleClose = useCallback(() => {
    setVisible(false);
    sessionStorage.setItem(SESSION_KEY, "1");
  }, []);

  const handleAuthSuccess = useCallback(() => {
    // After auth, nudge user to install the app
    setActiveTab("install");
  }, []);

  if (!visible) return null;

  const TABS: { id: Tab; label: string }[] = user
    ? [{ id: "install", label: "Get the App" }]
    : [
        { id: "login", label: "Log In" },
        { id: "signup", label: "Sign Up" },
        { id: "install", label: "Get the App" },
      ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-[2px]"
        style={{ animation: "fadeIn 200ms ease" }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal — bottom sheet on mobile, centered dialog on desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to BudgetUK"
        className="fixed z-[10000] bottom-0 left-0 right-0
                   sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
                   w-full sm:w-[460px]
                   max-h-[90dvh] overflow-y-auto
                   bg-[#fcfbf8] rounded-t-[20px] sm:rounded-[16px]
                   shadow-2xl"
        style={{ animation: "slideUp 280ms cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-[#d4d0c8]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-4 border-b border-passive">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#2d5a4c] rounded-full flex items-center justify-center text-white font-bold text-[13px] shrink-0">
              UK
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#1c1c1c] leading-tight">
                Welcome to BudgetUK
              </p>
              <p className="text-[12px] text-[#5f5f5d]">
                Budget-friendly spots across the UK
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5f5f5d] hover:bg-[#f0ede6] hover:text-[#1c1c1c] transition-colors ml-2 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 px-5 pt-4 pb-2">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 px-3 py-2 rounded-[8px] text-[13px] font-semibold transition-colors ${
                activeTab === id
                  ? "bg-[#1c1c1c] text-[#fcfbf8]"
                  : "text-[#5f5f5d] hover:bg-[#f0ede6] hover:text-[#1c1c1c]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-5 pt-3 pb-8">
          {activeTab === "login" && (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToSignup={() => setActiveTab("signup")}
            />
          )}
          {activeTab === "signup" && (
            <SignupForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setActiveTab("login")}
            />
          )}
          {activeTab === "install" && <InstallTab deferredPrompt={deferredPrompt} />}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @media (min-width: 640px) {
          @keyframes slideUp {
            from { opacity: 0; transform: translate(-50%, calc(-50% + 16px)) scale(0.97) }
            to   { opacity: 1; transform: translate(-50%, -50%) scale(1) }
          }
        }
      `}</style>
    </>
  );
}
