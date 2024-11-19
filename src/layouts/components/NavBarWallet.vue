<script setup lang="ts">
import { useBaseStore, useBlockchain, useWalletStore } from '@/stores';
import { Icon } from '@iconify/vue';
import { ref, computed, onMounted } from 'vue';
import { createWalletClient, custom } from 'viem'
import { addressEnCode } from '@/libs';
import { fromHex } from '@cosmjs/encoding';
import { testnet } from '@/libs/web3';
import router from '@/router';

if (!(window as any).ethereum) {
  router.push('/install-metamask')
}

const walletStore = useWalletStore();
const chainStore = useBlockchain();
const baseStore = useBaseStore();
// walletStore.$subscribe((m, s) => {
//   console.log(m, s);
// });

const isKiichain = computed(() => {
  return chainStore.chainName === 'kiichain'
});

async function walletStateChange(res?: any) {
  let walletVal = res?.detail?.value

  if(isKiichain.value || !res){
    const client = createWalletClient({
      chain: testnet,
      transport: custom((window as any).ethereum),
    })

    try{
      await client.switchChain({ id: testnet.id }) 
    }
    catch(err){
      await client.addChain({ chain: testnet })
    }

    // @ts-ignore
    const accounts = await client.requestAddresses() 
    const kiiAddress = addressEnCode('kii', fromHex(accounts[0].replace('0x','')))
    walletVal = {
      cosmosAddress: kiiAddress,
      hdPath: "m/44'/118/0'/0/0",
      wallet: "Metamask"
    }
  }
  
  walletStore.setConnectedWallet(walletVal);
  await walletStore.loadMyAsset()
}

let showCopyToast = ref(0);
async function copyAdress(address: string) {
  try {
    await navigator.clipboard.writeText(address);
    showCopyToast.value = 1;
    setTimeout(() => {
      showCopyToast.value = 0;
    }, 1000);
  } catch (err) {
    showCopyToast.value = 2;
    setTimeout(() => {
      showCopyToast.value = 0;
    }, 1000);
  }
}
const tipMsg = computed(() => {
  return showCopyToast.value === 2
    ? { class: 'error', msg: 'Copy Error!' }
    : { class: 'success', msg: 'Copy Success!' };
});
const handleWalletSelect = async (event: any) => {
  const checkMark = event.target;
  
  if (checkMark) {
    // Find the parent <li> element
    const walletItem = checkMark.closest('li');
    
    // Get the wallet name from the <p> element inside the <li>
    const walletName = walletItem?.querySelector('p').textContent.trim();
    
    // Log the selected wallet's name
    if (walletName === 'Metamask') {
      await walletStateChange()
    }
  }
}
</script>

<template>
  <div class="dropdown dropdown-hover dropdown-end">
    <label tabindex="0" class="btn btn-sm btn-primary m-1 lowercase truncate !inline-flex text-xs md:!text-sm hover:text-black dark:hover:text-white">
      <Icon icon="mdi:wallet" />
      <span class="ml-1 hidden md:block">
        {{ walletStore.shortAddress || 'Wallet' }}</span>
    </label>
    <div tabindex="0"
      class="dropdown-content menu shadow p-2 bg-base-100 dark:bg-base100 rounded w-52 md:!w-64 overflow-auto shadow-2xl">
      <label v-if="!walletStore?.currentAddress" @click="walletStateChange" for="PingConnectWallet" class="btn btn-sm btn-primary hover:text-black dark:hover:text-white">
        <Icon icon="mdi:wallet" /><span class="ml-1 block">Connect Wallet</span>
      </label>
      <div class="px-2 mb-1 text-gray-500 dark:text-gray-400 font-semibold">
        {{ walletStore.connectedWallet?.wallet }}
      </div>
      <div>
        <a v-if="walletStore.currentAddress"
          class="block py-2 px-2 hover:bg-gray-100 dark:hover:bg-[#353f5a] rounded cursor-pointer"
          style="overflow-wrap: anywhere" @click="copyAdress(walletStore.currentAddress)">
          {{ walletStore.currentAddress }}
        </a>
        <div class="divider mt-1 mb-1"></div>
        <RouterLink to="/wallet/accounts">
          <div class="block py-2 px-2 hover:!bg-gray-100 hover:text-black rounded cursor-pointer">Accounts</div>
        </RouterLink>
        <RouterLink to="/wallet/portfolio">
          <div class="block py-2 px-2 hover:!bg-gray-100  hover:text-black rounded cursor-pointer">Portfolio</div>
        </RouterLink>
        <div v-if="walletStore.currentAddress" class="divider mt-1 mb-1"></div>
        <a v-if="walletStore.currentAddress"
          class="block py-2 px-2 hover:bg-gray-100 dark:hover:bg-[#353f5a] rounded cursor-pointer"
          @click="walletStore.disconnect()">Disconnect</a>
      </div>
    </div>
    <div class="toast" v-show="showCopyToast === 1">
      <div class="alert alert-success">
        <div class="text-xs md:!text-sm">
          <span>{{ tipMsg.msg }}</span>
        </div>
      </div>
    </div>
    <div class="toast" v-show="showCopyToast === 2">
      <div class="alert alert-error">
        <div class="text-xs md:!text-sm">
          <span>{{ tipMsg.msg }}</span>
        </div>
      </div>
    </div>
  </div>
  <Teleport to="body">
    <div :class="isKiichain || walletStore.wallet.wallet === 'Metamask'?'hidden':''">
      <ping-connect-wallet :chain-id="baseStore.currentChainId" :hd-path="chainStore.defaultHDPath"
      :addr-prefix="chainStore.current?.bech32Prefix || 'cosmos'" @connect="walletStateChange"
      @click="handleWalletSelect"
      @keplr-config="walletStore.suggestChain()" />
    </div>
    
  </Teleport>
</template>
<script lang="ts">
export default {
  name: 'NavBarWallet'
}
</script>

<style>
.ping-connect-btn,
.ping-connect-dropdown {
  display: none !important;
}
</style>
