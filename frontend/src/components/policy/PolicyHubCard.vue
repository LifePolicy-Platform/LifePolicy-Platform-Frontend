<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  title: string
  description: string
  icon: string
  to: string
  variant: 'search' | 'create' | 'review'
}>()
</script>

<template>
  <RouterLink :to="to" class="policy-hub-card">
    <q-card
      flat
      bordered
      class="policy-hub-card__inner"
      :class="`policy-hub-card__inner--${variant}`"
    >
      <q-card-section class="policy-hub-card__content">
        <div class="policy-hub-card__icon-wrap">
          <q-icon :name="icon" size="34px" />
        </div>

        <div class="policy-hub-card__text">
          <div class="policy-hub-card__title">{{ title }}</div>
          <div class="policy-hub-card__description">{{ description }}</div>
        </div>

        <q-icon name="chevron_right" size="24px" class="policy-hub-card__arrow" />
      </q-card-section>
    </q-card>
  </RouterLink>
</template>

<style scoped>
.policy-hub-card {
  display: block;
  text-decoration: none;
  color: inherit;
}

.policy-hub-card__inner {
  position: relative;
  overflow: hidden;
  min-height: 132px;
  border-radius: 18px;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease;
}

.policy-hub-card__inner::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
}

.policy-hub-card__inner::after {
  content: '';
  position: absolute;
  right: -36px;
  bottom: -36px;
  width: 118px;
  height: 118px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.45);
  z-index: 0;
}

.policy-hub-card__content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 132px;
  padding: 24px;
}

.policy-hub-card__icon-wrap {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.policy-hub-card__text {
  flex: 1;
  min-width: 0;
}

.policy-hub-card__title {
  margin-bottom: 6px;
  color: #1f2937;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.3;
}

.policy-hub-card__description {
  color: #4b5563;
  font-size: 14px;
  line-height: 1.6;
}

.policy-hub-card__arrow {
  color: rgba(31, 41, 55, 0.45);
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.policy-hub-card:hover .policy-hub-card__inner {
  transform: translateY(-4px);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.12);
}

.policy-hub-card:hover .policy-hub-card__arrow {
  transform: translateX(4px);
  color: rgba(31, 41, 55, 0.72);
}

/* 保單查詢：藍綠 */
.policy-hub-card__inner--search {
  border-color: #b7e4dc;
}

.policy-hub-card__inner--search::before {
  background: linear-gradient(135deg, #ecfdf5 0%, #dff7f4 55%, #ccfbf1 100%);
}

.policy-hub-card__inner--search .policy-hub-card__icon-wrap {
  color: #0f766e;
}

/* 新增保單：綠色 */
.policy-hub-card__inner--create {
  border-color: #bbf7d0;
}

.policy-hub-card__inner--create::before {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 55%, #bbf7d0 100%);
}

.policy-hub-card__inner--create .policy-hub-card__icon-wrap {
  color: #15803d;
}

/* 審核保單：橘色 */
.policy-hub-card__inner--review {
  border-color: #fed7aa;
}

.policy-hub-card__inner--review::before {
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 55%, #fed7aa 100%);
}

.policy-hub-card__inner--review .policy-hub-card__icon-wrap {
  color: #c2410c;
}
</style>
