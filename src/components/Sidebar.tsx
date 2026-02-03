'use client'

import { createContext, useContext } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { sidebarItems } from '@/lib/sidebarItems'

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

interface SidebarProps {
  onLinkClick?: (href: string) => void;
  isMobile?: boolean;
}

export function Sidebar({ onLinkClick, isMobile = false }: SidebarProps) {
  const pathname = usePathname()

  const handleLinkClick = (href: string) => {
    if (onLinkClick) {
      onLinkClick(href)
    }
  }

  return (
    <div className={cn(
      "flex flex-col bg-white transition-all duration-300",
      isMobile ? "w-full h-full" : "w-64 border-r border-gray-200/80 shadow-sm"
    )}>
      {/* Section Label */}
      {!isMobile && (
        <div className="px-4 py-4 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dashboard Menu</p>
        </div>
      )}
      
      <ScrollArea className="flex-1">
        <nav className={cn("space-y-1 px-3", isMobile ? "py-4" : "py-3")}>
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={() => handleLinkClick(item.href)}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start px-3 font-medium transition-all duration-200",
                    isMobile ? "h-12 text-base" : "h-10",
                    isActive 
                      ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 border-l-4 border-blue-600 rounded-l-none" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive ? "text-blue-600" : "text-gray-500"
                  )} />
                  <span>{item.name}</span>
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}

