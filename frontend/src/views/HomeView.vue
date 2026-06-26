<script setup lang="ts">
import { computed } from 'vue'
import DashboardBarChart from '@/components/dashboard/DashboardBarChart.vue'
import DashboardLineChart from '@/components/dashboard/DashboardLineChart.vue'
import DashboardStatCard from '@/components/dashboard/DashboardStatCard.vue'
import PageHero from '@/components/layout/PageHero.vue'
import { useDashboard } from '@/composables/useDashboard'

const {
  yearlyPerformance,
  insuranceGoal,
  monthApplications,
  policyStatusDistribution,
  productCategorySales,
  sideStats,
  isLoading,
  errorMessage,
  formatCurrency,
  formatStatValue,
} = useDashboard()

const achievementGap = computed(() =>
  Math.max(0, insuranceGoal.value.monthlyTarget - insuranceGoal.value.currentAchieved),
)
</script>

<template>
  <section class="home-page">
    <PageHero
      compact
      title="首頁 數據分析"
      subtitle="今年業績概況、投保目標與保單申請趨勢"
    />
    <PageHero compact title="首頁 數據分析" subtitle="今年業績概況、投保目標與保單申請趨勢" />

    <div class="home-body">
      <q-banner v-if="errorMessage" rounded class="bg-red-1 text-red-8">
        {{ errorMessage }}
      </q-banner>

      <div v-else class="home-dashboard" :class="{ 'home-dashboard--loading': isLoading }">
        <div class="home-grid home-grid--stats">
          <DashboardStatCard title="今年業績" :value="formatCurrency(yearlyPerformance.amount)"
            :subtitle="yearlyPerformance.subtitle" :trend="yearlyPerformance.trend"
            :trend-label="yearlyPerformance.trendLabel" icon="payments" />
          <DashboardStatCard title="月目標（件）" :value="`${insuranceGoal.monthlyTarget}`" subtitle="本月投保目標件數" icon="flag" />
          <DashboardStatCard title="目前達成數" :value="`${insuranceGoal.currentAchieved}`" subtitle="本月核准並計入業績"
            icon="check_circle" />
          <DashboardStatCard title="達成率" :value="`${insuranceGoal.achievementRate}%`"
            :subtitle="achievementGap > 0 ? `尚差 ${achievementGap} 件達標` : '已達成月目標'"
            :progress="insuranceGoal.achievementRate" icon="trending_up" />
        </div>

        <div class="home-grid home-grid--pair">
          <DashboardLineChart title="當月申請保單" subtitle="申請件數趨勢" :data="monthApplications" y-axis-label="件數" />
          <DashboardBarChart title="保單狀態分布" subtitle="今年申請狀態" :data="policyStatusDistribution" y-axis-label="件數" />
        </div>

        <div class="home-grid home-grid--pair">
          <DashboardBarChart title="商品種類銷售量" subtitle="今年商品銷售分布" :data="productCategorySales" y-axis-label="件數" />
          <div class="home-side-stats">
            <DashboardStatCard v-for="stat in sideStats" :key="stat.title" dense :title="stat.title"
              :value="formatStatValue(stat.count)" :subtitle="stat.subtitle" :trend="stat.trend" />
          </div>
        </div>
      </div>

      <q-inner-loading :showing="isLoading" color="primary" />
    </div>
  </section>
</template>

<style scoped>
.home-page {
  --notus-green: #48bb78;
  --notus-green-dark: #38a169;
  --notus-green-deep: #2f855a;
  --notus-green-light: #9ae6b4;
  --notus-green-pale: #c6f6d5;
  --dash-bg: #f7fafc;
  --home-content-width: 980px;

  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
  width: 100%;
  background: var(--dash-bg);
}

.home-body {
  flex: 1 1 auto;
  width: 100%;
  max-width: var(--home-content-width);
  margin: -32px auto 0;
  padding: 0 16px 28px;
  position: relative;
  min-height: 200px;
}

.home-dashboard {
  display: grid;
  gap: 14px;
}

.home-dashboard--loading {
  opacity: 0.6;
  pointer-events: none;
}

.home-grid {
  display: grid;
  gap: 14px;
}

.home-grid--stats {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.home-grid--pair {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
}

.home-side-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  justify-content: space-between;
}

@media (max-width: 1100px) {
  .home-grid--stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .home-grid--pair {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .home-body {
    margin-top: -24px;
    padding: 0 14px 20px;
  }

  .home-grid--stats {
    grid-template-columns: 1fr;
  }
}
</style>
