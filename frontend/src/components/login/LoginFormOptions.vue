<script lang="ts">
import { defineComponent } from 'vue'
import { useAuthForm } from '../../composables/useAuthForm'

export default defineComponent({
  name: 'LoginFormOptions',
  setup() {
    return useAuthForm()
  },
  data() {
    return {
      successMessage: '',
    }
  },
  watch: {
    'form.username'() {
      this.successMessage = ''
      this.resetSubmitError()
    },
    'form.password'() {
      this.successMessage = ''
      this.resetSubmitError()
    },
  },
  methods: {
    async handleSubmit() {
      const result = await this.submit()
      this.successMessage = result.success ? result.message : ''
    },
  },
})
</script>

<template>
  <section class="card">
    <header class="card-heading">
      <div>
        <h2>Options API 登入表單</h2>
        <p>把 data、watch、methods 分開陳列，閱讀時會依功能區塊來找邏輯。</p>
      </div>
    </header>

    <div class="section-body">
      <form class="login-form" @submit.prevent="handleSubmit">
        <label class="search-field">
          <span class="search-field__label">帳號</span>
          <input v-model="form.username" class="search-field__input" type="text" />
        </label>
        <p v-if="errors.username" class="field-error">{{ errors.username }}</p>

        <label class="search-field">
          <span class="search-field__label">密碼</span>
          <input v-model="form.password" class="search-field__input" type="password" />
        </label>
        <p v-if="errors.password" class="field-error">{{ errors.password }}</p>

        <button class="primary-button" type="submit" :disabled="!canSubmit">登入</button>

        <p v-if="successMessage" class="state-box state-box--loading">{{ successMessage }}</p>
      </form>
    </div>
  </section>
</template>
