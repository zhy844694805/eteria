"use client"

import React from 'react'
import Image from "next/image"
import Link from "next/link"
import { Heart, Flame } from "lucide-react"

interface MemorialCardProps {
  memorial: {
    id: string
    slug: string
    subjectName: string
    type: string
    birthDate: string | null
    deathDate: string | null
    subjectType?: string
    breed?: string
    age?: number
    relationship?: string
    occupation?: string
    images: Array<{
      id: string
      url: string
      isMain: boolean
    }>
    _count: {
      messages: number
      candles: number
    }
  }
  formatDateRange: (birth: string | null, death: string | null) => string
  calculateAge?: (birth: string | null, death: string | null) => string
  formatAge?: (birth: string | null, death: string | null, age?: number) => string
  translatePetType?: (type?: string) => string
  translateBreed?: (breed?: string) => string
  translateRelationship?: (relationship?: string) => string
  isPetMemorial?: boolean
}

const MemorialCard = React.memo<MemorialCardProps>(({ 
  memorial, 
  formatDateRange, 
  calculateAge, 
  formatAge, 
  translatePetType, 
  translateBreed,
  translateRelationship,
  isPetMemorial = false 
}) => {
  const mainImage = memorial.images.find(img => img.isMain) || memorial.images[0]
  const baseUrl = isPetMemorial ? '/community-pet-obituaries' : '/community-person-obituaries'
  
  return (
    <Link
      href={`${baseUrl}/${memorial.slug}`}
      className="block"
    >
      <div className="memorial-card bg-white rounded-3xl overflow-hidden border border-slate-200 cursor-pointer hover:shadow-lg transition-shadow">
        <div className="aspect-square bg-slate-100">
          <Image
            src={mainImage?.url || "/placeholder.svg"}
            alt={memorial.subjectName}
            width={300}
            height={300}
            className="w-full h-full object-cover"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </div>
        <div className="p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-2">{memorial.subjectName}</h3>
          
          {isPetMemorial ? (
            <>
              <div className="text-slate-500 text-sm mb-1">
                {formatDateRange(memorial.birthDate, memorial.deathDate)} • {calculateAge?.(memorial.birthDate, memorial.deathDate)}
              </div>
              <div className="text-slate-600 text-sm mb-4">
                {memorial.breed ? `${translatePetType?.(memorial.subjectType)} • ${translateBreed?.(memorial.breed)}` : translatePetType?.(memorial.subjectType)}
              </div>
            </>
          ) : (
            <>
              <p className="text-slate-500 text-sm mb-1">
                {formatDateRange(memorial.birthDate, memorial.deathDate) && `${formatDateRange(memorial.birthDate, memorial.deathDate)} • `}{formatAge?.(memorial.birthDate, memorial.deathDate, memorial.age)}
              </p>
              <p className="text-slate-500 text-sm mb-3">
                {translateRelationship?.(memorial.relationship)} {memorial.occupation && `• ${memorial.occupation}`}
              </p>
            </>
          )}
          
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4" />
              <span>{memorial._count.candles}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{memorial._count.messages}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
})

MemorialCard.displayName = 'MemorialCard'

export default MemorialCard