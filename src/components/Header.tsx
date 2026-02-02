"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { auth } from "@/lib/firebase"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<import("firebase/auth").User | null>(null)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser)
    })
    return () => unsub()
  }, [])

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      setUser(null)
      window.location.href = "/"
    } catch (error) {
      console.error("Error during sign out:", error)
      window.location.href = "/auth/login"
    }
  }

  return (
    <header className="bg-white text-black font-sans">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/Saviour.png" alt="SAVIOUR Logo" width={180} height={40} />
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/about" className="hover:text-blue-600 transition-colors hover:scale-105 transform">
              About
            </Link>
            <Link href="/services" className="hover:text-blue-600 transition-colors hover:scale-105 transform">
              Services
            </Link>
            <Link href="/contact" className="hover:text-blue-600 transition-colors hover:scale-105 transform">
              Contact
            </Link>
            <Link href="/donate" className="hover:text-blue-600 transition-colors hover:scale-105 transform">
              Donate
            </Link>
            {!user && (
              <>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <Link href="/auth/login">Log In</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </>
            )}
            {user && (
              <>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <Link href={user?.email === "saviourglobalinfo@gmail.com" ? "/admin-dashboard" : "/dashboard"}>
                    Dashboard
                  </Link>
                </Button>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Log Out
                </Button>
              </>
            )}
          </nav>
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <nav className="flex flex-col items-center py-4 space-y-4">
            <Link href="/about" className="hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
              About
            </Link>
            <Link href="/services" className="hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
              Services
            </Link>
            <Link href="/contact" className="hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
              Contact
            </Link>
            <Link href="/donate" className="hover:text-blue-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
              Donate
            </Link>
            {!user && (
              <>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/auth/login">Log In</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </>
            )}
            {user && (
              <>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href={user?.email === "saviourglobalinfo@gmail.com" ? "/admin-dashboard" : "/dashboard"}>
                    Dashboard
                  </Link>
                </Button>
                <Button
                  onClick={() => { setIsMenuOpen(false); handleSignOut(); }}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Log Out
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}