"use client"

import { FileText, Users, Shield, AlertTriangle, Scale, Mail } from "lucide-react"
import { ResponsiveNavigation } from "@/components/responsive-navigation"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ResponsiveNavigation currentPage="terms" />

      <main className="pt-32">
        {/* Hero区域 */}
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-cyan-600" />
            </div>
            <h1 className="text-4xl font-light text-gray-900 mb-6">服务条款</h1>
            <p className="text-xl text-gray-600">
              欢迎使用永念服务。请仔细阅读以下服务条款，使用我们的服务即表示您同意遵守这些条款。
            </p>
            <div className="text-sm text-gray-500 mt-4">
              生效日期：2024年1月1日
            </div>
          </div>
        </section>

        {/* 主要内容 */}
        <section className="max-w-4xl mx-auto px-4 pb-20">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 space-y-12">
            
            {/* 服务描述 */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-cyan-600" />
                </div>
                <h2 className="text-2xl font-light text-gray-900">服务描述</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  永念（EternalMemory）是一个在线纪念平台，为用户提供创建和管理数字纪念页面的服务。
                  我们的服务包括但不限于：
                </p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>创建宠物和人类纪念页面</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>上传和存储纪念内容（文字、图片、视频）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>社区互动功能（留言、点亮蜡烛）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>分享和访问控制功能</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 用户责任 */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-light text-gray-900">用户责任</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium text-gray-900">使用我们的服务时，您同意：</h3>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>提供真实、准确、完整的信息</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>仅上传您有权使用的内容</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>尊重他人的隐私和权利</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>保护您的账户安全，不与他人分享登录信息</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>遵守适用的法律法规</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 禁止行为 */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-2xl font-light text-gray-900">禁止行为</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>以下行为是严格禁止的，违反者可能面临账户暂停或终止：</p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>上传非法、有害、威胁性、辱骂性或侵犯他人权利的内容</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>未经授权访问他人账户或纪念页面</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>发送垃圾信息或恶意软件</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>干扰或破坏服务的正常运行</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>使用自动化工具恶意抓取数据</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>冒充他人或虚假陈述与永念的关系</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 内容所有权 */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <Scale className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-2xl font-light text-gray-900">内容所有权</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium text-gray-900">您的内容：</h3>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>您保留对上传内容的所有权</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>您授予永念使用、存储、复制和展示您内容的许可</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>您可以随时删除或修改您的内容</span>
                  </li>
                </ul>
                <h3 className="text-lg font-medium text-gray-900 mt-6">我们的内容：</h3>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>永念平台的设计、功能和技术归我们所有</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>未经授权不得复制或使用我们的知识产权</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 服务可用性 */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-2xl font-light text-gray-900">服务可用性</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>我们努力确保服务的持续可用性，但请注意：</p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>服务可能因维护或技术原因暂时中断</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>我们不保证服务100%可用或无错误</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>我们保留修改或停止服务的权利</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>建议您定期备份重要内容</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 免责声明 */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-slate-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-gray-600" />
                </div>
                <h2 className="text-2xl font-light text-gray-900">免责声明</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  永念服务按"现状"提供。在法律允许的最大范围内，我们不对以下情况承担责任：
                </p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>因服务中断或数据丢失造成的损失</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>用户内容的准确性或合法性</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>第三方网站或服务的问题</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>用户之间的纠纷</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 账户终止 */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-2xl font-light text-gray-900">账户终止</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium text-gray-900">您可以：</h3>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>随时停止使用服务并删除账户</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>在删除前下载您的数据</span>
                  </li>
                </ul>
                <h3 className="text-lg font-medium text-gray-900 mt-6">我们可能会：</h3>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>因违反条款而暂停或终止账户</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>在合理期限内保留必要数据</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>因技术或法律原因终止服务</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 条款变更 */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-light text-gray-900">条款变更</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  我们可能会不时更新这些服务条款。重大变更将通过以下方式通知您：
                </p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>通过注册邮箱发送通知</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>在网站显著位置公布</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>提供30天的异议期</span>
                  </li>
                </ul>
                <p className="text-sm bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <strong>重要：</strong>继续使用服务即表示您接受更新后的条款。如不同意，请停止使用服务。
                </p>
              </div>
            </div>

            {/* 争议解决 */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <Scale className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-light text-gray-900">争议解决</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>如果发生争议，我们建议：</p>
                <ul className="space-y-3 ml-4">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>首先通过友好协商解决</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>联系我们的客户服务团队</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>必要时可通过法律途径解决</span>
                  </li>
                </ul>
                <p className="text-sm">
                  本条款受中华人民共和国法律管辖，争议解决地为北京市朝阳区人民法院。
                </p>
              </div>
            </div>

            {/* 联系方式 */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">联系我们</h3>
              </div>
              <p className="text-gray-600 mb-4">
                如果您对这些服务条款有任何疑问，请通过以下方式联系我们：
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>邮箱：</strong> legal@eternalmemory.cn</p>
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