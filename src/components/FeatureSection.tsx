'use client'

import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  Navigation, 
  Users, 
  Database, 
  CloudSun, 
  Phone, 
  Shield, 
  MessageSquare,
  MapPin,
  BookOpen,
  Heart,
  Zap
} from 'lucide-react'

const features = [
  {
    title: "Emergency SOS System",
    description: "One-tap emergency broadcast with GPS location, 9 emergency types, 3 priority levels, and image attachments. Get help when you need it most.",
    icon: AlertTriangle,
    color: "from-red-500 to-rose-600",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    iconBg: "bg-red-100 dark:bg-red-900/50",
  },
  {
    title: "Interactive Navigation",
    description: "Leaflet-powered maps showing all active SOS requests with color-coded markers. Filter by emergency type and respond with one click.",
    icon: Navigation,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
  },
  {
    title: "Community Chat",
    description: "Real-time city-based chat rooms to coordinate with neighbors. Share images, videos, and documents during emergencies.",
    icon: MessageSquare,
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    iconBg: "bg-purple-100 dark:bg-purple-900/50",
  },
  {
    title: "Weather Intelligence",
    description: "5-day forecasts with dual API reliability (WeatherAPI + OpenWeatherMap). Get hourly predictions and severe weather alerts.",
    icon: CloudSun,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
  },
  {
    title: "Resource Sharing",
    description: "Offer or request emergency supplies across 8 categories. Connect with your community to share medical supplies, food, shelter, and more.",
    icon: Database,
    color: "from-emerald-500 to-green-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
  },
  {
    title: "Emergency Contacts",
    description: "Quick access to national emergency numbers (112, 100, 101, 102) and personal contacts. One-tap calling and location sharing.",
    icon: Phone,
    color: "from-cyan-500 to-teal-600",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
    iconBg: "bg-cyan-100 dark:bg-cyan-900/50",
  },
  {
    title: "Safety Guides",
    description: "12 comprehensive disaster guides with video tutorials covering earthquakes, floods, fires, cyclones, and more.",
    icon: BookOpen,
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
    iconBg: "bg-pink-100 dark:bg-pink-900/50",
  },
  {
    title: "Secure Platform",
    description: "Firebase Authentication with Email and Google sign-in. Your data is protected with role-based access control.",
    icon: Shield,
    color: "from-slate-500 to-gray-600",
    bgColor: "bg-slate-50 dark:bg-slate-950/30",
    iconBg: "bg-slate-100 dark:bg-slate-900/50",
  },
]

const FeatureCard = ({ feature, index }: { feature: typeof features[0], index: number }) => {
  return (
    <motion.div
      className={`relative group rounded-2xl p-6 ${feature.bgColor} border border-gray-200/50 dark:border-gray-800/50 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-lg`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -5 }}
    >
      {/* Icon */}
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.iconBg} mb-4`}>
        <feature.icon className={`w-6 h-6 bg-gradient-to-r ${feature.color} bg-clip-text`} style={{ color: 'transparent', backgroundClip: 'text', WebkitBackgroundClip: 'text' }} />
        <feature.icon className={`w-6 h-6 absolute`} style={{ 
          background: `linear-gradient(to right, var(--tw-gradient-stops))`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
        }} />
      </div>
      
      {/* Gradient icon overlay */}
      <div className={`absolute top-6 left-6 inline-flex items-center justify-center w-12 h-12 rounded-xl`}>
        <div className={`w-6 h-6 bg-gradient-to-r ${feature.color} opacity-90`} style={{
          maskImage: `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><rect width="24" height="24"/></svg>')}")`,
          WebkitMaskImage: `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><rect width="24" height="24"/></svg>')}")`
        }} />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
        {feature.title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
        {feature.description}
      </p>

      {/* Hover gradient border effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10`} />
    </motion.div>
  )
}

const FeatureSection = () => {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full px-4 py-1.5 text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Zap className="w-4 h-4" />
            Powerful Features
          </motion.div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need for{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Emergency Preparedness
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            SAVIOUR provides comprehensive tools to help communities prepare for, respond to, and recover from emergencies.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl px-6 py-4">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-gray-700 dark:text-gray-300">
              Built to <span className="font-semibold text-gray-900 dark:text-white">save lives</span> and strengthen community resilience
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default FeatureSection

