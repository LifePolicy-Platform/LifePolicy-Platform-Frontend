<script setup lang="ts">
import PolicySearchInput from '../PolicySearchInput.vue'

defineProps<{
  modelValue: string
  formattedKeyword: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: []
}>()
</script>

<template>
  <section class="card">
    <header class="card-heading">
      <div>
        <h2>查詢表單元件</h2>
        <p>這個元件只處理輸入與送出，不直接決定結果怎麼顯示。</p>
      </div>
    </header>

    <div class="section-body">
      <PolicySearchInput
        :model-value="modelValue"
        @update:model-value="emit('update:modelValue', $event)"
      />

      <div class="helper-block">
        <span class="helper-label">computed 格式化結果</span>
        <strong>{{ formattedKeyword || '尚未輸入保單號' }}</strong>
      </div>

      <div class="actions">
        <button type="button" class="primary-button" @click="emit('search')">開始查詢</button>
        <p class="hint">props 負責把資料往下傳，emit 負責把查詢事件往上送。</p>
      </div>
    </div>
  </section>
</template>
