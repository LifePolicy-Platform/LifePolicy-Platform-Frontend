<script setup lang="ts">
import DashboardCardShell from '@/components/dashboard/DashboardCardShell.vue'
import type { RecentPolicyRow } from '@/types/dashboard'

defineProps<{
  rows: RecentPolicyRow[]
}>()

defineEmits<{
  action: []
}>()
</script>

<template>
  <DashboardCardShell
    title="最近申請保單"
    subtitle="今日最新 5 筆"
    action-label="查看全部"
    @action="$emit('action')"
  >
    <div class="table-wrap">
      <table class="recent-table">
        <thead>
          <tr>
            <th>保單編號</th>
            <th>客戶姓名</th>
            <th>商品名稱</th>
            <th>狀態</th>
            <th>申請時間</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.policyNo">
            <td class="recent-table__mono">{{ row.policyNo }}</td>
            <td>{{ row.customerName }}</td>
            <td>{{ row.productName }}</td>
            <td>
              <span class="status-tag" :style="{ color: row.statusColor, borderColor: row.statusColor }">
                {{ row.status }}
              </span>
            </td>
            <td>{{ row.appliedAt }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </DashboardCardShell>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
}

.recent-table {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
}

.recent-table th,
.recent-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #edf2f7;
  text-align: left;
  font-size: 0.84rem;
}

.recent-table th {
  color: #718096;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: #f7fafc;
}

.recent-table td {
  color: #2d3748;
}

.recent-table tbody tr:last-child td {
  border-bottom: none;
}

.recent-table__mono {
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: 0.8rem;
  color: #4a5568;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  background: #ffffff;
}
</style>
