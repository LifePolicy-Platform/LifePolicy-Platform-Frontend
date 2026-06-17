import { computed } from 'vue'
import type {
  BarChartItem,
  DashboardStat,
  InsuranceGoal,
  MonthlyPerformance,
  RecentPolicyRow,
  TimeSeriesPoint,
} from '@/types/dashboard'

/** 首頁 Dashboard 示範資料（之後可改為 API） */
export function useDashboard() {
  const monthlyPerformance = computed<MonthlyPerformance>(() => ({
    amount: 1_285_000,
    subtitle: '較上月同期成長',
    trend: 'up',
    trendLabel: '+12.4%',
  }))

  const insuranceGoal = computed<InsuranceGoal>(() => ({
    monthlyTarget: 200,
    currentAchieved: 156,
    achievementRate: 78,
  }))

  const todayApplications = computed<TimeSeriesPoint[]>(() => [
    { label: '09:00', value: 3 },
    { label: '10:00', value: 7 },
    { label: '11:00', value: 5 },
    { label: '12:00', value: 2 },
    { label: '13:00', value: 4 },
    { label: '14:00', value: 9 },
    { label: '15:00', value: 6 },
    { label: '16:00', value: 8 },
    { label: '17:00', value: 4 },
  ])

  const policyStatusDistribution = computed<BarChartItem[]>(() => [
    { label: '草稿', value: 18, color: '#a0aec0' },
    { label: '審核中', value: 42, color: '#4299e1' },
    { label: '待補件', value: 15, color: '#ed8936' },
    { label: '已承保', value: 128, color: '#48bb78' },
    { label: '已拒保', value: 9, color: '#f56565' },
  ])

  const productCategorySales = computed<BarChartItem[]>(() => [
    { label: '壽險', value: 85, color: '#48bb78' },
    { label: '醫療險', value: 62, color: '#4299e1' },
    { label: '意外險', value: 48, color: '#9f7aea' },
    { label: '年金險', value: 31, color: '#ed8936' },
    { label: '旅平險', value: 22, color: '#38b2ac' },
  ])

  const todayTotalApplications = computed(() =>
    todayApplications.value.reduce((sum, p) => sum + p.value, 0),
  )

  const recentPolicies = computed<RecentPolicyRow[]>(() => [
    {
      policyNo: 'POL-2026-0412',
      customerName: '王小明',
      productName: '終身壽險 A 型',
      status: '審核中',
      statusColor: '#4299e1',
      appliedAt: '14:32',
    },
    {
      policyNo: 'POL-2026-0411',
      customerName: '陳美玲',
      productName: '醫療險 Plus',
      status: '待補件',
      statusColor: '#ed8936',
      appliedAt: '13:58',
    },
    {
      policyNo: 'POL-2026-0410',
      customerName: '林志豪',
      productName: '意外險保障',
      status: '已承保',
      statusColor: '#48bb78',
      appliedAt: '11:20',
    },
    {
      policyNo: 'POL-2026-0409',
      customerName: '張雅婷',
      productName: '年金險穩健型',
      status: '審核中',
      statusColor: '#4299e1',
      appliedAt: '10:45',
    },
    {
      policyNo: 'POL-2026-0408',
      customerName: '李國強',
      productName: '旅平險短期',
      status: '草稿',
      statusColor: '#a0aec0',
      appliedAt: '09:15',
    },
  ])

  const extraStats = computed<DashboardStat[]>(() => [
    {
      title: '待審保單',
      value: '24 件',
      subtitle: '較昨日 +3 件',
      trend: 'up',
    },
    {
      title: '今日理賠申請',
      value: '7 件',
      subtitle: '較昨日 -2 件',
      trend: 'down',
    },
    {
      title: 'SLA 逾期案件',
      value: '5 件',
      subtitle: '需優先處理',
      trend: 'neutral',
    },
    {
      title: '本月新客戶',
      value: '38 位',
      subtitle: '較上月 +6 位',
      trend: 'up',
    },
  ])

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return {
    monthlyPerformance,
    insuranceGoal,
    todayApplications,
    todayTotalApplications,
    policyStatusDistribution,
    productCategorySales,
    recentPolicies,
    extraStats,
    formatCurrency,
  }
}
