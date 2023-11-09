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
import planetGroup1 from '@/assets/images/misc/planet-group-1.png';
import planetsBg from '@/assets/images/misc/planets-bg.png';


import earnMoreImage1 from '@/assets/images/misc/coins-1.png';
import earnMoreImage2 from '@/assets/images/misc/planet-group-2.png';
import earnMoreImage3 from '@/assets/images/misc/planet-group-3.png';
import earnMoreImage4 from '@/assets/images/misc/diamond-box.png';

import signUpStepBg1 from '@/assets/images/misc/writer-male.png';
import signUpStepBg2 from '@/assets/images/misc/competition-su-step-2.png';
import signUpStepBg3 from '@/assets/images/misc/hand-with-pen.png';
import signUpStepBg4 from '@/assets/images/misc/bg-bars-1.png';

import laptop3 from '@/assets/images/misc/laptop-3.png';
import tablet1 from '@/assets/images/misc/tablet-1.png';

import footerBg from '@/assets/images/pages/competition-footer-bg.png';

import { computed, ref } from 'vue';
import { useBaseStore } from '@/stores';

const baseStore = useBaseStore();

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


const earnMoreCardsList = ref([
  {
    banner: earnMoreImage1,
    title: '+50,000 TKII',
    description: 'If your validator never goes down during the competition.'
  },
  {
    banner: earnMoreImage2,
    title: '+20,000 TKII',
    description: 'If your validator only fails once during the competition.'
  },
  {
    banner: earnMoreImage3,
    title: '+20,000 TKII',
    description: `If you're able to take down another validator by disrupting their server.`,
    hasCheckInBtn: true
  },
  {
    banner: earnMoreImage4,
    title: '+X TKII',
    description: 'Whoever you can convince to stake on your validator will help your chances at winning the competition.'
  }
]);


const rulesCardsList = ref([
  {
    icon: 'icon-park-outline:setting-config',
    title: 'Play Fair',
    description: 'No shilling, aggressive speech, or threats to any peers in the competition.'
  },
  {
    icon: 'icon-park-outline:setting-config',
    title: 'Show Proof',
    description: 'show proof of each task completed that earns your Tkii. Examples can be a screenshot of or an email to a friend before registration, etc.'
  },
  {
    icon: 'icon-park-outline:setting-config',
    title: 'Reminders',
    description: 'Mainnet coins airdropped must be dedicated to validating and cannot be sold. Rewards from your validator can be sold to fund operations.'
  },
]);

const rewardsTableData = ref([
  {
    rank: 1,
    amount: 150000,
    percentage: 15
  },
  {
    rank: 2,
    amount: 120000,
    percentage: 14
  },
  {
    rank: 3,
    amount: 9000,
    percentage: 13
  },
  {
    rank: 4,
    amount: 8000,
    percentage: 20
  },
  {
    rank: 5,
    amount: 7000,
    percentage: 20
  },
  {
    rank: 6,
    amount: 6000,
    percentage: 20
  },
  {
    rank: 7,
    amount: 5000,
    percentage: 20
  },
  {
    rank: 8,
    amount: 4000,
    percentage: 20
  },
  {
    rank: 9,
    amount: 3000,
    percentage: 20
  },

]);

const isDarkMode = computed(() => baseStore.theme === 'dark');

</script>

