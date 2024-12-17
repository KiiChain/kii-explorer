<script lang="ts" setup>
import { useBlockchain, useFormatter } from '@/stores';
import DynamicComponent from '@/components/dynamic/DynamicComponent.vue';
import { computed, ref } from '@vue/reactivity';
import type { Tx, TxResponse } from '@/types';
import JsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import { getEvmTransactionInfo } from '@/libs/web3';
import { formatEther } from 'viem';
import { decodeCertificationEvent } from '@/libs/ethers';

const props = defineProps(['hash', 'chain']);

const blockchain = useBlockchain();
const format = useFormatter();
const tx = ref(
  {} as {
    tx: Tx;
    tx_response: TxResponse;
  }
);
const evmTx = ref()
const isEvmTxHash = (props.hash.length === 66 && props.hash.includes('0x'))

if (props.hash) {
  // hex format hash
  if (isEvmTxHash) {
    getEvmTransactionInfo(props.hash).then((x) => (evmTx.value = x));
  } else {
    blockchain.rpc.getTx(props.hash).then((x) => (tx.value = x));
  }
}
const messages = computed(() => {
  return tx.value.tx?.body?.messages || [];
});

</script>
<template>
  <div>
    <div v-if="tx.tx_response || evmTx?.transactionHash"
      class="bg-base-100 dark:bg-base100 px-4 pt-3 pb-4 rounded shadow mb-4">
      <h2 class="card-title truncate mb-2">{{ $t('tx.title') }}</h2>
      <div class="overflow-auto-x">
        <table class="table text-sm">
          <tbody>
            <tr>
              <td>{{ $t('tx.tx_hash') }}</td>
              <td>{{ isEvmTxHash ? evmTx.transactionHash : tx.tx_response.txhash }}</td>
            </tr>
            <tr>
              <td>{{ $t('account.height') }}</td>
              <td>
                <RouterLink :to="`/${props.chain}/block/${tx.tx_response?.height || evmTx.blockNumber}`"
                  class="text-primary dark:invert">{{ tx.tx_response?.height || evmTx.blockNumber }}
                </RouterLink>
              </td>
            </tr>
            <tr>
              <td>{{ $t('staking.status') }}</td>
              <td>
                <div class="text-xs truncate relative py-2 px-4 w-fit mr-2 rounded" :class="`text-${((tx.tx_response?.code === 0) || (evmTx?.transactionHash)) ? 'success' : 'error'
                  }`">
                  <span class="inset-x-0 inset-y-0 opacity-10 absolute" :class="`bg-${((tx.tx_response?.code === 0) || (evmTx?.transactionHash)) ? 'success' : 'error'
                    }`"></span>
                  {{ ((tx.tx_response?.code === 0) || (evmTx?.transactionHash)) ? 'Success' : 'Failed' }}
                </div>
              </td>
            </tr>
            <tr :class="tx.tx_response?.timestamp ? '' : 'hidden'">
              <td>{{ $t('account.time') }}</td>
              <td>
                {{ format.toLocaleDate(tx.tx_response?.timestamp) }} ({{
                  format.toDay(tx.tx_response?.timestamp, 'from')
                }})
              </td>
            </tr>
            <tr>
              <td>{{ $t('tx.gas') }}</td>
              <td>
                {{ isEvmTxHash ? `${formatEther(evmTx.gasUsed)} KII` : `${tx.tx_response?.gas_used} /
                ${tx.tx_response?.gas_wanted}` }}
              </td>
            </tr>
            <tr :class="tx.tx?.auth_info?.fee?.amount ? '' : 'hidden'">
              <td>{{ $t('tx.fee') }}</td>
              <td>
                {{
                  format.formatTokens(
                    tx.tx?.auth_info?.fee?.amount,
                    true,
                    '0,0.[00]'
                  )
                }}
              </td>
            </tr>
            <tr :class="tx.tx?.body.memo ? '' : 'hidden'">
              <td>{{ $t('tx.memo') }}</td>
              <td>{{ tx.tx?.body.memo }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="tx.tx_response || evmTx?.transactionHash"
      class="bg-base-100 dark:bg-base100 px-4 pt-3 pb-4 rounded shadow">
      <!-- Show certificates -->
      <div
        v-if="evmTx && evmTx.logs && evmTx.logs.length > 0 && evmTx.logs[0].address === '0x0de23fd7d8e20ac01b68873557d6f9d655db83d3'">
        <h2 class="card-title truncate mb-2"> Certificate</h2>
        <div v-for="(item, index) of evmTx.logs" :key="index">
          <JsonPretty :data="decodeCertificationEvent(item.data)" />
        </div>
        <br>
      </div>

      <!-- Show the Receipt -->
      <h2 class="card-title truncate mb-2">JSON</h2>
      <JsonPretty :data="isEvmTxHash ? evmTx : tx" :deep="3" />

      <!-- Decode information  -->
      <!-- {{ console.log(evmTx.logs) }} -->
    </div>
  </div>
</template>
