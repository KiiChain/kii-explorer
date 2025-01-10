<script setup lang="ts">
// @ts-ignore
import DualCardValue from '@/components/DualCardValue.vue';
import {
  useBankStore,
  useBaseStore,
  useBlockchain,
  useFormatter,
  useWalletStore,
} from '@/stores';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { shortenAddress } from '@/libs/utils';
import { testnet } from '@/libs/web3';
import router from '@/router';
import type { Block, Coin, TxResponse } from '@/types';
import { Icon } from '@iconify/vue';
import { createPublicClient, http } from 'viem';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

dayjs.extend(relativeTime);

const walletStore = useWalletStore();
const format = useFormatter();
const blockStore = useBlockchain();
const baseStore = useBaseStore();
const bankStore = useBankStore();
const route = useRoute();
const selectedChain = route.params.chain || 'Testnet Oro';

let isFilterDropdownActive = ref(false);
const loading = ref(true);
let errorMessage = ref('');
let searchQuery = ref('');
let latestTransactions = ref<TxResponse[]>([]);
let gasPriceEvm = ref('');
let latestBlocks = ref<Block[]>([]);

const publicClient = createPublicClient({
  chain: testnet,
  transport: http(),
});

const transactionsCount = computed(() => {
  return baseStore.txsCount;
});

const currentWallet = computed(() => {
  return walletStore.connectedWallet?.wallet;
});

const getSubValue = computed(() => {
  switch (selectedChain) {
    case 'kii': {
      return `(10,000 TPS)`;
    }
    case 'kiichain': {
      return '';
    }
    case 'Testnet Oro': {
      return '';
    }
  }
});

const fetchTransactions = async () => {
  try {
    const gasPrice = await publicClient.getGasPrice();
    gasPriceEvm.value = gasPrice.toString();

    switch (selectedChain) {
      case 'kii': {
        const txCount = await blockStore.rpc.getTxsCount();
        baseStore.updateTxCount(txCount);
        baseStore.updateTx(await bankStore.fetchLatestTxs(txCount));
        break;
      }
      case 'Testnet Oro': {
        let latestTxs;
        let txCount;
        if (currentWallet.value === 'Metamask') {
          latestTxs = await bankStore.fetchLatestTxsEvm();
          txCount = latestTxs.quantity;
          latestTransactions.value = latestTxs.transactions;
        } else {
          txCount = await blockStore.rpc.getTxsCount();
          latestTxs = await bankStore.fetchLatestTxs(txCount);
          baseStore.updateTx(latestTxs);
          latestTransactions.value = baseStore.getRecentTxs.slice(0, 20);
        }

        latestBlocks.value = await baseStore.fetchLatestEvmBlocks();
        baseStore.updateTxCount(txCount);
        break;
      }
      case 'kiichain': {
        await baseStore.fetchLatestEvmBlocks();
        await baseStore.fetchLatestEvmTxs();
        break;
      }
    }
    // loading.value = false;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await baseStore.fetchRecentBlocks();
  await fetchTransactions();

  const fetchRecentBlocksInterval = setInterval(
    baseStore.fetchRecentBlocks,
    60000
  ); // Every minute
  const fetchTransactionsInterval = setInterval(fetchTransactions, 60000); // Every minute

  return () => {
    clearInterval(fetchRecentBlocksInterval);
    clearInterval(fetchTransactionsInterval);
  };
});

const getAmountEVM = (transaction: TxResponse): Coin => {
  const data = transaction.tx.body.messages[0].amount;
  const amount = Array.isArray(data) ? data[0].amount : data.amount || '0';
  const denom = Array.isArray(data) ? data[0].denom : data.denom || 'tkii';

  return {
    amount,
    denom,
  };
};

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
  const evmAddr = /^0x[a-fA-F0-9]{40}$/;
  const evmTxHash = /^0x[a-fA-F0-9]{64}$/;

  const current = blockStore?.current?.chainName || '';
  const routeParams = router?.currentRoute?.value;

  if (!Object.values(routeParams?.params ?? '').includes(key)) {
    if (height.test(key)) {
      router.push({ path: `/${current}/block/${key}` });
    } else if (txhash.test(key) || evmTxHash.test(key)) {
      router.push({ path: `/${current}/tx/${key}` });
      //     this.$router.push({ name: 'transaction', params: { chain: c.chain_name, hash: key } })
    } else if (addr.test(key) || evmAddr.test(key)) {
      router.push({ path: `/${current}/account/${key}` });
    } else {
      errorMessage.value = 'The input not recognized';
    }
  }
}
</script>

