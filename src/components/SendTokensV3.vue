<script setup>
import { ref } from 'vue';
import Modal from './Modal.vue';
import { sendV3 } from '@/libs/ethers';

const showModal = ref(false);
const address = ref('');
const amount = ref(0);
const denom = ref('');
const loading = ref(false);
const message = ref('');
const isSuccess = ref(false);

const handleSend = async () => {
  loading.value = true;
  message.value = '';
  try {
    await sendV3(address.value, denom.value, amount.value);
    isSuccess.value = true;
    message.value = 'Transaction sent successfully!';
  } catch (error) {
    isSuccess.value = false;
    console.log(error)
    message.value = `Transaction failed: ${error.message}`;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <button @click="showModal = true">Open Send Modal</button>

  <Modal :show="showModal" @close="showModal = false">
    <template #header>
      <h2>Send Transaction</h2>
    </template>
    
    <template #body>
      <form @submit.prevent="handleSend">
        <div class="form-group">
          <label for="address">Recipient Address</label>
          <input
            v-model="address"
            type="text"
            id="address"
            required
            placeholder="Enter recipient address"
          />
        </div>
        <div class="form-group">
          <label for="amount">Amount</label>
          <input
            v-model.number="amount"
            type="number"
            id="amount"
            required
            min="0"
            placeholder="Enter amount to send"
          />
        </div>
        <div class="form-group">
          <label for="denom">Denomination</label>
          <input
            v-model="denom"
            type="text"
            id="denom"
            required
            placeholder="Enter token denomination (e.g., 'atom')"
          />
        </div>
        
        <button type="submit" :disabled="loading">
          {{ loading ? "Sending..." : "Send" }}
        </button>
        
        <p v-if="message" :class="{ 'success': isSuccess, 'error': !isSuccess }">
          {{ message }}
        </p>
      </form>
    </template>

    <template #footer>
      <button class="modal-default-button" @click="showModal = false">Close</button>
    </template>
  </Modal>
</template>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button[type="submit"] {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button[type="submit"]:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

p.success {
  color: green;
}

p.error {
  color: red;
}
</style>
