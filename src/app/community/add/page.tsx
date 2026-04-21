"use client";

import * as React from "react";
import { Header } from "@/components/features/Header";
import { SpotForm, SubmissionFormData } from "@/components/features/SpotForm";
import * as Toast from "@/components/ui/Toast";

export default function AddSpotPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [toastOpen, setToastOpen] = React.useState(false);

  const onSubmit = async (data: SubmissionFormData) => {
    setIsSubmitting(true);
    console.log("Spot Submitted:", data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setToastOpen(true);
  };

  return (
    <Toast.ToastProvider>
      <div className="min-h-screen bg-[#fcfbf8] pb-12 md:pb-20">
        <Header />
        <main className="max-w-[640px] mx-auto px-4 pt-32">
          <div className="mb-10 text-center">
            <h1 className="t-h2 text-[#1c1c1c] tracking-tight mb-3">Add a New Spot</h1>
            <p className="t-body text-[#5f5f5d]">Share your favorite budget-friendly location with the community.</p>
          </div>

          <SpotForm 
            onSubmit={onSubmit} 
            isLoading={isSubmitting} 
            buttonText="Publish Spot"
          />
        </main>

        <Toast.Toast open={toastOpen} onOpenChange={setToastOpen}>
          <div className="flex flex-col gap-1">
            <Toast.ToastTitle className="text-[#1c1c1c]">Success!</Toast.ToastTitle>
            <Toast.ToastDescription className="text-[#5f5f5d]">
              Spot submitted for review! It will appear on the map once approved by moderators.
            </Toast.ToastDescription>
          </div>
          <Toast.ToastClose />
        </Toast.Toast>
        <Toast.ToastViewport />
      </div>
    </Toast.ToastProvider>
  );
}
