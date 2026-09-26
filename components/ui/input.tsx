import * as React from "react";
import { cn } from "@/lib/utils";

export const fieldClass =
  "w-full rounded-xl border border-input bg-background/60 px-4 text-[15px] text-foreground placeholder:text-muted-foreground/70 transition-[border-color,box-shadow] outline-none focus-visible:outline-none focus:border-accent/60 focus:ring-4 focus:ring-accent/10 aria-[invalid=true]:border-destructive/60";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(fieldClass, "h-12", className)} {...props} />,
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldClass, "min-h-36 resize-y py-3 leading-relaxed", className)} {...props} />
  ),
);
Textarea.displayName = "Textarea";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-2 block text-[13px] font-medium text-foreground/85", className)} {...props} />;
}

export function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-[13px] text-destructive">
      {message}
    </p>
  );
}
