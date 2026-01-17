'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Share2, Bookmark, Compass, ArrowRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export default function Home() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  return (
    <div className="min-h-screen bg-mesh-hero overflow-hidden grain-overlay">
      {/* Hero Section - Editorial Asymmetric Layout */}
      <section className="relative min-h-screen">
        {/* Decorative Elements */}
        <div className="absolute top-20 right-[10%] w-72 h-72 bg-primary-200 shape-blob opacity-20 animate-float" />
        <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-secondary-200 shape-blob-alt opacity-15 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-[30%] w-4 h-4 bg-primary-500 rounded-full opacity-60" />
        <div className="absolute top-1/2 left-[15%] w-3 h-3 bg-secondary-500 rounded-full opacity-50" />
        <div className="absolute bottom-1/3 right-[20%] w-2 h-2 bg-accent-500 rounded-full opacity-70" />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-20 lg:pt-0 min-h-screen flex items-center">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-7 relative z-10">
              {/* Editorial Badge */}
              <div
                className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white/80 backdrop-blur-sm border border-primary-200 rounded-full shadow-coral animate-reveal-up stagger-1"
              >
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-primary-700">
                  Plan. Share. Inspire.
                </span>
              </div>

              {/* Main Headline - Dramatically Large */}
              <h1 className="text-editorial-display text-6xl sm:text-7xl lg:text-8xl xl:text-9xl text-neutral-900 mb-6 animate-reveal-up stagger-2">
                Your next
                <br />
                <span className="text-gradient-vibrant">adventure</span>
                <br />
                starts here
              </h1>

              {/* Decorative Line */}
              <div className="decorative-line w-32 mb-8 animate-reveal-up stagger-3" />

              {/* Subheading */}
              <p className="text-xl lg:text-2xl text-neutral-600 mb-10 max-w-xl font-body leading-relaxed animate-reveal-up stagger-4">
                Create stunning travel itineraries, discover journeys from fellow explorers, and share your adventures with the world.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 animate-reveal-up stagger-5">
                <Button
                  size="lg"
                  onClick={() => router.push('/auth/signup')}
                  className="font-heading font-bold text-base px-8 shadow-coral hover:shadow-coral-lg"
                >
                  Start Planning
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
                <Button
                  size="lg"
                  variant="tertiary"
                  onClick={() => router.push('/auth/login')}
                  className="font-heading font-bold text-base"
                >
                  I have an account
                </Button>
              </div>

              {/* Social Proof */}
              <div className="mt-12 flex items-center gap-6 animate-reveal-up stagger-6">
                <div className="flex -space-x-3">
                  {['bg-primary-400', 'bg-secondary-400', 'bg-accent-400', 'bg-primary-300'].map((bg, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-10 h-10 rounded-full border-2 border-white',
                        bg
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm text-neutral-600 font-body">
                  <span className="font-bold text-neutral-900">2,400+</span> travelers planning adventures
                </p>
              </div>
            </div>

            {/* Right Column - Feature Cards Stack */}
            <div className="lg:col-span-5 relative">
              {/* Decorative vertical line */}
              <div className="hidden lg:block absolute -left-6 top-0 bottom-0 decorative-line-vertical opacity-30" />

              <div className="space-y-4">
                {/* Feature Card 1 */}
                <Card
                  variant="elevated"
                  className="group border-editorial shadow-dramatic hover:shadow-dramatic-lg hover:-translate-y-1 transition-all duration-500 animate-reveal-right stagger-2"
                >
                  <CardContent className="p-6 flex items-start gap-5">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-coral">
                      <MapPin className="w-7 h-7 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-bold text-neutral-900 mb-1">Day-by-Day Planning</h3>
                      <p className="text-sm text-neutral-600 font-body leading-relaxed">
                        Build detailed itineraries with times, locations, and notes for every moment.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Feature Card 2 */}
                <Card
                  variant="elevated"
                  className="group border-editorial shadow-dramatic hover:shadow-dramatic-lg hover:-translate-y-1 transition-all duration-500 animate-reveal-right stagger-3"
                >
                  <CardContent className="p-6 flex items-start gap-5">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary-100 to-secondary-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-teal">
                      <Share2 className="w-7 h-7 text-secondary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-bold text-neutral-900 mb-1">Share Everywhere</h3>
                      <p className="text-sm text-neutral-600 font-body leading-relaxed">
                        Beautiful links with preview cards that look stunning on any platform.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Feature Card 3 */}
                <Card
                  variant="elevated"
                  className="group border-editorial shadow-dramatic hover:shadow-dramatic-lg hover:-translate-y-1 transition-all duration-500 animate-reveal-right stagger-4"
                >
                  <CardContent className="p-6 flex items-start gap-5">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-100 to-accent-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-golden">
                      <Bookmark className="w-7 h-7 text-accent-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-bold text-neutral-900 mb-1">Stash & Customize</h3>
                      <p className="text-sm text-neutral-600 font-body leading-relaxed">
                        Save trips from other travelers and make them uniquely yours.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs font-heading font-bold uppercase text-neutral-400 tracking-wider">Explore</span>
          <div className="w-px h-8 bg-gradient-to-b from-neutral-300 to-transparent" />
        </div>
      </section>

      {/* How It Works Section - Editorial Grid */}
      <section className="py-32 px-6 lg:px-12 bg-white grain-overlay relative">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 pattern-dots opacity-30" />

        <div className="max-w-[1400px] mx-auto relative z-10">
          {/* Section Header - Asymmetric */}
          <div className="grid lg:grid-cols-12 gap-8 mb-20">
            <div className="lg:col-span-5">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-primary-600 mb-4 block">
                How It Works
              </span>
              <h2 className="text-editorial-headline text-5xl lg:text-6xl text-neutral-900">
                Three steps to your perfect trip
              </h2>
            </div>
            <div className="lg:col-span-5 lg:col-start-8 flex items-end">
              <p className="text-lg text-neutral-600 font-body leading-relaxed">
                From inspiration to publication, Stashport makes travel planning effortless and beautiful.
              </p>
            </div>
          </div>

          {/* Steps - Large Numbers */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-16">
            {/* Step 1 */}
            <div className="group">
              <div className="mb-6 relative">
                <span className="stat-number text-8xl lg:text-9xl text-primary-100 group-hover:text-primary-200 transition-colors duration-500">01</span>
                <div className="absolute bottom-2 left-0 w-16 h-1 bg-primary-500 rounded-full" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-neutral-900 mb-4">Create Your Journey</h3>
              <p className="text-neutral-600 font-body leading-relaxed">
                Build beautiful day-by-day itineraries with every detail planned. Add locations, times, notes, and more.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group">
              <div className="mb-6 relative">
                <span className="stat-number text-8xl lg:text-9xl text-secondary-100 group-hover:text-secondary-200 transition-colors duration-500">02</span>
                <div className="absolute bottom-2 left-0 w-16 h-1 bg-secondary-500 rounded-full" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-neutral-900 mb-4">Discover & Save</h3>
              <p className="text-neutral-600 font-body leading-relaxed">
                Find inspiration from fellow travelers. One-click save any trip to your collection and customize it.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group">
              <div className="mb-6 relative">
                <span className="stat-number text-8xl lg:text-9xl text-accent-100 group-hover:text-accent-200 transition-colors duration-500">03</span>
                <div className="absolute bottom-2 left-0 w-16 h-1 bg-accent-500 rounded-full" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-neutral-900 mb-4">Share & Inspire</h3>
              <p className="text-neutral-600 font-body leading-relaxed">
                Publish your adventures with beautiful shareable links. Inspire others to explore the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Bold & Dramatic */}
      <section className="relative py-32 px-6 lg:px-12 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
        <div className="absolute inset-0 pattern-diagonal opacity-10" />

        {/* Decorative Shapes */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary-500 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-secondary-500 rounded-full opacity-10 blur-3xl" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-white/90">
              Start for free
            </span>
          </div>

          <h2 className="text-editorial-display text-5xl sm:text-6xl lg:text-7xl text-white mb-8">
            Ready to explore?
          </h2>

          <p className="text-xl text-primary-100 mb-12 max-w-2xl mx-auto font-body leading-relaxed">
            Join thousands of travel creators planning adventures and sharing inspiration with the world.
          </p>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => router.push('/auth/signup')}
            className="font-heading font-bold text-base px-10 bg-white text-primary-700 border-white hover:bg-primary-50 shadow-dramatic-lg"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-12 bg-neutral-900 text-neutral-400">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✈️</span>
            <span className="text-xl font-display font-bold text-white">Stashport</span>
          </div>
          <p className="text-sm font-body">
            &copy; {new Date().getFullYear()} Stashport. Plan. Share. Inspire.
          </p>
        </div>
      </footer>
    </div>
  )
}
