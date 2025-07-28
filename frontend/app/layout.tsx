import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "永念 | EternalMemory - 为您的爱宠创建免费悼念页",
  description:
    "为您心爱的宠物创建美丽、持久的纪念。分享回忆，与他人连接，让它们的精神永远活着。",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
