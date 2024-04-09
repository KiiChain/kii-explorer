<template>
    <div class="flex items-center">
      <button
        :class="{ 'bg-blue-500': isActive, 'bg-gray-200': !isActive }"
        @click="toggle"
        class="relative inline-flex flex-shrink-0 h-6 w-12 border-2 border-transparent rounded-full cursor-pointer transition-colors focus:outline-none"
      >
        <span
          :class="{ 'translate-x-6': isActive, 'translate-x-0': !isActive }"
          class="pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
        ></span>
      </button>
      <span class="ml-2 text-green-500">{{ label }}</span>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      value: {
        type: Boolean,
        required: true,
      },
      label: {
        type: String,
        default: "",
      },
    },
    computed: {
      isActive: {
        get() {
          return this.value;
        },
        set(value) {
          this.$emit("input", value);
        },
      },
    },
    methods: {
      toggle() {
        this.isActive = !this.isActive;
      },
    },
  };
  </script>