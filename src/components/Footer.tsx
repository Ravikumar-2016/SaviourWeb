'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Mail, Phone, MapPin, Heart, ArrowUpRight } from 'lucide-react'

// Custom social icons for better styling
const TwitterXIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

export default function Footer() {
  const pathname = usePathname()
  const currentYear = new Date().getFullYear()
  
  // Hide footer on dashboard pages - dashboard has its own layout
  if (pathname?.startsWith('/dashboard')) {
    return null
  }

  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Our Services', href: '/services' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Dashboard', href: '/dashboard' },
  ]

  const socialLinks = [
    { name: 'Twitter', href: 'https://x.com/', icon: TwitterXIcon },
    { name: 'Instagram', href: 'https://www.instagram.com/', icon: InstagramIcon },
    { name: 'Facebook', href: 'https://www.facebook.com/', icon: FacebookIcon },
  ]

  return (
    <footer className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <Link href="/" className="inline-block mb-6">
                <Image 
                  src="/Saviour.png" 
                  alt="SAVIOUR Logo" 
                  width={160} 
                  height={40} 
                  className="brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
                />
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
                Empowering communities through disaster preparedness, emergency response, and safety education. Together, we build resilience.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow us on ${social.name}`}
                    className="w-10 h-10 rounded-full bg-slate-800 hover:bg-blue-600 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 hover:scale-110"
                  >
                    <social.icon />
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-6 relative">
                Quick Links
                <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-blue-500 rounded-full" />
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-slate-400 hover:text-white text-sm flex items-center gap-1 group transition-colors duration-200"
                    >
                      <span>{link.name}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Features */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-6 relative">
                Features
                <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-blue-500 rounded-full" />
              </h4>
              <ul className="space-y-3">
                <li>
                  <span className="text-slate-400 text-sm">SOS Emergency Alerts</span>
                </li>
                <li>
                  <span className="text-slate-400 text-sm">Real-time Weather Updates</span>
                </li>
                <li>
                  <span className="text-slate-400 text-sm">Safety Guidelines</span>
                </li>
                <li>
                  <span className="text-slate-400 text-sm">Community Support</span>
                </li>
                <li>
                  <span className="text-slate-400 text-sm">Emergency Navigation</span>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-6 relative">
                Contact Us
                <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-blue-500 rounded-full" />
              </h4>
              <ul className="space-y-4">
                <li>
                  <a 
                    href="mailto:saviourglobalinfo@gmail.com" 
                    className="flex items-start gap-3 text-slate-400 hover:text-white transition-colors duration-200 group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-800 group-hover:bg-blue-600 flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Email</p>
                      <p className="text-sm">saviourglobalinfo@gmail.com</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a 
                    href="tel:+9193xxxxxxxx" 
                    className="flex items-start gap-3 text-slate-400 hover:text-white transition-colors duration-200 group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-800 group-hover:bg-blue-600 flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Phone</p>
                      <p className="text-sm">+91 93xxxxxxxx</p>
                    </div>
                  </a>
                </li>
                <li>
                  <div className="flex items-start gap-3 text-slate-400">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Location</p>
                      <p className="text-sm">IIITDM Jabalpur, India</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-slate-500 text-sm flex items-center gap-1">
                © {currentYear} SAVIOUR. Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for safer communities
              </p>
              <nav className="flex items-center gap-6">
                <Link 
                  href="/privacy" 
                  className="text-slate-500 hover:text-white text-sm transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
                <Link 
                  href="/terms" 
                  className="text-slate-500 hover:text-white text-sm transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