<template>
  <div class="space-y-5">
    <div class="font-bold text-2xl">
      {{
        walletStore.shortAddress ? `Welcome ${walletStore.shortAddress}` : ''
      }}
    </div>

    <!-- Search -->
    <div
      class="flex items-center rounded-lg bg-base-100 dark:bg-base100 p-2 rounded-xl w-full shadow"
    >
      <!-- Search Filter Input -->
      <input
        :placeholder="$t('pages.explore_search_placeholder')"
        v-model="searchQuery"
        class="px-4 h-10 bg-transparent flex-1 outline-none text-neutral dark:text-white"
      />
      <!-- <div class="px-4 text-neutral hidden md:!block">{{ chains.length }}/{{ dashboard.length }}</div> -->

      <!-- Search Filter Magnify -->
      <div
        class="linear-gradient-tb-bg p-2 w-fit h-fit rounded-lg cursor-pointer"
      >
        <Icon icon="mdi:magnify" class="text-2xl text-white" @click="confirm" />
      </div>
    </div>
    <div class="mt-2 text-center text-sm text-error" v-show="errorMessage">
      {{ errorMessage }}
    </div>

    <!-- Stats -->
    <div class="grid md:grid-cols-2 gap-2">
      <DualCardValue
        icon="ri:token-swap-line"
        title="KII PRICE"
        :value="`N/A (Testnet)`"
        sub-value-suffix="(+0.10%)"
        title2="GAS PRICE"
        :value2="'--'"
      />

      <DualCardValue
        icon="uil:transaction"
        title="TRANSACTIONS"
        :value="transactionsCount?.toString() ?? 0"
        :sub-value="getSubValue"
        title2="BLOCK HEIGHT"
        :value2="latestBlocks[0]?.block.header.height"
      />
    </div>

    <!-- Line Chart -->
    <!-- <div>
      <div
        class="px-12 py-6 bg-white shadow-lg rounded-lg space-y-2 dark:bg-base100"
      >
        <div>
          Transaction History in
          {{ transactionHistoryChartValue.labels.length }} days
        </div>
        <LineChart
          :series="transactionHistoryChartValue.series.reverse()"
          :labels="transactionHistoryChartValue.labels.reverse()"
        />
      </div>
    </div> -->

    <!-- Tables -->
    <div v-if="loading" class="h-full w-full">
      <div
        class="bg-transparent dark:bg-transparent px-5 py-5 text-white h-full w-full flex justify-center items-center"
      >
        <PulseLoader color="#fff" />
      </div>
    </div>
    <div v-if="!loading" class="grid grid-cols-2 gap-2 items-start">
      <table class="table rounded bg-[#F9F9F9] dark:bg-base100 shadow">
        <thead>
          <tr class="">
            <td colspan="3" class="text-info">LATEST BLOCKS</td>
          </tr>
        </thead>
        <tr
          v-for="(item, index) in latestBlocks"
          class="border-y-solid border-y-1 border-[#EAECF0]"
          :key="'latest-block' + index"
        >
          <td class="py-4">
            <div class="flex gap-3 items-center">
              <div class="p-2 rounded-full bg-base-300">
                <Icon icon="mingcute:paper-line" class="text-lg" />
              </div>
              <div>
                <RouterLink
                  :to="`/${selectedChain}/block/${item.block.header.height}`"
                  class="text-info font-bold"
                  >{{ item.block.header.height }}</RouterLink
                >
                <div class="text-gray-500">
                  {{ format.toDay(item.block?.header?.time, 'from') }}
                </div>
              </div>
            </div>
          </td>
          <td class="py-4">
            <div>
              <span class="text-black dark:text-white">Fee Recipient </span>
              <span class="text-info font-semibold">{{
                format.validator(item.block?.header?.proposer_address)
              }}</span>
            </div>
            <div class="text-gray-500">
              {{ item.block?.data?.txs.length }} txs
            </div>
          </td>
          <!-- <td class="py-4 text-info font-semibold"> {{ item.block?.data?.txs ? computeTx(item.block.data.txs) : 'No transactions' }}</td> -->
        </tr>
      </table>

      <table class="table rounded bg-[#F9F9F9] dark:bg-base100 shadow">
        <thead>
          <tr class="">
            <td colspan="3" class="text-info">LATEST TRANSACTIONS</td>
          </tr>
        </thead>
        <tr
          v-for="(item, index) in latestTransactions"
          class="border-y-solid border-y-1 border-[#EAECF0]"
          :key="'latest-transaction' + index"
        >
          <td class="py-4">
            <div class="flex gap-3 items-center">
              <div class="p-2 rounded-full bg-base-300">
                <Icon icon="mingcute:paper-line" class="text-lg" />
              </div>
              <div>
                <RouterLink
                  :to="`/${selectedChain}/tx/${item.txhash}`"
                  class="text-info font-bold"
                >
                  {{ shortenAddress(item.txhash, 15, 0) }}
                </RouterLink>
                <div class="text-gray-500">
                  {{ format.toDay(item.timestamp, 'from') }}
                </div>
              </div>
            </div>
          </td>
          <td class="py-4">
            <div class="flex justify-center space-x-1">
              <span class="text-black dark:text-white">From: </span>
              <span class="text-info font-semibold">{{
                shortenAddress(
                  item.tx.body.messages[0]['from_address'] || '',
                  20,
                  0
                )
              }}</span>
            </div>
            <div class="flex justify-center space-x-1">
              <span class="text-black dark:text-white">To: </span>
              <span class="text-info font-semibold">{{
                shortenAddress(
                  item.tx.body.messages[0]['to_address'] || '',
                  20,
                  0
                )
              }}</span>
            </div>
          </td>
          <td class="py-4 text-info font-semibold">
            {{ format.formatToken(getAmountEVM(item)) }}
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>
