import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  steps: { key: string; label: string }[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center mb-8 md:mb-10">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center">
          {/* Step Circle */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                index < currentStep
                  ? 'bg-primary-500 text-background-50'
                  : index === currentStep
                    ? 'bg-primary-500 text-background-50 ring-4 ring-primary-100'
                    : 'bg-background-100 text-foreground-400'
              )}
            >
              {index < currentStep ? (
                <span className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-check-line" />
                </span>
              ) : (
                index + 1
              )}
            </div>
            <span
              className={cn(
                'text-xs mt-1.5 font-medium whitespace-nowrap',
                index <= currentStep ? 'text-foreground-800' : 'text-foreground-400'
              )}
            >
              {step.label}
            </span>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                'w-10 md:w-16 h-0.5 mx-1 md:mx-2 mt-[-18px] transition-colors duration-300',
                index < currentStep ? 'bg-primary-500' : 'bg-background-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}