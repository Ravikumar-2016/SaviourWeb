import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle2, AlertTriangle, Shield, Scale, Cog, Bell, Mail, Phone, Users, MapPin } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service - SAVIOUR",
  description: "Terms of Service for the SAVIOUR disaster management and emergency response platform",
}

export default function TermsPage() {
  const lastUpdated = "January 2025"
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <FileText className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Terms of Service</h1>
          <p className="text-slate-600">Last updated: {lastUpdated}</p>
        </div>

        {/* Acceptance */}
        <Card className="mb-6 border-l-4 border-l-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              1. Acceptance of Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 space-y-4">
            <p>
              By accessing or using the SAVIOUR disaster management and emergency response platform, you agree to be 
              bound by these Terms of Service. If you do not agree to these terms, please do not create an account 
              or use our services.
            </p>
            <p>
              SAVIOUR is designed to help individuals and communities prepare for, respond to, and recover from 
              emergencies and natural disasters. By using our platform, you acknowledge the critical nature of 
              these services and agree to use them responsibly.
            </p>
          </CardContent>
        </Card>

        {/* Services Description */}
        <Card className="mb-6 border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Cog className="w-5 h-5 text-blue-600" />
              2. Our Services
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 space-y-4">
            <p>SAVIOUR provides the following emergency management and safety services:</p>
            
            <div className="grid gap-3 mt-4">
              <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900">SOS Emergency Alerts</h4>
                  <p className="text-sm">Create emergency alerts with your location to notify nearby users and your emergency contacts</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                <Users className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900">Community Support</h4>
                  <p className="text-sm">Connect with other users through community chat and respond to SOS alerts from people in need</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900">Emergency Navigation</h4>
                  <p className="text-sm">Find and navigate to nearby hospitals, fire stations, police stations, and emergency shelters</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                <Bell className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900">Weather Monitoring</h4>
                  <p className="text-sm">Real-time weather updates, forecasts, and severe weather alerts for your location</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                <Shield className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900">Safety Resources</h4>
                  <p className="text-sm">Comprehensive safety guidelines for various disasters including earthquakes, floods, fires, and more</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Obligations */}
        <Card className="mb-6 border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="w-5 h-5 text-green-600" />
              3. User Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 space-y-4">
            <p>As a SAVIOUR user, you agree to:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span>Provide accurate information when creating your account and adding emergency contacts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span><strong>Use SOS alerts only for genuine emergencies</strong> — false alerts undermine the system and may delay help to those in real need</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span>Respond to SOS alerts from others only if you are able to provide safe assistance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span>Use community chat respectfully and avoid sharing harmful or misleading information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span>Keep your account credentials secure and not share them with others</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span>Not use the platform for any unlawful or malicious purposes</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Emergency Disclaimer */}
        <Card className="mb-6 border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-red-700">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              4. Emergency Services Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 space-y-4">
            <div className="bg-red-100 border border-red-200 rounded-lg p-4">
              <p className="font-semibold text-red-800 mb-2">⚠️ IMPORTANT: SAVIOUR is NOT a replacement for official emergency services</p>
              <p className="text-red-700">
                In life-threatening emergencies, <strong>always contact your local emergency services first</strong> 
                (such as 112, 100, 101, or 102 in India). SAVIOUR is a supplementary community support tool and 
                cannot guarantee response times or availability of assistance.
              </p>
            </div>
            <p>
              While we strive to provide accurate and timely information, SAVIOUR:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <span>Cannot guarantee that nearby users will respond to your SOS alert</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <span>Depends on internet connectivity and GPS accuracy for location services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <span>Provides weather data from third-party APIs which may have delays or inaccuracies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <span>Uses map data that may not reflect current road conditions or closures</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="mb-6 border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-purple-600" />
              5. Privacy and Data
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 space-y-4">
            <p>
              To provide emergency services effectively, SAVIOUR collects and processes your personal information, 
              including your location during SOS alerts. By using our platform, you consent to this data collection 
              as described in our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
            </p>
            <p>
              Key data practices include:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <span>Your location is shared with nearby users only when you create an SOS alert</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <span>Emergency contact information is stored securely and used only for notifications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <span>We never sell your personal data to third parties</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-6 border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Scale className="w-5 h-5 text-orange-600" />
              6. Intellectual Property
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 space-y-4">
            <p>
              All content on the SAVIOUR platform, including text, graphics, logos, icons, images, safety guidelines, 
              and software, is the property of SAVIOUR or its licensors and is protected by applicable intellectual 
              property laws.
            </p>
            <p>
              You may not copy, modify, distribute, or reproduce any content from our platform without prior written 
              consent, except for personal, non-commercial use of safety guidelines for educational purposes.
            </p>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="mb-6 border-l-4 border-l-slate-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Scale className="w-5 h-5 text-slate-600" />
              7. Limitation of Liability
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 space-y-4">
            <p>
              SAVIOUR provides its services on an &quot;as is&quot; and &quot;as available&quot; basis. While we 
              strive for reliability, especially during emergencies, we cannot guarantee uninterrupted service.
            </p>
            <p>
              To the maximum extent permitted by law, SAVIOUR shall not be liable for any direct, indirect, 
              incidental, consequential, or exemplary damages arising from:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-slate-500 rounded-full mt-2 flex-shrink-0" />
                <span>Service interruptions during emergencies or disasters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-slate-500 rounded-full mt-2 flex-shrink-0" />
                <span>Inaccurate or delayed weather or location data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-slate-500 rounded-full mt-2 flex-shrink-0" />
                <span>Actions or inactions of other users responding to SOS alerts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-slate-500 rounded-full mt-2 flex-shrink-0" />
                <span>Reliance on safety guidelines or navigation information</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Modifications */}
        <Card className="mb-6 border-l-4 border-l-teal-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-teal-600" />
              8. Changes to Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 space-y-4">
            <p>
              We may update these Terms of Service periodically to reflect changes in our services or legal 
              requirements. We will notify you of significant changes through the platform or via email.
            </p>
            <p>
              Continued use of SAVIOUR after any changes constitutes acceptance of the updated terms. We encourage 
              you to review these terms regularly.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="border-l-4 border-l-indigo-500 bg-gradient-to-r from-indigo-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-indigo-600" />
              9. Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700 space-y-4">
            <p>If you have questions about these Terms of Service, please contact us:</p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <a 
                href="mailto:saviourglobalinfo@gmail.com" 
                className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors"
              >
                <Mail className="w-5 h-5 text-indigo-600" />
                <span>saviourglobalinfo@gmail.com</span>
              </a>
              <a 
                href="tel:+9193xxxxxxxx" 
                className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors"
              >
                <Phone className="w-5 h-5 text-indigo-600" />
                <span>+91 93xxxxxxxx</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

