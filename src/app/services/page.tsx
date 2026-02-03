import { Metadata } from 'next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AlertTriangle, Navigation, Users, Cloud, Shield, BookOpen, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Our Services - SAVIOUR',
  description: 'Explore the emergency management and safety services offered by SAVIOUR',
}

const services = [
  {
    title: "SOS Emergency Alerts",
    description: "Send instant emergency alerts with your real-time location to nearby users and your pre-configured emergency contacts. Get help from your community when you need it most.",
    icon: AlertTriangle,
    color: "red",
    features: ["One-tap SOS activation", "Real-time location sharing", "Emergency contact notifications", "Community responders nearby"]
  },
  {
    title: "Weather Monitoring",
    description: "Stay informed with real-time weather updates, hourly forecasts, and severe weather alerts. Get detailed information including temperature, humidity, wind speed, and more.",
    icon: Cloud,
    color: "blue",
    features: ["Real-time weather data", "7-day weather forecast", "Severe weather alerts", "Sunrise & sunset times"]
  },
  {
    title: "Emergency Navigation",
    description: "Quickly find and navigate to nearby emergency services including hospitals, fire stations, police stations, and emergency shelters using integrated maps.",
    icon: Navigation,
    color: "green",
    features: ["Nearby hospitals", "Fire stations", "Police stations", "Emergency shelters"]
  },
  {
    title: "Community Support",
    description: "Connect with other SAVIOUR users through our community chat. Share updates, coordinate during emergencies, and build a network of mutual support.",
    icon: Users,
    color: "purple",
    features: ["Real-time community chat", "SOS response system", "User profiles", "Help coordination"]
  },
  {
    title: "Safety Guidelines",
    description: "Access comprehensive safety resources and guidelines for various emergencies including earthquakes, floods, fires, cyclones, and more.",
    icon: BookOpen,
    color: "yellow",
    features: ["Earthquake safety", "Flood preparedness", "Fire safety", "First aid tutorials"]
  },
  {
    title: "Emergency Contacts",
    description: "Store and manage your emergency contacts securely. These contacts will be automatically notified when you activate an SOS alert.",
    icon: Phone,
    color: "indigo",
    features: ["Add unlimited contacts", "Auto-notification on SOS", "Quick access", "Secure storage"]
  }
]

const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
  red: { bg: "bg-red-100", icon: "text-red-600", border: "border-red-200" },
  blue: { bg: "bg-blue-100", icon: "text-blue-600", border: "border-blue-200" },
  green: { bg: "bg-green-100", icon: "text-green-600", border: "border-green-200" },
  purple: { bg: "bg-purple-100", icon: "text-purple-600", border: "border-purple-200" },
  yellow: { bg: "bg-yellow-100", icon: "text-yellow-600", border: "border-yellow-200" },
  indigo: { bg: "bg-indigo-100", icon: "text-indigo-600", border: "border-indigo-200" },
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            SAVIOUR provides a comprehensive suite of emergency management and safety services designed to help you and your community stay safe during disasters and emergencies.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            const colors = colorClasses[service.color]
            return (
              <Card 
                key={index} 
                className={`bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 ${colors.border}`}
              >
                <CardHeader>
                  <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <service.icon className={`w-7 h-7 ${colors.icon}`} />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-500">
                        <span className={`w-1.5 h-1.5 ${colors.bg.replace('100', '500')} rounded-full mr-2`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join SAVIOUR today and access all these features to keep yourself and your community safe during emergencies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="secondary" size="lg">
              <Link href="/about">Learn More About Saviour</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
