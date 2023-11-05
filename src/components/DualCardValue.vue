<script setup lang="ts">
import { Icon } from '@iconify/vue';

interface Props {
    icon?: string;
    title?: string;
    value?: string;
    subValue?: string;
    title2?: string;
    value2?: string;
    subValue2?: string;
}

defineProps<Props>();

</script>

<template>
    <div class="bg-white dark:bg-base-100 shadow-md rounded-lg p-4 h-fit xl:h-[95px] flex gap-2 divide-x flex-col xl:flex-row">
        <div class="flex-1 flex flex-col xl:flex-row gap-2">
            <div
                class="linear-gradient-tl-to-br-bg flex items-center justify-center h-12 w-12 xl:h-full xl:w-fit aspect-square linear-gradient-tl-to-br-bg rounded">
                <Icon :icon="icon" class="text-3xl text-white" />
            </div>
            <div class="h-full flex flex-col justify-between">
                <div class="text-gray-400 font-semibold">{{ title }}</div>
                <div class="flex items-center gap-2">
                    <div class="font-bold text-3xl">{{ value }}</div>
                    <div v-if="subValue?.length" class="text-gray-500 text-lg">{{ subValue }}</div>
                </div>
            </div>
        </div>

        <div class="flex-1 flex gap-2 xl:text-right">
            <div class="xl:ml-auto h-full flex flex-col justify-between">
                <div class="text-gray-400 font-semibold">{{ title }}</div>
                <div class="flex items-center gap-2">
                    <div class="font-bold text-3xl">{{ value }}</div>
                    <div v-if="subValue?.length" class="text-gray-500 text-lg">{{ subValue }}</div>
                </div>
            </div>
        </div>
    </div>
</template>
