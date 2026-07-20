<template>
  <Card>
    <h3>Jogadores</h3>
    <DataTable :value="players" responsiveLayout="scroll">
      <Column field="name" header="Jogador" />
      <Column field="kills" header="Kills" />
      <Column field="deaths" header="Deaths" />
      <Column field="assists" header="Assists" />
      <Column field="damage" header="Damage" />
+    </DataTable>
  </Card>
</template>

<script setup lang="ts">
import type { PlayerStat } from '~/features/analytics/types'
const props = defineProps<{ players: PlayerStat[] }>()
</script>

<style scoped>
</style>
