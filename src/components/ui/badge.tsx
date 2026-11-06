import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border-2 px-2 py-0.5 text-xs font-bold transition-all focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-border bg-primary text-primary-foreground shadow-brutal-xs",
        secondary:
          "border-border bg-card text-foreground shadow-brutal-xs",
        destructive:
          "border-border bg-rose-500/15 text-rose-700 dark:text-rose-400 shadow-brutal-xs",
        success:
          "border-border bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 shadow-brutal-xs",
        warning:
          "border-border bg-amber-500/15 text-amber-800 dark:text-amber-300 shadow-brutal-xs",
        outline: "border-border text-foreground bg-card shadow-brutal-xs",
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
