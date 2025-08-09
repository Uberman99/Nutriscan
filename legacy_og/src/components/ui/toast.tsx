import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  title: string
  description?: string
  variant?: "default" | "success" | "error"
  onClose: () => void
}

export function Toast({ title, description, variant = "default", onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={cn(
        "w-full max-w-sm rounded-lg border p-4 shadow-lg",
        "animate-in slide-in-from-top-2 duration-300",
        {
          "bg-white border-gray-200": variant === "default",
          "bg-green-50 border-green-200": variant === "success",
          "bg-red-50 border-red-200": variant === "error",
        }
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div
            className={cn("text-sm font-semibold", {
              "text-gray-900": variant === "default",
              "text-green-800": variant === "success",
              "text-red-800": variant === "error",
            })}
          >
            {title}
          </div>
          {description && (
            <div
              className={cn("mt-1 text-sm", {
                "text-gray-600": variant === "default",
                "text-green-700": variant === "success",
                "text-red-700": variant === "error",
              })}
            >
              {description}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="ml-2 flex-shrink-0 rounded-md p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Array<ToastProps & { id: string }>>([])

  const toast = React.useCallback((props: Omit<ToastProps, "onClose">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...props, id, onClose: () => {} }])
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const ToastContainer = React.useCallback(() => {
    return (
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toastProps) => (
          <Toast
            key={toastProps.id}
            {...toastProps}
            onClose={() => dismiss(toastProps.id)}
          />
        ))}
      </div>
    )
  }, [toasts, dismiss])

  return { toast, ToastContainer }
}
