<script lang="ts" setup>
import { computed, ref } from '@vue/reactivity';
import { useBankStore, useBaseStore, useBlockchain, useFormatter } from '@/stores';
import { PageRequest, type AuthAccount, type Coin, type DenomOwner } from '@/types';
import { onMounted } from 'vue';
import PaginationBar from '@/components/PaginationBar.vue';
// import { shortenAddress } from '@/libs/utils';
const props = defineProps(['chain']);

const format = useFormatter();
const chainStore = useBlockchain()
const bankStore = useBankStore();
const blockchain = useBlockchain();

const list = ref([] as Coin[])

function showType(v: string) {
  return v.replace("/cosmos.auth.v1beta1.", "")
}

const pageRequest = ref(new PageRequest())
const pageResponse = ref({} as any)
const topDenomOwners = ref([] as DenomOwner[]);
const allDenomOwners = ref([] as DenomOwner[]);

onMounted(async() => {
  const data = await bankStore.fetchTopDenomOwners(blockchain.current?.assets[0].base ?? '')
  topDenomOwners.value = data;

  pageload(1);

  const owners = await bankStore.fetchDenomOwners(blockchain.current?.assets[0].base ?? '')
  allDenomOwners.value = owners;
});

// console.log('allData', allData)
function pageload(p: number) {
  pageRequest.value.setPage(p)
  chainStore.rpc.getBankSupply(pageRequest.value).then(x => {
    list.value = x.supply
    pageResponse.value = x.pagination
  });
}

const topAccountHolders = computed(() => {
  const data = topDenomOwners.value;
  const supplyMax = list.value.find(item => item.denom === blockchain.current?.assets[0].base);

  if (Array.isArray(data)) {
    const topData = data.slice(0, 10).map((x) => {
      return {
        amount: (parseFloat(x.balance.amount)/ parseFloat(supplyMax?.amount ?? '0') * 100),
        address: x.address
      }
    });
    const otherData = data.slice(10, data.length);

    const otherDataTotal = otherData.reduce(
      (accumulator, x) => accumulator + parseFloat(x.balance.amount),
      0
    );

    const mergedData = [...topData, {
      amount: (otherDataTotal/ parseFloat(supplyMax?.amount ?? '0') * 100),
      address: 'Other accounts'
    }];

    return mergedData.filter(item => item.amount > 0);
  }

  return [];
});

const accountOwners = computed(() => {
  const data = allDenomOwners.value;
  const supplyMax = list.value.find(item => item.denom === blockchain.current?.assets[0].base);

  if (Array.isArray(data)) {

    return data.map((x) => {
      return {
        amount: x.balance.amount,
        percentage: (parseFloat(x.balance.amount)/ parseFloat(supplyMax?.amount ?? '0') * 100).toFixed(2),
        address: x.address
      }
    });
  }

  return [];
});


</script>
<template>
  <div class="overflow-auto space-y-3">

    <div class="text-info font-bold text-lg">
      Bank Supply
    </div>

    <div class="relative overflow-auto flex gap-5 flex-nowrap w-full">
      <div class="h-1 w-full absolute bottom-1/3 linear-gradient-l-to-r-bg "></div>
      <div v-for="(stat, index) in topAccountHolders" class="w-[135px] space-y-2" :key="'top-account-holders' + index">
        <div class="h-[170px] rounded-lg overflow-hidden relative bg-[#DDDBE4] dark:bg-black dark:border dark:border-info">
          <div class="absolute bottom-0 left-0 right-0 linear-gradient-tl-to-br-bg" :style="`height: ${stat.amount}%`" />
        </div>
        <div class="truncate w-full text-black dark:text-white">{{stat.address}}</div>
      </div>
    </div>

    <!-- Table -->
    <div>
      <table class="table rounded bg-[#F9F9F9] dark:bg-base100">
        <thead>
          <tr class="">
            <td class="text-info">WALLET ADDRESS</td>
            <td class="text-info">AMOUNT</td>
            <td class="text-info">% OF SUPPLY</td>
          </tr>
        </thead>
        <tr v-for="(item, index) in accountOwners" class="border-y-solid border-y-1 border-[#EAECF0]" :key="'account-owners' + index">
          <td class="py-4 text-info font-bold">{{ item.address }}</td>
          <td class="py-4">{{ item.amount }}</td>
          <td class="py-4">{{ item.percentage }}%</td>
        </tr>
      </table>
    </div>

    <PaginationBar :limit="pageRequest.limit" :total="pageResponse.total" :callback="pageload" />
  </div>
</template>

<route>
    {
      meta: {
        i18n: 'supply',
        order: 17,
        icon: 'solar:shop-bold'
      }
    }
  </route>
