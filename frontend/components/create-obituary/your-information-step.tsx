"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface YourInformationStepProps {
  formData: any
  updateFormData: (updates: any) => void
  onBack: () => void
}

export function YourInformationStep({ formData, updateFormData, onBack }: YourInformationStepProps) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Your Free Pet Obituary</h1>
        <p className="text-gray-600">Honor your beloved pet with a beautiful tribute that lives forever</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
          <Input
            placeholder="Enter your name"
            value={formData.ownerName}
            onChange={(e) => updateFormData({ ownerName: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
          <Input
            type="email"
            placeholder="Enter your email"
            value={formData.ownerEmail}
            onChange={(e) => updateFormData({ ownerEmail: e.target.value })}
          />
          <p className="text-sm text-gray-500 mt-1">We'll send you a link to your pet's memorial page</p>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button className="bg-teal-400 hover:bg-teal-500 text-white px-8 py-2 rounded-full">Create Memorial</Button>
        </div>
      </div>
    </div>
  )
}
