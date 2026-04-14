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
            <div className="flex items-center gap-2 border-sidebar-border/60 bg-sidebar/80 border shadow-sm backdrop-blur rounded-lg p-2 px-4">
                {/* {Search Bar} */}
                <div className='ml-auto'></div>
                <ThemeToggle />
                <UserButton/>
            </div>
            <div className="h-4"></div>
            {/* {main content} */}
            <div className="border-sidebar-border/60 bg-sidebar border shadow-sm rounded-lg overflow-y-scroll h-[calc(100vh-6rem)] p-4">
                {children}
            </div>
        </main>
    </SidebarProvider>
  )
}

export default layout