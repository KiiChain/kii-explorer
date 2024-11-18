<script setup>
import { sendV3 } from '@/libs/ethers';
import { getWalletBalance } from '@/libs/web3';
import { useBlockchain, useWalletStore } from '@/stores';
import { ref, computed, onMounted } from 'vue';

const showModal = ref(false);

// Form fields
const recipient = ref('');
const amount = ref(0);
const selectedToken = ref('');
const evmWalletBalance = ref(null);
const loading = ref(false);
const errorMessage = ref('');

// Computed to check if the wallet is Metamask
const walletStore = useWalletStore();
const isMetamask = computed(() => walletStore.connectedWallet?.wallet === 'Metamask');

const blockchain = useBlockchain();

onMounted(async () => {
  if (isMetamask.value) {
    evmWalletBalance.value = await getWalletBalance(
      blockchain.current?.assets[0].base ?? '',
    );
  }
});

// Handle Send Transaction
const handleSend = async () => {
  if (!recipient.value || !amount.value) {
    errorMessage.value = 'Please fill in all fields.';
    return;
  }

  try {
    loading.value = true;
    errorMessage.value = '';
    await sendV3(recipient.value, amount.value);
    showModal.value = false;
  } catch (error) {
    console.error(error);
    errorMessage.value = `Transaction failed: ${error.message}`;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <!-- Button to Open Modal -->
  <button
    class="btn bg-radial-gradient-base-duo bg-base-100 dark:bg-base-100 text-white w-full"
    @click="showModal = true"
  >
    Send
  </button>

  <!-- Modal -->
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="modal-box relative p-5 bg-white dark:bg-gray-800 w-[90%] max-w-md rounded shadow-lg">
      <!-- Close Button -->
      <button
        class="btn btn-sm btn-circle absolute right-4 top-4"
        @click="showModal = false"
      >
        ✕
      </button>

      <!-- Modal Header -->
      <h3 class="text-lg font-bold capitalize dark:text-gray-300 mb-4">Send</h3>

      <!-- Modal Body -->
      <div>
        <!-- Token Selection -->
        <!-- <div class="form-control">
          <label class="label">
            <span class="label-text dark:text-gray-400">Balances</span>
          </label>
          <select
            v-model="selectedToken"
            class="select select-bordered dark:text-white"
          >
            <option value="">Select a token</option>
            <option
              v-for="(balance, index) in evmWalletBalance ? [evmWalletBalance] : []"
              :key="index"
              :value="balance.denom"
            >
              {{ balance.amount }} {{ balance.denom }}
            </option>
          </select>
        </div> -->

        <!-- Recipient Field -->
        <div class="form-control mt-4">
          <label class="label">
            <span class="label-text dark:text-gray-400">Recipient (0x)</span>
          </label>
          <input
            type="text"
            v-model="recipient"
            placeholder="Enter recipient address"
            class="input border border-gray-300 dark:border-gray-600 dark:text-white"
          />
        </div>

        <!-- Amount Field -->
        <div class="form-control mt-4">
          <label class="label">
            <span class="label-text dark:text-gray-400">Amount (in KII)</span>
          </label>
          <input
            type="number"
            v-model="amount"
            placeholder="Enter amount to send"
            class="input border border-gray-300 dark:border-gray-600 w-full dark:text-white"
          />
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="text-red-500 mt-4">
          {{ errorMessage }}
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-action mt-6">
        <button
          class="btn btn-primary w-full"
          :disabled="loading"
          @click="handleSend"
        >
          {{ loading ? 'Sending...' : 'Send' }}
        </button>
      </div>
    </div>
  </div>
</template>
