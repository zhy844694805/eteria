import { toast } from 'sonner'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react'

// 成功通知
export const showSuccess = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 4000,
    icon: CheckCircle2,
    className: 'border-green-200 bg-green-50',
  })
}

// 错误通知  
export const showError = (message: string, description?: string) => {
  toast.error(message, {
    description,
    duration: 6000,
    icon: AlertCircle,
    className: 'border-red-200 bg-red-50',
    action: description ? {
      label: '查看详情',
      onClick: () => console.log('Error details:', description)
    } : undefined
  })
}

// 警告通知
export const showWarning = (message: string, description?: string) => {
  toast.warning(message, {
    description,
    duration: 5000,
    icon: AlertTriangle,
    className: 'border-yellow-200 bg-yellow-50',
  })
}

// 信息通知
export const showInfo = (message: string, description?: string) => {
  toast.info(message, {
    description,
    duration: 4000,
    icon: Info,
    className: 'border-blue-200 bg-blue-50',
  })
}

// 加载通知
export const showLoading = (message: string, promise?: Promise<any>) => {
  if (promise) {
    return toast.promise(promise, {
      loading: {
        icon: Loader2,
        title: message,
        description: '请稍候...',
      },
      success: (data) => ({
        icon: CheckCircle2,
        title: '操作成功',
        description: data?.message || '操作已完成',
      }),
      error: (error) => ({
        icon: AlertCircle,
        title: '操作失败',
        description: error?.message || '请稍后重试',
      })
    })
  }

  return toast.loading(message, {
    icon: Loader2,
  })
}

// 自定义操作通知
export const showAction = (
  message: string, 
  description: string,
  actionLabel: string, 
  onAction: () => void,
  duration = 8000
) => {
  toast(message, {
    description,
    duration,
    action: {
      label: actionLabel,
      onClick: onAction
    }
  })
}

// 纪念页相关的特定通知
export const memorialToasts = {
  // 纪念页创建
  creating: () => showLoading('正在创建纪念页'),
  created: (name: string) => showSuccess(
    '纪念页创建成功', 
    `${name}的纪念页已成功创建，现在可以分享给家人朋友了`
  ),
  createFailed: (error?: string) => showError(
    '创建失败', 
    error || '创建纪念页时出现问题，请检查网络连接后重试'
  ),

  // 留言相关
  messageSent: () => showSuccess('留言发送成功', '您的纪念留言已发布'),
  messageFailed: () => showError('留言发送失败', '请检查网络连接后重试'),

  // 蜡烛相关
  candleLit: () => showSuccess(
    '蜡烛点亮成功', 
    '您的纪念蜡烛已点亮，愿逝者安息'
  ),
  candleFailed: () => showError('点亮蜡烛失败', '请稍后重试'),
  candleAlreadyLit: () => showWarning(
    '今日已点亮', 
    '您今天已经为这个纪念页点亮过蜡烛了'
  ),

  // 图片上传
  imageUploading: (count: number) => showLoading(`正在上传 ${count} 张图片`),
  imageUploaded: (count: number) => showSuccess(
    `图片上传成功`, 
    `${count} 张图片已成功添加到纪念页`
  ),
  imageUploadFailed: () => showError(
    '图片上传失败', 
    '请检查图片格式和大小，然后重试'
  ),

  // 保存状态
  saving: () => showLoading('正在保存'),
  saved: () => showSuccess('保存成功', '您的更改已保存'),
  saveFailed: () => showError('保存失败', '请检查网络连接后重试'),

  // 分享相关
  linkCopied: () => showSuccess('链接已复制', '纪念页链接已复制到剪贴板'),
  shareFailed: () => showError('分享失败', '无法复制链接，请手动复制地址栏链接'),

  // 删除确认
  confirmDelete: (name: string, onConfirm: () => void) => showAction(
    '确认删除纪念页',
    `此操作将永久删除${name}的纪念页，无法恢复`,
    '确认删除',
    onConfirm,
    10000
  ),

  // 权限相关
  accessDenied: () => showError(
    '访问被拒绝', 
    '您没有权限访问此纪念页'
  ),
  loginRequired: () => showWarning(
    '请先登录', 
    '您需要登录后才能执行此操作'
  ),

  // 搜索相关
  searchEmpty: () => showInfo('搜索结果为空', '请尝试其他关键词'),
  searchError: () => showError('搜索失败', '搜索服务暂时不可用，请稍后重试'),
}

// 表单验证通知
export const formToasts = {
  validationFailed: (errors: string[]) => showError(
    '表单验证失败',
    `请检查以下字段：${errors.join('、')}`
  ),
  
  requiredFields: (fields: string[]) => showWarning(
    '请填写必填项',
    `以下字段为必填项：${fields.join('、')}`
  ),

  emailInvalid: () => showError('邮箱格式错误', '请输入有效的邮箱地址'),
  phoneInvalid: () => showError('手机号格式错误', '请输入有效的手机号码'),
  dateInvalid: () => showError('日期格式错误', '请选择有效的日期'),
  
  autoSaved: () => showInfo('内容已自动保存', '您的编辑内容已自动保存到本地'),
  dataRestored: () => showInfo('已恢复上次编辑', '检测到未完成的编辑内容，已为您恢复'),
}

// 系统通知
export const systemToasts = {
  networkError: () => showError(
    '网络连接异常', 
    '请检查网络连接后重试'
  ),
  
  serverError: () => showError(
    '服务器错误', 
    '服务器暂时不可用，请稍后重试'
  ),
  
  maintenanceMode: () => showWarning(
    '系统维护中', 
    '系统正在维护，部分功能可能受到影响'
  ),
  
  sessionExpired: () => showWarning(
    '登录已过期', 
    '请重新登录以继续使用'
  ),

  updateAvailable: () => showAction(
    '发现新版本',
    '新版本已发布，建议刷新页面获取最新功能',
    '立即刷新',
    () => window.location.reload()
  )
}