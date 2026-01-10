'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Share2, Bookmark, Instagram } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Turn your trips into
            <span className="text-blue-600"> viral content</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create stunning travel itineraries and instantly share them on Instagram, TikTok, Twitter & YouTube. Or stash amazing trips from other creators.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => router.push('/signup')}>
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 mb-16">
        <h2 className="text-4xl font-bold text-center mb-12">
          Built for creators, made for sharing
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <MapPin className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Plan Every Detail</h3>
              <p className="text-gray-600">
                Build day-by-day itineraries with times, locations, and notes for every activity.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Instagram className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Share to Social</h3>
              <p className="text-gray-600">
                Post directly to Instagram, TikTok, Twitter & YouTube with auto-generated captions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Bookmark className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Stash & Customize</h3>
              <p className="text-gray-600">
                One-click save any public trip to your collection. Make it your own in seconds.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Share2 className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Beautiful Links</h3>
              <p className="text-gray-600">
                Share clean, beautiful preview cards that look great across all platforms.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 py-16 mb-16">
        <h2 className="text-4xl font-bold text-center mb-12">Your content workflow</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mb-4 mx-auto">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Plan Your Trip</h3>
            <p className="text-gray-600">
              Create beautiful itineraries with every detail. Or stash one from another creator.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mb-4 mx-auto">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">Generate Content</h3>
            <p className="text-gray-600">
              Get platform-ready captions, hashtags, and preview cards for Instagram, TikTok & more.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mb-4 mx-auto">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Share & Grow</h3>
            <p className="text-gray-600">
              Post to social media, track engagement, and build your travel creator audience.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16 mb-0">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Start creating travel content today</h2>
          <p className="text-xl mb-8 opacity-90">
            Join creators sharing their trips on Instagram, TikTok, and beyond.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => router.push('/signup')}
          >
            Get Started for Free
          </Button>
        </div>
      </section>
    </div>
  )
}
