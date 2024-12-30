<script lang="ts" setup>
import { ref } from 'vue';
import { type AccountEntry, isEvmAddress } from './utils';
import axios from 'axios';

const requestTokenMessage = ref('');
const requestTokenErrorMessage = ref('');
const walletAddress = ref('');
const enableButton = ref(true);

const conf = ref(
  JSON.parse(localStorage.getItem('imported-addresses') || '{}') as Record<
    string,
    AccountEntry[]
  >
);

async function requestTestnetTokens() {
  try {
    // Make API request
    const apiUrl = import.meta.env.VITE_APP_FAUCET_API_URL;
    const response = await axios.get(
      `${apiUrl}/faucet?address=${walletAddress.value}`
    );
    requestTokenMessage.value = response.data;

    // Clear the message after 5 seconds
    enableButton.value = false;
    setTimeout(() => {
      requestTokenMessage.value = '';
      enableButton.value = true;
    }, 5000); // 5000 milliseconds = 5 seconds
  } catch (error) {
    console.error('Error while requesting testnet tokens:', error);
    requestTokenErrorMessage.value = 'Error: Unable to request testnet tokens';
  }
}
</script>
<template>
  <div class="h-full w-full">
    <div
      class="w-full flex h-full"
      style="
        background: url('/assets/Coins.png') no-repeat,
          url('/assets/Coins.png') no-repeat;
        background-size: 50%;
        background-position: 75% -5%, 120% -5%;
      "
    >
      <div class="w-[40%] pl-4 flex justify-center flex-col">
        <div class="relative w-full">
          <img
            src="/assets/bg_radial_gradients.png"
            style="max-width: unset"
            class="z-[0] absolute top-0 -bottom-12 my-auto -left-24 right-0 mx-auto w-[110%]"
          />
          <h1
            style="
              font-family: 'Montserrat', sans-serif;
              font-size: 60px;
              font-weight: 600;
              line-height: 73.14px;
              background: radial-gradient(
                circle at bottom,
                #c0ffff 5%,
                #b8ffff 10%,
                #4f43a1 90%
              );
              -webkit-background-clip: text;
              background-clip: text;
              color: transparent;
              -webkit-text-fill-color: transparent;
            "
            class="mt-16 mb-8 z-[1] relative"
          >
            Welcome to<br />KiiChain's faucet
          </h1>
        </div>

        <div class="text-white my-4 pl-4">
          <div class="font-bold">How to use KiiChain's faucet</div>
          <ol style="list-style-type: decimal" class="my-4 px-4">
            <li>Set up your testnet wallet here</li>
            <li>Insert your wallet address</li>
            <li>Claim your KII</li>
          </ol>
        </div>

        <div class="text-white space-y-2 pl-4 w-2/3">
          <div class="font-bold">Wallet Address</div>

          <!-- Wallet address input -->
          <div class="brand-gradient-border-2">
            <input
              class="bg-base-100 dark:bg-base-100 w-full rounded text-white py-1 px-4"
              placeholder="Enter wallet address"
              v-model="walletAddress"
            />
          </div>

          <!-- Claim token button -->
          <div class="brand-gradient-border-2">
            <button
              @click="requestTestnetTokens"
              :disabled="!enableButton"
              class="btn btn-sm btn-primary hover:text-black dark:hover:text-white w-full"
            >
              Claim your tokens
            </button>
          </div>

          <!-- Faucet Answer Text -->
          <span class="text-yes">{{ requestTokenMessage }}</span>
          <span class="text-error">{{ requestTokenErrorMessage }}</span>
        </div>
      </div>
      <div
        class="grow"
        style="
          background: url('/assets/KII-Coin_1.png') no-repeat;
          background-position: center;
          background-size: contain;
        "
      />
    </div>
  </div>
</template>
