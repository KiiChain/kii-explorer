<template>
    <div class="flex items-center justify-center min-h-screen">
      <div class="bg-white p-6 rounded-lg shadow-lg text-center">
        <h1 class="text-2xl font-bold text-red-500 mb-4">MetaMask is not installed</h1>
        <p class="text-gray-700 mb-6">To interact with our site, you need to have MetaMask installed.</p>
        <a
          href="https://metamask.io/download"
          target="_blank"
          class="inline-block px-6 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-600"
        >
          Click here to install MetaMask
        </a>
      </div>
    </div>
  </template>
  
  <script>
import router from '@/router';

  export default {
    beforeMount() {
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
        router.push('/')
      }
    }
  }
  </script>
  
  <style scoped>
  /* Add any additional custom styles here */
  </style>
  <route lang="yaml">
    meta:
      layout: blank
    </route>
  