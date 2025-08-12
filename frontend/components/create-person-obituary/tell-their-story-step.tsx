"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  MessageSquare, Edit, Heart, Smile, Brain, HeartHandshake, Shield, 
  Moon, Zap, Dumbbell, Laugh, Search, Target, Palette, Star,
  Book, Paintbrush, Music, User, ChefHat, Flower, Plane, 
  Drama, Dumbbell as Sports, Scissors
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
    { icon: Heart, label: "慈爱" },
    { icon: Smile, label: "温和" },
    { icon: Brain, label: "智慧" },
    { icon: HeartHandshake, label: "关怀" },
    { icon: Shield, label: "勇敢" },
    { icon: Moon, label: "平静" },
    { icon: Zap, label: "活力" },
    { icon: Dumbbell, label: "坚强" },
    { icon: Laugh, label: "幽默" },
    { icon: Search, label: "细心" },
    { icon: Target, label: "专注" },
    { icon: Shield, label: "保护" },
    { icon: Heart, label: "深情" },
    { icon: Palette, label: "创意" },
    { icon: Star, label: "闪耀" },
  ]

  const hobbies = [
    { icon: Book, label: "阅读" },
    { icon: Paintbrush, label: "绘画" },
    { icon: Music, label: "音乐" },
    { icon: User, label: "散步" },
    { icon: ChefHat, label: "烹饪" },
    { icon: Flower, label: "园艺" },
    { icon: Plane, label: "旅行" },
    { icon: Drama, label: "戏剧" },
    { icon: Sports, label: "运动" },
    { icon: Scissors, label: "手工" },
  ]

  const handleWritingMethodSelect = (method: string) => {
    updateFormData({ writingMethod: method })
    if (method === "ai") {
      // Simulate AI generation
      setTimeout(() => {
        const aiObituary = `${formData.personName}是一个温暖而充满爱心的人，在我们心中留下了不可磨灭的印记。作为我们的${formData.relationshipText || "亲人"}，他们用无私的爱和关怀照亮了我们的生活。

从小到大，${formData.personName}展现出了非凡的品格和坚韧的精神。他们总是把家人和朋友放在第一位，用自己的方式默默地支持着身边的每一个人。无论是在困难的时候给予安慰，还是在快乐的时刻分享喜悦，${formData.personName}都是我们最可靠的支撑。

${formData.personName}对生活充满热情，享受着简单而美好的时光。他们的笑容总能驱散阴霾，他们的话语总能带来温暖。虽然我们深深怀念${formData.personName}，但我们知道他们的爱将永远伴随着我们，指引我们前行的道路。

${formData.personName}的一生是爱与奉献的一生，他们的精神将在我们心中永远闪耀。我们会带着对${formData.personName}的美好回忆继续前行，让他们的爱在我们的生活中延续下去。`

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

  const handleHobbyToggle = (hobby: string) => {
    const currentHobbies = formData.hobbies || []
    const updatedHobbies = currentHobbies.includes(hobby)
      ? currentHobbies.filter((h: string) => h !== hobby)
      : [...currentHobbies, hobby]
    updateFormData({ hobbies: updatedHobbies })
  }

  if (showAIGenerated && formData.aiGeneratedObituary) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">创建免费纪念页</h1>
          <p className="text-gray-600">用永久存在的美丽纪念向逝去的亲人致敬</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">AI 生成纪念文</h2>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">AI 生成</span>
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
            <Button variant="outline" className="text-purple-600 border-purple-300 hover:bg-purple-50 bg-transparent">
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
          <Button onClick={onNext} className="bg-purple-400 hover:bg-purple-500 text-white px-8 py-2 rounded-full">
            下一步
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">创建免费纪念页</h1>
        <p className="text-gray-600">用永久存在的美丽纪念向逝去的亲人致敬</p>
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
                className="border-2 border-gray-200 rounded-xl p-6 text-center hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">为我创建</h4>
                <p className="text-gray-600 text-sm">回答几个问题，我们将为您创建美丽的纪念文</p>
              </button>
              <button
                onClick={() => handleWritingMethodSelect("self")}
                className="border-2 border-gray-200 rounded-xl p-6 text-center hover:border-purple-300 hover:bg-purple-50 transition-colors"
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
                他们的性格是什么样的？ <span className="text-gray-500 text-sm">(可多选)</span>
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {personalityTraits.map((trait) => (
                  <button
                    key={trait.label}
                    onClick={() => handleTraitToggle(trait.label)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      formData.personalityTraits?.includes(trait.label)
                        ? "border-purple-300 bg-purple-50 text-purple-700"
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

            {/* Hobbies */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                他们的兴趣爱好是什么？ <span className="text-gray-500 text-sm">(可多选)</span>
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {hobbies.map((hobby) => (
                  <button
                    key={hobby.label}
                    onClick={() => handleHobbyToggle(hobby.label)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      formData.hobbies?.includes(hobby.label)
                        ? "border-purple-300 bg-purple-50 text-purple-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="mb-1 flex justify-center">
                      <hobby.icon className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-medium">{hobby.label}</div>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">请至少选择一个兴趣爱好</p>
            </div>

            {/* Special Memory */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                特别的回忆或故事 <span className="text-gray-500 text-sm font-normal">(可选)</span>
              </h3>
              <Textarea
                placeholder="分享一个特别的回忆、独特的品格或任何使他们独特的事情..."
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">撰写纪念文</h3>
            <Textarea
              placeholder="分享他们的生平故事、性格、兴趣爱好，以及您将永远珍藏的特别回忆..."
              rows={12}
              className="mb-4"
              value={formData.selfWrittenObituary}
              onChange={(e) => updateFormData({ selfWrittenObituary: e.target.value })}
            />
            <p className="text-sm text-gray-500">
              慢慢来，精心撰写一个能够体现他们独特精神的美丽纪念文。
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
              disabled={!formData.personalityTraits?.length || !formData.hobbies?.length}
              className="bg-purple-400 hover:bg-purple-500 text-white px-8 py-2 rounded-full"
            >
              生成故事
            </Button>
          )}
          {formData.writingMethod === "self" && (
            <Button 
              onClick={onNext} 
              disabled={!formData.selfWrittenObituary?.trim()}
              className="bg-purple-400 hover:bg-purple-500 text-white px-8 py-2 rounded-full"
            >
              下一步
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}