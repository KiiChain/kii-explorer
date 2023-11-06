<script setup lang="ts">
// @ts-ignore
import { useWalletStore, useBlockchain } from '@/stores';
import CardValue from '@/components/CardValue.vue';
import DualCardValue from '@/components/DualCardValue.vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { Icon } from '@iconify/vue';
import { onMounted, ref } from 'vue';
import router from '@/router'

dayjs.extend(relativeTime);

const walletStore = useWalletStore();

let isFilterDropdownActive = ref(false);

let mockList = ref<any[]>([]);

const blockStore = useBlockchain();
let errorMessage = ref('');
let searchQuery = ref('');

onMounted(() => {});

function confirm() {
  errorMessage.value = '';
  const key = searchQuery.value;
  if (!key) {
    errorMessage.value = 'Please enter a value!';
    return;
  }
  const height = /^\d+$/;
  const txhash = /^[A-Z\d]{64}$/;
  const addr = /^[a-z\d]+1[a-z\d]{38,58}$/;

  const current = blockStore?.current?.chainName || '';
  const routeParams = router?.currentRoute?.value;

  if (!Object.values(routeParams?.params ?? '').includes(key)) {
    if (height.test(key)) {
      router.push({ path: `/${current}/block/${key}` });
    } else if (txhash.test(key)) {
      router.push({ path: `/${current}/tx/${key}` });
      //     this.$router.push({ name: 'transaction', params: { chain: c.chain_name, hash: key } })
    } else if (addr.test(key)) {
      router.push({ path: `/${current}/account/${key}` });
    } else {
      errorMessage.value = 'The input not recognized';
    }
  }
}

mockList.value = Array(15).fill(null).map((_v, i) => ({
  hash: Math.floor(Math.random() * (18499999 - 18400000 + 1) + 18400000),
  feeRecipient: 'resync builder',
  txnCount: Math.floor(Math.random() * (200 - 150 + 1) + 150),
  value: Math.floor(Math.random() * (0.09895 - 0.03595 + 1) + 0.03595),
}));

function toggleIsFilterDropdown() {
  isFilterDropdownActive.value = !isFilterDropdownActive.value;
}

</script>
<template>
  <div class="space-y-5">
    <div class="font-bold text-2xl">Welcome {{ walletStore.shortAddress }}</div>

    <!-- Search -->
    <div class="flex items-center rounded-lg bg-base-100 dark:bg-base100 p-2 rounded-xl w-full shadow">

      <!-- Search Filter Dropdown -->
      <!-- <div class="relative flex gap-2 items-center linear-gradient-tb-bg text-white rounded px-3 py-2 cursor-pointer"
        @click="toggleIsFilterDropdown">
        <Icon icon="icon-park-outline:setting-config" class="text-lg fill-white" />
        <div>All Filters</div>
        <Icon icon="mdi:chevron-up" class="text-lg fill-white transition-all ease-in-out"
          :class="!isFilterDropdownActive && 'rotate-180'" />
        <div v-if="isFilterDropdownActive"
          class="absolute -bottom-32 right-0 bg-white border rounded border-info text-black divide-y w-full">
          <div class="px-4 py-2 hover:bg-gray-100">Filter 1</div>
          <div class="px-4 py-2 hover:bg-gray-100">Filter 2</div>
          <div class="px-4 py-2 hover:bg-gray-100">Filter 3</div>
        </div>
      </div> -->

      <!-- Search Filter Input -->
      <input :placeholder="$t('pages.explore_search_placeholder')" 
        v-model="searchQuery"
        class="px-4 h-10 bg-transparent flex-1 outline-none text-neutral" />
      <!-- <div class="px-4 text-neutral hidden md:!block">{{ chains.length }}/{{ dashboard.length }}</div> -->

      <!-- Search Filter Magnify -->
      <div class="linear-gradient-tb-bg p-2 w-fit h-fit rounded-lg cursor-pointer">
        <Icon icon="mdi:magnify" class="text-2xl text-white" @click="confirm"/>
      </div>
    </div>
    <div
      class="mt-2 text-center text-sm text-error"
      v-show="errorMessage"
    >
      {{ errorMessage }}
    </div>

    <!-- Stats -->
    <div class="grid md:grid-cols-2 gap-2">
      <CardValue icon="cib:ethereum" title="ETHER PRICE" :value="`$${1999.34.toLocaleString()}`"
        sub-value="@ 0.0524735 BTC" sub-value-suffix="(+0.10%)" />
      <CardValue icon="material-symbols:globe" title="MARKET CAP" :value="`$${215187658132.00.toLocaleString()}`" />

      <DualCardValue icon="uil:transaction" title="TRANSACTIONS" :value="`$${2456.89.toLocaleString()}`"
        sub-value="(12.3 TPS)" title2="MED GAS PRICE" value2="21 Gwei" :sub-value2="`$${0.67.toLocaleString()}`" />

      <DualCardValue icon="clarity:block-solid" title="LAST FINALIZED BLOCK" :value="`$${125745680.00.toLocaleString()}`"
        title2="LAST SAFE BLOCK" :value2="`${45615498.00.toLocaleString()}`" />
    </div>

    <!-- Tables -->
    <!-- <div class="flex gap-2">
      <table class="table rounded bg-[#F9F9F9] dark:bg-base100 shadow">
        <thead>
          <tr class="">
            <td colspan="3" class="text-info">LATEST BLOCKS</td>
          </tr>
        </thead>
        <tr v-for="item in mockList" class="border-y-solid border-y-1 border-[#EAECF0]">
          <td class="py-4">
            <div class="flex gap-3 items-center">
              <div class="p-2 rounded-full bg-base-300">
                <Icon icon="mingcute:paper-line" class="text-lg" />
              </div>
              <div>
                <div class=" text-info font-bold">{{ item.hash }}</div>
                <div class="text-gray-500">{{ dayjs().fromNow() }}</div>
              </div>
            </div>
          </td>
          <td class="py-4">
            <div>
              <span class=" text-black dark:text-white">Fee Recipient </span>
              <span class=" text-info font-semibold">{{ item.feeRecipient }}</span>
            </div>
            <div class="text-gray-500">{{ item.txnCount }} in 12 secs</div>
          </td>
          <td class="py-4 text-info font-semibold">{{ `${item.value.toFixed(6)}` }} ETH</td>
        </tr>
      </table>

      <table class="table rounded bg-[#F9F9F9] dark:bg-base100 shadow">
        <thead>
          <tr class="">
            <td colspan="3" class="text-info">LATEST BLOCKS</td>
          </tr>
        </thead>
        <tr v-for="item in mockList" class="border-y-solid border-y-1 border-[#EAECF0]">
          <td class="py-4">
            <div class="flex gap-3 items-center">
              <div class="p-2 rounded-full bg-base-300">
                <Icon icon="mingcute:paper-line" class="text-lg" />
              </div>
              <div>
                <div class=" text-info font-bold">{{ item.hash }}</div>
                <div class="text-gray-500">{{ dayjs().fromNow() }}</div>
              </div>
            </div>
          </td>
          <td class="py-4">
            <div>
              <span class=" text-black dark:text-white">From: </span>
              <span class=" text-info font-semibold">0X1F9090E6723IX99</span>
            </div>
            <div>
              <span class=" text-black dark:text-white">To: </span>
              <span class=" text-info font-semibold">0XCM12M3N4U584292</span>
            </div>
          </td>
          <td class="py-4 text-info font-semibold">{{ `${item.value.toFixed(6)}` }} ETH</td>
        </tr>
      </table>

    </div> -->

  </div>
</template>
