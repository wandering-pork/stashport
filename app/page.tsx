'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { MapPin, Compass, Share2, BookOpen, ArrowRight, Sparkles, Users, Globe2 } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && user) {
      window.location.href = '/dashboard'
    }
  }, [user, isLoading])

  if (isLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfcfa]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e07a5f] mx-auto mb-4" />
          <p className="text-[#7d7a74]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fdfcfa] overflow-hidden">
      {/* Hero Section */}
      <section className="relative">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Warm gradient orbs */}
          <div className="absolute top-20 right-[15%] w-[500px] h-[500px] bg-[#e07a5f]/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-40 left-[10%] w-[400px] h-[400px] bg-[#8fa68a]/6 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4a574]/5 rounded-full blur-[150px]" />

          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(45, 42, 38, 0.07) 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 pt-12 lg:pt-20 pb-20 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text */}
            <div className="max-w-xl">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5f0e6] rounded-full mb-8 animate-fade-in">
                <Sparkles className="w-4 h-4 text-[#d4a574]" />
                <span className="text-sm font-medium text-[#6b7b5f]">Plan · Share · Discover</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#2d2a26] leading-[1.05] tracking-tight mb-6 animate-slide-in-up">
                Your next
                <br />
                adventure
                <br />
                <span className="text-gradient-terra">starts here</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg lg:text-xl text-[#5d5a54] leading-relaxed mb-10 animate-slide-in-up" style={{ animationDelay: '100ms' }}>
                Create beautiful travel itineraries, discover journeys from explorers worldwide, and share your stories with stunning visual guides.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 animate-slide-in-up" style={{ animationDelay: '200ms' }}>
                <Button
                  size="lg"
                  onClick={() => router.push('/auth/signup')}
                  className="bg-[#e07a5f] hover:bg-[#d4654a] text-white shadow-terra text-base px-8 h-14"
                >
                  Start Planning Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => router.push('/explore')}
                  className="border-[#d9cfc0] text-[#4d4a44] hover:bg-[#f5f0e6] hover:border-[#bdb9b3] h-14"
                >
                  Explore Trips
                </Button>
              </div>

              {/* Social Proof */}
              <div className="mt-12 pt-8 border-t border-[#ebe4d6] animate-slide-in-up" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {['#e07a5f', '#6b7b5f', '#d4a574', '#8fa68a'].map((color, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full border-2 border-[#fdfcfa] flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: color }}
                      >
                        {['JM', 'SK', 'AL', 'TN'][i]}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2d2a26]">Join 2,400+ travelers</p>
                    <p className="text-sm text-[#7d7a74]">Planning their next journey</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Feature Preview Cards */}
            <div className="relative hidden lg:block">
              {/* Floating Card 1 - Main */}
              <div
                className="relative z-10 bg-white rounded-2xl shadow-warm-lg p-6 animate-slide-in-right"
                style={{ animationDelay: '150ms' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#e07a5f]/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-[#e07a5f]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2d2a26]">7 Days in Portugal</h3>
                    <p className="text-sm text-[#7d7a74]">Lisbon · Porto · Sintra</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { day: 'Day 1', place: 'Explore Alfama District', time: '9:00 AM' },
                    { day: 'Day 2', place: 'Day trip to Sintra Palace', time: '8:30 AM' },
                    { day: 'Day 3', place: 'Food tour in Belém', time: '11:00 AM' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[#f5f0e6] last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#e07a5f] bg-[#e07a5f]/10 px-2 py-1 rounded">{item.day}</span>
                        <span className="text-sm text-[#4d4a44]">{item.place}</span>
                      </div>
                      <span className="text-xs text-[#9d9a94]">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Card 2 - Stats */}
              <div
                className="absolute -bottom-8 -left-8 bg-white rounded-xl shadow-warm p-4 animate-slide-in-up z-20"
                style={{ animationDelay: '300ms' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#6b7b5f]/10 flex items-center justify-center">
                    <Globe2 className="w-5 h-5 text-[#6b7b5f]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#2d2a26]">50+</p>
                    <p className="text-xs text-[#7d7a74]">Countries explored</p>
                  </div>
                </div>
              </div>

              {/* Floating Card 3 - Share */}
              <div
                className="absolute -top-4 -right-4 bg-white rounded-xl shadow-warm p-4 animate-slide-in-down z-20"
                style={{ animationDelay: '400ms' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#d4a574]/10 flex items-center justify-center">
                    <Share2 className="w-4 h-4 text-[#d4a574]" />
                  </div>
                  <span className="text-sm font-medium text-[#4d4a44]">Share anywhere</span>
                </div>
              </div>

              {/* Decorative compass */}
              <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-[0.03] compass-light" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          {/* Section Header */}
          <div className="text-center mb-16 lg:mb-20">
            <span className="inline-block text-sm font-semibold text-[#6b7b5f] uppercase tracking-wider mb-4">
              Everything you need
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold text-[#2d2a26] mb-6">
              Plan trips like a pro
            </h2>
            <p className="text-lg text-[#5d5a54] max-w-2xl mx-auto">
              From quick city breaks to month-long adventures, Stashport gives you the tools to plan, organize, and share every detail.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="feature-card group bg-white rounded-2xl p-8 shadow-warm hover:shadow-warm-lg">
              <div className="w-14 h-14 rounded-2xl bg-[#e07a5f]/10 flex items-center justify-center mb-6 group-hover:bg-[#e07a5f]/15 transition-colors">
                <BookOpen className="w-7 h-7 text-[#e07a5f]" />
              </div>
              <h3 className="text-xl font-bold text-[#2d2a26] mb-3">Day-by-Day Planning</h3>
              <p className="text-[#5d5a54] leading-relaxed mb-4">
                Build detailed itineraries with times, locations, and notes. Add activities, restaurants, and experiences for each day of your trip.
              </p>
              <ul className="space-y-2 text-sm text-[#7d7a74]">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#e07a5f]" />
                  Timeline view with drag & drop
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#e07a5f]" />
                  Add photos and notes
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#e07a5f]" />
                  Auto-save as you plan
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="feature-card group bg-white rounded-2xl p-8 shadow-warm hover:shadow-warm-lg">
              <div className="w-14 h-14 rounded-2xl bg-[#6b7b5f]/10 flex items-center justify-center mb-6 group-hover:bg-[#6b7b5f]/15 transition-colors">
                <Users className="w-7 h-7 text-[#6b7b5f]" />
              </div>
              <h3 className="text-xl font-bold text-[#2d2a26] mb-3">Discover & Save</h3>
              <p className="text-[#5d5a54] leading-relaxed mb-4">
                Find inspiration from fellow travelers. Browse curated itineraries and save the ones you love to your personal collection.
              </p>
              <ul className="space-y-2 text-sm text-[#7d7a74]">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#6b7b5f]" />
                  Browse by destination
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#6b7b5f]" />
                  Filter by trip type
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#6b7b5f]" />
                  One-click save & customize
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="feature-card group bg-white rounded-2xl p-8 shadow-warm hover:shadow-warm-lg">
              <div className="w-14 h-14 rounded-2xl bg-[#d4a574]/10 flex items-center justify-center mb-6 group-hover:bg-[#d4a574]/15 transition-colors">
                <Share2 className="w-7 h-7 text-[#d4a574]" />
              </div>
              <h3 className="text-xl font-bold text-[#2d2a26] mb-3">Share Everywhere</h3>
              <p className="text-[#5d5a54] leading-relaxed mb-4">
                Generate beautiful shareable links with stunning preview cards. Perfect for social media, blogs, or sending to friends.
              </p>
              <ul className="space-y-2 text-sm text-[#7d7a74]">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4a574]" />
                  Beautiful share cards
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4a574]" />
                  Multiple formats (Story, Square)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4a574]" />
                  Download as image
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24 lg:py-32 bg-[#f5f0e6]">
        {/* Pattern overlay */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(45, 42, 38, 0.04) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-16">
          {/* Section Header */}
          <div className="text-center mb-16 lg:mb-20">
            <span className="inline-block text-sm font-semibold text-[#e07a5f] uppercase tracking-wider mb-4">
              How it works
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold text-[#2d2a26] mb-6">
              Three steps to your
              <br />
              perfect trip
            </h2>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {[
              {
                number: '01',
                title: 'Create Your Journey',
                description: 'Start with a destination. Add dates, activities, and all the details that make your trip unique. Our intuitive editor makes planning a breeze.',
                color: '#e07a5f'
              },
              {
                number: '02',
                title: 'Get Inspired',
                description: 'Browse trips from travelers who\'ve been there. Find hidden gems, local favorites, and insider tips. Save what you love to your collection.',
                color: '#6b7b5f'
              },
              {
                number: '03',
                title: 'Share Your Story',
                description: 'Turn your itinerary into a beautiful visual guide. Share the link, download as an image, or post directly to social media.',
                color: '#d4a574'
              }
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="relative inline-block mb-6">
                  <span
                    className="text-8xl lg:text-9xl font-bold opacity-10 number-badge"
                    style={{ color: step.color }}
                  >
                    {step.number}
                  </span>
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full"
                    style={{ backgroundColor: step.color }}
                  />
                </div>
                <h3 className="text-xl font-bold text-[#2d2a26] mb-4">{step.title}</h3>
                <p className="text-[#5d5a54] leading-relaxed max-w-sm mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[#e07a5f]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-[#6b7b5f]/5 rounded-full blur-[80px]" />

        <div className="relative max-w-4xl mx-auto px-6 lg:px-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#e07a5f]/10 rounded-full mb-8">
            <span className="w-2 h-2 bg-[#e07a5f] rounded-full animate-pulse" />
            <span className="text-sm font-medium text-[#e07a5f]">Free to start</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2d2a26] mb-6 leading-tight">
            Ready to plan your
            <br />
            next adventure?
          </h2>

          <p className="text-lg text-[#5d5a54] mb-10 max-w-xl mx-auto">
            Join thousands of travelers who use Stashport to plan, share, and discover amazing journeys around the world.
          </p>

          <Button
            size="lg"
            onClick={() => router.push('/auth/signup')}
            className="bg-[#e07a5f] hover:bg-[#d4654a] text-white shadow-terra-lg text-lg px-10 h-16"
          >
            Get Started — It&apos;s Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-16 border-t border-[#ebe4d6]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#e07a5f] flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#2d2a26]">Stashport</span>
          </div>
          <p className="text-sm text-[#7d7a74]">
            © {new Date().getFullYear()} Stashport. Plan · Share · Discover.
          </p>
        </div>
      </footer>
    </div>
  )
}
