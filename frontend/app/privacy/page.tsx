"use client"

import { Shield, Eye, Lock, Database, Users, Mail } from "lucide-react"
import { ResponsiveNavigation } from "@/components/responsive-navigation"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ResponsiveNavigation currentPage="privacy" />

      <main className="pt-32">
        {/* Hero区域 */}
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-cyan-600" />
            </div>
            <h1 className="text-4xl font-light text-gray-900 mb-6">隐私政策</h1>
            <p className="text-xl text-gray-600">
              您的隐私对我们至关重要。本政策详细说明我们如何收集、使用和保护您的个人信息。
            </p>
            <div className="text-sm text-gray-500 mt-4">
              最后更新：2024年1月1日
            </div>
          </div>
        </section>

        {/* 主要内容 */}
        <section className="max-w-4xl mx-auto px-4 pb-20">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 space-y-12">
            
            {/* 信息收集 */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center">
                  <Database className="w-5 h-5 text-cyan-600" />
                </div>
                <h2 className="text-2xl font-light text-gray-900">信息收集</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium text-gray-900">我们收集的信息类型：</h3>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>账户信息：</strong>当您注册账户时，我们收集您的姓名、邮箱地址和密码</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>纪念内容：</strong>您创建的纪念页面内容，包括文字、图片和视频</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>使用数据：</strong>您如何使用我们服务的信息，如访问频率和功能使用情况</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>设备信息：</strong>设备类型、操作系统、浏览器信息和IP地址</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 信息使用 */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-light text-gray-900">信息使用</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium text-gray-900">我们使用您的信息来：</h3>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>提供和维护永念服务</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>创建和管理您的纪念页面</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>向您发送服务相关的通知和更新</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>改进我们的服务质量和用户体验</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>防止欺诈和确保平台安全</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 信息保护 */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-2xl font-light text-gray-900">信息保护</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>我们采用行业标准的安全措施来保护您的个人信息：</p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>数据加密：</strong>使用SSL/TLS加密技术保护数据传输</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>访问控制：</strong>严格限制员工对用户数据的访问权限</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>定期备份：</strong>定期备份数据以防止意外丢失</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>安全监控：</strong>24/7监控系统以检测和防止安全威胁</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 信息分享 */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-2xl font-light text-gray-900">信息分享</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>除以下情况外，我们不会与第三方分享您的个人信息：</p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>获得您的明确同意</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>法律要求或政府机关要求</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>保护永念和用户的合法权益</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>与信任的服务提供商合作（在严格保密协议下）</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 您的权利 */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-2xl font-light text-gray-900">您的权利</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>您对自己的个人信息享有以下权利：</p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>访问权：</strong>查看我们收集的关于您的个人信息</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>更正权：</strong>更新或更正不准确的个人信息</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>删除权：</strong>要求删除您的个人信息（在某些条件下）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>数据迁移权：</strong>获取您的数据副本或将其转移到其他服务</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Cookie政策 */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <Database className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-light text-gray-900">Cookie政策</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>我们使用Cookie和类似技术来：</p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>记住您的登录状态和偏好设置</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>分析网站使用情况以改进服务</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>确保网站安全和防止欺诈</span>
                  </li>
                </ul>
                <p className="text-sm bg-gray-50 p-4 rounded-xl">
                  您可以通过浏览器设置控制Cookie的使用，但禁用某些Cookie可能会影响网站功能。
                </p>
              </div>
            </div>

            {/* 政策更新 */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-slate-100 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-gray-600" />
                </div>
                <h2 className="text-2xl font-light text-gray-900">政策更新</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  我们可能会不时更新本隐私政策。重大更改时，我们会通过邮件或网站通知您。
                  请定期查看本页面以了解最新的隐私政策。
                </p>
                <p className="text-sm bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                  <strong>重要提示：</strong>继续使用我们的服务即表示您同意本隐私政策的条款。
                </p>
              </div>
            </div>

            {/* 联系我们 */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">有问题？联系我们</h3>
              <p className="text-gray-600 mb-4">
                如果您对本隐私政策有任何疑问或需要行使您的权利，请联系我们：
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>邮箱：</strong> privacy@eternalmemory.cn</p>
                <p><strong>电话：</strong> 400-888-0001</p>
                <p><strong>地址：</strong> 北京市朝阳区建国门外大街1号国贸大厦A座28层</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}