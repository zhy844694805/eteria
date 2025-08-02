"use client"

import { useState } from "react"
import { Mail, Phone, MapPin, Clock, Send, Heart } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // 模拟提交过程
    setTimeout(() => {
      toast.success("消息已发送！我们会尽快回复您。")
      setFormData({ name: "", email: "", subject: "", message: "" })
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="contact" />

      <main className="pt-32">
        {/* Hero区域 */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light text-gray-900 mb-6">联系我们</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              我们随时为您提供帮助和支持。无论您有任何问题或建议，请随时与我们联系。
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 pb-20">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* 联系方式 */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-light text-gray-900 mb-6">联系方式</h2>
                <p className="text-gray-600 mb-8">
                  我们的团队致力于为每一位用户提供最温暖的服务。请选择最适合您的联系方式。
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">邮箱联系</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      发送详细的问题或建议，我们会在24小时内回复
                    </p>
                    <a href="mailto:support@eternalmemory.cn" className="text-cyan-600 hover:text-cyan-700">
                      support@eternalmemory.cn
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">客服热线</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      紧急问题或需要即时帮助时请拨打
                    </p>
                    <a href="tel:+86-400-888-0001" className="text-emerald-600 hover:text-emerald-700">
                      400-888-0001
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">工作时间</h3>
                    <p className="text-gray-600 text-sm">
                      周一至周五：9:00 - 18:00<br />
                      周六至周日：10:00 - 16:00<br />
                      节假日：休息
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">办公地址</h3>
                    <p className="text-gray-600 text-sm">
                      北京市朝阳区建国门外大街1号<br />
                      国贸大厦A座28层<br />
                      邮编：100020
                    </p>
                  </div>
                </div>
              </div>

              {/* 快速链接 */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
                <h3 className="font-medium text-gray-900 mb-4">常见问题</h3>
                <div className="space-y-2">
                  <a href="#" className="block text-cyan-600 hover:text-cyan-700 text-sm">
                    如何创建纪念页面？
                  </a>
                  <a href="#" className="block text-cyan-600 hover:text-cyan-700 text-sm">
                    如何分享纪念页面？
                  </a>
                  <a href="#" className="block text-cyan-600 hover:text-cyan-700 text-sm">
                    如何删除或修改内容？
                  </a>
                  <a href="#" className="block text-cyan-600 hover:text-cyan-700 text-sm">
                    隐私和安全政策
                  </a>
                </div>
              </div>
            </div>

            {/* 联系表单 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="mb-6">
                <h2 className="text-2xl font-light text-gray-900 mb-2">发送消息</h2>
                <p className="text-gray-600">填写下面的表单，我们会尽快回复您</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      姓名 *
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="请输入您的姓名"
                      required
                      className="rounded-xl border-gray-300 focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      邮箱 *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="请输入您的邮箱"
                      required
                      className="rounded-xl border-gray-300 focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    主题 *
                  </label>
                  <Input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="请简述您的问题或建议"
                    required
                    className="rounded-xl border-gray-300 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    详细描述 *
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="请详细描述您的问题或需要的帮助..."
                    rows={6}
                    required
                    className="rounded-xl border-gray-300 focus:border-cyan-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-xl transition-colors"
                >
                  {isSubmitting ? (
                    "发送中..."
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Send className="w-5 h-5" />
                      <span>发送消息</span>
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 text-center">
                  <Heart className="w-4 h-4 inline mr-1 text-red-500" />
                  我们承诺保护您的隐私，不会将您的信息用于其他用途
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}