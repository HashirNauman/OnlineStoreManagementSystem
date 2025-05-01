import * as React from "react";

interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ open, onOpenChange, className, children, ...props }, ref) => {
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onOpenChange(false);
        }
      };

      if (open) {
        document.addEventListener("keydown", handleKeyDown);
      } else {
        document.removeEventListener("keydown", handleKeyDown);
      }

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
      <div
        ref={ref}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Dialog.displayName = "Dialog";

const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={`px-4 py-2 font-medium text-white bg-primary hover:bg-primary-dark rounded-md ${className}`}
    {...props}
  />
));
DialogTrigger.displayName = "DialogTrigger";

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`relative z-50 w-full max-w-lg rounded-md bg-white shadow-lg ${className}`}
    {...props}
  />
));
DialogContent.displayName = "DialogContent";

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`p-4 border-b border-gray-200 ${className}`}
    {...props}
  />
));
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={`text-lg font-semibold text-gray-800 ${className}`}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex justify-end p-4 border-t border-gray-200 ${className}`}
    {...props}
  />
));
DialogFooter.displayName = "DialogFooter";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
};
