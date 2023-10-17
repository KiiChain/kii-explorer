<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import {
  useDashboard,
  LoadingStatus,
  type ChainConfig,
} from '@/stores/useDashboard';
import ChainSummary from '@/components/ChainSummary.vue';
import { computed, ref } from 'vue';
import { useBlockchain } from '@/stores';

const dashboard = useDashboard();

const keywords = ref('');
const chains = computed(() => {
  if (keywords.value) {
    return Object.values(dashboard.chains).filter(
      (x: ChainConfig) => x.chainName.indexOf(keywords.value) > -1
    );
  } else {
    return Object.values(dashboard.chains);
  }
});
const chainStore = useBlockchain()
</script>
<template>
  <div class="h-full w-full relative">
    <img class="absolute inset-0 m-auto z-[1]" src="../assets/images/svg/gradient-1.svg" />
    <div class="w-full h-full flex flex-col items-center justify-center relative z-[2]">
      <div class="flex md:!flex-row flex-col items-center justify-center mb-6 mt-14 gap-2 ">
        <div class="w-36 rounded-full">
          <img class="w-full" src="../assets/logo.svg" />
        </div>
      </div>
      <div class="text-center text-neutral max-w-[50%]">
        <p class="mb-1 text-xl w-full">
          {{ $t('pages.slogan') }}
        </p>
      </div>
      <div v-if="dashboard.status !== LoadingStatus.Loaded" class="flex justify-center">
        <progress class="progress progress-info w-80 h-1"></progress>
      </div>

      <div class="flex items-center rounded-lg bg-base-100 dark:bg-base100 mt-10 p-2 rounded-xl max-w-md w-full">
        <Icon icon="mdi:magnify" class="text-2xl text-gray-400 ml-3" />
        <input :placeholder="$t('pages.search_placeholder')"
          class="px-4 h-10 bg-transparent flex-1 outline-none text-neutral" v-model="keywords" />
        <div class="px-4 text-neutral hidden md:!block">{{ chains.length }}/{{ dashboard.length }}</div>
      </div>

      <div class="flex gap-2 w-full items-center justify-center w-full my-5 flex-wrap">
        <ChainSummary v-for="(chain, index) in chains" :key="index" :name="chain.chainName" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.logo path {
  fill: #171d30;
}
</style>
