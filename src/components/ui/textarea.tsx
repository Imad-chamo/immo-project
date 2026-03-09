import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm",
            "placeholder:text-gray-400 outline-none transition-colors resize-none",
            "focus:border-[#1A4A8A] focus:ring-2 focus:ring-[#1A4A8A]/20",
            error ? "border-red-500" : "border-gray-300",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {helperText && !error && <p className="text-xs text-gray-500">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
