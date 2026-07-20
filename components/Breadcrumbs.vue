<template>
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <NuxtLink to="/">Home</NuxtLink>
    <span v-if="items.length">›</span>
    <template v-for="(item, index) in items" :key="index">
      <NuxtLink v-if="item.to" :to="item.to">{{ item.label }}</NuxtLink>
      <span v-else>{{ item.label }}</span>
      <span v-if="index < items.length - 1">›</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
const props = defineProps({
  items: {
    type: Array as () => Array<{ label: string; to?: string }> ,
    default: () => []
  }
})
</script>

<style scoped>
.breadcrumbs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-soft);
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}
.breadcrumbs a {
  color: var(--accent);
  text-decoration: none;
}
.breadcrumbs span {
  color: var(--text-soft);
}
</style>
