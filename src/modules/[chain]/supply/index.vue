<script lang="ts" setup>
import { computed, ref } from '@vue/reactivity';
import { useBankStore, useBaseStore, useBlockchain, useFormatter } from '@/stores';
import { PageRequest, type AuthAccount, type Pagination, type Coin, type DenomOwner } from '@/types';
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
const pageResponse = ref({} as Pagination)
const topDenomOwners = ref([] as DenomOwner[]);

onMounted(async() => {
  const data = await bankStore.fetchTopDenomOwners(blockchain.current?.assets[0].base ?? '')

  topDenomOwners.value = data;
  pageload(1);
});

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
      console.log('x.balance.amount', x.balance.amount, supplyMax?.amount, (parseFloat(x.balance.amount)/ parseFloat(supplyMax?.amount ?? '0')))
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

    return [...topData, {
      amount: (otherDataTotal/ parseFloat(supplyMax?.amount ?? '0') * 100),
      address: 'Other accounts'
    }];
  }


  return [];
});

console.log('topAccountHolders', topAccountHolders)

</script>
<template>
  <div class="overflow-auto space-y-3">

    <div class="text-info font-bold text-lg">
      Bank Supply
    </div>

    <div class="relative overflow-auto flex gap-5 flex-nowrap w-full">
      <div class="h-1 w-full absolute bottom-1/3 linear-gradient-l-to-r-bg " />
      <div v-for="stat in topAccountHolders" class="w-[135px] space-y-2">
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
            <td class="text-info">Token</td>
            <td class="text-info">Amount</td>
          </tr>
        </thead>
        <tr v-for="item in list" class="border-y-solid border-y-1 border-[#EAECF0]">
          <td class="py-4 text-info font-bold">{{ item.denom }}</td>
          <td class="py-4">{{ item.amount }}</td>
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
