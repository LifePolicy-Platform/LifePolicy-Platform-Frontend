export interface DashboardStat {
  title: string
  count: number
  subtitle: string
  trend?: 'up' | 'down' | 'neutral'
}

export interface TimeSeriesPoint {
  label: string
  value: number
}

export interface BarChartItem {
  label: string
  value: number
  color?: string
}

export interface InsuranceGoal {
  monthlyTarget: number
  currentAchieved: number
  achievementRate: number
}

export interface YearlyPerformance {
  amount: number
  subtitle: string
  trend: 'up' | 'down' | 'neutral'
  trendLabel?: string
}

export interface DashboardSummary {
  yearlyPerformance: YearlyPerformance
  insuranceGoal: InsuranceGoal
  monthApplications: TimeSeriesPoint[]
  policyStatusDistribution: BarChartItem[]
  productCategorySales: BarChartItem[]
  sideStats: DashboardStat[]
}

export interface RecentPolicyRow {
  policyNo: string
  customerName: string
  productName: string
  status: string
  statusColor: string
  appliedAt: string
}
