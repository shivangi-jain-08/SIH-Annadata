import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:translate-y-[-1px] active:translate-y-[0px] cursor-pointer-ripple",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-600 hover:shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
        secondary:
          "bg-secondary text-white hover:bg-secondary-600 hover:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        subtle: "bg-[#F2FCE2] text-primary hover:bg-[#E5F7D3] hover:shadow-sm",
        green: "bg-primary text-white hover:bg-primary-700 hover:shadow-md",
        orange: "bg-secondary text-white hover:bg-secondary-700 hover:shadow-md",
        accent: "bg-accent text-white hover:bg-accent-700 hover:shadow-md",
        glass: "bg-white/70 backdrop-blur-md border border-white/20 hover:bg-white/80 hover:shadow-md text-gray-800",
        neumorphic: "bg-[#f0f0f3] shadow-neumorphic-light hover:shadow-neumorphic-pressed active:shadow-neumorphic-pressed text-gray-800 transition-shadow",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
        pill: "h-9 rounded-full px-4",
        "pill-lg": "h-11 rounded-full px-6 text-base",
      },
      animation: {
        none: "",
        pulse: "animate-pulse-gentle",
        float: "animate-float",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        none: "rounded-none", 
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
      rounded: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, animation, rounded, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, animation, rounded, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }