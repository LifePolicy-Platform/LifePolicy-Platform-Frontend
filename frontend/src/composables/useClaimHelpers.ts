import { useQuasar } from 'quasar'

export function useClaimHelpers() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085'

  // 1. 日期格式化
  function formatDate(dateStr: any) {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }

  // 2. 金額千分位轉換
  function formatMoney(val: any) {
    if (val === null || val === undefined || isNaN(Number(val))) return '0'
    return Number(val).toLocaleString('en-US')
  }

  // 3. 狀態顏色映射
  function getStatusColor(status: string) {
    switch (status) {
      case 'APPROVED': return 'green-7'
      case 'REJECTED': return 'red-7'
      case 'RETURN': return 'orange-9'
      case 'PENDING': return 'blue-7'
      default: return 'blue-grey-6'
    }
  }

  // 4. 狀態中文名稱映射 (管理端)
  function getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      SUBMIT: '初審',
      PENDING: '複審',
      APPROVED: '已核准',
      REJECTED: '已駁回',
      RETURN: '退回補件中'
    }
    return map[status] || status
  }

  // 5. 審核歷程狀態中文名稱映射 (Log端)
  function getStatusLabellog(status: string): string {
    const map: Record<string, string> = {
      SUBMIT: '送件',
      PENDING: '初審',
      APPROVED: '已核准',
      REJECTED: '已駁回',
      RETURN: '退回補件中'
    }
    return map[status] || status
  }

  // 6. 生日計算年齡
  function calculateAge(birthday: string | null | undefined): string {
    if (!birthday) return '未提供生日'
    const birthDate = new Date(birthday)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return isNaN(age) ? '格式錯誤' : `${age} 歲`
  }

  // 7. 性別代碼格式化
  function formatGender(gender: string | null | undefined): string {
    if (!gender) return '-'
    const g = gender.toUpperCase().trim()
    if (g === 'M' || g === 'MALE') return '男 (Male)'
    if (g === 'F' || g === 'FEMALE') return '女 (Female)'
    return gender
  }

  // 8. 風險等級代碼格式化
  function formatRiskLevel(level: string | null | undefined): string {
    if (!level) return '未評估'
    const l = level.toUpperCase().trim()
    if (l === 'HIGH') return '高風險 (HIGH)'
    if (l === 'MEDIUM') return '中風險 (MEDIUM)'
    if (l === 'LOW') return '低風險 (LOW)'
    return level
  }

  // 9. PDF與影像開啟
  function viewPdf(path: string | undefined) {
    if (!path) return
    if (path.startsWith('http')) {
      window.open(path, '_blank')
      return
    }
    const cleanBase = baseUrl.replace(/\/$/, '')
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    window.open(`${cleanBase}${cleanPath}`, '_blank')
  }

  // 🌟 10. 新增：獲取當前登入使用者的 ROLE_CODE 權限
  function getUserRole(): string {
    const userJson = localStorage.getItem('User')
    if (userJson) {
      try {
        const userObj = JSON.parse(userJson)
        return userObj.ROLE_CODE || ''
      } catch (e) {
        console.error('讀取角色權限失敗', e)
      }
    }
    return ''
  }

  // 🌟 11. 新增：依據角色與狀態判斷是否屬於可「進入審核關卡」的狀態
  function isAuditState(row: any): boolean {
    const role = getUserRole().toUpperCase().trim()
    const status = row.claimStatus

    if (role === 'APPLICANT') {
      return status === 'SUBMIT'
    } else if (role === 'REVIEWER' || role === 'ADMIN') {
      return status === 'PENDING'
    }
    return false
  }

  return {
    formatDate,
    formatMoney,
    getStatusColor,
    getStatusLabel,
    getStatusLabellog,
    calculateAge,
    formatGender,
    formatRiskLevel,
    viewPdf,
    getUserRole,     // 🌟 匯出
    isAuditState     // 🌟 匯出
  }
}