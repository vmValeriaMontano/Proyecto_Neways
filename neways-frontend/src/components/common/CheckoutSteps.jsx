import React from 'react';
import { Check } from 'lucide-react';

export default function CheckoutSteps({ currentStep = 1 }) {
  const steps = [
    { id: 1, label: 'Envío' },
    { id: 2, label: 'Pago' },
    { id: 3, label: 'Compra finalizada' }
  ];

  return (
    <div className="flex items-center justify-between max-w-xs mx-auto my-6 px-4">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  isCompleted
                    ? 'bg-purple-600 text-white'
                    : isCurrent
                    ? 'bg-purple-500 text-white'
                    : 'bg-white border-2 border-gray-300 text-gray-500'
                }`}
              >
                {isCompleted ? <Check size={18} /> : step.id}
              </div>
              <span className="text-[11px] font-medium text-slate-600 mt-1">
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div 
                className={`flex-1 h-[2px] mx-2 mb-4 ${
                  currentStep > step.id ? 'bg-purple-600' : 'bg-gray-300'
                }`} 
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}