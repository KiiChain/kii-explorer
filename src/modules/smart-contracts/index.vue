<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useBaseStore, useFormatter } from '@/stores';
// @ts-ignore
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
// import { SmartContract } from '@/types';

const baseStore = useBaseStore();

const format = useFormatter();
const smartContracts = ref<any[] | undefined>([]);
const totalContracts = ref(0);
const currentPage = ref(0);
const loading = ref(false);
const itemsPerPage = 10;

const fetchSmartContracts = async (page = 0) => {
    try {
        loading.value = true;
        const response = await baseStore.fetchSmartContracts(page, itemsPerPage);
        smartContracts.value = response.smartContracts;
        totalContracts.value = response.quantity;
        currentPage.value = page;
    } catch (error) {
        console.error('Error fetching smart contracts:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchSmartContracts();
});

const totalPages = computed(() => Math.ceil(totalContracts.value / itemsPerPage));

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
    <div class="brand-gradient-border w-fit my-4">
        <div class="btn bg-base-100 dark:bg-base-100 text-white w-fit border-none" style="border-radius: 0 !important;">
            {{ $t('cosmwasm.btn_contract') }}
        </div>
        <div class="btn bg-base-100 dark:bg-base-100 text-white w-fit border-none" style="border-radius: 0 !important;">
            {{ $t('account.address') }}
        </div>
        <div class="btn bg-radial-gradient-base-duo bg-base-100 dark:bg-base-100 text-white w-fit">
            {{ $t('cosmwasm.btn_query') }}
        </div>
    </div>
    <div v-if="loading" class="brand-gradient-border h-full w-full">
        <div class="bg-base-100 dark:bg-base100 px-5 py-5 text-white h-full w-full  flex justify-center items-center">
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
                        </tr>
                    </thead>
                    <tr v-for="(contract, i) in smartContracts" :key="i" class="hover">
                        <td>
                            <div class="truncate max-w-sm">
                                {{ contract.BlockNumber }}
                            </div>
                        </td>
                        <td class="text-green-500">{{ contract.transaction.chainId }}</td>
                        <td>{{ contract.sender }}</td>
                        <td>
                            <div class="max-w-sm">{{ contract.transaction.accessList?.join(',') }}</div>
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
            <div class="brand-gradient-border w-fit ml-auto">
                <div class="btn bg-radial-gradient-base-duo bg-base-100 dark:bg-base-100 text-white w-fit">
                    {{ $t('cosmwasm.btn_up_sc') }}
                </div>
            </div>
        </div>
    </div>
</template>