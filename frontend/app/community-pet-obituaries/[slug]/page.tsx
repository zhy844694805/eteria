"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Heart, Flame, Download, Copy, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

// This would normally come from a database or API based on the slug
export default function PetMemorialPage() {
  const params = useParams()
  const [message, setMessage] = useState("")
  const [candlesLit, setCandlesLit] = useState(5)
  const [petData, setPetData] = useState<any>(null)

  // Mock data - in a real app, this would be fetched based on params.slug
  const getPetData = (slug: string) => {
    // For now, return Nemo's data for any slug that contains "nemo"
    if (slug.includes("nemo")) {
      return {
        name: "Nemo",
        birthDate: "October 7, 2010",
        deathDate: "September 16, 2023",
        age: "12 years",
        type: "Cat",
        color: "Black & White",
        gender: "Male",
        mainPhoto: "/placeholder.svg?height=400&width=400",
        obituary: `Nemo was the biggest fur-baby who loved to snuggle in bed with you. Whether he was basking in a sunny windowsill or curled up next to you, this affectionate black and white cat had a way of making you immediately feel warm and content. With his soft purrs and gentle nudges, Nemo's friendly, cuddly nature was a constant source of comfort and joy.

Though he may have been a house cat, Nemo's curious spirit ensured he was always on the lookout for the next adventure. He would perch by the window for hours, mesmerized by the birds and squirrels outside, his tail twitching with anticipation. And when playtime called, Nemo was never one to turn away, pouncing and batting at toys with the energy of a kitten, even in his senior years.

Nemo's favorite pastime, though, was undoubtedly cuddling up next to his favorite humans. In those quiet moments, he would belly flop onto the laptop keyboard or claim his spot on your lap, purring contentedly as he made himself at home. In those moments, it was clear that Nemo had claimed me as his own, and I wouldn't have had it any other way. His gentle presence and unwavering affection were a true gift, reminding us every day of the simple pleasures in life.

Though our hearts are heavy with the loss of our beloved companion, Nemo's memory will live on through the warmth and laughter he brought to our home. He was truly a one-of-a-kind friend, and we were beyond fortunate to have shared 12 wonderful years with this gentle, loving soul.`,
        author: "Yufei Hou",
        publishDate: "July 17, 2023",
        photos: [
          "/placeholder.svg?height=200&width=200",
          "/placeholder.svg?height=200&width=200",
          "/placeholder.svg?height=200&width=200",
          "/placeholder.svg?height=200&width=200",
          "/placeholder.svg?height=200&width=200",
          "/placeholder.svg?height=200&width=200",
          "/placeholder.svg?height=200&width=200",
          "/placeholder.svg?height=200&width=200",
          "/placeholder.svg?height=200&width=200",
        ],
        messages: [
          {
            author: "Crystal S.",
            date: "July 17, 2023",
            message:
              "You are a gorgeous cat, Nemo! I always love hearing about you and seeing your pictures. You sure are loved and cherished.",
          },
          {
            author: "Mark S.",
            date: "July 17, 2023",
            message: "Thank you for sharing Nemo's story. It's clear they were a very special part of your family.",
          },
        ],
      }
    }

    // Default fallback data for other pets
    return {
      name: "Pet",
      birthDate: "Unknown",
      deathDate: "Unknown",
      age: "Unknown",
      type: "Pet",
      color: "Unknown",
      gender: "Unknown",
      mainPhoto: "/placeholder.svg?height=400&width=400",
      obituary: "A beloved companion who brought joy to their family.",
      author: "Anonymous",
      publishDate: "Recently",
      photos: [],
      messages: [],
    }
  }

  useEffect(() => {
    if (params.slug) {
      const data = getPetData(params.slug as string)
      setPetData(data)
    }
  }, [params.slug])

  if (!petData) {
    return <div>Loading...</div>
  }

  const handleLightCandle = () => {
    setCandlesLit(candlesLit + 1)
  }

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, "_blank")
  }

  const handleShareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=Remembering ${petData.name}&url=${window.location.href}`,
      "_blank",
    )
  }

  const handleSharePinterest = () => {
    window.open(
      `https://pinterest.com/pin/create/button/?url=${window.location.href}&description=Remembering ${petData.name}`,
      "_blank",
    )
  }

  const handleShareEmail = () => {
    window.location.href = `mailto:?subject=Remembering ${petData.name}&body=I wanted to share this beautiful memorial with you: ${window.location.href}`
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Header */}
      <Navigation currentPage="community" />

      {/* Main Content */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Left Column - Pet Photo and Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
              <div className="aspect-square">
                <Image
                  src={petData.mainPhoto || "/placeholder.svg"}
                  alt={petData.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Pet Details Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{petData.name}</h2>
              <div className="text-gray-600 mb-4">
                {petData.birthDate} - {petData.deathDate}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Age</span>
                  <span className="text-gray-800">{petData.age}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="text-gray-800">{petData.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Color</span>
                  <span className="text-gray-800">{petData.color}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Gender</span>
                  <span className="text-gray-800">{petData.gender}</span>
                </div>
              </div>
            </div>

            {/* Candle Lighting */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Flame className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">{candlesLit}</div>
              <div className="text-gray-600 text-sm mb-4">candles lit in memory of {petData.name}</div>
              <Button
                onClick={handleLightCandle}
                className="w-full bg-teal-400 hover:bg-teal-500 text-white rounded-full"
              >
                Light a Candle
              </Button>
            </div>

            {/* Download Obituary */}
            <Button
              variant="outline"
              className="w-full mb-6 border-teal-400 text-teal-600 hover:bg-teal-50 rounded-full bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Obituary
            </Button>

            {/* Partnership */}
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <div className="text-sm text-gray-600 mb-2">In partnership with</div>
              <div className="font-semibold text-gray-800 mb-1">Crystal Soucy, Pet Loss Grief</div>
              <div className="font-semibold text-gray-800 mb-2">Coach/Certified Grief Educator</div>
              <div className="text-xs text-gray-500">
                Website:{" "}
                <a href="#" className="text-teal-600 hover:underline">
                  www.crystalsoucy.com
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Obituary and Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Remembering {petData.name}</h1>

              <div className="prose prose-gray max-w-none mb-8">
                {petData.obituary.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="text-gray-600 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold text-sm">YH</span>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Written by {petData.author}</div>
                  <div className="text-sm text-gray-500">{petData.publishDate}</div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="text-sm text-gray-600 mb-4">Share {"Nemo's"} Obituary</div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleShareFacebook}>
                    Share
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-800 text-gray-800 bg-transparent"
                    onClick={handleShareTwitter}
                  >
                    X Post
                  </Button>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleSharePinterest}>
                    Pin
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleShareEmail}>
                    <Mail className="w-4 h-4 mr-1" />
                    Email
                  </Button>
                  <Button size="sm" className="bg-teal-400 hover:bg-teal-500 text-white" onClick={handleCopyLink}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Memories */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Photo Memories</h2>
          <div className="grid grid-cols-3 gap-4">
            {petData.photos.map((photo, index) => (
              <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={photo || "/placeholder.svg"}
                  alt={`Memory of ${petData.name}`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Messages of Love */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Messages of Love</h2>

          {/* Leave a Message */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Leave a Message of Love</h3>
            <Textarea
              placeholder="Share a memory or leave a message of love..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mb-4"
              rows={4}
            />
            <div className="flex justify-end">
              <Button className="bg-gray-400 hover:bg-gray-500 text-white rounded-full px-6">Continue</Button>
            </div>
          </div>

          {/* Existing Messages */}
          <div className="space-y-4">
            {petData.messages.map((msg, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-gray-600 mb-4">{msg.message}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{msg.author}</span>
                  <span>{msg.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Mission */}
      <section className="px-4 py-12 bg-teal-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Support Our Mission</h3>
              <p className="text-gray-600 text-sm">
                Every pet deserves a beautiful memorial. Your support helps us keep Tuckerly free for grieving pet
                parents everywhere.
              </p>
            </div>
          </div>
          <Button className="bg-pink-500 hover:bg-pink-600 text-white">
            <Heart className="w-4 h-4 mr-2" />
            Make a Donation
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
