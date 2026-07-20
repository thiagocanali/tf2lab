<template>
  <button type="button" class="back-button" @click="goBack">
    <span class="arrow">←</span>
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  label: { type: String, default: 'Voltar' },
  fallback: { type: String, default: '/' }
})

const router = useRouter()
const canBack = ref(false)

onMounted(() => {
  canBack.value = window.history.length > 1
})

const goBack = async () => {
  if (canBack.value) {
    router.back()
  } else {
    await router.push(props.fallback)
  }
}
</script>

<style scoped>
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
  font-weight: 700;
}

.back-button:hover {
  transform: translateX(-1px);
  background: rgba(255, 79, 60, 0.14);
  border-color: rgba(255, 79, 60, 0.28);
}

.arrow {
  font-size: 1.1rem;
}
</style>
