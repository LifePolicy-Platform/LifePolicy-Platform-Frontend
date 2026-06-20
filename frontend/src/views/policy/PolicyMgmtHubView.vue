<script setup lang="ts">
import PageHero from '@/components/layout/PageHero.vue'
import PolicyHubCard from '@/components/policy/PolicyHubCard.vue'
</script>

<template>
  <section class="page-with-hero">
    <PageHero title="保單管理" subtitle="選擇要進行的保單作業" />

    <div class="page-body page-body--center policy-hub-body">
      <div class="policy-card-grid">
        <PolicyHubCard
          variant="search"
          title="保單查詢"
          description="查詢投保申請、帶入修改或審核"
          icon="search"
          to="/workbench?tab=query"
        />
        <PolicyHubCard
          variant="create"
          title="新增保單"
          description="建立新投保申請"
          icon="note_add"
          to="/workbench?tab=create"
        />
        <PolicyHubCard
          variant="review"
          title="審核保單"
          description="審核待核保件（REVIEWER）"
          icon="fact_check"
          to="/workbench?tab=review"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.policy-hub-body {
  width: 100%;
}

.policy-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(260px, 300px));
  gap: 1.75rem;
  width: 100%;
  max-width: 980px;
  justify-content: center;
}

@media (max-width: 1023px) {
  .policy-card-grid {
    grid-template-columns: repeat(2, minmax(260px, 300px));
  }
}

@media (max-width: 639px) {
  .policy-card-grid {
    grid-template-columns: minmax(280px, 340px);
    justify-items: center;
  }
}
</style>
