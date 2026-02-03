'use client'

import { ReactNode, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { useResponsive } from '@/hooks/useResponsive'
import { Menu, X, User, LogOut, Home, Globe, Info, Briefcase, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/firebase'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DashboardLayoutProps {
  children: ReactNode;
}

function MobileHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      window.location.href = "/"
    } catch (error) {
      console.error("Error during sign out:", error)
    }
  }

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 px-4 py-3 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Left - Hamburger Menu */}
          <div className="w-10 flex justify-start">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-10 w-10 hover:bg-blue-50"
            >
              <Menu className="h-5 w-5 text-gray-700" />
            </Button>
          </div>
          
          {/* Center - Logo */}
          <Link href="/dashboard" className="flex items-center justify-center flex-1">
            <Image src="/Saviour.png" alt="SAVIOUR" width={130} height={32} priority />
          </Link>

          {/* Right - Navigation & Profile Icons */}
          <div className="flex items-center gap-1">
            {/* Navigation Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-blue-50">
                  <Globe className="h-5 w-5 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link href="/" className="flex items-center cursor-pointer">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/about" className="flex items-center cursor-pointer">
                    <Info className="mr-2 h-4 w-4" />
                    About
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/services" className="flex items-center cursor-pointer">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Services
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contact" className="flex items-center cursor-pointer">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-blue-50">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="fixed left-0 top-0 h-full w-72 bg-white shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
              <Link href="/dashboard" onClick={() => setSidebarOpen(false)}>
                <Image src="/Saviour.png" alt="SAVIOUR" width={130} height={32} priority />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="h-8 w-8 hover:bg-white/50"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar onLinkClick={() => setSidebarOpen(false)} isMobile />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function DesktopNavbar() {
  const handleSignOut = async () => {
    try {
      await auth.signOut()
      window.location.href = "/"
    } catch (error) {
      console.error("Error during sign out:", error)
    }
  }

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 px-6 py-3 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* Left - Logo */}
        <Link href="/dashboard" className="flex items-center">
          <Image src="/Saviour.png" alt="SAVIOUR" width={140} height={35} priority />
        </Link>

        {/* Center - Navigation Links */}
        <nav className="flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            About
          </Link>
          <Link href="/services" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            Services
          </Link>
          <Link href="/contact" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            Contact
          </Link>
        </nav>

        {/* Right - Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-blue-50">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="flex items-center cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isMobile } = useResponsive()

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Full-width Navbar at top for desktop */}
      {!isMobile && <DesktopNavbar />}
      
      {/* Mobile header */}
      {isMobile && <MobileHeader />}
      
      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {!isMobile && <Sidebar />}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative">
          {/* Subtle background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 relative">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

