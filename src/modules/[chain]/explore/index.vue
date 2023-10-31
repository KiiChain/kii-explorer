<script setup lang="ts">
// @ts-ignore
import { useWalletStore } from '@/stores';

const walletStore = useWalletStore();
</script>
<template>
    <div>
       <div class="font-bold text-2xl">Welcome {{ walletStore.shortAddress }}</div>
    </div>
</template>
<route>
    {
      meta: {
        i18n: 'explore',
        order: 1,
        icon: 'mdi:magnify'
      }
    }
</route> 
