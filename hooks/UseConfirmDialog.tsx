"use client";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"
  import { createContext, useContext, useState,type ReactNode } from "react"
  
  interface ConfirmOptions {
    title: string
    description?: string
    confirmText?: string
    cancelText?: string
    type?: "default" | "danger"
  }
  
  type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>
  
  const ConfirmDialogContext = createContext<ConfirmFn | null>(null)
  
  export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false)
    const [options, setOptions] = useState<ConfirmOptions>({
      title: "",
      description: "",
      confirmText: "Confirm",
      cancelText: "Cancel",
      type: "default"
    })
    const [resolver, setResolver] = useState<((result: boolean) => void) | null>(
      null
    )
  
    const confirm: ConfirmFn = (opts) => {
      setOptions({ confirmText: "Confirm", cancelText: "Cancel", ...opts })
      setOpen(true)
      return new Promise((resolve) => setResolver(() => resolve))
    }
  
    const handleConfirm = () => {
      setOpen(false)
      resolver?.(true)
    }
  
    const handleCancel = () => {
      setOpen(false)
      resolver?.(false)
    }
  
    return (
      <ConfirmDialogContext.Provider value={confirm}>
        {children}
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{options.title}</AlertDialogTitle>
              {options.description && (
                <AlertDialogDescription>{options.description}</AlertDialogDescription>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancel}>
                {options.cancelText}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm} className={options.type === "danger" ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500" : ""}>
                {options.confirmText}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ConfirmDialogContext.Provider>
    )
  }
  
  export function useConfirmDialog() {
    const ctx = useContext(ConfirmDialogContext)
    if (!ctx) {
      throw new Error("useConfirmDialog must be used inside ConfirmDialogProvider")
    }
    return ctx
  }
  