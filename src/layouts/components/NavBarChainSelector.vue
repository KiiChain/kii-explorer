<script setup lang="ts">
import { useBlockchain } from '@/stores/useBlockchain';
import { computed, ref } from 'vue';

const chain = useBlockchain();

let chainFilters = ref<string[]>(["kii", "kiichain"])

function handleSelectedChainFilter(event: Event) {
  const target = event.target as HTMLSelectElement
  window.location.replace(`${window.location.protocol}/${target.value}`)
}

const selectedChain = computed(() => chain.current?.chainName)

</script>

<template>
  <div class="tooltip tooltip-bottom delay-1000">
    <select @change="handleSelectedChainFilter($event)" class="select select-bordered">
      <option v-for="chainFilter in chainFilters" :key="chainFilter" :value="chainFilter"
        :selected="chainFilter === selectedChain">
        {{ chainFilter }}
      </option>
    </select>
  </div>
</template>
