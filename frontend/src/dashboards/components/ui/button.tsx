import React, { forwardRef } from 'react';

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  disabled?: boolean; // Add 'disabled' prop to handle disabled state
  style?: React.CSSProperties; // Add 'style' prop for inline styles
}

// Define styles for variants and sizes
const variantStyles: Record<string, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-teal-700 text-gray-800 hover:bg-gray-300",
  ghost: "bg-teal-400 text-gray-800 hover:bg-teal-300",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
};

const sizeStyles: Record<string, string> = {
  sm: "text-xs px-2 py-1",
  md: "text-sm px-4 py-2",
  lg: "text-lg px-6 py-3",
};

// Use React.forwardRef to allow refs to be forwarded to the button element
const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  children,
  disabled = false, // Default to 'false' if not provided
  style, // Accept the 'style' prop
}, ref) => {
  const variantClass = variantStyles[variant] || "";
  const sizeClass = sizeStyles[size] || "";

  // Styles for the disabled state
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      ref={ref} // Forward the ref to the button element
      className={`rounded-md font-medium ${variantClass} ${sizeClass} ${disabledClass} ${className}`}
      onClick={disabled ? undefined : onClick} // Disable onClick if the button is disabled
      disabled={disabled} // Apply native 'disabled' attribute
      style={style} // Pass the 'style' prop to the button element
    >
      {children}
    </button>
  );
});

// Add a displayName for better debugging in React DevTools
Button.displayName = "Button";

export default Button;