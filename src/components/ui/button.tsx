import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-border shadow-brutal-sm hover:brightness-105",
        destructive:
          "bg-destructive text-destructive-foreground border-border shadow-brutal-sm hover:brightness-105",
        outline:
          "border-border bg-card hover:bg-accent hover:text-accent-foreground text-foreground shadow-brutal-sm",
        secondary:
          "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80 shadow-brutal-sm",
        ghost: "border-transparent hover:bg-accent hover:text-accent-foreground shadow-none active:translate-x-0 active:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline border-transparent shadow-none active:translate-x-0 active:translate-y-0",
        emerald: "bg-emerald-600 text-white border-border shadow-brutal-sm hover:bg-emerald-500",
        rose: "bg-rose-600 text-white border-border shadow-brutal-sm hover:bg-rose-500",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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

export { Button, buttonVariants }
