'use client'

import { ReactNode, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { useResponsive } from '@/hooks/useResponsive'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

interface DashboardLayoutProps {
  children: ReactNode;
}

function MobileHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center">
          <Image src="/Saviour.png" alt="SAVIOUR" width={120} height={30} />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </header>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
            <Sidebar onLinkClick={() => setSidebarOpen(false)} isMobile />
          </div>
        </div>
      )}
    </>
  )
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isMobile } = useResponsive()

  return (
    <div className="flex h-screen bg-gray-100">
      {!isMobile && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isMobile && <DynamicMobileHeader />}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
          <div className="container mx-auto px-6 py-8 relative">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

