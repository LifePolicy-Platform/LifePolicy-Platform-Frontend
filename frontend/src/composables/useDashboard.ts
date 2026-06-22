import { onMounted, ref } from 'vue'
import { fetchDashboardSummary } from '@/api/dashboard'
import type {
  BarChartItem,
  DashboardStat,
  InsuranceGoal,
  TimeSeriesPoint,
  YearlyPerformance,
} from '@/types/dashboard'

const EMPTY_GOAL: InsuranceGoal = {
  monthlyTarget: 200,
  currentAchieved: 0,
  achievementRate: 0,
}

const EMPTY_PERFORMANCE: YearlyPerformance = {
  amount: 0,
  subtitle: '',
  trend: 'neutral',
}

export function useDashboard() {
  const yearlyPerformance = ref<YearlyPerformance>({ ...EMPTY_PERFORMANCE })
  const insuranceGoal = ref<InsuranceGoal>({ ...EMPTY_GOAL })
  const monthApplications = ref<TimeSeriesPoint[]>([])
  const policyStatusDistribution = ref<BarChartItem[]>([])
  const productCategorySales = ref<BarChartItem[]>([])
  const sideStats = ref<DashboardStat[]>([])
  const isLoading = ref(false)
  const errorMessage = ref('')

  async function load() {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const summary = await fetchDashboardSummary()
      yearlyPerformance.value = {
        ...summary.yearlyPerformance,
        amount: Number(summary.yearlyPerformance.amount ?? 0),
      }
      insuranceGoal.value = summary.insuranceGoal
      monthApplications.value = summary.monthApplications ?? []
      policyStatusDistribution.value = summary.policyStatusDistribution ?? []
      productCategorySales.value = (summary.productCategorySales ?? []).map((item) => ({
        ...item,
        value: Number(item.value ?? 0),
      }))
      sideStats.value = (summary.sideStats ?? []).map((stat) => ({
        ...stat,
        count: Number(stat.count ?? 0),
        trend: stat.trend ?? 'neutral',
      }))
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : '載入 Dashboard 失敗，請確認後端服務是否正常'
    } finally {
      isLoading.value = false
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  function formatStatValue(count: number): string {
    return `${count} 件`
  }

  onMounted(() => {
    void load()
  })

  return {
    yearlyPerformance,
    insuranceGoal,
    monthApplications,
    policyStatusDistribution,
    productCategorySales,
    sideStats,
    isLoading,
    errorMessage,
    load,
    formatCurrency,
    formatStatValue,
  }
}
