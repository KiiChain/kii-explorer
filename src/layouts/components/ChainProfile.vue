<script setup lang="ts">
import { useBlockchain, useBaseStore, type Endpoint } from '@/stores';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import kiiChainLogo from '@/assets/logo-kiichain.svg';

const chainStore = useBlockchain();
const baseStore = useBaseStore();
chainStore.initial();
const router = useRouter();
function changeEndpoint(item: Endpoint) {
  chainStore.setRestEndpoint(item);
  if (chainStore.current) router.push(`/${chainStore.current.chainName}`);
}
const isDarkMode = computed(() => baseStore.theme === 'dark');

</script>

<template>
  <div class="dropdown">
    <label tabindex="0" class="flex items-center">
      <div class="p-1 relative mr-3 cursor-pointer">
        <div v-if="chainStore.logo && chainStore.logo !== ''">
          <img v-lazy="kiiChainLogo" alt="" class="h-9" />
          <!-- <img v-if="isDarkMode"  v-lazy="chainStore.altLogo" alt="" class="w-9 h-9 rounded-full" /> -->
          <!-- <img v-if="!isDarkMode" v-lazy="chainStore.logo" alt="" class="w-9 h-9 rounded-full" /> -->
        </div>
        <div
          class="w-2 h-2 rounded-full bg-yes absolute right-0 bottom-0 shadow"
        ></div>
      </div>
      <div class="flex-1 w-0 hidden">
        <div
          :key="
            baseStore.latest?.block?.header?.height ||
            chainStore.chainName ||
            ''
          "
          class="capitalize whitespace-nowrap text-base font-semibold text-gray-600 dark:text-gray-200 hidden md:!block"
        >
          #{{
            baseStore.latest?.block?.header?.height ||
            chainStore.chainName ||
            ''
          }}
        </div>
        <div
          class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap hidden md:!block"
        >
          {{ chainStore.connErr || chainStore.endpoint.address }}
        </div>
      </div>
    </label>
    <div
      tabindex="0"
      class="dropdown-content -left-6 w-80 menu shadow bg-base-100 rounded-box overflow-auto shadow-2xl"
    >
      <!-- rest -->
      <div
        class="px-4 py-2 text-sm text-gray-400"
        v-if="chainStore.current?.endpoints?.rest"
      >
        Rest Endpoint
      </div>
      <div
        v-for="(item, index) in chainStore.current?.endpoints?.rest"
        class="px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-[#384059] cursor-pointer"
        :key="index"
        @click="changeEndpoint(item)"
      >
        <div class="flex flex-col">
          <div class="flex items-center justify-between w-full">
            <div class="text-gray-500 dark:text-gray-200 capitalize">
              {{ item.provider }}
            </div>
            <span
              v-if="item.address === chainStore.endpoint?.address"
              class="bg-yes inline-block h-2 w-2 rounded-full"
            />
          </div>
          <div class="text-gray-400 text-xs whitespace-nowrap">
            {{ item.address }}
          </div>
        </div>
      </div>

      <!-- rest -->
      <div class="px-4 py-2 text-sm text-gray-400">Information</div>
      <div class="w-full">
        <div class="py-2 px-4">
          Chain Id: {{ baseStore.currentChainId }}
        </div>
        <div class="py-2 px-4">
          Height: {{ baseStore.latest.block?.header.height }}
        </div>
      </div>
      <!-- bottom-->
      <div class="px-4 py-2">&nbsp;</div>
    </div>
  </div>
</template>
