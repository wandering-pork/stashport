'use client'

import { useRouter } from 'next/navigation'
import { MapPin, Calendar, Heart, ArrowUpRight } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { TagPill } from '@/components/ui/tag-pill'
import { cn } from '@/lib/utils/cn'

export interface ExploreItinerary {
  id: string
  title: string
  description: string | null
  destination: string | null
  slug: string
  budgetLevel: number | null
  type: 'daily' | 'guide'
  coverPhotoUrl: string | null
  createdAt: string
  dayCount: number
  tags: string[]
  creator: {
    id: string
    displayName: string
    avatarColor: string | null
  }
}

interface ExploreCardProps {
  itinerary: ExploreItinerary
  index?: number
}

export function ExploreCard({ itinerary, index = 0 }: ExploreCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/t/${itinerary.slug}`)
  }

  // Format relative time
  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <article
      onClick={handleClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl cursor-pointer',
        'bg-white border border-neutral-200/60',
        'shadow-sm hover:shadow-dramatic-lg',
        'transform transition-all duration-500 ease-out',
        'hover:scale-[1.02] hover:-translate-y-1',
        'animate-reveal-up'
      )}
      style={{ animationDelay: `${index * 75}ms` }}
    >
      {/* Cover Photo Section */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {itinerary.coverPhotoUrl ? (
          <>
            <img
              src={itinerary.coverPhotoUrl}
              alt={`${itinerary.title} cover`}
              className={cn(
                'absolute inset-0 w-full h-full object-cover',
                'transition-transform duration-700 ease-out',
                'group-hover:scale-110'
              )}
            />
            {/* Cinematic gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </>
        ) : (
          /* Gradient placeholder with pattern */
          <div className={cn(
            'absolute inset-0',
            itinerary.type === 'guide'
              ? 'bg-gradient-to-br from-primary-400 via-primary-500 to-secondary-500'
              : 'bg-gradient-to-br from-secondary-400 via-secondary-500 to-primary-500'
          )}>
            <div className="absolute inset-0 pattern-dots opacity-20" />
            {/* Decorative floating shapes */}
            <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
            <div className="absolute bottom-1/3 right-1/4 w-20 h-20 bg-white/15 rounded-full blur-2xl" />
          </div>
        )}

        {/* Destination Badge - Glass morphism */}
        {itinerary.destination && (
          <div className={cn(
            'absolute bottom-4 left-4 z-10',
            'flex items-center gap-1.5 px-3 py-1.5',
            'bg-white/20 backdrop-blur-md rounded-full',
            'border border-white/30',
            'text-white text-xs font-heading font-semibold',
            'shadow-lg'
          )}>
            <MapPin className="w-3.5 h-3.5" />
            <span>{itinerary.destination}</span>
          </div>
        )}

        {/* Type Badge */}
        <div className={cn(
          'absolute top-4 right-4 z-10',
          'flex items-center gap-1 px-2.5 py-1',
          'rounded-full text-xs font-heading font-bold',
          'shadow-lg',
          itinerary.type === 'guide'
            ? 'bg-primary-500/90 text-white backdrop-blur-sm'
            : 'bg-secondary-500/90 text-white backdrop-blur-sm'
        )}>
          {itinerary.type === 'guide' ? (
            <>
              <Heart className="w-3 h-3" />
              <span>Guide</span>
            </>
          ) : (
            <>
              <Calendar className="w-3 h-3" />
              <span>Daily</span>
            </>
          )}
        </div>

        {/* Hover Arrow Indicator */}
        <div className={cn(
          'absolute bottom-4 right-4 z-10',
          'w-10 h-10 rounded-full',
          'bg-white/20 backdrop-blur-sm',
          'flex items-center justify-center',
          'opacity-0 group-hover:opacity-100',
          'transform translate-x-2 group-hover:translate-x-0',
          'transition-all duration-300'
        )}>
          <ArrowUpRight className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title */}
        <h3 className={cn(
          'font-display font-bold text-lg text-neutral-900',
          'line-clamp-2 mb-2',
          'group-hover:text-primary-600 transition-colors duration-300'
        )}>
          {itinerary.title}
        </h3>

        {/* Description Preview */}
        {itinerary.description && (
          <p className="text-sm text-neutral-600 line-clamp-2 mb-3 font-body">
            {itinerary.description}
          </p>
        )}

        {/* Tags */}
        {itinerary.tags && itinerary.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {itinerary.tags.slice(0, 2).map((tag) => (
              <TagPill key={tag} tag={tag} size="sm" />
            ))}
            {itinerary.tags.length > 2 && (
              <span className="text-xs text-neutral-400 font-medium px-2 py-0.5">
                +{itinerary.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Footer: Creator & Meta */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          {/* Creator */}
          <div className="flex items-center gap-2">
            <Avatar
              name={itinerary.creator.displayName}
              size="sm"
              color={itinerary.creator.avatarColor || undefined}
            />
            <div className="flex flex-col">
              <span className="text-xs font-heading font-semibold text-neutral-700 truncate max-w-[100px]">
                {itinerary.creator.displayName}
              </span>
              <span className="text-xs text-neutral-400">
                {getRelativeTime(itinerary.createdAt)}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <span className="flex items-center gap-1 font-medium">
              <span className="text-neutral-900 font-heading font-bold">
                {itinerary.dayCount}
              </span>
              {itinerary.type === 'guide' ? 'sections' : 'days'}
            </span>
            {itinerary.budgetLevel && (
              <span className="font-heading font-bold text-accent-600">
                {'$'.repeat(itinerary.budgetLevel)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Subtle hover border glow */}
      <div className={cn(
        'absolute inset-0 rounded-2xl pointer-events-none',
        'border-2 border-transparent',
        'group-hover:border-primary-300/50',
        'transition-colors duration-300'
      )} />
    </article>
  )
}
