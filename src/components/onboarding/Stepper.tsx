"use client";

import { Check, Store, Clock, Scissors, Users, PartyPopper } from "lucide-react";
import { ONBOARDING_STEPS } from "@/lib/onboarding";

const STEP_ICONS = [Store, Clock, Scissors, Users, PartyPopper];

interface StepperProps {
  currentStep: number;
}

export function Stepper({ currentStep }: StepperProps) {
  return (
    <nav className="flex items-center justify-center gap-1 sm:gap-2 mb-8">
      {ONBOARDING_STEPS.map((step, index) => {
        const Icon = STEP_ICONS[index];
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors
                  ${isCompleted
                    ? "bg-success-500 text-white"
                    : isCurrent
                      ? "bg-primary-500 text-white"
                      : "bg-gray-200 text-gray-400"
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </div>
              <span
                className={`
                  text-xs mt-1 hidden sm:block
                  ${isCurrent ? "font-semibold text-primary-700" : "text-gray-500"}
                `}
              >
                {step.label}
              </span>
            </div>
            {index < ONBOARDING_STEPS.length - 1 && (
              <div
                className={`
                  w-6 sm:w-10 h-0.5 mx-1
                  ${currentStep > step.id ? "bg-success-500" : "bg-gray-200"}
                `}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