<template>
  <div class="h-full text-white">

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
        class="absolute overflow-hidden bottom-2 px-6 py-4 rounded-xl right-[16%] border border-white/20 backdrop-blur-sm">
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
    <div class="py-32 px-6 lg:!px-64 bg-base-100 text-black dark:text-white">
      <div class="space-y-2">
        <div class="text-5xl font-bold text-center">How do I earn Tkii and compete?</div>
        <div class="text-xl text-center">
          Once you have secured 10,000 Tkii, you can turn your node into a validator on <a
            href="https://www.kiitestexplorer.io" target="_blank">www.kiitestexplorer.io</a>. Name your validator after
          your
          favorite supercar for an extra +1,000 Tkii and share the name in the discord.
        </div>
      </div>

      <div class="flex flex-col items-center lg:!justify-start lg:!flex-row gap-12 mx-auto py-12">
        <div
          class="flex flex-col lg:!flex-row justify-center h-auto gap-2 w-full lg:!w-[40%] items-center lg:!items-start flex-wrap shrink-0">
          <div class="text-5xl text-transparent font-bold bg-clip-text linear-gradient-tb-bg-4">Start</div>
          <div>+2,500 Tkii available every 24 hours via the faucet in our Discord. </div>
          <div class="text-info">JOIN OUR DISCORD SERVER</div>
        </div>
        <div
          class="rounded-2xl overflow-hidden linear-gradient-tl-br-bg-2 relative shrink-0 w-full lg:!w-[60%] aspect-[4/3] flex items-center justify-center">
          <img :src="laptop2" />
          <img class="absolute bottom-[40%] left-[10%] w-[18%] -rotate-[20deg]" :src="discordLogo" />
          <img class="absolute bottom-[65%] left-[25%] w-[8%] rotate-[20deg]" :src="discordLogo" />
          <img class="absolute bottom-[65%] left-[8%] w-[10%] -rotate-[15deg]" :src="discordLogo" />
        </div>
      </div>

      <div class="flex flex-col items-center lg:!justify-start lg:!flex-row gap-12 mx-auto py-12">
        <div
          class="flex flex-col lg:!flex-row justify-center h-auto gap- w-full lg:!w-[40%] items-center lg:!items-start flex-wrap shrink-0">
          <div class="text-5xl text-transparent font-bold bg-clip-text linear-gradient-tb-bg-4">Compete</div>
          <div>+2,000 Tkii: Following Kiiglobal on Twitter and Discord.
            +1,000 Tkii: Retweeting our weekly pinned tweet with quote.</div>
          <div class="text-info">FOLLOW OUR TWITTER</div>
        </div>
        <div
          class="rounded-2xl overflow-hidden relative shrink-0 w-full lg:!w-[60%] aspect-[4/3] flex items-center justify-center">
          <img :src="competeImage" />
        </div>
      </div>

      <div class="flex flex-col items-center lg:!justify-start lg:!flex-row gap-12 mx-auto py-12">
        <div
          class="flex flex-col lg:!flex-row justify-center h-auto gap-2 w-full lg:!w-[40%] items-center lg:!items-start flex-wrap shrink-0">
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
          class="rounded-2xl linear-gradient-tb-bg-3 overflow-hidden relative shrink-0 w-full lg:!w-[60%]  flex items-center justify-center px-8 py-12">
          <div class="grid grid-rows-4 grid-cols-1 lg:!grid-rows-2 lg:!grid-cols-2 gap-12 w-full h-full">
            <div v-for="earnInfo in earnInfoList" class="flex flex-col gap-2">
              <div class="text-white text-xl font-semibold flex items-center gap-2">
                <div class="p-1 bg-white rounded">
                  <Icon :icon="earnInfo.icon" class="text-base200 " />
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

    <!-- 3rd section -->
    <div class="py-32 px-6 lg:!px-64 space-y-2 bg-no-repeat text-black dark:text-white" v-bind:style="{
      backgroundImage: isDarkMode ? 'url(' + planetGroup1 + ')' : '',
      backgroundSize: '42%',
      backgroundPositionY: '90%',
      backgroundPositionX: '-10%'
    }">
      <div class="text-xl uppercase">
        Test Coins
      </div>
      <div class="text-5xl font-bold">How to <span class="text-transparent bg-clip-text linear-gradient-tb-bg-3">Earn
          More</span> Coins</div>
      <div class="text-xl">
        As a validator you can earn more b testing and receive test coins below are ways on how you can earn more test
        coins.
      </div>
      <div class="bg-no-repeat">
        <div
          class="grid grid-cols-2 lg:!grid-rows-2 gap-12 lg:!ml-auto w-full h-full my-32" :class="{
            'lg:!w-1/2': isDarkMode
          }">
          <div v-for="earnCard in earnMoreCardsList" class="flex flex-col gap-4 rounded-lg p-6 dark:p-0 shadow-lg dark:shadow-none">
            <div class="bg-contain bg-no-repeat h-[50px]" v-bind:style="{
              backgroundImage:  isDarkMode ? 'url(' + earnCard.banner + ')' : '',
              backgroundSize: 'auto 50px'
            }" />
            <div class="text-2xl font-semibold flex items-center gap-2">
              {{ earnCard.title }}
            </div>
            <div class="text-lg">
              {{ earnCard.description }}
            </div>
            <div v-if="earnCard.hasCheckInBtn">
              <div class="font-bold text-md px-8 py-2 rounded-full w-fit linear-gradient-tb-bg text-white mt-8">
                CHECK IN
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>



    <!-- 4th section -->
    <div class="py-32 px-6 lg:!px-64 flex flex-col gap-y-2 bg-cover bg-no-repeat text-black dark:text-white" v-bind:style="{
      backgroundImage: isDarkMode ? 'url(' + planetsBg + ')' : '',
    }">

      <div class="space-y-6 mb-32">
        <div class="text-4xl font-bold text-center">Are There More <span class="text-info">Rules?</span>
        </div>
        <div class="flex flex-col lg:!flex-row justify-center gap-2 text-black min-h-[0px]">
          <div v-for="ruleCard in rulesCardsList"
            class="flex flex-col gap-2 p-6 bg-light-purple rounded-lg flex-1 h-auto">
            <div class=" text-xl font-semibold flex items-center gap-2">
              <div class="p-1 bg-violet rounded">
                <Icon :icon="ruleCard.icon" class="text-white " />
              </div>
              {{ ruleCard.title }}
            </div>
            <div class="">
              {{ ruleCard.description }}
            </div>
          </div>
        </div>
      </div>

      <div class="text-4xl font-bold text-center">How To Sign Up?</div>
      <div class="text-center">Once you have completed each task, we will airdrop your +5,000 Tkii to begin.</div>

      <div class="grid grid-rows-2 grid-cols-1 lg:!grid-cols-12 gap-2">

        <div class="lg:!col-span-5 bg-no-repeat p-6 bg-base200 rounded-lg gap-2 space-y-3 shadow-lg dark:shadow-none" v-bind:style="{
          backgroundImage: isDarkMode ? 'url(' + signUpStepBg1 + ')' : '',
          backgroundSize: '30%',
          backgroundPositionY: '50%',
          backgroundPositionX: '90%'
        }">
          <div class="text-xl font-semibold">Step 1</div>
          <div class="w-2/3 text-md">
            Sign up for an account on KIIEX and pass KYC verification (settings -> verification -> level 1). Important to
            note that your email address and username will be your main point of reference.
          </div>
        </div>

        <div class="lg:!col-span-7 bg-cover bg-no-repeat p-6 bg-base200 rounded-lg shadow-lg dark:shadow-none" v-bind:style="{
          backgroundImage: isDarkMode ? 'url(' + signUpStepBg2 + ')' : '',
        }">
          <div class="text-xl font-semibold">Step 1</div>
          <div class="w-2/3 text-md">
            Sign up for an account on KIIEX and pass KYC verification (settings -> verification -> level 1). Important to
            note that your email address and username will be your main point of reference.
          </div>
        </div>

        <div class="lg:!col-span-6 bg-no-repeat p-6 bg-base200 rounded-lg shadow-lg dark:shadow-none" v-bind:style="{
          backgroundImage: isDarkMode ? 'url(' + signUpStepBg3 + ')' : '',
          backgroundSize: '30%',
          backgroundPositionY: '120%',
          backgroundPositionX: '105%'
        }">
          <div class="text-xl font-semibold">Step 3</div>
          <div class="w-2/3 text-md">
            Sign our electronic user agreement stating that coins received in mainnet will be dedicated to your
            validator. 
          </div>
        </div>

        <div class="lg:!col-span-6 bg-no-repeat p-6 bg-base200 rounded-lg shadow-lg dark:shadow-none" v-bind:style="{
          backgroundImage: isDarkMode ? 'url(' + signUpStepBg4 + ')' : '',
          backgroundSize: '60%',
          backgroundPositionY: '100%',
          backgroundPositionX: '105%'
        }">
          <div class="text-xl font-semibold">Step 4</div>
          <div class="w-2/3 text-md">
            Drop your KIIEX username on our discord channel “Validator competition” stating “My username is “X” and I'm
            signing up for the Kii Blockchain Validator competition. My wallet address will be “X”.
          </div>
        </div>
      </div>

      <div>
        <div class="flex flex-col lg:!flex-row mt-64 gap-12">
          <div class="flex flex-col gap-y-2 grow order-2 lg:!order-1">
            <div class="text-4xl font-bold" >What are the dates?</div>
            <div>The competition will begin November 1st, 2023. On January 15th, 2024 we will stop the competition and the
              final grid will be assigned. Shortly after, we will airdrop tokens in Mainnet for validating. Tokens will be
              airdropped before day 1 listing on CEX or DEX&amp;s with ample time to set up your validators in mainnet.
            </div>
            <div class="font-bold text-lg px-8 py-2 rounded-full w-fit linear-gradient-tb-bg text-white mt-8">
              REGISTER NOW!
            </div>
          </div>
          <div class="min-w-[40%] order-1 lg:!order-2">
            <img class="mx-auto" :src="laptop3" />
          </div>
        </div>

        <div class="flex flex-col lg:!flex-row mt-64 gap-12">
          <div class="min-w-[40%]">
            <img class="mx-auto" :src="tablet1" />
          </div>
          <div class="flex flex-col gap-y-2 grow">
            <div class="text-4xl font-bold">Questions and tech support</div>
            <div>The competition will begin November 1st, 2023. On January 15th, 2024 we will stop the competition and the
              final grid will be assigned. Shortly after, we will airdrop tokens in Mainnet for validating. Tokens will be
              airdropped before day 1 listing on CEX or DEX&amp;s with ample time to set up your validators in mainnet.
            </div>
            <div class="font-bold text-lg px-8 py-2 rounded-full w-fit ml-auto linear-gradient-tb-bg text-white mt-8">
              CONTACT US!
            </div>
          </div>

        </div>
      </div>

    </div>


    <!-- 5th section -->
    <div class="px-6 lg:!px-64 flex flex-col gap-y-2" v-bind:style="{
      background: isDarkMode ? `radial-gradient(circle at 90% 40%, #301E46, transparent 20%),
            radial-gradient(circle at 10% 60%, #301E46, transparent 20%)` : ''
    }">
      <div class="bg-white p-12 rounded-xl space-y-2">
        <div class="flex justify-between">
          <div class="text-3xl font-bold text-black">What are the rewards?</div>
          <button class="px-4 py-2 bg-violet text-white rounded-lg h-fit text-xs font-semibold">FIND OUT</button>
        </div>
        <div class="text-black">Validators are competing for 1,000,000,000 Kii in mainnet, airdropped to the top 20
          finalists, inspired by F1 point distribution</div>
        <div class="grid grid-cols-3 grid-rows-auto text-black rounded-lg border border-gray-100 divide-y">
          <div class="py-1 px-3 !border-0">Rank Kii</div>
          <div class="py-1 px-3 !border-0">Amount of Kii</div>
          <div class="py-1 px-3 !border-0">Percentage</div>
          <template v-for="item in rewardsTableData">
            <div class="bg-gray-100 py-1 px-3">{{ item.rank }}</div>
            <div class="bg-gray-100 py-1 px-3">{{ item.amount.toLocaleString() }}</div>
            <div class="bg-gray-100 py-1 px-3"> {{ item.percentage }}%</div>
          </template>
        </div>
      </div>
    </div>

    <div class="py-12 px-6 lg:!px-64 relative">
      <img class="absolute left-0 right-0 top-0 z-10" :src="footerBg" />
      <div class="absolute mx-auto left-0 right-0 space-y-6 z-20">
        <div class="p-4 text-6xl text-white bg-violet mx-auto w-fit rounded-lg font-bold">95+</div>
        <div class="text-4xl font-bold text-center">
          <div class="text-info">More than 95 corporate clients carry out</div>
          <div class="text-white">OTC with us as of the moment</div>
        </div>
        <div class="font-bold text-lg px-8 py-2 rounded-full w-fit mx-auto linear-gradient-l-to-r-bg-3 text-white mt-8">
          Learn more about OTC with KIIEX
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
