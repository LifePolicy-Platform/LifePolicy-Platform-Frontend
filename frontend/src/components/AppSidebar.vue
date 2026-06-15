<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { SidebarNavItem } from '@/constants/navigation'

const props = defineProps<{
  items: readonly SidebarNavItem[]
}>()

const searchQuery = ref('')

interface NavGroup {
  title: string
  order: number
  items: SidebarNavItem[]
}

const filteredGroups = computed<NavGroup[]>(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const groupMap = new Map<string, NavGroup>()

  for (const item of props.items) {
    const match =
      !q ||
      item.label.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.group.toLowerCase().includes(q)

    if (!match) continue

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

const hasResults = computed(() => filteredGroups.value.length > 0)
</script>

<template>
  <aside class="app-sidebar">
    <div class="sidebar-topbar">
      <div class="sidebar-logo" aria-label="系統 Logo">
        <q-icon name="eco" size="22px" class="sidebar-logo__icon" />
      </div>
    </div>

    <div class="sidebar-search">
      <q-input
        v-model="searchQuery"
        dense
        borderless
        placeholder="Search Menus"
        class="sidebar-search__input"
      >
        <template #append>
          <q-icon name="search" size="18px" />
        </template>
      </q-input>
    </div>

    <nav class="sidebar-menu" aria-label="主選單">
      <template v-if="hasResults">
        <section
          v-for="group in filteredGroups"
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
      </template>

      <p v-else class="sidebar-empty">找不到符合的選單</p>
    </nav>
  </aside>
</template>
