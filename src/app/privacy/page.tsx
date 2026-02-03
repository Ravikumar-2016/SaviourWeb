import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Database, Eye, Lock, UserCheck, Bell, Mail, Phone } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy - SAVIOUR",
  description: "Privacy Policy for the SAVIOUR disaster management and emergency response platform",
}

export default function PrivacyPage() {
  const lastUpdated = "January 2025"
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Privacy Policy</h1>
          <p className="text-slate-600">Last updated: {lastUpdated}</p>
        </div>

        {/* Introduction */}
        <Card className="mb-6 border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-blue-600" />
              1. Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 space-y-4">
            <p>
              Welcome to SAVIOUR (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). SAVIOUR is a comprehensive disaster 
              management and emergency response platform designed to help communities prepare for, respond to, and 
              recover from emergencies and natural disasters.
            </p>
            <p>
              Your privacy and the security of your personal information are of utmost importance to us, especially 
              given the sensitive nature of emergency services. This Privacy Policy explains how we collect, use, 
              disclose, and safeguard your information when you use our platform.
            </p>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card className="mb-6 border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Database className="w-5 h-5 text-green-600" />
              2. Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 space-y-4">
            <p>To provide our emergency and disaster management services, we collect the following types of information:</p>
            
            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-2">Account Information</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Name, email address, and phone number for account creation</li>
                  <li>Profile photo (optional) for community identification</li>
                  <li>City/location preferences for localized weather and emergency alerts</li>
                </ul>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-2">Emergency Contact Information</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Emergency contacts you add (names, phone numbers, relationships)</li>
                  <li>This data is stored securely and used only for emergency notifications</li>
                </ul>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-2">Location Data</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Real-time location when you activate SOS alerts</li>
                  <li>Location for navigation to emergency services (hospitals, shelters, fire stations)</li>
                  <li>City selection for weather forecasts and disaster warnings</li>
                </ul>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-2">Usage Data</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>SOS alerts created and responded to</li>
                  <li>Safety resources accessed and community interactions</li>
                  <li>Device information and app usage patterns</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Data */}
        <Card className="mb-6 border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-purple-600" />
              3. How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 space-y-4">
            <p>SAVIOUR uses your information to provide critical emergency and safety services:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <span><strong>SOS Emergency Alerts:</strong> Share your location with nearby users and emergency contacts when you need help</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <span><strong>Weather Alerts:</strong> Provide real-time weather updates and disaster warnings for your location</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <span><strong>Emergency Navigation:</strong> Guide you to nearby hospitals, fire stations, police stations, and shelters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <span><strong>Community Support:</strong> Connect you with other users who can provide assistance during emergencies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <span><strong>Safety Education:</strong> Provide personalized safety guidelines and emergency preparedness resources</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <span><strong>Service Improvement:</strong> Analyze usage patterns to enhance platform reliability and features</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card className="mb-6 border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-orange-600" />
              4. Information Sharing
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 space-y-4">
            <p>We share your information only in the following circumstances:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                <span><strong>During SOS Alerts:</strong> Your location and contact information may be shared with nearby users who can provide help</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                <span><strong>Emergency Contacts:</strong> Your emergency contacts will be notified when you activate an SOS alert</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                <span><strong>Community Chat:</strong> Messages you send in community chat are visible to other authenticated users</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                <span><strong>Legal Requirements:</strong> When required by law or to protect safety and rights</span>
              </li>
            </ul>
            <p className="text-sm bg-orange-50 p-3 rounded-lg mt-4">
              <strong>Note:</strong> We never sell your personal information to third parties for marketing purposes.
            </p>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-6 border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-red-600" />
              5. Data Security
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 space-y-4">
            <p>We implement robust security measures to protect your information:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <span>Secure authentication through Firebase Authentication</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <span>Encrypted data transmission using HTTPS/TLS protocols</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <span>Firebase Firestore security rules to protect user data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <span>Regular security audits and monitoring</span>
              </li>
            </ul>
            <p className="text-sm text-slate-600 mt-4">
              While we strive to protect your data, no electronic transmission or storage method is 100% secure. 
              We encourage you to use strong passwords and keep your account credentials confidential.
            </p>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-6 border-l-4 border-l-teal-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-teal-600" />
              6. Your Rights and Choices
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 space-y-4">
            <p>You have control over your personal information:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
                <span><strong>Access and Update:</strong> View and update your profile information through the Dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
                <span><strong>Delete Emergency Contacts:</strong> Remove emergency contacts at any time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
                <span><strong>Location Control:</strong> Control when your location is shared through browser permissions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
                <span><strong>Account Deletion:</strong> Request deletion of your account and associated data by contacting us</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Changes */}
        <Card className="mb-6 border-l-4 border-l-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-indigo-600" />
              7. Changes to This Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 space-y-4">
            <p>
              We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. 
              We will notify you of significant changes through the platform or via email. We encourage you to review 
              this policy regularly.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              8. Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 space-y-4">
            <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <a 
                href="mailto:saviourglobalinfo@gmail.com" 
                className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
              >
                <Mail className="w-5 h-5 text-blue-600" />
                <span>saviourglobalinfo@gmail.com</span>
              </a>
              <a 
                href="tel:+9193xxxxxxxx" 
                className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
              >
                <Phone className="w-5 h-5 text-blue-600" />
                <span>+91 93xxxxxxxx</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

