<script setup lang="ts">
// @ts-ignore
import { useWalletStore, useBlockchain, useBaseStore, useFormatter, useBankStore } from '@/stores';
import CardValue from '@/components/CardValue.vue';
import DualCardValue from '@/components/DualCardValue.vue';
import LineChart from '@/components/charts/LineChart.vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { Icon } from '@iconify/vue';
import { computed, onMounted, ref } from 'vue';
import router from '@/router'
import type {  Tx, TxResponse } from '@/types';
import { shortenAddress } from '@/libs/utils';

dayjs.extend(relativeTime);

const walletStore = useWalletStore();
const format = useFormatter();
const blockStore = useBlockchain();
const baseStore = useBaseStore();
const bankStore = useBankStore();

let isFilterDropdownActive = ref(false);

let errorMessage = ref('');
let searchQuery = ref('');
let latestTransactions = ref<TxResponse[]>([]);
let transactionsCount = ref(0);

onMounted(async() => {
  const data = await bankStore.fetchLatestTxs(blockStore.current?.assets[0].base ?? '')

  latestTransactions.value = data;

  transactionsCount.value = await blockStore.rpc.getTxsCount();
});

const latestBlocks = computed(() => {
    return baseStore.recents.reverse().slice(0, 20) 
})

function computeTx(items: Tx[]) {
  const initialDenom = blockStore.current?.assets[0].base ?? '';
  const total = items.reduce((accumulator, currentTx) => {
    const message = currentTx.body.messages[0];
    const messageAmount = Array.isArray(message.amount) ? message.amount[0] : message.amount;

    // Assuming denom is the same for all transactions, otherwise you'd need to handle varying denoms
    const denom = initialDenom;

    // Sum amounts as integers then convert back to string
    const amount = (parseInt(accumulator.amount) + parseInt(messageAmount.amount)).toString();
    
    return {
      denom, 
      amount 
    };
  }, { denom: initialDenom, amount: '0' });

  return format.formatToken(total);
}

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

function toggleIsFilterDropdown() {
  isFilterDropdownActive.value = !isFilterDropdownActive.value;
}

const transactionHistory = computed(() => {
  return latestTransactions?.value?.reduce((history, currentItem) => {
    const txDate = dayjs(currentItem.timestamp).format('MMM D YYYY');

    if (Object.keys(history).some((existingHistory: any) => dayjs(existingHistory.date).isSame(txDate, 'd'))) {
      history[txDate] = {
        tx: [...history[txDate].tx, currentItem]
      }
    } else {
      history[txDate] = {
        tx: [currentItem]
      }
    }
    return history;

  }, {} as any)
});

