<script setup lang="ts">

import { Icon } from '@iconify/vue';
import galaxyBg from '@/assets/images/pages/competition-galaxy-bg.png';
import laptop from '@/assets/images/pages/competition-laptop.png';
import pillars from '@/assets/images/pages/competition-pillars.png';
import kiiExLogo from '@/assets/images/pages/competition-kiiex-logo.png';
import kiiExLogo2 from '@/assets/images/pages/competition-kiiex-logo-2.png';

</script>

<template>
  <div class="h-full">
    <div class="space-y-5 grow bg-no-repeat bg-cover relative" v-bind:style="{
      backgroundImage: 'url(' + galaxyBg + ')',
      height: 'calc(100% + 20px)'
    }">
      <div class="text-center mx-auto my-auto absolute inset-0 h-fit w-fit z-30 pb-[20%] space-y-4">
        <div class="font-bold text-6xl">The <soan class="text-transparent bg-clip-text linear-gradient-tb-bg-4">Global KII
          </soan> Competition</div>
        <div class="font-semibold text-2xl shadow">Compete At A World Class Level</div>
        <div class="font-bold text-xl px-4 py-2 bg-white rounded-full w-fit mx-auto">
          <span class="text-transparent bg-clip-text linear-gradient-tb-bg-2 uppercase">Start Now!</span>
        </div>
      </div>
      <img class="absolute bottom-0 opacity-50" :src="pillars" />
      <img class="absolute -bottom-[65px] w-[80%] left-0 right-0 mx-auto" :src="laptop" />

      <div class="absolute bottom-0 px-6 py-4 rounded-xl ml-[16%] border border-white/20 backdrop-blur-sm">
        <div class="relative space-y-2">
          <div class="text-2xl font-semibold text-white mr-12">All in with</div>
          <div><img :src="kiiExLogo" /></div>
          <div class="absolute right-0 bottom-0">
            <Icon icon="carbon:circle-filled" />
          </div>
        </div>
      </div>

      <div
        class="absolute overflow-hidden -bottom-[5%] px-6 py-4 rounded-xl right-[16%] border border-white/20 backdrop-blur-sm">
        <div class="relative space-y-2">
          <div class="text-xl font-semibold text-white ml-12 text-right">
            <div v-for="text in ['Scalability', 'Connectivity', 'Simplicity']" class="flex gap-2 items-center">
              <div class="w-2 h-2 rounded-full bg-white linear-gradient-tb-bg-2" /> {{ text }}
            </div>
          </div>
          <img :src="kiiExLogo2" class="absolute -bottom-[50%] -left-[30%] w-[50%]" />
          <div class="absolute left-0 top-0">
            <Icon icon="carbon:circle-filled" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<route>
    {
      meta: {
        i18n: 'competition',
        order: 3,
        icon: 'material-symbols:trophy'
      }
    }
  </route>
