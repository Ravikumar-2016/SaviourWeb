import { Activity, CloudSun, Database, Navigation, PhoneCall, Shield, UserCircle, Users, AlertTriangle } from 'lucide-react'

export const sidebarItems = [
  { name: 'Dashboard', icon: Activity, href: '/dashboard' },
  { name: 'Profile', icon: UserCircle, href: '/dashboard/profile' },
  { name: 'SOS', icon: AlertTriangle, href: '/dashboard/sos' },
  { name: 'Resources', icon: Database, href: '/dashboard/resources' },
  { name: 'Weather', icon: CloudSun, href: '/dashboard/weather' },
  { name: 'Community', icon: Users, href: '/dashboard/community' },
  { name: 'Emergency Help', icon: PhoneCall, href: '/dashboard/emergency' },
  { name: 'Navigation', icon: Navigation, href: '/dashboard/navigation' },
  { name: 'Safety', icon: Shield, href: '/dashboard/safety' },
]

