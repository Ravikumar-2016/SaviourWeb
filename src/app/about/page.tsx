import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Shield, AlertTriangle, Cloud, MapPin, Users, Heart, Target, Lightbulb, Globe, Handshake } from 'lucide-react'

export default function About() {
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 min-h-screen">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">About Us</h2>
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Empowering communities in times of crisis
          </p>
          <p className="max-w-2xl mt-5 mx-auto text-xl text-gray-500">
            SAVIOUR is a comprehensive disaster management and emergency response platform designed to help individuals and communities prepare for, respond to, and recover from emergencies.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">Our Mission</h3>
              <p className="mt-4 text-lg text-gray-500">
                At SAVIOUR, our mission is to leverage technology to save lives and minimize the impact of natural disasters. We provide real-time emergency alerts, connect communities for mutual support, and deliver critical safety information when it matters most.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">Our Vision</h3>
              <p className="mt-4 text-lg text-gray-500">
                We envision a world where every community has access to life-saving emergency tools. Through our platform, we aim to create a global network of mutual aid, ensuring that no one faces a crisis alone. SAVIOUR strives to be the trusted companion in emergencies.
              </p>
            </div>
          </div>
        </div>

        {/* What We Offer */}
        <div className="mt-20">
          <h3 className="text-3xl font-extrabold text-gray-900 text-center mb-4">What We Offer</h3>
          <p className="text-center text-gray-500 max-w-2xl mx-auto mb-12">
            SAVIOUR provides a comprehensive suite of emergency management features designed to keep you and your community safe.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl p-6 border border-red-100 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">SOS Emergency Alerts</h4>
              <p className="text-sm text-gray-500">Send emergency alerts with your location to nearby users and your emergency contacts instantly.</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cloud className="w-7 h-7 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Weather Monitoring</h4>
              <p className="text-sm text-gray-500">Real-time weather updates, forecasts, and severe weather alerts to keep you informed.</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 border border-green-100 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Emergency Navigation</h4>
              <p className="text-sm text-gray-500">Find and navigate to nearby hospitals, fire stations, police stations, and shelters.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border border-purple-100 text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-purple-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Community Support</h4>
              <p className="text-sm text-gray-500">Connect with other users through community chat and respond to SOS alerts from people in need.</p>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mt-20">
          <h3 className="text-3xl font-extrabold text-gray-900 text-center mb-12">Our Values</h3>
          <ul className="space-y-4 max-w-3xl mx-auto">
            <li className="flex items-center bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <span className="bg-blue-500 rounded-full p-3 mr-4 flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-white" />
              </span>
              <span className="text-lg text-gray-700">Innovation in disaster management technology</span>
            </li>
            <li className="flex items-center bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <span className="bg-green-500 rounded-full p-3 mr-4 flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </span>
              <span className="text-lg text-gray-700">Community empowerment and mutual support</span>
            </li>
            <li className="flex items-center bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <span className="bg-yellow-500 rounded-full p-3 mr-4 flex-shrink-0">
                <Globe className="w-5 h-5 text-white" />
              </span>
              <span className="text-lg text-gray-700">Accessibility and inclusivity for all users</span>
            </li>
            <li className="flex items-center bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <span className="bg-red-500 rounded-full p-3 mr-4 flex-shrink-0">
                <Handshake className="w-5 h-5 text-white" />
              </span>
              <span className="text-lg text-gray-700">Collaboration with local and global partners</span>
            </li>
            <li className="flex items-center bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <span className="bg-purple-500 rounded-full p-3 mr-4 flex-shrink-0">
                <Heart className="w-5 h-5 text-white" />
              </span>
              <span className="text-lg text-gray-700">Commitment to saving lives and protecting communities</span>
            </li>
          </ul>
        </div>

        {/* Our Team */}
        <div className="mt-20">
          <h3 className="text-3xl font-extrabold text-gray-900 text-center">Our Team</h3>
          <p className="mt-4 max-w-3xl mx-auto text-center text-lg text-gray-500">
            SAVIOUR is built by a dedicated team of developers and disaster management enthusiasts from IIITDM Jabalpur, India. We&apos;re passionate about using technology to make a positive impact on the world and help communities stay safe during emergencies.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-10 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to stay safe?</h3>
            <p className="text-blue-100 mb-6">Join SAVIOUR today and be part of a community that looks out for each other.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="secondary" className="px-8 py-3">
                <Link href="/services">Explore Our Services</Link>
              </Button>
              <Button asChild variant="outline" className="px-8 py-3 bg-transparent border-white text-white hover:bg-white/10">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

