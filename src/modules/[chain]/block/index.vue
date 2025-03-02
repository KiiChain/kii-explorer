<script lang="ts" setup>
import { useBaseStore, useBlockchain, useFormatter, useWalletStore } from '@/stores';
import { computed, ref } from '@vue/reactivity';
import { onMounted } from 'vue';

import { convertKeys, toSnakeCase } from '@/libs/utils';
import type { Block, TxResponse } from '@/types';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

const tab = ref('blocks');

const baseStore = useBaseStore()
const blockchain = useBlockchain();
const walletStore = useWalletStore();

const format = useFormatter();

const transactionList = ref<TxResponse[]>([])
const blockList = ref<Block[]>([])
const loadingRecentBlocks = ref(true);
const loadingRecentTransactions = ref(true);

const currentChain = computed(() => {
    return blockchain.chainName
});

onMounted(async () => {
    if (currentChain.value === 'kiichain') {
        blockList.value = baseStore.getRecentBlocks;
        transactionList.value = baseStore.getRecentTxs;

        if (blockList.value.length === 0) {
            loadingRecentBlocks.value = true;
            await baseStore.fetchLatestEvmBlocks();
            blockList.value = baseStore.getRecentBlocks;
            loadingRecentBlocks.value = false;

            loadingRecentTransactions.value = true;
            transactionList.value = baseStore.getRecentTxs;
            loadingRecentTransactions.value = false;
        } else {
            loadingRecentBlocks.value = false;
            loadingRecentTransactions.value = false;
        }
    } else if (baseStore.isV3Metamask) {
        loadingRecentBlocks.value = true;
        await baseStore.fetchRecentBlocks();
        blockList.value = baseStore.getRecentBlocks;
        loadingRecentBlocks.value = false;

        loadingRecentTransactions.value = true;
        transactionList.value = await baseStore.fetchLatestEvmTxs();
        loadingRecentTransactions.value = false;
    } else {
        loadingRecentBlocks.value = true;
        await baseStore.fetchRecentBlocks();
        blockList.value = baseStore.recents;
        loadingRecentBlocks.value = false;

        const recentTxs = baseStore.txsInRecents;
        loadingRecentTransactions.value = true;
        transactionList.value = convertKeys(recentTxs, toSnakeCase);
        loadingRecentTransactions.value = false;

        const intervalId = setInterval(baseStore.fetchRecentBlocks, 60000); // Fetch transactions every minute
        return () => clearInterval(intervalId); // Clear interval on component unmount
    }
});

</script>
<template>
    <div>
        <div class="tabs tabs-boxed bg-transparent mb-4">
            <a class="tab text-gray-400 uppercase" :class="{ 'tab-active': tab === 'blocks' }"
                @click="tab = 'blocks'">{{ $t('block.recent') }}</a>
            <!-- <RouterLink class="tab text-gray-400 uppercase"
                :to="`/${chain}/block/${Number(baseStore.latest?.block?.header.height || 0) + 10000}`">{{ $t('block.future')
                }}
            </RouterLink> -->
            <a class="tab text-gray-400 uppercase" :class="{ 'tab-active': tab === 'transactions' }"
                @click="tab = 'transactions'">{{ $t('account.transactions') }}</a>
        </div>
        <div class="h-full w-full" v-if="loadingRecentBlocks">
            <div
                class="bg-transparent dark:bg-transparent px-5 py-5 text-white h-full w-full  flex justify-center items-center">
                <PulseLoader color="#fff" />
            </div>
        </div>
        <div v-show="tab === 'blocks'" class="grid xl:!grid-cols-6 md:!grid-cols-4 grid-cols-1 gap-3">

            <RouterLink v-for="(item, index) in blockList" class="flex flex-col justify-between rounded p-4 shadow bg-baseStore-100"
                :to="`/${currentChain}/block/${item.block.header.height}`" :key="'block-' + index">
                <div class="flex justify-between">
                    <h3 class="text-md font-bold sm:!text-lg">
                        {{ item.block.header.height }}
                    </h3>
                    <span class="rounded text-xs whitespace-nowrap font-medium text-green-600">
                        {{ format.toDay(item.block?.header?.time, 'from') }}
                    </span>
                </div>
                <div class="flex justify-between tooltip" data-tip="Block Proposor">
                    <div class="mt-2 hidden text-sm sm:!block truncate">
                        <span>{{ format.validator(item.block?.header?.proposer_address) }}</span>
                    </div>
                    <span class="text-right mt-1 whitespace-nowrap"> {{ item.block?.data?.txs.length }} txs </span>
                </div>
            </RouterLink>
        </div>

        <div v-show="tab === 'transactions'" class="bg-baseStore-100 rounded overflow-x-auto">
            <table class="table w-full table-compact">
                <thead class="bg-baseStore-200">
                    <tr>
                        <th style="position: relative; z-index: 2;">{{ $t('account.height') }}</th>
                        <th style="position: relative; z-index: 2;">{{ $t('account.hash') }}</th>
                        <!-- <th>{{ $t('account.messages') }}</th> -->
                        <th>{{ $t('block.fees') }}</th>
                        <th> Sender </th>
                        <th> Created At </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in transactionList" :index="index" class="hover" :key="'tl-' + index">
                        <td>
                            <RouterLink :to="`/${currentChain}/block/${item.height}`">{{ item.height }}</RouterLink>
                        </td>
                        <td>
                            <RouterLink :to="`/${currentChain}/tx/${item.txhash}`">{{
                                item.txhash
                            }}</RouterLink>
                        </td>
                        <!-- <td>{{ format.messages(item.tx.body.messages) }}</td> -->
                        <td>{{ item.tx.auth_info.fee.amount[0].amount }}</td>
                        <td>{{ item.tx.body.messages[0].from_address || item.from_address }}</td>
                        <td>{{ format.toDay(item.timestamp) }}</td>
                    </tr>
                </tbody>
            </table>
            <div class="p-4">
                <div class="alert relative bg-transparent">
                    <div class="alert  absolute inset-x-0 inset-y-0 w-full h-full bg-info opacity-10"></div>
                    <div class="text-info flex gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            class="stroke-current flex-shrink-0 w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>{{ $t('block.only_tx') }}</span>
                    </div>
                </div>
                <div class="h-full w-full" v-if="loadingRecentTransactions">
                    <div
                        class="bg-transparent dark:bg-transparent px-5 py-5 text-white h-full w-full  flex justify-center items-center">
                        <PulseLoader color="#fff" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<route>
    {
      meta: {
        i18n: 'blocks',
        order: 5,
        icon: 'bitcoin-icons:block-filled',
      }
    }
  </route>
