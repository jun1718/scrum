import { createContext, useContext, useState, type ReactNode } from 'react'

const ApiOverlayContext = createContext(false)
const ApiOverlayToggleContext = createContext<() => void>(() => {})

export function ApiOverlayProvider({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <ApiOverlayContext.Provider value={show}>
      <ApiOverlayToggleContext.Provider value={() => setShow((v) => !v)}>
        {children}
      </ApiOverlayToggleContext.Provider>
    </ApiOverlayContext.Provider>
  )
}

export function useApiOverlay() {
  return useContext(ApiOverlayContext)
}

export function useApiOverlayToggle() {
  return useContext(ApiOverlayToggleContext)
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-100 text-green-800 border-green-300',
  POST: 'bg-blue-100 text-blue-800 border-blue-300',
  PUT: 'bg-amber-100 text-amber-800 border-amber-300',
  DELETE: 'bg-red-100 text-red-800 border-red-300',
}

export interface ApiInfo {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  endpoint: string
  description: string
}

interface ApiSectionProps {
  label: string
  apis: ApiInfo[]
  children: ReactNode
}

export function ApiSection({ label, apis, children }: ApiSectionProps) {
  const show = useApiOverlay()
  const [open, setOpen] = useState(false)

  if (!show) return <>{children}</>

  return (
    <div
      className="relative rounded-lg border-2 border-dashed border-yellow-400 bg-yellow-50/30"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="absolute -top-3 left-3 z-10 inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 rounded px-2 py-0.5 text-xs font-bold cursor-pointer hover:bg-yellow-500 transition-colors"
      >
        {open ? '▼' : '▶'} {label}
        <span className="font-normal text-yellow-700 ml-1">({apis.length} APIs)</span>
      </button>
      {open && (
        <div className="mx-3 mt-4 mb-2 p-3 bg-white rounded-md border border-yellow-300 shadow-sm">
          <div className="space-y-1.5">
            {apis.map((api, i) => {
              const color = METHOD_COLORS[api.method] ?? 'bg-gray-100 text-gray-800 border-gray-300'
              return (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className={`inline-flex items-center font-mono font-bold border rounded px-1.5 py-0.5 ${color}`}>
                    {api.method}
                  </span>
                  <span className="font-mono text-gray-700">{api.endpoint}</span>
                  <span className="text-gray-500">{api.description}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
      <div className={open ? 'pt-1' : 'pt-2'}>
        {children}
      </div>
    </div>
  )
}
