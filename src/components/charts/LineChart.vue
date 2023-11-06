<script lang="ts" setup>
import ApexCharts from 'vue3-apexcharts';
import { computed } from 'vue';
import { useBaseStore } from '@/stores';
import { getLineChartConfig } from './apexChartConfig';

const props = defineProps(['series', 'labels']);

const baseStore = useBaseStore();

const transactionHistoryChartConfig = computed(() => {
  const theme = baseStore.theme;
  return getLineChartConfig(theme, props?.labels);
});
</script>

<template>
  <ApexCharts type="line" height="210" :options="transactionHistoryChartConfig" :series="series" />
</template>

<script lang="ts">
export default {
  name: 'LineChart',
};
</script>
