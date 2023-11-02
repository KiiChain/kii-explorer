<script lang="ts" setup>
import { computed, ref } from '@vue/reactivity';
import { useBaseStore, useBlockchain, useFormatter } from '@/stores';
import { PageRequest, type AuthAccount, type Pagination, type Coin } from '@/types';
import { onMounted } from 'vue';
import PaginationBar from '@/components/PaginationBar.vue';
const props = defineProps(['chain']);

const format = useFormatter();
const chainStore = useBlockchain()

const list = ref([] as Coin[])
// TODO: remove mock
const mockBarCount = Array(20).fill(null).map((_v, i) => Math.floor(Math.random() * (100 - 1 + 1)) + 1);

function showType(v: string) {
  return v.replace("/cosmos.auth.v1beta1.", "")
}

const pageRequest = ref(new PageRequest())
const pageResponse = ref({} as Pagination)

onMounted(() => {
  pageload(1)
});

function pageload(p: number) {
  pageRequest.value.setPage(p)
  chainStore.rpc.getBankSupply(pageRequest.value).then(x => {
    list.value = x.supply
    pageResponse.value = x.pagination
  });
}

</script>
<template>
  <div class="overflow-auto space-y-3">

    <div class="text-info font-bold text-lg">
      Bank Supply
    </div>

    <!-- TODO: Integrate -->
    <div class="relative overflow-auto flex gap-5 flex-nowrap w-full">
      <div class="h-1 w-full absolute bottom-1/3 linear-gradient-l-to-r-bg " />
      <div v-for="stat in mockBarCount" class="w-[135px] space-y-2">
        <div class="h-[170px] rounded-lg overflow-hidden relative bg-[#DDDBE4]">
          <div class="absolute bottom-0 left-0 right-0 linear-gradient-tl-to-br-bg" :style="`height: ${stat}%`" />
        </div>
        <div class="truncate w-full text-black dark:text-white">0x474d4495c2b5d4495c2b5d4495c2b5d</div>
      </div>
    </div>

    <!-- Table -->
    <div>
      <table class="table rounded bg-[#F9F9F9]">
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
        order: 17
      }
    }
  </route>
