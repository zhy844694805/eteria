"use client"

import { useState } from "react"
import { Heart, Shield, Users, Star, Share2, Calendar, HandHeart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState(25)
  const [customAmount, setCustomAmount] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    cardNumber: "",
    expirationDate: "",
    securityCode: "",
    billingZip: "",
  })

  const presetAmounts = [10, 25, 50, 100]

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount("")
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    if (value) {
      setSelectedAmount(Number.parseFloat(value) || 0)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const supportReasons = [
    {
      icon: <Heart className="w-6 h-6 text-pink-500" />,
      title: "Keep Obituaries Free",
      description: "Your donation ensures that every pet parent can create a memorial without financial barriers.",
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-500" />,
      title: "Preserve Memories Forever",
      description:
        "We maintain and protect thousands of pet memories, ensuring they remain accessible for years to come.",
    },
    {
      icon: <Users className="w-6 h-6 text-pink-400" />,
      title: "Support Our Community",
      description: "Help us expand our grief support resources and connect pet parents during difficult times.",
    },
    {
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      title: "Improve Our Platform",
      description: "Your support helps us develop new features and improve the memorial experience for everyone.",
    },
  ]

  const otherWaysToSupport = [
    {
      icon: <Share2 className="w-8 h-8 text-teal-500" />,
      title: "Share Our Mission",
      description: "Spread the word about Tuckerly to help more pet parents find comfort.",
    },
    {
      icon: <Calendar className="w-8 h-8 text-purple-500" />,
      title: "Monthly Giving",
      description: "Become a sustaining supporter with a monthly donation of any amount.",
    },
    {
      icon: <HandHeart className="w-8 h-8 text-pink-500" />,
      title: "Volunteer",
      description: "Help moderate memorials or provide grief support to our community.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Header */}
      <Navigation currentPage="donate" />

      {/* Hero Section */}
      <section className="px-4 py-16 bg-gradient-to-r from-purple-100 to-pink-100">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">Support Our Mission</h1>
          <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
            Help us keep pet obituaries free for everyone. Your generosity ensures that all pet parents can create
            beautiful memorials for their beloved companions.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Left Column - Why Your Support Matters */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Why Your Support Matters</h2>
            <div className="space-y-6">
              {supportReasons.map((reason, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{reason.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{reason.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Donation Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <form className="space-y-6">
              {/* Your Information */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Your Information</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">First Name</label>
                    <Input
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Last Name</label>
                    <Input
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Email Address</label>
                  <Input
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">{"We'll send your donation receipt to this email."}</p>
                </div>
              </div>

              {/* Donation Amount */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Choose your donation amount</h3>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {presetAmounts.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant={selectedAmount === amount && !customAmount ? "default" : "outline"}
                      className={`${
                        selectedAmount === amount && !customAmount
                          ? "bg-purple-500 hover:bg-purple-600 text-white"
                          : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                      onClick={() => handleAmountSelect(amount)}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Or enter a custom amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="pl-8"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Payment Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Card Number</label>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Expiration Date</label>
                      <Input
                        placeholder="MM/YY"
                        value={formData.expirationDate}
                        onChange={(e) => handleInputChange("expirationDate", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Security Code</label>
                      <Input
                        placeholder="123"
                        value={formData.securityCode}
                        onChange={(e) => handleInputChange("securityCode", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Billing ZIP/Postal Code</label>
                    <Input
                      placeholder="12345"
                      value={formData.billingZip}
                      onChange={(e) => handleInputChange("billingZip", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button className="w-full bg-gradient-to-r from-teal-400 to-purple-500 hover:from-teal-500 hover:to-purple-600 text-white py-3 text-lg rounded-full">
                Donate ${selectedAmount.toFixed(2)}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Your donation is processed securely through Stripe. You will receive a receipt via email.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Other Ways to Support */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Other Ways to Support</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {otherWaysToSupport.map((way, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  {way.icon}
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{way.title}</h3>
                <p className="text-gray-600 text-sm">{way.description}</p>
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
