import { useEffect, useState, useCallback, createContext, useContext } from 'react'

interface ToastState {
  message: string
  visible: boolean
}

const ToastContext = createContext<(message: string) => void>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>({ message: '', visible: false })

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true })
  }, [])

  useEffect(() => {
    if (!toast.visible) return
    const timer = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500)
    return () => clearTimeout(timer)
  }, [toast.visible])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast.visible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto bg-gray-800 text-white px-6 py-4 rounded-xl shadow-2xl max-w-sm text-center animate-toast">
            <p className="text-sm font-medium leading-relaxed">{toast.message}</p>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}
