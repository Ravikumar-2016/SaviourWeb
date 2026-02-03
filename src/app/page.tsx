import { Suspense } from 'react'
import HeroSection from '@/components/HeroSection'
import FeatureSection from '@/components/FeatureSection'
import ContactSection from '@/components/ContactSection'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function Home() {
  return (
    <main>
      <HeroSection />
      <Suspense fallback={<LoadingSpinner />}>
        <FeatureSection />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <ContactSection />
      </Suspense>
    </main>
  )
}

