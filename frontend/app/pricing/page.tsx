import {
  Heart,
  Check,
  Star,
  Camera,
  MessageCircle,
  Flame,
  Share2,
  Globe,
  Edit,
  Rainbow,
  Download,
  Lock,
  Zap,
  Smartphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function PricingPage() {
  const features = [
    {
      icon: <Star className="w-5 h-5 text-purple-500" />,
      title: "Unlimited Pet Obituaries",
      description: "Honor all your pets — create one or many",
    },
    {
      icon: <Edit className="w-5 h-5 text-orange-500" />,
      title: "AI Writing Assistant",
      description: "Free AI-powered obituary writing service — or write it yourself",
    },
    {
      icon: <Camera className="w-5 h-5 text-green-500" />,
      title: "Up to 10 Photos per Obituary",
      description: "Share your favorite memories",
    },
    {
      icon: <MessageCircle className="w-5 h-5 text-purple-400" />,
      title: "Unlimited Messages of Love",
      description: "Family & friends can leave love and stories",
    },
    {
      icon: <Flame className="w-5 h-5 text-yellow-500" />,
      title: "Virtual Candle Lighting",
      description: "Community can light candles in memory",
    },
    {
      icon: <Share2 className="w-5 h-5 text-blue-500" />,
      title: "Social Media Sharing",
      description: "Share on Facebook, Instagram, Pinterest & more",
    },
    {
      icon: <Globe className="w-5 h-5 text-teal-500" />,
      title: "Always Online",
      description: "Obituaries stay live forever — no expiration",
    },
    {
      icon: <Edit className="w-5 h-5 text-red-500" />,
      title: "Edit Anytime",
      description: "Make updates whenever you'd like",
    },
    {
      icon: <Rainbow className="w-5 h-5 text-pink-500" />,
      title: "Community Discovery",
      description: "Find and connect with other pet memorials",
    },
    {
      icon: <Download className="w-5 h-5 text-purple-600" />,
      title: "Free PDF Download",
      description: "Download beautiful PDF memorials to print and share",
    },
    {
      icon: <Lock className="w-5 h-5 text-gray-600" />,
      title: "Privacy Controls",
      description: "Keep memorials private or share with the world",
    },
    {
      icon: <Zap className="w-5 h-5 text-yellow-600" />,
      title: "Instant Publishing",
      description: "Your memorial goes live immediately",
    },
    {
      icon: <Smartphone className="w-5 h-5 text-blue-600" />,
      title: "Mobile Friendly",
      description: "Create and view on any device",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Header */}
      <Navigation currentPage="pricing" />

      {/* Hero Section */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">{"It's Free"}</h1>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            <p className="text-gray-600 text-lg leading-relaxed">
              Create as many pet obituaries as you need, completely free.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              No subscriptions. No paywalls. Just a beautiful place to honor your {"pet's"} memory.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{"What's Included (Forever Free)"}</h2>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{feature.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <Button className="bg-teal-400 hover:bg-teal-500 text-white px-8 py-4 text-lg rounded-full">
            Create Your Free Pet Obituary
          </Button>
        </div>
      </section>

      {/* Support Mission */}
      <section className="px-4 py-12 bg-teal-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
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
