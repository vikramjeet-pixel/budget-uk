import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-[6px] border border-[var(--border-passive)] bg-[#f7f4ed] px-[12px] py-[8px] text-[16px] text-[#1c1c1c] transition-shadow duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#5f5f5d] outline-none focus:shadow-[var(--focus-shadow)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
