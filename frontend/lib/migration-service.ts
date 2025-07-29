// 数据迁移服务，用于将localStorage数据迁移到数据库
export interface LocalStorageObituaryData {
  id: string
  petName?: string
  personName?: string
  petType?: string
  breed?: string
  color?: string
  gender?: 'male' | 'female' | 'unknown'
  relationship?: 'parent' | 'spouse' | 'child' | 'sibling' | 'relative' | 'friend' | 'colleague' | 'other'
  age?: number
  occupation?: string
  location?: string
  dateOfBirth?: string
  dateOfDeath?: string
  lifeStory?: string
  images?: string[]
  creatorName: string
  creatorEmail?: string
  creatorPhone?: string
  createdAt: string
  type: 'pet' | 'human'
}

export interface LocalStorageUserData {
  id: string
  name: string
  email: string
  preferredSystem?: 'pet' | 'human'
  createdAt: string
  lastLoginAt: string
}

export class MigrationService {
  // 获取localStorage中的纪念页数据
  getLocalStorageObituaries(): LocalStorageObituaryData[] {
    if (typeof window === 'undefined') return []
    
    const petObituaries = this.getStorageData('pet_obituaries') || []
    const humanObituaries = this.getStorageData('human_obituaries') || []
    
    return [
      ...petObituaries.map((obit: any) => ({ ...obit, type: 'pet' })),
      ...humanObituaries.map((obit: any) => ({ ...obit, type: 'human' }))
    ]
  }

  // 获取localStorage中的用户数据
  getLocalStorageUser(): LocalStorageUserData | null {
    if (typeof window === 'undefined') return null
    
    const userData = this.getStorageData('eternalmemory_current_user')
    return userData || null
  }

  // 迁移用户数据到数据库
  async migrateUserData(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const localUser = this.getLocalStorageUser()
      
      if (!localUser) {
        return { success: false, message: '没有找到本地用户数据' }
      }

      // 检查用户是否已经存在于数据库中
      const response = await fetch(`/api/users/${userId}`)
      if (response.ok) {
        return { success: true, message: '用户数据已存在于数据库中' }
      }

      return { success: true, message: '用户数据迁移完成（当前用户已通过认证系统存在）' }
      
    } catch (error) {
      console.error('Migrate user data error:', error)
      return { success: false, message: '迁移用户数据失败' }
    }
  }

  // 迁移纪念页数据到数据库
  async migrateObituaryData(userId: string): Promise<{ success: boolean; message: string; results: any[] }> {
    try {
      const localObituaries = this.getLocalStorageObituaries()
      
      if (localObituaries.length === 0) {
        return { 
          success: true, 
          message: '没有找到本地纪念页数据', 
          results: [] 
        }
      }

      const results = []

      for (const obituary of localObituaries) {
        try {
          // 转换数据格式以匹配API
          const memorialData = this.transformObituaryToMemorial(obituary, userId)
          
          // 创建纪念页
          const response = await fetch('/api/memorials', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(memorialData)
          })

          const result = await response.json()
          
          if (response.ok) {
            results.push({
              localId: obituary.id,
              memorialId: result.memorial.id,
              name: obituary.petName || obituary.personName,
              status: 'success'
            })

            // 如果有图片，创建图片记录
            if (obituary.images && obituary.images.length > 0) {
              await this.migrateImages(result.memorial.id, obituary.images)
            }
          } else {
            results.push({
              localId: obituary.id,
              name: obituary.petName || obituary.personName,
              status: 'failed',
              error: result.error
            })
          }
        } catch (error) {
          results.push({
            localId: obituary.id,
            name: obituary.petName || obituary.personName,
            status: 'failed',
            error: error instanceof Error ? error.message : '未知错误'
          })
        }
      }

      const successCount = results.filter(r => r.status === 'success').length
      const failCount = results.filter(r => r.status === 'failed').length

      return {
        success: failCount === 0,
        message: `迁移完成：${successCount} 个成功，${failCount} 个失败`,
        results
      }

    } catch (error) {
      console.error('Migrate obituary data error:', error)
      return { 
        success: false, 
        message: '迁移纪念页数据失败', 
        results: [] 
      }
    }
  }

  // 迁移图片数据
  private async migrateImages(memorialId: string, imageUrls: string[]): Promise<void> {
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i]
      try {
        const imageData = {
          memorialId,
          url,
          filename: `migrated-image-${i + 1}.jpg`,
          mimeType: 'image/jpeg',
          size: 0, // 无法获取本地图片大小
          isPrimary: i === 0, // 第一张图片设为主图
          caption: `从本地数据迁移的图片 ${i + 1}`
        }

        await fetch('/api/images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(imageData)
        })
      } catch (error) {
        console.error('Migrate image error:', error)
      }
    }
  }

  // 转换localStorage纪念页数据为API格式
  private transformObituaryToMemorial(obituary: LocalStorageObituaryData, userId: string) {
    const baseData = {
      type: obituary.type === 'pet' ? 'PET' : 'HUMAN',
      name: obituary.petName || obituary.personName || '',
      dateOfBirth: obituary.dateOfBirth,
      dateOfDeath: obituary.dateOfDeath,
      lifeStory: obituary.lifeStory,
      creatorId: userId,
      creatorName: obituary.creatorName,
      creatorEmail: obituary.creatorEmail,
      creatorPhone: obituary.creatorPhone,
    }

    // 宠物特有字段
    if (obituary.type === 'pet') {
      return {
        ...baseData,
        petType: obituary.petType,
        breed: obituary.breed,
        color: obituary.color,
        gender: obituary.gender?.toUpperCase() as 'MALE' | 'FEMALE' | 'UNKNOWN',
      }
    }

    // 人类特有字段
    return {
      ...baseData,
      relationship: obituary.relationship?.toUpperCase() as any,
      age: obituary.age,
      occupation: obituary.occupation,
      location: obituary.location,
    }
  }

  // 清理localStorage数据
  clearLocalStorageData(): void {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem('pet_obituaries')
    localStorage.removeItem('human_obituaries')
    // 保留用户数据，因为仍然需要用于会话管理
    // localStorage.removeItem('eternalmemory_current_user')
  }

  // 获取存储数据的辅助方法
  private getStorageData(key: string): any {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error(`Error parsing localStorage data for key ${key}:`, error)
      return null
    }
  }

  // 检查是否有需要迁移的数据
  hasDataToMigrate(): boolean {
    const obituaries = this.getLocalStorageObituaries()
    return obituaries.length > 0
  }

  // 获取迁移数据统计
  getMigrationStats(): { petCount: number; humanCount: number; totalCount: number } {
    const obituaries = this.getLocalStorageObituaries()
    const petCount = obituaries.filter(o => o.type === 'pet').length
    const humanCount = obituaries.filter(o => o.type === 'human').length
    
    return {
      petCount,
      humanCount,
      totalCount: obituaries.length
    }
  }
}

export const migrationService = new MigrationService()