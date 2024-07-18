<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useBaseStore, useBlockchain, useFormatter } from '@/stores';
// @ts-ignore
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

const baseStore = useBaseStore();
const blockStore = useBlockchain();

const format = useFormatter();
const smartContracts = ref<any[] | undefined>([]);
const totalContracts = ref(0);
const currentPage = ref(0);
const loading = ref(false);
const itemsPerPage = 20;

const current = blockStore?.current?.chainName || '';
const isKiichain = current === "kiichain"

const latestSmartContracts = computed(() => {
    return baseStore.smartContracts;
});

const smartContractsCount = computed(() => {
    return baseStore.smartContractQuantity;
});

const fetchSmartContracts = async (page = 0) => {
    try {
        loading.value = true;
        smartContracts.value = baseStore.getSmartContracts;
        totalContracts.value = baseStore.smartContractQuantity;
        if (smartContracts.value.length == 0) {
            await baseStore.fetchSmartContracts(0)
            smartContracts.value = baseStore.getSmartContracts;
            totalContracts.value = baseStore.smartContractQuantity;
        }
        currentPage.value = page;
    } catch (error) {
        console.error('Error fetching smart contracts:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    try {
        await fetchSmartContracts();
    } catch (error) {
        console.error('Error fetching smart contracts:', error);
    }
});


const totalPages = computed(() => Math.ceil(smartContractsCount.value / itemsPerPage));

const nextPage = () => {
    if (currentPage.value < totalPages.value - 1) {
        fetchSmartContracts(currentPage.value + 1);
    }
};

const prevPage = () => {
    if (currentPage.value > 0) {
        fetchSmartContracts(currentPage.value - 1);
    }
};
</script>

<template>
    <div class="h-full w-full">
        <div v-if="isKiichain">
            <div class="brand-gradient-border w-fit my-4 hidden">
                <div class="btn bg-base-100 dark:bg-base-100 text-white w-fit border-none"
                    style="border-radius: 0 !important;">
                    {{ $t('cosmwasm.btn_contract') }}
                </div>
                <div class="btn bg-base-100 dark:bg-base-100 text-white w-fit border-none"
                    style="border-radius: 0 !important;">
                    {{ $t('account.address') }}
                </div>
                <div class="btn bg-radial-gradient-base-duo bg-base-100 dark:bg-base-100 text-white w-fit">
                    {{ $t('cosmwasm.btn_query') }}
                </div>
            </div>
            <div v-if="loading" class="brand-gradient-border h-full w-full">
                <div
                    class="bg-base-100 dark:bg-base100 px-5 py-5 text-white h-full w-full  flex justify-center items-center">
                    <PulseLoader color="#fff" />
                </div>
            </div>
            <div v-if="!loading" class="brand-gradient-border">
                <div class="bg-base-100 dark:bg-base100 px-5 py-5 text-white space-y-4">
                    <div class="overflow-x-auto">
                        <table class="table table-compact w-full mt-5">
                            <thead class="capitalize">
                                <tr>
                                    <td>{{ $t('smart_contracts.code_id') }}</td>
                                    <td>{{ $t('smart_contracts.code_hash') }}</td>
                                    <td>{{ $t('smart_contracts.creator') }}</td>
                                    <td>{{ $t('smart_contracts.permissions') }}</td>
                                    <td>{{ $t('smart_contracts.created_at') }}</td>
                                </tr>
                            </thead>
                            <tr v-for="(contract, i) in latestSmartContracts" :key="i" class="hover">
                                <td>
                                    <div class="truncate max-w-sm">
                                        {{ contract.BlockNumber }}
                                    </div>
                                </td>
                                <td class="text-green-500">
                                    <a :href="`/${current}/tx/${contract.transaction.hash}`">
                                        {{ contract.contractAddress }}
                                    </a>
                                </td>
                                <td>{{ contract.sender }}</td>
                                <td>
                                    <div class="max-w-sm">{{ contract.transaction.accessList?.join(',') }}</div>
                                </td>
                                <td>
                                    {{ format.toDay(contract.timestamp) }}
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div v-if="totalPages" class="flex justify-between items-center mt-4">
                        <button @click="prevPage" :disabled="currentPage === 0" class="btn btn-primary">
                            {{ $t('pagination.previous') }}
                        </button>
                        <span>{{ $t('pagination.page', { current: currentPage + 1, total: totalPages }) }}</span>
                        <button @click="nextPage" :disabled="currentPage === totalPages - 1" class="btn btn-primary">
                            {{ $t('pagination.next') }}
                        </button>
                    </div>
                    <div class="brand-gradient-border w-fit ml-auto hidden">
                        <div class="btn bg-radial-gradient-base-duo bg-base-100 dark:bg-base-100 text-white w-fit">
                            {{ $t('cosmwasm.btn_up_sc') }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="h-full w-full flex justify-center items-center">
            <div class="px-5 py-5 text-white bg-radial-gradient-base-duo border rounded-lg">
                <h1 class="text-xl font-bold">SWITCH TO KIICHAIN</h1>
                <p class="mt-2">Please switch your network to Kiichain to access this feature.</p>
            </div>
        </div>


    </div>
</template>
