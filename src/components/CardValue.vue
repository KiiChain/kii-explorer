<script setup lang="ts">
import { Icon } from '@iconify/vue';

interface Props {
  title?: string;
  value?: string;
  icon?: string;
  subValue?: string;
  subValueSuffix?: string;
}

defineProps<Props>();

</script>

<template>
  <div class="bg-white shadow-md rounded-lg p-4 h-[95px] flex gap-2">
    <div
      class="linear-gradient-tl-to-br-bg flex items-center justify-center h-full aspect-square linear-gradient-tl-to-br-bg rounded">
      <Icon :icon="icon" class="text-3xl text-white" />
    </div>
    <div class="h-full flex flex-col justify-between">
      <div class="text-gray-400 font-semibold">{{ title }}</div>
      <div class="flex items-center gap-2">
        <div class="font-bold text-3xl">{{ value }}</div>
        <div v-if="subValue?.length">{{ subValue }}</div>
        <div v-if="subValueSuffix?.length" class="text-success">{{ subValueSuffix }}</div>
      </div>
    </div>
  </div>
</template>
