import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-[var(--element-height)] w-full min-w-0 bg-state-default border border-state-default-border text-text-xhigh placeholder:text-text-low font-[400] text-[0.875rem] leading-[1.25rem] font-[Inter,sans-serif] px-[var(--space8)] py-0 outline-none transition-[color,box-shadow,border-color]",
        "focus-visible:border-state-selection-border focus-visible:ring-1 focus-visible:ring-state-selection-border",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-state-disabled disabled:border-state-disabled-border disabled:text-text-disabled",
        "aria-invalid:border-state-error-border",
        "file:text-text-xhigh file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Input }
