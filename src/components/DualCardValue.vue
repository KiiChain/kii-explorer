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
    <div
        class="shadow-md p-4 h-auto md:h-fit flex gap-2 flex-col xl:!flex-row text-white">
        <div class="flex-1 flex flex-col xl:!flex-row gap-2 brand-gradient-border">
            <!-- <div v-if="icon"
                class="linear-gradient-tl-to-br-bg flex items-center justify-center h-12 w-12 xl:!h-full xl:!w-fit aspect-square linear-gradient-tl-to-br-bg rounded">
                <Icon :icon="icon" class="text-3xl text-white" />
            </div> -->
            <div class="h-full flex flex-col justify-between min-w-[0px] bg-radial-gradient-base-duo bg-base-100 dark:bg-base-100 text-white w-full py-2 px-4">
                <div class="text-white font-semibold truncate ">{{ title }}</div>
                <div class="flex flex-col md:!flex-row md:items-center md:gap-2">
                    <div class="font-bold text-3xl truncate">{{ value }}</div>
                    <div v-if="subValue?.length" class="text-white text-lg truncate">{{ subValue }}</div>
                </div>
            </div>
        </div>

        <div class="flex-1 flex gap-2 brand-gradient-border">
            <div class="h-full flex flex-col justify-between min-w-[0px] bg-radial-gradient-base-duo bg-base-100 dark:bg-base-100 text-white w-full py-2 px-4">
                <div class="text-white font-semibold truncate">{{ title2 }}</div>
                <div class="flex flex-col md:!flex-row md:items-center md:gap-2">
                    <div class="font-bold text-3xl truncate">{{ value2 }}</div>
                    <div v-if="subValue?.length" class="text-white text-lg truncate">{{ subValue2 }}</div>
                </div>
            </div>
        </div>
    </div>
</template>