const transactionHistoryChartValue = computed(() => {
  const getAmount = (item: TxResponse) => {
    return Array.isArray(item.tx.body.messages[0]['amount'])
      ? item.tx.body.messages[0]['amount'][0]['amount']
      : item.tx.body.messages[0]['amount']['amount']
  }

  return {
    series: Object.values(transactionHistory?.value || {}).map((data: any) => ({
      data: data.tx.reduce((total: number, curr: any) => total = total + Number(getAmount(curr)), 0).toString(),
    })),
    labels: Object.keys(transactionHistory?.value || {})?.map((date: string) => dayjs(date).format('MMM D'))
  }
})

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
      <CardValue icon="cib:ethereum" title="KII PRICE" :value="`$${1999.34.toLocaleString()}`"
        sub-value="@ 0.0524735 BTC" sub-value-suffix="(+0.10%)" />
      <CardValue icon="material-symbols:globe" title="MARKET CAP" :value="`$${215187658132.00.toLocaleString()}`" />

      <DualCardValue icon="uil:transaction" title="TRANSACTIONS" :value="transactionsCount.toString()"
        sub-value="(10,000 TPS)" title2="MED GAS PRICE" value2="21 Gwei" :sub-value2="`$${0.67.toLocaleString()}`" />

      <DualCardValue icon="clarity:block-solid" title="LAST FINALIZED BLOCK" :value="`$${125745680.00.toLocaleString()}`"
        title2="LAST SAFE BLOCK" :value2="`${45615498.00.toLocaleString()}`" />
    </div>

    <!-- Line Chart -->
    <div>
      <div class="px-12 py-6 bg-white shadow-lg rounded-lg space-y-2 dark:bg-base100">
        <div>Transaction History in {{ transactionHistoryChartValue.labels.length }} days</div>
        <!-- <div class="flex items-center gap-2">
          <div class="text-2xl font-semibold">$ {{ 32.18.toLocaleString() }}</div>
          <div class="flex items-center">
            <Icon icon="mdi:chevron-up" /> <div>1.2 %</div>
          </div>
        </div> -->
        <LineChart :series="transactionHistoryChartValue.series.reverse()" :labels="transactionHistoryChartValue.labels.reverse()" />
      </div>
    </div>

    <!-- Tables -->
    <div class="grid grid-cols-2 gap-2 items-start">
      <table class="table rounded bg-[#F9F9F9] dark:bg-base100 shadow">
        <thead>
          <tr class="">
            <td colspan="3" class="text-info">LATEST BLOCKS</td>
          </tr>
        </thead>
        <tr v-for="item in latestBlocks" class="border-y-solid border-y-1 border-[#EAECF0]">
          <td class="py-4">
            <div class="flex gap-3 items-center">
              <div class="p-2 rounded-full bg-base-300">
                <Icon icon="mingcute:paper-line" class="text-lg" />
              </div>
              <div>
                <div class=" text-info font-bold">{{ item.block.header.height }}</div>
                <div class="text-gray-500">
                  {{ format.toDay(item.block?.header?.time, 'from') }}
                </div>
              </div>
            </div>
          </td>
          <td class="py-4">
            <div>
              <span class=" text-black dark:text-white">Fee Recipient </span>
              <span class=" text-info font-semibold">{{ format.validator(item.block?.header?.proposer_address) }}</span>
            </div>
            <div class="text-gray-500">{{ item.block?.data?.txs.length }} txs</div>
          </td>
          <td class="py-4 text-info font-semibold"> {{ item.block?.data?.txs ? computeTx(item.block.data.txs) : 'No transactions' }}</td>
        </tr>
      </table>

      <table class="table rounded bg-[#F9F9F9] dark:bg-base100 shadow">
        <thead>
          <tr class="">
            <td colspan="3" class="text-info">LATEST TRANSACTIONS</td>
          </tr>
        </thead>
        <tr v-for="item in latestTransactions" class="border-y-solid border-y-1 border-[#EAECF0]">
          <td class="py-4">
            <div class="flex gap-3 items-center">
              <div class="p-2 rounded-full bg-base-300">
                <Icon icon="mingcute:paper-line" class="text-lg" />
              </div>
              <div>
                <div class=" text-info font-bold">{{ shortenAddress(item.txhash, 15, 0) }}</div>
                <div class="text-gray-500"> {{ format.toDay(item.timestamp, 'from') }}</div>
              </div>
            </div>
          </td>
          <td class="py-4">
            <div class="flex justify-center space-x-1">
              <span class=" text-black dark:text-white">From: </span>
              <span class=" text-info font-semibold">{{ shortenAddress(item.tx.body.messages[0]['from_address'] || '', 20, 0) }}</span>
            </div>
            <div class="flex justify-center space-x-1">
              <span class=" text-black dark:text-white">To: </span>
              <span class=" text-info font-semibold">{{ shortenAddress(item.tx.body.messages[0]['to_address'] || '', 20, 0) }}</span>
            </div>
          </td>
          <td class="py-4 text-info font-semibold">
            {{ format.formatToken(
              Array.isArray(item.tx.body.messages[0]['amount']) 
                ? item.tx.body.messages[0]['amount'][0]
                :item.tx.body.messages[0]['amount']
            )}}
          </td>
        </tr>
      </table>

    </div>

  </div>
</template>
