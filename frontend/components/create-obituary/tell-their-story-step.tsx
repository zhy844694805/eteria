"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Edit } from "lucide-react"

interface TellTheirStoryStepProps {
  formData: any
  updateFormData: (updates: any) => void
  onNext: () => void
  onBack: () => void
}

export function TellTheirStoryStep({ formData, updateFormData, onNext, onBack }: TellTheirStoryStepProps) {
  const [showAIGenerated, setShowAIGenerated] = useState(false)

  const personalityTraits = [
    { emoji: "🎾", label: "Playful" },
    { emoji: "❤️", label: "Loyal" },
    { emoji: "🎯", label: "Independent" },
    { emoji: "🤗", label: "Cuddly" },
    { emoji: "🛡️", label: "Protective" },
    { emoji: "🕊️", label: "Gentle" },
    { emoji: "⚡", label: "Energetic" },
    { emoji: "😌", label: "Calm" },
    { emoji: "😈", label: "Mischievous" },
    { emoji: "😊", label: "Friendly" },
    { emoji: "🤫", label: "Reserved" },
    { emoji: "🦸", label: "Brave" },
    { emoji: "🔍", label: "Curious" },
    { emoji: "🧠", label: "Intelligent" },
    { emoji: "💕", label: "Affectionate" },
  ]

  const activities = [
    { emoji: "🚶", label: "Going for walks" },
    { emoji: "🎾", label: "Playing fetch" },
    { emoji: "🏊", label: "Swimming" },
    { emoji: "🚗", label: "Car rides" },
    { emoji: "👥", label: "Making new friends" },
    { emoji: "🤗", label: "Belly rubs" },
    { emoji: "🐕", label: "Playing with other pets" },
    { emoji: "🥾", label: "Hiking" },
    { emoji: "😴", label: "Cuddling" },
    { emoji: "🐿️", label: "Chasing squirrels" },
  ]

  const handleWritingMethodSelect = (method: string) => {
    updateFormData({ writingMethod: method })
    if (method === "ai") {
      // Simulate AI generation
      setTimeout(() => {
        const aiObituary = `From the moment I bounded into our lives, it was clear this little Affenpinscher was a true charmer. With their soft, fluffy coat and big, expressive eyes, I had a way of instantly melting hearts wherever they went. And true to the Affenpinscher breed, they were always ready to chase after a squirrel or pounce on a new toy, their mischievous spirit shining through.

But beyond their playful nature, I was first and foremost a devoted and cuddly companion. They seemed to have an innate sense of when you needed a little extra love, snuggling up beside you on the couch or curling up in your lap, their soft fur and gentle purrs providing endless comfort. It's those quiet moments of pure contentment that we'll cherish the most.

Though our time with I was far too short, just 5 precious days, the joy and laughter they brought to our home will stay with us forever. Their zest for life and boundless energy were truly one of a kind, and we feel so lucky to have been the recipients of their unwavering affection, even if only for a brief moment. As we grieve this profound loss, we take solace in knowing that I's legacy of love will live on, inspiring us to approach each day with the same infectious enthusiasm and unapologetic silliness that defined their too-short life.`

        updateFormData({ aiGeneratedObituary: aiObituary })
        setShowAIGenerated(true)
      }, 2000)
    }
  }

  const handleTraitToggle = (trait: string) => {
    const currentTraits = formData.personalityTraits || []
    const updatedTraits = currentTraits.includes(trait)
      ? currentTraits.filter((t: string) => t !== trait)
      : [...currentTraits, trait]
    updateFormData({ personalityTraits: updatedTraits })
  }

  const handleActivityToggle = (activity: string) => {
    const currentActivities = formData.activities || []
    const updatedActivities = currentActivities.includes(activity)
      ? currentActivities.filter((a: string) => a !== activity)
      : [...currentActivities, activity]
    updateFormData({ activities: updatedActivities })
  }

  if (showAIGenerated && formData.aiGeneratedObituary) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Your Free Pet Obituary</h1>
          <p className="text-gray-600">Honor your beloved pet with a beautiful tribute that lives forever</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">AI-Generated Obituary</h2>
            <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium">AI Generated</span>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="prose prose-gray max-w-none">
              {formData.aiGeneratedObituary.split("\n\n").map((paragraph: string, index: number) => (
                <p key={index} className="text-gray-700 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <Button variant="outline" className="text-teal-600 border-teal-300 hover:bg-teal-50 bg-transparent">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline">Regenerate</Button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <p className="text-green-800 text-sm flex items-center gap-2">
              <span>✓</span>
              This obituary has been saved. You can edit it above or click Next to continue.
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext} className="bg-teal-400 hover:bg-teal-500 text-white px-8 py-2 rounded-full">
            Next
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Your Free Pet Obituary</h1>
        <p className="text-gray-600">Honor your beloved pet with a beautiful tribute that lives forever</p>
      </div>

      <div className="space-y-8">
        {/* Writing Method Selection */}
        {!formData.writingMethod && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
              How would you like to create the obituary?
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => handleWritingMethodSelect("ai")}
                className="border-2 border-gray-200 rounded-xl p-6 text-center hover:border-teal-300 hover:bg-teal-50 transition-colors"
              >
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-teal-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Write it for me</h4>
                <p className="text-gray-600 text-sm">Answer a few questions and we'll create a beautiful tribute</p>
              </button>
              <button
                onClick={() => handleWritingMethodSelect("self")}
                className="border-2 border-gray-200 rounded-xl p-6 text-center hover:border-teal-300 hover:bg-teal-50 transition-colors"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Edit className="w-8 h-8 text-gray-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">I'll write it myself</h4>
                <p className="text-gray-600 text-sm">Write your own personal tribute at your own pace</p>
              </button>
            </div>
          </div>
        )}

        {/* AI Questions */}
        {formData.writingMethod === "ai" && !showAIGenerated && (
          <>
            {/* Personality Traits */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                What was their personality like? <span className="text-gray-500 text-sm">(Select all that apply)</span>
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {personalityTraits.map((trait) => (
                  <button
                    key={trait.label}
                    onClick={() => handleTraitToggle(trait.label)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      formData.personalityTraits?.includes(trait.label)
                        ? "border-teal-300 bg-teal-50 text-teal-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{trait.emoji}</div>
                    <div className="text-xs font-medium">{trait.label}</div>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">Please select at least one personality trait</p>
            </div>

            {/* Activities */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                What did they love to do? <span className="text-gray-500 text-sm">(Select all that apply)</span>
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {activities.map((activity) => (
                  <button
                    key={activity.label}
                    onClick={() => handleActivityToggle(activity.label)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      formData.activities?.includes(activity.label)
                        ? "border-teal-300 bg-teal-50 text-teal-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{activity.emoji}</div>
                    <div className="text-xs font-medium">{activity.label}</div>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">Please select at least one activity</p>
            </div>

            {/* Special Memory */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Special Memory or Story <span className="text-gray-500 text-sm font-normal">(Optional)</span>
              </h3>
              <Textarea
                placeholder="Share a special memory, unique quirk, or anything else that made them special..."
                value={formData.specialMemory}
                onChange={(e) => updateFormData({ specialMemory: e.target.value })}
                rows={4}
              />
            </div>
          </>
        )}

        {/* Self Writing */}
        {formData.writingMethod === "self" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Write Your Pet's Obituary</h3>
            <Textarea
              placeholder="Share your beloved pet's story, their personality, favorite activities, and the special memories you'll cherish forever..."
              rows={12}
              className="mb-4"
            />
            <p className="text-sm text-gray-500">
              Take your time to craft a beautiful tribute that captures their unique spirit.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          {formData.writingMethod === "ai" && !showAIGenerated && (
            <Button
              onClick={() => handleWritingMethodSelect("ai")}
              disabled={!formData.personalityTraits?.length || !formData.activities?.length}
              className="bg-teal-400 hover:bg-teal-500 text-white px-8 py-2 rounded-full"
            >
              Generate Story
            </Button>
          )}
          {formData.writingMethod === "self" && (
            <Button onClick={onNext} className="bg-teal-400 hover:bg-teal-500 text-white px-8 py-2 rounded-full">
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
