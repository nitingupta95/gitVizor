import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import React from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { AppSidebar } from './app-sidebar'
import { Separator } from '@/components/ui/separator'

type Props = {
  children: React.ReactNode
}

const layout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className='w-full m-2 min-w-0'>

        {/* ── Topbar ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 border border-border/40 bg-background/50 shadow-sm backdrop-blur-md rounded-full px-4 py-2">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors h-8 w-8 shrink-0" />
          
          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 ring-2 ring-primary/20 hover:ring-primary/40 transition-all rounded-full",
                }
              }}
            />
          </div>
        </div>

        <div className="h-3" />

        {/* ── Main content ─────────────────────────────────────────────── */}
        <div className="border border-sidebar-border/40 bg-sidebar/60 shadow-[0_4px_20px_rgba(0,0,0,0.15)] backdrop-blur-xl rounded-xl overflow-y-auto h-[calc(100vh-5.5rem)] p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}

export default layout