<script lang="ts" setup>
import PriceMarketChart from '@/components/charts/PriceMarketChart.vue';
import MdEditor from 'md-editor-v3';

import {
  useBaseStore,
  useBlockchain,
  useFormatter,
  useParamStore,
  useStakingStore,
  useTxDialog,
  useWalletStore
} from '@/stores';
import { Icon } from '@iconify/vue';
import { computed } from '@vue/reactivity';
import { onMounted, ref } from 'vue';
import { colorMap, useIndexModule } from '../indexStore';

import CardStatisticsVertical from '@/components/CardStatisticsVertical.vue';
import Modal from '@/components/Modal.vue';
import ArrayObjectElement from '@/components/dynamic/ArrayObjectElement.vue';
import {
  getRewardsBalance,
  withdrawRewardsBalance
} from '@/libs/web3';
import { toETHAddress } from '../../../libs/address';

// @ts-ignore
import SendTokensV3 from '@/components/SendTokensV3.vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';

const props = defineProps(['chain']);

const {
  isV2,
  isV3,
  isV3Metamask,
  initial
} = useBaseStore();
const blockchain = useBlockchain();
const store = useIndexModule();
const walletStore = useWalletStore();
const stakingStore = useStakingStore();
const format = useFormatter();
const dialog = useTxDialog();
const paramStore = useParamStore();
const coinInfo = computed(() => {
  return store.coinInfo;
});

const loading = ref(false);
const showRewardsModal = ref(false);
const selectedValidator = ref('');
const rewardBalance = ref();
const loadingMessage = ref('');

onMounted(async () => {
  await initial();
  store.loadDashboard();
  walletStore.loadMyAsset();
  paramStore.handleAbciInfo();
  stakingStore.init();

  // if(!(coinInfo.value && coinInfo.value.name)) {
  // }
  if (!isV3Metamask) {
    rewardBalance.value = await getRewardsBalance(
      blockchain.current?.assets[0].base ?? ''
    );
  }
});
const ticker = computed(() => store.coinInfo.tickers[store.tickerIndex]);

const isLoading = computed(() => loading.value);

const currName = ref('');
blockchain.$subscribe(async (m, s) => {
  if (s.chainName !== currName.value) {
    currName.value = s.chainName;
    store.loadDashboard();
    await walletStore.loadMyAsset();
    paramStore.handleAbciInfo();
  }
});
function shortName(name: string, id: string) {
  return name.toLowerCase().startsWith('ibc/') ||
    name.toLowerCase().startsWith('0x')
    ? id
    : name;
}

const comLinks = [
  {
    name: 'Website',
    icon: 'mdi-web',
    href: store.homepage,
  },
  {
    name: 'Twitter',
    icon: 'mdi-twitter',
    href: store.twitter,
  },
  {
    name: 'Telegram',
    icon: 'mdi-telegram',
    href: store.telegram,
  },
  {
    name: 'Github',
    icon: 'mdi-github',
    href: store.github,
  },
];

// wallet box
const change = computed(() => {
  const token = walletStore.balanceOfStakingToken;
  return token ? format.priceChanges(token.denom) : 0;
});
const color = computed(() => {
  switch (true) {
    case change.value > 0:
      return 'text-green-600';
    case change.value === 0:
      return 'text-grey-500';
    case change.value < 0:
      return 'text-red-600';
  }
});

async function updateState() {
  await walletStore.loadMyAsset();
}

function trustColor(v: string) {
  return `text-${colorMap(v)}`;
}

const quantity = ref(100);
const qty = computed({
  get: () => {
    return parseFloat(quantity.value.toFixed(6));
  },
  set: (val) => {
    quantity.value = val;
  },
});
const amount = computed({
  get: () => {
    return quantity.value * ticker.value.converted_last.usd || 0;
  },
  set: (val) => {
    quantity.value = val / ticker.value.converted_last.usd || 0;
  },
});

const withdrawRewardsTransaction = () => {
  loadingMessage.value = 'Withdrawing KII Rewards...';
  withdrawRewardsBalance(
    blockchain.current?.assets[0].base ?? '',
    loading,
    loadingMessage
  );
};

const walletBalance = computed(() => walletStore.evmWalletBalance);
const walletRewardBalance = computed(() => rewardBalance.value);
const isMetamask = computed(() => walletStore.connectedWallet?.wallet === 'Metamask')
const hideClassViaConnectedWalletMetamask = computed(() => {
  return isMetamask.value && isV3 ? 'hidden' : '';
})
</script>

