<script lang="ts" setup>
import ApexCharts from 'vue3-apexcharts';
import { computed } from 'vue';
import { useBaseStore } from '@/stores';
import { getLineChartConfig } from './apexChartConfig';

const props = defineProps(['series', 'labels']);

const baseStore = useBaseStore();

const data = computed(() => ([{
  name: "Transactions",
  data: props.series.map((item: any) => item.data)
}]))

const transactionHistoryChartConfig = computed(() => {
  const theme = baseStore.theme;
  return getLineChartConfig(theme, props?.labels);
});
</script>

<template>
  <ApexCharts type="line" height="275" :options="transactionHistoryChartConfig" :series="data" />
</template>

<script lang="ts">
export default {
  name: 'LineChart',
};
</script>
