import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
    size?: "sm" | "md" | "lg"
    fullWidth?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", size = "md", fullWidth = false, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

        const variants = {
            primary: "bg-primary text-white hover:bg-primary-hover shadow-sm",
            secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
            outline: "border border-input bg-background hover:bg-gray-100 hover:text-accent-foreground",
            ghost: "hover:bg-gray-100 hover:text-accent-foreground",
            danger: "bg-red-600 text-white hover:bg-red-700",
        }

        const sizes = {
            sm: "h-9 px-3 text-xs",
            md: "h-10 px-4 py-2 text-sm",
            lg: "h-12 px-8 text-base",
        }

        const width = fullWidth ? "w-full" : ""

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"
