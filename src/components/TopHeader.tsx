import { useApiOverlay, useApiOverlayToggle } from './ApiTag'

export function TopHeader() {
  const apiVisible = useApiOverlay()
  const toggleApi = useApiOverlayToggle()

  return (
    <header className="h-14 shrink-0 bg-[#1e40af] flex items-center justify-between px-4 w-full">
      <div className="flex items-center gap-2 text-white font-semibold text-lg">
        <span>Dooray!</span>
        <span className="opacity-80">|</span>
        <span>스크럼</span>
      </div>
      <div className="flex-1 max-w-xl mx-6 hidden sm:block">
        <div className="bg-white/15 rounded-md px-3 py-2 flex items-center gap-2">
          <span className="text-white/70 text-sm">Q 업무 검색</span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-white">
        <button
          type="button"
          onClick={toggleApi}
          className={`px-2.5 py-1 rounded text-xs font-mono ${apiVisible ? 'bg-green-500 text-white' : 'bg-white/20 text-white/80 hover:bg-white/30'}`}
        >
          API {apiVisible ? 'ON' : 'OFF'}
        </button>
        <button type="button" className="p-1.5 rounded hover:bg-white/10" aria-label="알림">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-sm font-medium">
          U
        </div>
      </div>
    </header>
  )
}
