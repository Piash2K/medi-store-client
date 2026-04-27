"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Bolt,
  Info,
  CheckCircle,
} from "lucide-react";

// Dynamically import the ChatbotWidget to avoid SSR issues
const ChatbotWidget = dynamic(() => import("@/components/shared/chatbot-widget"), { ssr: false });

export default function HelpPageClient() {
  const [openChat, setOpenChat] = useState(false);
  return (
    <>
      <ChatbotWidget isOpen={openChat} setIsOpen={setOpenChat} />
      <div>
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold tracking-wide mb-3 md:mb-4">
          <Bolt className="w-3 h-3 md:w-4 md:h-4" />
          Powered by Groq AI
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">
          Ask MediStore AI
        </h2>
        <p className="text-sm md:text-base text-white/90 mb-4 md:mb-6">
          Get instant answers about your orders, shipping status, and
          account settings. Our AI assistant is here 24/7 to help you
          navigate our services.
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2 text-white/80">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-xs md:text-sm">
              MediStore AI cannot provide medical diagnoses or medical advice.
            </p>
          </div>
          <div className="flex items-start gap-2 text-white/80">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-xs md:text-sm">
              Verified pharmacists are available for clinical consultations.
            </p>
          </div>
        </div>
        <Button
          className="mt-6 md:mt-8 bg-white text-teal-700 text-sm font-semibold px-6 md:px-8 py-2 md:py-3 rounded-full hover:bg-teal-50 transition-all shadow-lg active:scale-95"
          onClick={() => setOpenChat(true)}
        >
          Start AI Chat
        </Button>
      </div>
    </>
  );
}
