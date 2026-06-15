<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// computed getter / setter 在這裡扮演 v-model 的橋樑，
// 讓元件知道資料來自父層，同時也能把新值往外送。
const inputValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})
</script>

<template>
  <label class="search-field">
    <span class="search-field__label">保單號碼查詢</span>
    <input
      v-model="inputValue"
      class="search-field__input"
      type="text"
      placeholder="例如：PL-2024-0001 或輸入 ERROR500 測試錯誤"
    />
  </label>
</template>