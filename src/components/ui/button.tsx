import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-white hover:bg-primary/80": variant === 'default',
            "bg-red-500 text-white hover:bg-red-400": variant === 'destructive',
            "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100": variant === 'outline',
            "bg-secondary text-white hover:bg-secondary/80": variant === 'secondary',
            "hover:bg-gray-100 text-gray-700": variant === 'ghost',
            "text-primary underline hover:no-underline": variant === 'link',
            "h-10 px-4 py-2": size === 'default',
            "h-8 px-3 py-1.5": size === 'sm',
            "h-12 px-6 py-3": size === 'lg',
            "h-10 w-10": size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