<template>
  <div>
    <div v-if="coinInfo && coinInfo.name" class="bg-base-100 dark:bg-base100 rounded shadow mb-4">
      <div class="grid grid-cols-2 md:grid-cols-3 p-4">
        <div class="col-span-2 md:col-span-1">
          <div class="text-xl font-semibold text-main">
            {{ coinInfo.name }} (<span class="uppercase">{{
              coinInfo.symbol
              }}</span>)
          </div>
          <div class="text-xs mt-2">
            {{ $t('index.rank') }}:
            <div class="badge text-xs badge-error bg-[#fcebea] dark:bg-[#41384d] text-red-400">
              #{{ coinInfo.market_cap_rank }}
            </div>
          </div>

          <div class="my-4 flex flex-wrap items-center">
            <a v-for="(item, index) of comLinks" :key="index" :href="item.href"
              class="link link-primary px-2 py-1 rounded-sm no-underline hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center">
              <Icon :icon="item?.icon" />
              <span class="ml-1 text-sm uppercase">{{ item?.name }}</span>
            </a>
          </div>

          <div>
            <div class="dropdown dropdown-hover w-full">
              <label>
                <div
                  class="bg-gray-100 dark:bg-[#384059] flex items-center justify-between px-4 py-2 cursor-pointer rounded">
                  <div>
                    <div class="font-semibold text-xl text-[#666] dark:text-white">
                      {{ ticker?.market?.name || '' }}
                    </div>
                    <div class="text-info text-sm">
                      {{ shortName(ticker?.base, ticker.coin_id) }}/{{
                        shortName(ticker?.target, ticker.target_coin_id)
                      }}
                    </div>
                  </div>

                  <div class="text-right">
                    <div class="text-xl font-semibold text-[#666] dark:text-white">
                      ${{ ticker.converted_last.usd }}
                    </div>
                    <div class="text-sm" :class="store.priceColor">
                      {{ store.priceChange }}%
                    </div>
                  </div>
                </div>
              </label>
              <div class="dropdown-content pt-1">
                <div class="h-64 overflow-auto w-full shadow rounded">
                  <ul class="menu w-full bg-gray-100 rounded dark:bg-[#384059]">
                    <li v-for="(item, index) in store.coinInfo.tickers" :key="index" @click="store.selectTicker(index)">
                      <div class="flex items-center justify-between hover:bg-base-100 dark:bg-base100">
                        <div class="flex-1">
                          <div class="text-main text-sm" :class="trustColor(item.trust_score)">
                            {{ item?.market?.name }}
                          </div>
                          <div class="text-sm text-gray-500 dark:text-gray-400">
                            {{ shortName(item?.base, item.coin_id) }}/{{
                              shortName(item?.target, item.target_coin_id)
                            }}
                          </div>
                        </div>

                        <div class="text-base text-main">
                          ${{ item.converted_last.usd }}
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="flex">
              <label class="btn btn-primary !px-1 my-5 mr-2 hover:text-black dark:hover:text-white" for="calculator">
                <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <rect x="4" y="2" width="16" height="20" rx="2"></rect>
                    <line x1="8" x2="16" y1="6" y2="6"></line>
                    <line x1="16" x2="16" y1="14" y2="18"></line>
                    <path d="M16 10h.01"></path>
                    <path d="M12 10h.01"></path>
                    <path d="M8 10h.01"></path>
                    <path d="M12 14h.01"></path>
                    <path d="M8 14h.01"></path>
                    <path d="M12 18h.01"></path>
                    <path d="M8 18h.01"></path>
                  </g>
                </svg>
              </label>
              <!-- Put this part before </body> tag -->
              <input type="checkbox" id="calculator" class="modal-toggle" />
              <div class="modal">
                <div class="modal-box">
                  <h3 class="text-lg font-bold">
                    {{ $t('index.price_calculator') }}
                  </h3>
                  <div class="flex flex-col w-full mt-5">
                    <div class="grid h-20 flex-grow card rounded-box place-items-center">
                      <div class="join w-full">
                        <label class="join-item btn">
                          <span class="uppercase">{{ coinInfo.symbol }}</span>
                        </label>
                        <input type="number" v-model="qty" min="0" placeholder="Input a number"
                          class="input grow input-bordered join-item" />
                      </div>
                    </div>
                    <div class="divider">=</div>
                    <div class="grid h-20 flex-grow card rounded-box place-items-center">
                      <div class="join w-full">
                        <label class="join-item btn">
                          <span>USD</span>
                        </label>
                        <input type="number" v-model="amount" min="0" placeholder="Input amount"
                          class="join-item grow input input-bordered" />
                      </div>
                    </div>
                  </div>
                </div>
                <label class="modal-backdrop" for="calculator">{{
                  $t('index.close')
                  }}</label>
              </div>
              <a class="my-5 !text-white btn grow" :class="{
                '!btn-success': store.trustColor === 'green',
                '!btn-warning': store.trustColor === 'yellow',
              }" :href="ticker.trade_url" target="_blank">
                {{ $t('index.buy') }} {{ coinInfo.symbol || '' }}
              </a>
            </div>
          </div>
        </div>

        <div class="col-span-2">
          <PriceMarketChart />
        </div>
      </div>
      <div class="h-[1px] w-full bg-gray-100 dark:bg-[#384059]"></div>
      <div class="max-h-[250px] overflow-auto p-4 text-sm">
        <MdEditor :model-value="coinInfo.description?.en" previewOnly></MdEditor>
      </div>
      <div class="mx-4 flex flex-wrap items-center">
        <div v-for="(tag, index) in coinInfo.categories"
          class="mr-2 mb-4 text-xs bg-gray-100 dark:bg-[#384059] px-3 rounded-full py-1" :key="'tag' + index">
          {{ tag }}
        </div>
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-4">
      <div v-for="(item, key) in store.stats" :key="key" class="relative">
        <div class="brand-gradient-border">
          <CardStatisticsVertical v-bind="item" class="dark:bg-radial-gradient-base-duo" />
        </div>
      </div>
    </div>

    <!-- <div v-if="blockchain.supportModule('governance')" class="bg-base-100 dark:bg-base100 rounded mt-4 shadow">
      <div class="px-4 pt-4 pb-2 text-lg font-semibold text-main">
        {{ $t('index.active_proposals') }}
      </div>
      <div class="px-4 pb-4">
        <ProposalListItem :proposals="store?.proposals" />
      </div>
      <div class="pb-8 text-center" v-if="store.proposals?.proposals?.length === 0">
        {{ $t('index.no_active_proposals') }}
      </div>
    </div> -->

    <div class="brand-gradient-border mt-4 shadow">
      <div class="w-full h-full bg-black">
        <div class="flex justify-between px-4 pt-4 pb-2 text-lg font-semibold text-main text-white">
          <span class="truncate">{{
            walletStore.currentAddress || 'Wallet not connected'
          }}</span>
          <RouterLink v-if="walletStore.currentAddress"
            class="float-right text-sm cursor-pointert link link-primary no-underline font-medium text-white"
            :to="`/${chain}/account/${walletStore.currentAddress}`">{{ $t('index.more') }}</RouterLink>
        </div>
        <div class="grid grid-cols-1 md:!grid-cols-4 auto-cols-auto gap-4 px-4 pb-6"
          :class="walletStore.currentAddress ? '' : 'hidden'">
          <div class="brand-gradient-border !text-white">
            <div class="bg-radial-gradient-base-duo bg-base-100 dark:bg-base-100 rounded-sm px-4 py-3">
              <div class="text-sm mb-1">{{ $t('account.balance') }}</div>
              <div class="text-lg font-semibold text-main">
                {{
                  isMetamask
                    ? format.formatToken(walletBalance)
                    : format.formatToken(walletStore.balanceOfStakingToken)
                }}
              </div>
              <div class="text-sm" :class="color">
                ${{ isMetamask
                    ? format.formatToken(walletBalance)
                    : format.formatToken(walletStore.balanceOfStakingToken) }}
              </div>
            </div>
          </div>
          <div class="brand-gradient-border !text-white" :class="hideClassViaConnectedWalletMetamask">
            <div class="bg-radial-gradient-base-duo bg-base-100 dark:bg-base-100 rounded-sm px-4 py-3">
              <div class="text-sm mb-1">{{ $t('module.staking') }}</div>
              <div class="text-lg font-semibold text-main">
                {{ format.formatToken(walletStore.stakingAmount) }}
              </div>
              <div class="text-sm" :class="color">
                ${{ format.tokenValue(walletStore.stakingAmount) }}
              </div>
            </div>
          </div>
          <div class="brand-gradient-border !text-white" :class="hideClassViaConnectedWalletMetamask">
            <div class="bg-radial-gradient-base-duo bg-base-100 dark:bg-base-100 rounded-sm px-4 py-3">
              <div class="text-sm mb-1">{{ $t('index.reward') }}</div>
              <div class="text-lg font-semibold text-main">
                {{ format.formatToken(walletStore.rewardAmount) }}
              </div>
              <div class="text-sm" :class="color">
                ${{ format.tokenValue(walletStore.rewardAmount) }}
              </div>
            </div>
          </div>
          <div class="brand-gradient-border !text-white" :class="hideClassViaConnectedWalletMetamask">
            <div class="bg-radial-gradient-base-duo bg-base-100 dark:bg-base-100 rounded-sm px-4 py-3">
              <div class="text-sm mb-1">{{ $t('index.unbonding') }}</div>
              <div class="text-lg font-semibold text-main">
                {{ format.formatToken(walletStore.unbondingAmount) }}
              </div>
              <div class="text-sm" :class="color">
                ${{ format.tokenValue(walletStore.unbondingAmount) }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="walletStore.delegations.length > 0" class="px-4 pb-4 overflow-auto"
          :class="walletStore.currentAddress ? '' : 'hidden'">
          <table class="table table-compact w-full table-zebra">
            <thead>
              <tr>
                <th>{{ $t('account.validator') }}</th>
                <th>{{ $t('account.delegations') }}</th>
                <th>{{ $t('account.rewards') }}</th>
                <th>{{ $t('staking.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in walletStore.delegations" :key="index">
                <td>
                  <RouterLink class="link dark:text-white link-primary no-underline"
                    :to="`/${chain}/staking/${item?.delegation?.validator_address}`">
                    {{
                      format.validatorFromBech32(
                        item?.delegation?.validator_address
                      )
                    }}
                  </RouterLink>
                </td>
                <td>{{ format.formatToken(item?.balance) }}</td>
                <td>
                  {{
                    format.formatTokens(
                      walletStore?.rewards?.rewards?.find(
                        (el) =>
                          el?.validator_address ===
                          item?.delegation?.validator_address
                      )?.reward
                    )
                  }}
                </td>
                <td>
                  <div>
                    <!-- <label for="delegate"
                      class="btn !btn-xs !btn-primary hover:!text-black dark:hover:!text-white rounded-sm mr-2"
                      :class="isV2 ? 'hidden' : ''" @click="
                        dialog.open(
                          'delegate',
                          {
                            validator_address: item.delegation.validator_address,
                          },
                          updateState
                        )
                        ">
                      {{ $t('account.btn_delegate') }}
                    </label> -->
                    <RouterLink :to="`/${blockchain.chainName}/staking`"
                      class="btn !btn-xs !btn-primary hover:!text-black dark:hover:!text-white rounded-sm mr-2"
                      :class="isV2 ? '' : 'hidden'">{{ $t('account.btn_delegate') }}</RouterLink>
                    <label for="withdraw" :class="isV2 ? 'hidden' : ''"
                      class="btn !btn-xs !btn-primary hover:!text-black dark:hover:!text-white btn-ghost rounded-sm"
                      @click="
                        dialog.open(
                          'withdraw',
                          {
                            validator_address: item.delegation.validator_address,
                          },
                          updateState
                        )
                        ">
                      {{ $t('index.btn_withdraw_reward') }}
                    </label>
                    <label
                      class="btn !btn-xs !btn-primary hover:!text-black dark:hover:!text-white btn-ghost rounded-sm"
                      :class="isV2 ? '' : 'hidden'"
                      @click="(showRewardsModal = true) && (selectedValidator = item.delegation.validator_address)">
                      {{ $t('index.btn_withdraw_reward') }}
                    </label>

                    <ping-token-convert :class="!isV2 ? '' : 'hidden'"
                      :chain-name="blockchain?.current?.prettyName" :endpoint="blockchain?.endpoint?.address"
                      :hd-path="walletStore?.connectedWallet?.hdPath"></ping-token-convert>

                    <Teleport to="body">
                      <div :class="isV2 ? '' : 'hidden'">
                        <!-- Rewards Modal -->
                        <Modal :show="selectedValidator === item.delegation.validator_address && showRewardsModal === true
                          " @close="
                            (selectedValidator = '') && (showRewardsModal = false)
                            ">
                          <template #header>
                            <h1 class="text-2xl">Withdraw KII Rewards</h1>
                          </template>
                          <template #body>
                            <div class="w-full">
                              Withdraw your earned KII rewards!
                              <div class="w-full">
                                <div class="flex-col">
                                  <div class="flex justify-center py-2">
                                    <span class="text-green-500">{{
                                      `Outstanding Rewards Balance: ${isV2
                                        ? format.formatToken(
                                          walletRewardBalance
                                        )
                                        : format.formatToken(
                                          walletStore.balanceOfStakingToken,
                                          false
                                        )
                                      }`
                                    }}</span>
                                  </div>
                                  <div class="flex justify-center w-full py-2">
                                    <button class="w-full rounded-lg bg-[#432ebe] text-white p-2"
                                      @click="withdrawRewardsTransaction()">
                                      Withdraw KII Rewards
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </template>
                        </Modal>
                      </div>
                    </Teleport>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="grid grid-cols-3 gap-4 px-4 pb-6 mt-4" :class="walletStore.currentAddress ? '' : 'hidden'">
          <div class="brand-gradient-border" :class="isV2 ? 'hidden' : ''">
            <SendTokensV3 v-if="isV3 && isMetamask"/>
            <label v-else for="send" class="btn bg-radial-gradient-base-duo bg-base-100 dark:bg-base-100 text-white w-full"
              @click="dialog.open('send', {}, updateState)">{{ $t('account.btn_send') }}</label>
          </div>
          <div class="brand-gradient-border" :class="(isMetamask && isV3) || isV2 ? 'hidden' : ''">
            <label for="delegate" class="btn bg-radial-gradient-base-duo bg-base-100 dark:bg-base-100 text-white w-full"
              @click="dialog.open('delegate', {}, updateState)">{{ $t('account.btn_delegate') }}</label>
          </div>
          <div class="brand-gradient-border">
            <RouterLink :to="`/${blockchain.chainName}/account/${(isV2 || isV3Metamask
              ? toETHAddress(walletStore.currentAddress)
              : walletStore.currentAddress)}`"
              class="btn bg-radial-gradient-base-duo bg-base-100 dark:bg-base-100 text-white w-full">My Account
            </RouterLink>
          </div>
          <div class="brand-gradient-border" :class="isV2 ? '' : 'hidden'">
            <RouterLink :to="`/${blockchain.chainName}/staking`"
              class="btn bg-radial-gradient-base-duo bg-base-100 dark:bg-base-100 text-white w-full">
              {{ $t('account.btn_delegate') }}
            </RouterLink>
          </div>
        </div>
        <Teleport to="body">
          <ping-token-convert :class="!isV2 ? '' : 'hidden'" :chain-name="blockchain?.current?.prettyName"
            :endpoint="blockchain?.endpoint?.address"
            :hd-path="walletStore?.connectedWallet?.hdPath"></ping-token-convert>

          <div :class="isV2 ? '' : 'hidden'">
            <!-- Swap Modal -->
            <!-- <Modal :show="showModal" @close="showModal = false">
              <template #header>
                <h1 class="text-2xl">Swap KII and sKII</h1>
              </template>
              <template #body>
                <div class="w-full">
                  Exchange your KII and sKII depending on what you want to do!
                  <div class="py-4">
                    Use <span class="text-green-500">sKII</span> to stake in
                    validators for rewards. Exchange your
                    <span class="text-green-500">sKII</span> to
                    <span class="text-green-500">KII</span> for paying gas fees
                    and deploying smart contracts on Kiichain! <br /><br />
                    <strong
                      >NOTE: You will need KII to pay for swap gas fees.</strong
                    >
                  </div>
                  <div class="w-full">
                    <div class="flex-col">
                      <Toggle
                        :value="isActive"
                        @input="isActive = $event"
                        :label="isActive ? `sKII` : `KII`"
                      />
                      <div class="flex justify-center py-2">
                        <span class="text-green-500">{{
                          isActive
                            ? `sKII Balance: ${format.formatToken(
                                walletStore.balanceOfStakingToken,
                                false
                              )}`
                            : `KII Balance: ${format.formatToken(
                                walletStore.balanceOfStakingToken,
                                false
                              )}`
                        }}</span>
                      </div>
                      <div class="flex justify-center py-2">
                        <input
                          class="w-full rounded p-1"
                          type="number"
                          placeholder="Enter number of tokens to swap..."
                          min="0.000001" 
                          step="0.000001"
                          v-model.number="toSwapAmount"
                        />
                      </div>
                      <div class="flex justify-center w-full py-2">
                        <button
                          class="w-full rounded-lg bg-[#432ebe] text-white p-2"
                          @click="buySkiiTransaction(toSwapAmount)"
                        >
                          {{ isActive ? `Swap to KII` : `Swap to sKII` }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </Modal> -->

            <!-- Send Modal -->
            <!-- <Modal :show="showSendModal" @close="showSendModal = false">
              <template #header>
                <h1 class="text-2xl">Send sKII</h1>
              </template>
              <template #body>
                <div class="w-full">
                  Use the send feature to transfer you
                  <span class="text-green-500">sKII</span> to other addresses.<br /><br />
                  <strong
                    >NOTE: You will need KII to pay for send gas fees.</strong
                  >
                  <div class="w-full">
                    <div class="flex-col py-4">
                      <div class="flex justify-center py-2">
                        <span class="text-green-500">{{
                          `sKII Balance: ${format.formatToken(
                            walletStore.balanceOfStakingToken,
                            false
                          )}`
                        }}</span>
                      </div>
                      <div class="flex flex-col justify-center py-2 gap-4">
                        <input
                          class="w-full rounded p-1"
                          type="number"
                          placeholder="Enter number of tokens to send..."
                          min="0.000001" 
                          step="0.000001"
                          v-model.number="toSendAmount"
                        />
                        <input
                          class="w-full rounded p-1"
                          type="text"
                          placeholder="Enter KII Address"
                          v-model.text="destinationAddress"
                        />
                      </div>
                      <div class="flex justify-center w-full py-2">
                        <button
                          class="w-full rounded-lg bg-[#432ebe] text-white p-2"
                          @click="sendTransaction(toSendAmount)"
                        >
                          Send sKII
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </Modal> -->

            <!-- Loading Modal -->
            <Modal :show="isLoading" @close="loading = false">
              <template #header>
                <h1 class="text-2xl">Please wait...</h1>
              </template>
              <template #body>
                <PulseLoader />
              </template>
              <template #footer>
                <div />
              </template>
            </Modal>
          </div>
        </Teleport>
      </div>
    </div>

    <div class="flex w-full flex-col gap-4 mt-4">
      <!-- <div class="bg-base-100 dark:bg-base100 rounded mt-4">
        <div class="px-4 pt-4 pb-2 text-lg font-semibold text-main">
          {{ $t('index.top_account_holders') }}
        </div>
        <div class="pb-2">
          <DonutChart :series="topAccountHolders" :labels="topAccountAddresses" />
        </div>
      </div> -->
      <div
        class="text-white grow basis-0 min-w-0">
        <div class="flex items-center gap-1 px-4 pt-4 pb-2">
          <!-- <div class="p-2 rounded shadow bg-white/[0.2]">
            <Icon class="text-white" icon="icon-park-outline:more-app" size="32" />
          </div> -->
          <div class="text-xl font-semibold text-accent">
            {{ $t('index.app_versions') }}
          </div>
        </div>
        <!-- Application Version -->
        <ArrayObjectElement :value="paramStore.appVersion?.items" :thead="false" />
        <div class="h-4"></div>
      </div>

      <div v-if="!store.coingeckoId"
        class="text-white grow basis-0 min-w-0">
        <div class="flex items-center gap-1 px-4 pt-4 pb-2">
          <!-- <div class="p-2 rounded shadow bg-white/[0.2]">
            <Icon class="text-white" icon="ri:node-tree" size="32" />
          </div> -->
          <div class="text-xl font-semibold text-accent">
            {{ $t('index.node_info') }}
          </div>
        </div>
        <ArrayObjectElement :value="paramStore.nodeVersion?.items" :thead="false" />
        <div class="h-4"></div>
      </div>
    </div>
  </div>
</template>

<route>
  {
    meta: {
      i18n: 'dashboard',
      order: 2,
      icon: 'material-symbols:dashboard-outline'
    }
  }
</route>
