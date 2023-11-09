<script setup lang="ts">

import { Icon } from '@iconify/vue';
import galaxyBg from '@/assets/images/pages/competition-galaxy-bg.png';
import laptop from '@/assets/images/pages/competition-laptop.png';
import pillars from '@/assets/images/pages/competition-pillars.png';
import kiiExLogo from '@/assets/images/pages/competition-kiiex-logo.png';
import kiiExLogo2 from '@/assets/images/pages/competition-kiiex-logo-2.png';
import discordLogo from '@/assets/images/misc/discord-logo.png';
import laptop2 from '@/assets/images/misc/laptop-2.png';
import competeImage from '@/assets/images/pages/competition-compete-image.png';
import { ref } from 'vue';

const earnInfoList = ref([
  {
    icon: 'icon-park-outline:setting-config',
    title: '+2,500 Tkii',
    description: 'Share the username of your friend who successfully signed up for this competition and we will airdrop the both of you +2,500 Tkii.'
  },
  {
    icon: 'icon-park-outline:setting-config',
    title: '+1,000 Tkii',
    description: 'Complete the weekly challenge on our telegram channel.'
  },
  {
    icon: 'tdesign:curve',
    title: '+5,000 Tkii',
    description: 'Any bugs or UI design flaws that you recommend and are implemented will be rewarded with tokens.'
  },
  {
    icon: 'tdesign:curve',
    title: '+5,000 Tkii',
    description: 'Share the username of your friend who successfully signed up for KIIEX and passed KYC.'
  }
]);


</script>

<template>
  <div class="h-full">

    <!-- 1st section -->
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

    <!-- 2nd section -->
    <div class="py-32 px-64 bg-base-100">
      <div class="space-y-2">
        <div class="text-5xl font-bold text-center">How do I earn Tkii and compete?</div>
        <div class="text-xl text-center">
          Once you have secured 10,000 Tkii, you can turn your node into a validator on <a
            href="https://www.kiitestexplorer.io" target="_blank">www.kiitestexplorer.io</a>. Name your validator after
          your
          favorite supercar for an extra +1,000 Tkii and share the name in the discord.
        </div>
      </div>

      <div class="flex flex-col items-center lg:justify-start lg:flex-row gap-12 mx-auto py-12">
        <div
          class="flex justify-center h-auto gap-2 w-full lg:w-[40%] items-center lg:items-start flex-wrap shrink-0 flex-row lg:flex-col">
          <div class="text-5xl text-transparent font-bold bg-clip-text linear-gradient-tb-bg-4">Start</div>
          <div>+2,500 Tkii available every 24 hours via the faucet in our Discord. </div>
          <div class="text-info">JOIN OUR DISCORD SERVER</div>
        </div>
        <div
          class="rounded-2xl overflow-hidden linear-gradient-tl-br-bg-2 relative shrink-0 w-full lg:w-[60%] aspect-[4/3] flex items-center justify-center">
          <img :src="laptop2" />
          <img class="absolute bottom-[40%] left-[10%] w-[18%] -rotate-[20deg]" :src="discordLogo" />
          <img class="absolute bottom-[65%] left-[25%] w-[8%] rotate-[20deg]" :src="discordLogo" />
          <img class="absolute bottom-[65%] left-[8%] w-[10%] -rotate-[15deg]" :src="discordLogo" />
        </div>
      </div>

      <div class="flex flex-col items-center lg:justify-start lg:flex-row gap-12 mx-auto py-12">
        <div
          class="flex justify-center h-auto gap- w-full lg:w-[40%] items-center lg:items-start flex-wrap shrink-0 flex-row lg:flex-col">
          <div class="text-5xl text-transparent font-bold bg-clip-text linear-gradient-tb-bg-4">Compete</div>
          <div>+2,000 Tkii: Following Kiiglobal on Twitter and Discord. 
            +1,000 Tkii: Retweeting our weekly pinned tweet with quote. </div>
          <div class="text-info">FOLLOW OUR TWITTER</div>
        </div>
        <div
          class="rounded-2xl overflow-hidden relative shrink-0 w-full lg:w-[60%] aspect-[4/3] flex items-center justify-center">
          <img :src="competeImage" />
        </div>
      </div>

      <div class="flex flex-col items-center lg:justify-start lg:flex-row gap-12 mx-auto py-12">
        <div
          class="flex justify-center h-auto gap-2 w-full lg:w-[40%] items-center lg:items-start flex-wrap shrink-0 flex-row lg:flex-col">
          <div class="text-5xl text-transparent font-bold bg-clip-text linear-gradient-tb-bg-4">Earn</div>
          <div>
            <div>
              How do I <span class="font-semibold">win</span>?
              <span class="font-semibold">Simple.</span> Whoever has the most <span class="font-semibold">Tkii</span> on
              their
              <span class="font-semibold">validator</span> at the end of the competition <span
                class="font-semibold">wins</span>.
            </div>

          </div>
          <div class="text-info">JOIN OUR DISCORD SERVER</div>
        </div>
        <div
          class="rounded-2xl linear-gradient-tb-bg-3 overflow-hidden relative shrink-0 w-full lg:w-[60%]  flex items-center justify-center px-8 py-12">
          <div class="grid grid-rows-4 grid-cols-1 xl:grid-rows-2 xl:grid-cols-2 gap-12 w-full h-full">
            <div v-for="earnInfo in earnInfoList" class="flex flex-col gap-2">
              <div class="text-white text-xl font-semibold flex items-center gap-2">
                <div class="p-1 bg-white rounded">
                  <Icon :icon="earnInfo.icon" class="text-base-200 " />
                </div>
                {{ earnInfo.title }}
              </div>
              <div class="text-white">
                {{ earnInfo.description }}
              </div>
            </div>
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
        icon: 'material-symbols:trophy',
        section: 2,
        weight: 'font-semibold'
      }
    }
  </route>
