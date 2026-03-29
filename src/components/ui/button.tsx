import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-text-xhigh font-[500] text-[0.875rem] leading-[1.25rem] font-[Inter,sans-serif] transition-all disabled:pointer-events-none disabled:bg-state-disabled disabled:border-state-disabled-border disabled:text-text-disabled [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-button-primary border border-button-primary-border hover:bg-button-primary-hover active:bg-button-primary-pressed",
        destructive:
          "bg-[var(--color-red3)] border border-transparent text-white hover:bg-[var(--color-red4)] active:bg-[var(--color-red5)]",
        secondary:
          "bg-button-secondary border border-button-secondary-border hover:bg-button-secondary-hover active:bg-button-secondary-pressed",
        outline:
          "bg-button-tertiary border border-button-tertiary-border hover:bg-button-tertiary-hover active:bg-button-tertiary-pressed",
        ghost:
          "bg-transparent border border-transparent hover:bg-button-tertiary-hover active:bg-button-tertiary-pressed",
        link: "bg-transparent border-none text-hyperlink underline-offset-4 hover:underline hover:text-hyperlink-hover active:text-hyperlink-pressed",
      },
      size: {
        default: "h-[var(--element-height)] px-4 py-0",
        sm: "h-[calc(var(--element-height)*0.85)] px-3 gap-1.5",
        lg: "h-[calc(var(--element-height)*1.15)] px-6",
        icon: "h-[var(--element-height)] w-[var(--element-height)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
