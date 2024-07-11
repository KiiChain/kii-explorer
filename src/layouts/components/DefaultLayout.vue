<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { ref } from 'vue';

// Components
import newFooter from '@/layouts/components/NavFooter.vue';
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue';
import NavbarSearch from '@/layouts/components/NavbarSearch.vue';
import NavBarChainSelector from '@/layouts/components/NavBarChainSelector.vue'
import ChainProfile from '@/layouts/components/ChainProfile.vue';
import wave from '@/assets/images/svg/wave.svg';

import { useDashboard } from '@/stores/useDashboard';
import { useBaseStore, useBlockchain } from '@/stores';

import NavBarI18n from './NavBarI18n.vue';
import NavBarWallet from './NavBarWallet.vue';
import type {
  NavGroup,
  NavLink,
  NavSectionTitle,
  VerticalNavItems,
} from '../types';

const testnetHelpTextVisible = ref(true);

const dashboard = useDashboard();
const baseStore = useBaseStore();
dashboard.initial();
const blockchain = useBlockchain();

const current = ref('');
blockchain.$subscribe((m, s) => {
  if (current.value != s.chainName) {
    current.value = s.chainName;
    blockchain.initial();
  }
});

const sidebarShow = ref(false);
const sidebarOpen = ref(true);

const changeOpen = (index: Number) => {
  if (index === 0) {
    sidebarOpen.value = !sidebarOpen.value;
  }
};
const showDiscord = window.location.host.search('ping.pub') > -1;
const isKiichain = window.location.pathname.search('kiichain') > -1;

function isNavGroup(nav: VerticalNavItems | any): nav is NavGroup {
  return (nav as NavGroup).children !== undefined && (nav as NavGroup).children.length > 0;
}
function isNavLink(nav: VerticalNavItems | any): nav is NavLink {
  return (<NavLink>nav).to !== undefined;
}
function isNavTitle(nav: VerticalNavItems | any): nav is NavSectionTitle {
  return (<NavSectionTitle>nav).heading !== undefined;
}
function selected(route: any, nav: NavLink) {
  const b = route.path === nav.to?.path;
  // ||
  // (route.path.startsWith(nav.to?.path) &&
  //   nav.title.indexOf('dashboard') === -1);
  // console.log(route.path, nav.to?.path, b)
  return b;
}
</script>

<template>
  <div class="bg-gray-100 dark:bg-[#000]">

    <!-- testnet helptext -->
    <div class="px-3 pt-4 h-screen flex flex-col">
      <div
        class="h-8 overflow-hidden items-center text-center w-full bg-300% justify-center linear-gradient-l-to-r-bg animate-gradient text-white relative transition-all ease-in-out"
        :class="isKiichain ? 'hidden' : 'flex'">
        <span class="font-semibold">We have deployed a new testnet. Check out <a href="/kiichain"
            class="underline">Kiichain Testnet</a> now.</span>
        <!-- <Icon icon="bi:x" class="right-0 cursor-pointer absolute right-0 mr-2 hover:rotate-90 transition-all ease-in-out rounded-full border border-white/50" @click="testnetHelpTextVisible = false" /> -->
      </div>

      <!-- header -->
      <div class="flex items-center py-4 rounded px-4 sticky top-0 z-10 rounded-3xl" v-bind:style="{
        backgroundImage: 'url(' + wave + ')',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }">
        <div class="text-2xl pr-3 cursor-pointer xl:!hidden" @click="sidebarShow = true">
          <Icon icon="mdi-menu" />
        </div>

        <ChainProfile />

        <div class="flex-1 w-0"></div>

        <!-- <NavSearchBar />-->
        <!-- <NavBarI18n class="hidden md:!inline-block" /> -->
        <!-- <NavbarThemeSwitcher class="!inline-block" /> -->
        <NavbarSearch class="!inline-block" />
        <NavBarChainSelector />
        <NavBarWallet />
      </div>

      <!-- navigation -->
      <div class="w-full">
        <div v-for="(item, index) of blockchain.computedChainMenu.filter(menu => (menu as NavGroup).children.length)"
          :key="index" class="px-2">
          <div v-if="isNavGroup(item)" :tabindex="index"
            class="flex py-4 items-center w-fit gap-4 flex-col lg:flex-row">
            <div v-if="index > 0 && index < blockchain.computedChainMenu.length && false"
              class="h-[1px] w-full linear-gradient-l-to-r-bg" />
            <div v-for="(el, key) of item?.children" class="menu w-full !p-0" :key="key">
              <RouterLink v-if="isNavLink(el)" @click="sidebarShow = false"
                class="hover:bg-gray-100 dark:hover:bg-primary rounded cursor-pointer px-3 py-2 flex items-center"
                :class="{
                  '': selected($route, el),
                }" :to="el.to">
                <!-- <img
                  v-if="el?.icon?.image"
                  :src="el?.icon?.image"
                  class="w-6 h-6 rounded-full mr-3 ml-4"
                  :class="{
                    'border border-gray-300 bg-white': selected($route, el),
                  }"
                /> -->
                <Icon v-if="el.icon?.icon" :icon="el.icon?.icon" class="text-xl mr-2 text-accent dark:text-accent" />
                <div class="text-base capitalize text-gray-500 dark:text-gray-300 whitespace-nowrap" :class="[
                  {
                    '!text-accent': selected($route, el),
                  },
                  el.meta?.weight
                ]">
                  {{ item?.title === 'Favorite' ? el?.title : $t(el?.title) }}
                </div>
              </RouterLink>
            </div>
          </div>

          <RouterLink v-if="isNavLink(item)" :to="item?.to" @click="sidebarShow = false"
            class="cursor-pointer rounded-lg px-4 flex items-center py-2 hover:bg-gray-100 dark:hover:bg-[#373f59]">
            <Icon v-if="item?.icon?.icon" :icon="item?.icon?.icon" class="text-xl mr-2" :class="{
              'text-yellow-500': item?.title === 'Favorite',
              'text-blue-500': item?.title !== 'Favorite',
            }" />
            <img v-if="item?.icon?.image" :src="item?.icon?.image"
              class="w-6 h-6 rounded-full mr-3 border border-blue-100" />
            <div class="text-base capitalize flex-1 text-gray-700 dark:text-gray-200 whitespace-nowrap">
              {{ item?.title }}
            </div>
            <div v-if="item?.badgeContent" class="badge badge-sm text-white border-none" :class="item?.badgeClass">
              {{ item?.badgeContent }}
            </div>
          </RouterLink>
          <div v-if="isNavTitle(item)" class="px-4 text-sm text-gray-400 pb-2 uppercase">
            {{ item?.heading }}
          </div>
        </div>
      </div>

      <!-- 👉 Pages -->
      <div class="h-full overflow-y-auto pb-5">
        <RouterView v-slot="{ Component }">
          <Transition mode="out-in">
            <Component :is="Component" />
          </Transition>
        </RouterView>
      </div>

      <newFooter />
    </div>
  </div>
</template>
