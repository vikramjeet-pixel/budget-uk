import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[#1c1c1c] text-[#fcfbf8] rounded-[6px] shadow-[var(--inset-dark)] active:opacity-80 focus-visible:shadow-[var(--focus-shadow)] hover:opacity-90",
        ghost:
          "bg-transparent text-[#1c1c1c] border border-[var(--border-interactive)] rounded-[6px] active:opacity-80 focus-visible:shadow-[var(--focus-shadow)] hover:bg-[var(--hover-tint)]",
        cream:
          "bg-[#f7f4ed] text-[#1c1c1c] rounded-[6px] active:opacity-80 focus-visible:shadow-[var(--focus-shadow)] hover:bg-[#eceae4]",
        pill:
          "bg-[#f7f4ed] text-[#1c1c1c] rounded-[9999px] shadow-[var(--inset-dark)] opacity-50 active:opacity-80 focus-visible:shadow-[var(--focus-shadow)] hover:opacity-100",
      },
      size: {
        sm: "px-[12px] py-[6px] text-[14px]",
        md: "px-[16px] py-[8px] text-[16px]",
        icon: "p-[8px] aspect-square",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  size?: "sm" | "md" | "icon"
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = "icon", ...props }, ref) => {
    return (
      <Button
        variant="pill"
        size={size}
        className={cn("flex-shrink-0 items-center justify-center", className)}
        ref={ref}
        {...props}
      />
    )
  }
)
IconButton.displayName = "IconButton"

export { Button, buttonVariants, IconButton }
