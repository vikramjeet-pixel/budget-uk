"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signUpWithEmail, signInWithGoogle } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { trackSignup } from "@/lib/analytics";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [authError, setAuthError] = React.useState("");
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setAuthError("");
    try {
      await signUpWithEmail(data.email, data.password);
      trackSignup({ method: "email" });
      router.push("/");
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setAuthError("Email is already registered. Try logging in.");
      } else {
        setAuthError("Failed to create account. Please try again later.");
      }
      console.error(error);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError("");
    try {
      await signInWithGoogle();
      trackSignup({ method: "google" });
      router.push("/");
    } catch (error: any) {
      setAuthError("Google sign-in failed. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[400px] flex-col px-4 pt-[96px] pb-16">
      <h1 className="t-h2 text-[#1c1c1c] text-center mb-8">Join BudgetUK</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Input 
            {...register("email")}
            type="email" 
            placeholder="Email address"
            disabled={isSubmitting}
          />
          {errors.email && (
            <span className="t-caption text-[#dc2626] px-1">{errors.email.message}</span>
          )}
        </div>
        
        <div className="flex flex-col gap-1">
          <Input 
            {...register("password")}
            type="password" 
            placeholder="Password"
            disabled={isSubmitting}
          />
          {errors.password && (
            <span className="t-caption text-[#dc2626] px-1">{errors.password.message}</span>
          )}
        </div>

        {authError && (
          <span className="t-caption text-[#dc2626] text-center px-1">{authError}</span>
        )}

        <Button type="submit" variant="primary" className="w-full mt-2" disabled={isSubmitting}>
          {isSubmitting ? "Signing up..." : "Sign up"}
        </Button>
      </form>
      
      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-[var(--border-passive)]" />
        <span className="px-4 text-[14px] text-[#5f5f5d]">or</span>
        <div className="flex-1 border-t border-[var(--border-passive)]" />
      </div>

      <Button 
        type="button" 
        variant="ghost" 
        className="w-full"
        onClick={handleGoogleSignIn}
      >
        Continue with Google
      </Button>

      <p className="mt-8 text-center text-[#5f5f5d] text-[14px]">
        Already have an account?{" "}
        <Link href="/login" className="text-[#1c1c1c] underline underline-offset-4 hover:text-opacity-80">
          Log in
        </Link>
      </p>
    </div>
  );
}
