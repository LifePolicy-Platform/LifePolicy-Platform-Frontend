<script setup lang="ts">
import { computed } from 'vue'
import DashboardBarChart from '@/components/dashboard/DashboardBarChart.vue'
import DashboardLineChart from '@/components/dashboard/DashboardLineChart.vue'
import DashboardStatCard from '@/components/dashboard/DashboardStatCard.vue'
import { useDashboard } from '@/composables/useDashboard'

const {
  monthlyPerformance,
  insuranceGoal,
  todayApplications,
  policyStatusDistribution,
  productCategorySales,
  extraStats,
  formatCurrency,
} = useDashboard()

const sideStats = computed(() =>
  extraStats.value.filter((s) => s.title !== '本月新客戶'),
)
</script>

<template>
  <section class="home-page">
    <header class="home-hero">
      <div class="home-hero__inner">
        <h2 class="home-title">首頁 Dashboard</h2>
        <p class="home-subtitle">本月業績概況、投保目標與保單申請趨勢</p>
      </div>
    </header>

    <div class="home-body">
      <div class="home-grid home-grid--stats">
        <DashboardStatCard
          title="本月業績"
          :value="formatCurrency(monthlyPerformance.amount)"
          :subtitle="monthlyPerformance.subtitle"
          :trend="monthlyPerformance.trend"
          :trend-label="monthlyPerformance.trendLabel"
          icon="payments"
        />
        <DashboardStatCard
          title="月目標（件）"
          :value="`${insuranceGoal.monthlyTarget}`"
          subtitle="本月投保目標件數"
          icon="flag"
        />
        <DashboardStatCard
          title="目前達成數"
          :value="`${insuranceGoal.currentAchieved}`"
          subtitle="已受理並計入業績"
          trend="up"
          trend-label="+8"
          icon="check_circle"
        />
        <DashboardStatCard
          title="達成率"
          :value="`${insuranceGoal.achievementRate}%`"
          :subtitle="`尚差 ${insuranceGoal.monthlyTarget - insuranceGoal.currentAchieved} 件達標`"
          :progress="insuranceGoal.achievementRate"
          icon="trending_up"
        />
      </div>

      <div class="home-grid home-grid--pair">
        <DashboardLineChart
          title="今日申請保單"
          subtitle="每小時趨勢"
          :data="todayApplications"
          y-axis-label="件數"
        />
        <DashboardBarChart
          title="保單狀態分布"
          subtitle="目前申請狀態"
          :data="policyStatusDistribution"
          y-axis-label="件數"
        />
      </div>

      <div class="home-grid home-grid--pair">
        <DashboardBarChart
          title="商品種類銷售量"
          subtitle="本月累計"
          :data="productCategorySales"
          y-axis-label="件數"
        />
        <div class="home-side-stats">
          <DashboardStatCard
            v-for="stat in sideStats"
            :key="stat.title"
            dense
            :title="stat.title"
            :value="stat.value"
            :subtitle="stat.subtitle"
            :trend="stat.trend"
          />
        </div>
      </div>
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

.home-hero {
  flex: 0 0 auto;
  width: 100%;
  min-height: clamp(108px, 13vh, 148px);
  padding: calc(var(--chrome-height) + 6px) 20px 44px;
  background: linear-gradient(
    135deg,
    var(--notus-green-dark) 0%,
    var(--notus-green) 45%,
    var(--notus-green-light) 75%
  );
}

.home-hero__inner {
  max-width: var(--home-content-width);
  margin: 0 auto;
  padding: 0 16px;
  text-align: left;
}

.home-title {
  margin: 0;
  color: #ffffff;
  font-size: 1.45rem;
  font-weight: 700;
}

.home-subtitle {
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.9rem;
  font-weight: 500;
}

.home-body {
  flex: 1 1 auto;
  width: 100%;
  max-width: var(--home-content-width);
  margin: -32px auto 0;
  padding: 0 16px 28px;
  display: grid;
  gap: 14px;
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
  .home-hero {
    min-height: 100px;
    padding: calc(var(--chrome-height) + 4px) 16px 36px;
  }

  .home-body {
    margin-top: -24px;
    padding: 0 14px 20px;
  }

  .home-grid--stats {
    grid-template-columns: 1fr;
  }
}
</style>
