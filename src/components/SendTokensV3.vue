<script setup>
import { sendV3 } from '@/libs/ethers';
import { getWalletBalance } from '@/libs/web3';
import { useBlockchain, useWalletStore } from '@/stores';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter(); // Access Vue Router for redirection

const showModal = ref(false);
const progress = ref(0);
const transactionSubmitted = ref(false);
const progressMessage = ref("Processing...");
const processingCompleted = ref(false); // Track whether processing is completed

// Form fields
const recipient = ref('');
const amount = ref(0);
const evmWalletBalance = ref(null);
const loading = ref(false);
const errorMessage = ref('');
const transactionHash = ref('');

// Computed to check if the wallet is Metamask
const walletStore = useWalletStore();
const isMetamask = computed(() => walletStore.connectedWallet?.wallet === 'Metamask');

const blockchain = useBlockchain();

const updateProgress = (value, message) => {
  progress.value = value;
  progressMessage.value = message || "Processing...";
  if (value === 100) {
    processingCompleted.value = true; // Mark processing as completed
    progressMessage.value = "Completed";
  }
};

onMounted(async () => {
  if (isMetamask.value) {
    evmWalletBalance.value = await getWalletBalance(
      blockchain.current?.assets[0].base ?? '',
    );
  }
});

// Reset all modal state
const resetModal = () => {
  showModal.value = false;
  progress.value = 0;
  transactionSubmitted.value = false;
  progressMessage.value = "Processing...";
  processingCompleted.value = false;
  recipient.value = '';
  amount.value = 0;
  errorMessage.value = '';
  transactionHash.value = '';
  loading.value = false;
};

// Handle Send Transaction
const handleSend = async () => {
  if (!recipient.value || !amount.value) {
    errorMessage.value = 'Please fill in all fields.';
    return;
  }

  try {
    loading.value = true;
    errorMessage.value = '';
    transactionSubmitted.value = true;
    processingCompleted.value = false; // Reset processing status

    const txHash = await sendV3(recipient.value, amount.value, updateProgress);
    transactionHash.value = txHash?.hash; // Save transaction hash
    progress.value = 100; // Mark progress as complete

  } catch (error) {
    console.error(error.message);
    // Extract the relevant message
    const errorMessageExtracted =
      error?.info?.error?.message || // Extract the message from the nested object
      error.message || // Fallback to the direct error message
      'An unknown error occurred.'; // Default message

    errorMessage.value = `Transaction failed: ${errorMessageExtracted}`;
  } finally {
    loading.value = false;
    await walletStore.myEvmBalance();
  }
};

// Navigate to transaction details page
const viewTransactionDetails = () => {
  if (transactionHash.value) {
    router.push(`/${blockchain.chainName}/tx/${transactionHash.value}`); // Navigate to /[hash]/tx
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
    <div class="modal-box relative p-5 bg-gray-900 w-[90%] max-w-md rounded shadow-lg">
      <!-- Close Button -->
      <button
        class="btn btn-sm btn-circle absolute right-4 top-4 text-white"
        @click="resetModal"
      >
        ✕
      </button>

      <!-- Modal Header -->
      <h3 class="text-lg font-bold text-white mb-4">Send</h3>

      <div v-if="transactionSubmitted">
        <!-- Progress Bar -->
        <p class="text-white mb-2">{{ progressMessage }}</p>
        <div class="w-full bg-gray-700 rounded h-2.5">
          <div
            class="bg-green-500 h-2.5 rounded"
            :style="{ width: progress + '%' }"
          ></div>
        </div>
        <p class="text-white mt-2">{{ progress }}%</p>

        <!-- View Transaction -->
        <div
          v-if="processingCompleted && transactionHash"
          class="flex items-center justify-center mt-4"
        >
          <button
            class="text-green-400 underline"
            @click="viewTransactionDetails"
          >
            View Transaction
          </button>
        </div>
      </div>

      <!-- Transaction Form -->
      <div v-else>
        <!-- Recipient Field -->
        <div class="form-control mt-4">
          <label class="label">
            <span class="label-text text-gray-400">Recipient (0x)</span>
          </label>
          <input
            type="text"
            v-model="recipient"
            placeholder="Enter recipient address"
            class="input border border-gray-600 bg-gray-800 text-white"
          />
        </div>

        <!-- Amount Field -->
        <div class="form-control mt-4">
          <label class="label">
            <span class="label-text text-gray-400">Amount (in KII)</span>
          </label>
          <input
            type="number"
            v-model="amount"
            placeholder="Enter amount to send"
            class="input border border-gray-600 bg-gray-800 text-white"
          />
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="text-red-500 mt-4">
          {{ errorMessage }}
        </div>

        <!-- Send Button -->
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
  </div>
</template>
