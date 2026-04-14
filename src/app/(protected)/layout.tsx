import { SidebarProvider } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import React from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { AppSidebar } from './app-sidebar'

type Props={
    children: React.ReactNode
}

const layout = ({ children }: Props) => {
  return (
    <SidebarProvider>
        <AppSidebar/>
        <main className='w-full m-2'>
            <div className="flex items-center gap-2 border border-sidebar-border/40 bg-sidebar/60 shadow-[0_2px_12px_rgba(0,0,0,0.15)] backdrop-blur-xl rounded-xl p-2.5 px-4">
                {/* {Search Bar} */}
                <div className='ml-auto'></div>
                <ThemeToggle />
                <UserButton/>
            </div>
            <div className="h-3"></div>
            {/* {main content} */}
            <div className="border border-sidebar-border/40 bg-sidebar/60 shadow-[0_4px_20px_rgba(0,0,0,0.15)] backdrop-blur-xl rounded-xl overflow-y-scroll h-[calc(100vh-5.5rem)] p-6">
                {children}
            </div>
        </main>
    </SidebarProvider>
  )
}

export default layout