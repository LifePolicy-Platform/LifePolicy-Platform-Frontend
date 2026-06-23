<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { SidebarNavItem } from '@/constants/navigation'
import { scrollPageToTop } from '@/utils/scroll'

const props = defineProps<{
  items: readonly SidebarNavItem[]
}>()

function onNavClick() {
  scrollPageToTop()
}

interface NavGroup {
  title: string
  order: number
  items: SidebarNavItem[]
}

const navGroups = computed<NavGroup[]>(() => {
  const groupMap = new Map<string, NavGroup>()

  for (const item of props.items) {
    const existing = groupMap.get(item.group)
    if (existing) {
      existing.items.push(item)
    } else {
      groupMap.set(item.group, {
        title: item.group,
        order: item.groupOrder,
        items: [item],
      })
    }
  }

  return Array.from(groupMap.values()).sort((a, b) => a.order - b.order)
})
</script>

<template>
  <aside class="app-sidebar">
    <nav class="sidebar-menu" aria-label="主選單">
      <section
        v-for="group in navGroups"
        :key="group.title"
        class="sidebar-group"
      >
        <p class="sidebar-group__title">{{ group.title }}</p>

        <template v-for="(item, idx) in group.items" :key="`${group.title}-${item.label}-${idx}`">
          <RouterLink
            v-if="item.path && !item.disabled"
            :to="item.path"
            class="sidebar-menu__link"
            active-class="sidebar-menu__link--active"
            @click="onNavClick"
          >
            <q-icon :name="item.icon" size="18px" class="sidebar-menu__icon" />
            <span class="sidebar-menu__label">{{ item.label }}</span>
          </RouterLink>

          <span
            v-else
            class="sidebar-menu__link sidebar-menu__link--disabled"
            :title="'功能開發中'"
          >
            <q-icon :name="item.icon" size="18px" class="sidebar-menu__icon" />
            <span class="sidebar-menu__label">{{ item.label }}</span>
          </span>
        </template>
      </section>
    </nav>
  </aside>
</template>