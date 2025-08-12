"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  MessageSquare, Edit, Gamepad2, Heart, Target, Smile, Shield, Flower2, 
  Zap, Moon, Laugh, Users, Eye, Sword, Search, Brain, HeartHandshake, 
  User, Circle, Home, Car, Users2, Hand, Dog, Mountain, Bed, Squirrel 
} from "lucide-react"

interface TellTheirStoryStepProps {
  formData: any
  updateFormData: (updates: any) => void
  onNext: () => void
  onBack: () => void
}

export function TellTheirStoryStep({ formData, updateFormData, onNext, onBack }: TellTheirStoryStepProps) {
  const [showAIGenerated, setShowAIGenerated] = useState(false)

  const personalityTraits = [
    { icon: Gamepad2, label: "顽皮" },
    { icon: Heart, label: "忠诚" },
    { icon: Target, label: "独立" },
    { icon: Smile, label: "可爱" },
    { icon: Shield, label: "保护" },
    { icon: Flower2, label: "温柔" },
    { icon: Zap, label: "活力" },
    { icon: Moon, label: "平静" },
    { icon: Laugh, label: "调皮" },
    { icon: Users, label: "友善" },
    { icon: Eye, label: "内向" },
    { icon: Sword, label: "勇敢" },
    { icon: Search, label: "好奇" },
    { icon: Brain, label: "聪明" },
    { icon: HeartHandshake, label: "亲切" },
  ]

  const activities = [
    { icon: User, label: "散步" },
    { icon: Circle, label: "捡球游戏" },
    { icon: Circle, label: "游泳" },
    { icon: Car, label: "坐车兜风" },
    { icon: Users2, label: "交朋友" },
    { icon: Hand, label: "肚皮按摩" },
    { icon: Dog, label: "和其他宠物玩耍" },
    { icon: Mountain, label: "徒步" },
    { icon: Bed, label: "拥抱" },
    { icon: Squirrel, label: "追松鼠" },
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">创建免费宠物纪念页</h1>
          <p className="text-gray-600">用永不遗忘的美丽贡品向您的爱宠致敬</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">AI 生成纪念文</h2>
            <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium">AI 生成</span>
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
              编辑
            </Button>
            <Button variant="outline">重新生成</Button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <p className="text-green-800 text-sm flex items-center gap-2">
              <span>✓</span>
此纪念文已保存。您可以在上方编辑或点击下一步继续。
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            返回
          </Button>
          <Button onClick={onNext} className="bg-teal-400 hover:bg-teal-500 text-white px-8 py-2 rounded-full">
            下一步
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">创建免费宠物纪念页</h1>
        <p className="text-gray-600">用永不遗忘的美丽贡品向您的爱宠致敬</p>
      </div>

      <div className="space-y-8">
        {/* Writing Method Selection */}
        {!formData.writingMethod && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
              您希望如何创建纪念文？
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => handleWritingMethodSelect("ai")}
                className="border-2 border-gray-200 rounded-xl p-6 text-center hover:border-teal-300 hover:bg-teal-50 transition-colors"
              >
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-teal-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">为我创建</h4>
                <p className="text-gray-600 text-sm">回答几个问题，我们将为您创建美丽的纪念文</p>
              </button>
              <button
                onClick={() => handleWritingMethodSelect("self")}
                className="border-2 border-gray-200 rounded-xl p-6 text-center hover:border-teal-300 hover:bg-teal-50 transition-colors"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Edit className="w-8 h-8 text-gray-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">我自己写</h4>
                <p className="text-gray-600 text-sm">按照自己的节奏写下个人的纪念文</p>
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
                它的性格是什么样的？ <span className="text-gray-500 text-sm">(可多选)</span>
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
                    <div className="mb-1 flex justify-center">
                      <trait.icon className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-medium">{trait.label}</div>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">请至少选择一个性格特征</p>
            </div>

            {/* Activities */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                它最喜欢做什么？ <span className="text-gray-500 text-sm">(可多选)</span>
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
                    <div className="mb-1 flex justify-center">
                      <activity.icon className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-medium">{activity.label}</div>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">请至少选择一个活动</p>
            </div>

            {/* Special Memory */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                特别的回忆或故事 <span className="text-gray-500 text-sm font-normal">(可选)</span>
              </h3>
              <Textarea
                placeholder="分享一个特别的回忆、独特的习惯或任何使它独特的事情..."
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">撰写您宠物的纪念文</h3>
            <Textarea
              placeholder="分享您爱宠的故事、性格、喜爱的活动，以及您将永远珍藏的特别回忆..."
              rows={12}
              className="mb-4"
              value={formData.selfWrittenObituary}
              onChange={(e) => updateFormData({ selfWrittenObituary: e.target.value })}
            />
            <p className="text-sm text-gray-500">
              慢慢来，精心撰写一个能够捉捉它独特精神的美丽纪念文。
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack}>
            返回
          </Button>
          {formData.writingMethod === "ai" && !showAIGenerated && (
            <Button
              onClick={() => handleWritingMethodSelect("ai")}
              disabled={!formData.personalityTraits?.length || !formData.activities?.length}
              className="bg-teal-400 hover:bg-teal-500 text-white px-8 py-2 rounded-full"
            >
              生成故事
            </Button>
          )}
          {formData.writingMethod === "self" && (
            <Button 
              onClick={onNext} 
              disabled={!formData.selfWrittenObituary?.trim()}
              className="bg-teal-400 hover:bg-teal-500 text-white px-8 py-2 rounded-full disabled:bg-gray-300"
            >
              下一步
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
