'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import Footer from '@/components/ui/footer'
import Button from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import styles from './page.module.css'

export default function HostelsPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    // Only run animations on client side
    if (typeof window === 'undefined') return

    const initAnimations = async () => {
      try {
        const { gsap } = await import('gsap')
        
        // Hero animations
        const tl = gsap.timeline()
        
        tl.fromTo(titleRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
        )
        .fromTo(subtitleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.6'
        )

      } catch (error) {
        console.warn('GSAP animations failed to load:', error)
      }
    }

    initAnimations()
  }, [])


  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section ref={heroRef} className={styles.heroSection} style={{backgroundImage: 'url(https://upsa.edu.gh/wp-content/uploads/2020/08/slide-7.jpg)'}}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className={styles.heroContent}>
          <h1 ref={titleRef} className="text-4xl md:text-6xl font-bold text-white mb-6">
            Discover Our
            <span className="text-blue-400"> Hostels</span>
          </h1>
          <p ref={subtitleRef} className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Experience world-class hostel facilities designed to provide comfort, security, 
            and an environment conducive to academic excellence.
          </p>
          <Link href="/signup">
            <Button size="lg" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white">
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Take the first step towards comfortable and secure hostel living. 
            Apply now and secure your place in our vibrant student community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8 py-4 bg-white text-blue-600 hover:bg-gray-100">
                Apply for Hostel
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
