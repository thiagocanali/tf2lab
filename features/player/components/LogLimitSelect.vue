<template>
  <div class="log-limit" role="group" :aria-label="`Analyze last ${modelValue} logs`">
    <span class="log-limit__label">Logs analyzed</span>
    <div class="log-limit__pills">
      <button
        v-for="option in options"
        :key="option"
        type="button"
        class="log-limit__pill"
        :class="{ 'is-active': option === modelValue }"
        :aria-pressed="option === modelValue"
        @click="select(option)"
      >
        {{ option }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: number }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: number): void }>()

const options = [5, 10, 20, 50] as const

function select(value: number) {
  if (value === props.modelValue) return
  emit('update:modelValue', value)
}
</script>

<style scoped>
.log-limit {
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.45rem 0.55rem 0.45rem 1rem;
  border: 1px solid rgba(255, 79, 60, 0.18);
  border-radius: 999px;
  background: rgba(7, 8, 13, 0.55);
  box-shadow: var(--shadow-soft);
}

.log-limit__label {
  color: var(--text-muted);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
  white-space: nowrap;
}

.log-limit__pills {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.15rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.log-limit__pill {
  border: 0;
  background: transparent;
  color: var(--text-soft);
  font-weight: 700;
  font-size: 0.82rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
  min-width: 2.4rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.log-limit__pill:hover:not(.is-active) {
  color: var(--text);
  background: rgba(255, 79, 60, 0.12);
}

.log-limit__pill.is-active {
  background: linear-gradient(135deg, var(--tf2-red), var(--tf2-orange));
  color: #160807;
  box-shadow: 0 6px 18px rgba(255, 79, 60, 0.35);
  transform: translateY(-1px);
}

.log-limit__pill:focus-visible {
  outline: 2px solid var(--tf2-orange);
  outline-offset: 2px;
}

@media (max-width: 520px) {
  .log-limit {
    flex-wrap: wrap;
    padding: 0.5rem 0.7rem;
    border-radius: 18px;
  }
  .log-limit__pills {
    flex: 1;
    justify-content: space-between;
  }
}
</style>
