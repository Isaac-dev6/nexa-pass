import type { ReactNode } from 'react'
import { Sidebar } from '../ui/Sidebar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4F4FB] md:flex md:bg-[#F0F0F8]">
      <Sidebar />
      <main className="flex-1 min-h-screen md:flex md:justify-center">
        <div className="w-full md:max-w-[900px] min-h-screen bg-[#F4F4FB]">
          {children}
        </div>
      </main>
    </div>
  )
}
