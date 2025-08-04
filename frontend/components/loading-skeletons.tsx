import { Skeleton } from "@/components/ui/skeleton"

// 纪念卡片加载骨架屏
export function MemorialCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* 主图片骨架 */}
      <Skeleton className="w-full h-48 rounded-xl mb-4" />
      
      {/* 标题和基本信息 */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      
      {/* 统计信息 */}
      <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  )
}

// 社区页面网格加载骨架屏
export function CommunityGridSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <MemorialCardSkeleton key={index} />
      ))}
    </div>
  )
}

// 纪念页详情加载骨架屏
export function MemorialDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* 头部区域 */}
      <div className="text-center mb-12">
        <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
        <Skeleton className="h-6 w-1/2 mx-auto mb-6" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
      
      {/* 基本信息 */}
      <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
      
      {/* 故事内容 */}
      <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
        <Skeleton className="h-8 w-40 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      
      {/* 图片画廊 */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}

// 表单加载骨架屏
export function FormSkeleton() {
  return (
    <div className="space-y-8">
      {/* 表单标题 */}
      <div className="text-center">
        <Skeleton className="h-10 w-48 mx-auto mb-4" />
        <Skeleton className="h-6 w-64 mx-auto" />
      </div>
      
      {/* 表单字段 */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
      
      {/* 按钮区域 */}
      <div className="flex justify-center gap-6">
        <Skeleton className="h-12 w-24" />
        <Skeleton className="h-12 w-32" />
      </div>
    </div>
  )
}

// 设置页面骨架屏
export function SettingsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* 侧边栏 */}
        <div className="lg:col-span-1">
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        </div>
        
        {/* 主内容区 */}
        <div className="lg:col-span-3">
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <Skeleton className="h-8 w-40 mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <MemorialCardSkeleton key={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 空状态组件
export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: {
  icon: any
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-xl font-light text-slate-800 mb-4">{title}</h3>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">{description}</p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  )
}

// 错误状态组件
export function ErrorState({ 
  title = "加载失败", 
  description = "网络连接出现问题，请稍后重试", 
  onRetry 
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-xl font-light text-slate-800 mb-4">{title}</h3>
      <p className="text-slate-500 mb-8">{description}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors"
        >
          重新加载
        </button>
      )}
    </div>
  )
}