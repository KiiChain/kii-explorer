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
  <div class="bg-white dark:bg-base100 shadow-md rounded-lg p-4 h-auto md:h-fit xl:!h-[95px] flex gap-2 flex-col xl:!flex-row">
    <div
      class="linear-gradient-tl-to-br-bg flex items-center justify-center aspect-square linear-gradient-tl-to-br-bg rounded h-12 w-12 xl:!h-full xl:!w-fit aspect-square">
      <Icon :icon="icon || ''" class="text-3xl text-white" />
    </div>
    <div class="h-full flex flex-col md:justify-between flex-nowrap min-w-[0px]">
      <div class="text-gray-400 font-semibold w-full truncate">{{ title }}</div>
      <div class="flex flex-col md:!flex-row md:items-center md:gap-2 ">
        <div class="font-bold text-2xl truncate">{{ value }}</div>
        <div v-if="subValue?.length" class="truncate">{{ subValue }}</div>
        <div v-if="subValueSuffix?.length" class="text-success truncate">{{ subValueSuffix }}</div>
      </div>
    </div>
  </div>
</template>
