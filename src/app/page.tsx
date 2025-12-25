'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import Footer from '@/components/ui/footer'
import Button from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import styles from './page.module.css'

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

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
        .fromTo(ctaRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.4'
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
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url(https://upsa.edu.gh/wp-content/uploads/2020/08/slide-7.jpg)'}}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 ref={titleRef} className="text-4xl md:text-6xl font-bold text-white mb-6">
            Your Home Away From
            <span className="text-blue-400"> Home</span>
          </h1>
          <p ref={subtitleRef} className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Experience comfortable and secure hostel living at UPSA. Modern amenities, 
            convenient locations, and a supportive community await you.
          </p>
          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about-hostel">
              <Button variant="outline" size="lg" className="px-8 py-4 border-white text-white hover:bg-white hover:text-gray-900">
                View Hostels
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
