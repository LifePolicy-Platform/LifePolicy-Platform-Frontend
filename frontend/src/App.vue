<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppFooter from './components/AppFooter.vue'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import { sidebarNavItems } from './constants/navigation'

const route = useRoute()

const activeTopicLabel = computed(() => route.meta.label ?? '未命名主題')
const hideSidebar = computed(() => route.meta.hideSidebar === true)
const hasTopHero = computed(() => route.meta.hasTopHero === true)
</script>

<template>
  <div class="app-layout" :class="{ 'app-layout--no-sidebar': hideSidebar }">
    <AppSidebar v-if="!hideSidebar" :items="sidebarNavItems" />

    <div class="app-shell" :class="{ 'app-shell--hero': hasTopHero }">
      <AppHeader v-if="!hideSidebar" :class="{ 'app-header--overlay': hasTopHero }" />

      <main
        class="app-main"
        :class="{
          'app-main--bare': hideSidebar,
          'app-main--hero': hasTopHero,
        }"
      >
        <RouterView />
      </main>

      <AppFooter
        v-if="!hideSidebar"
        :active-topic-label="activeTopicLabel"
        :class="{ 'app-footer--hero': hasTopHero }"
      />
    </div>
  </div>
</template>
