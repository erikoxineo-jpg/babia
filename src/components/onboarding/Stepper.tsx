"use client";

import { Check, Store, Clock, Scissors, Users, PartyPopper } from "lucide-react";
import { ONBOARDING_STEPS } from "@/lib/onboarding";

const STEP_ICONS = [Store, Clock, Scissors, Users, PartyPopper];

interface StepperProps {
  currentStep: number;
}

export function Stepper({ currentStep }: StepperProps) {
  return (
    <nav className="flex items-center justify-between mb-8">
      {ONBOARDING_STEPS.map((step, index) => {
        const Icon = STEP_ICONS[index];
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${isCompleted
                    ? "bg-primary-500 text-white"
                    : isCurrent
                      ? "bg-secondary-500 text-white ring-4 ring-secondary-100"
                      : "bg-gray-100 text-gray-400"
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`
                  text-[11px] mt-1.5 hidden sm:block
                  ${isCurrent ? "font-semibold text-secondary-600" : isCompleted ? "text-primary-600 font-medium" : "text-gray-400"}
                `}
              >
                {step.label}
              </span>
            </div>
            {index < ONBOARDING_STEPS.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-2 rounded-full transition-colors
                  ${currentStep > step.id ? "bg-primary-500" : "bg-gray-100"}
                `}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
