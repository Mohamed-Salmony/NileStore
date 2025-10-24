"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n/config";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import LanguageWrapper from "@/components/LanguageWrapper";
import Chatbot from "@/components/Chatbot";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <I18nextProvider i18n={i18n}>
          <LanguageWrapper />
          <AuthProvider>
            {children}
            <Chatbot />
            <Toaster />
            <Sonner />
          </AuthProvider>
        </I18nextProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}