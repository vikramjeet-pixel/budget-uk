import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-[9999px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 px-[12px] py-[4px] text-[12px]",
  {
    variants: {
      variant: {
        default: "bg-[var(--hover-tint)] text-[#1c1c1c]",
        category: "bg-[var(--hover-tint)] text-[#1c1c1c]",
        tier: "bg-[var(--hover-tint)] text-[#1c1c1c]",
        free: "bg-[#fcfbf8] text-[#1c1c1c] border border-[var(--border-passive)]",
        outline: "bg-transparent border border-[var(--border-passive)] text-[#5f5f5d]",
        primary: "bg-[#1c1c1c] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
