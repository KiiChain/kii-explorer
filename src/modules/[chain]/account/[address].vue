<script lang="ts" setup>
import {
  useBaseStore,
  useBlockchain,
  useFormatter,
  useStakingStore,
  useTxDialog,
  useWalletStore,
} from '@/stores';
import DynamicComponent from '@/components/dynamic/DynamicComponent.vue';
import DonutChart from '@/components/charts/DonutChart.vue';
import { ref, computed } from '@vue/reactivity';
import { onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import 'vue-json-pretty/lib/styles.css';
import type {
  AuthAccount,
  Delegation,
  TxResponse,
  DelegatorRewards,
  UnbondingResponses,
} from '@/types';
import type { Coin } from '@cosmjs/amino';
import Countdown from '@/components/Countdown.vue';
import { useRoute } from 'vue-router';
import {
  getRewardsBalance,
  getWalletBalance,
  withdrawRewardsBalance,
} from '@/libs/web3';
import { addressEnCode, toETHAddress } from '@/libs/address';
import { fromHex } from '@cosmjs/encoding';
// @ts-ignore
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import Modal from '@/components/Modal.vue';

const props = defineProps(['address', 'chain']);

const route = useRoute();
const walletAddress = route.params.address;
const chain = route.params.chain;
const walletStore = useWalletStore();
const baseStore = useBaseStore();
const blockchain = useBlockchain();
const stakingStore = useStakingStore();
const dialog = useTxDialog();
const format = useFormatter();
const account = ref({} as AuthAccount);
const txs = ref([] as TxResponse[]);
const receivedTxs = ref([] as TxResponse[]);
const delegations = ref([] as Delegation[]);
const rewards = ref({} as DelegatorRewards);
const balances = ref([] as Coin[]);
const unbonding = ref([] as UnbondingResponses[]);
const unbondingTotal = ref(0);
const showRewardsModal = ref(false);
const rewardBalance = ref();
const loading = ref(false);
const loadingMessage = ref('');

const isKiichain = chain === 'kiichain';
const isEvmAddress =
  walletAddress?.length === 42 && walletAddress?.includes('0x');

const combinedTxs = computed(() => {
  return [...txs.value, ...receivedTxs.value].sort(
    (a, b) => parseInt(b.height) - parseInt(a.height)
  );
});

const kiiConvertedAddress = isEvmAddress
  ? addressEnCode('kii', fromHex(props.address.replace('0x', '')))
  : props.address;

onMounted(async () => {
  if (isMetamask) {
    await walletStore.myEvmBalance(isEvmAddress ? props.address : toETHAddress(props.address))
    balances.value = [walletStore.evmWalletBalance];
    rewardBalance.value = await getRewardsBalance(
      blockchain.current?.assets[0].base ?? ''
    );
    blockchain.rpc.getTxsByWalletEvm(props.address).then((tx) => {
      txs.value = tx
    })
  }
  loadAccount(kiiConvertedAddress);
});
const totalAmountByCategory = computed(() => {
  let sumDel = 0;
  delegations.value?.forEach((x) => {
    sumDel += Number(x.balance.amount);
  });
  let sumRew = 0;
  rewards.value?.total?.forEach((x) => {
    sumRew += Number(x.amount);
  });
  let sumBal = 0;
  balances.value?.forEach((x) => {
    sumBal += Number(x.amount);
  });
  let sumUn = 0;
  unbonding.value?.forEach((x) => {
    x.entries?.forEach((y) => {
      sumUn += Number(y.balance);
    });
  });
  const amountByCategory = [sumBal]
  if (!baseStore.isV3Metamask) {
    amountByCategory.push(sumDel, sumRew, sumUn)
  }
  return amountByCategory;
});

// const labels = ['Balance', 'Delegation', 'Reward', 'Unbonding'];
const labels = computed(() => {
  return [
    'Balance',
    ...(baseStore.isV3Metamask ? [] : ['Stake', 'Reward', 'Withdrawals'])
  ]
});

const totalAmount = computed(() => {
  return totalAmountByCategory.value.reduce((p, c) => c + p, 0);
});

const totalValue = computed(() => {
  let value = 0;
  delegations.value?.forEach((x) => {
    value += format.tokenValueNumber(x.balance);
  });
  rewards.value?.total?.forEach((x) => {
    value += format.tokenValueNumber(x);
  });
  balances.value?.forEach((x) => {
    value += format.tokenValueNumber(x);
  });
  unbonding.value?.forEach((x) => {
    x.entries?.forEach((y) => {
      value += format.tokenValueNumber({
        amount: y.balance,
        denom: stakingStore.params.bond_denom,
      });
    });
  });
  return format.formatNumber(value, '0,0.00');
});

const hideButtons = computed(() => {
  if (isEvmAddress) {
    return (
      addressEnCode('kii', fromHex(props.address.replace('0x', ''))) !==
      addressEnCode('kii', fromHex((walletAddress as string).replace('0x', '')))
    );
  }
  return walletStore.currentAddress !== walletAddress;
});

function loadAccount(address: string) {
  blockchain.rpc.getAuthAccount(address).then((x) => {
    account.value = x.account;
  });
  blockchain.rpc.getTxsBySender(address).then((x) => {
    txs.value = x.tx_responses;
  });
  blockchain.rpc.getTxsReceived(address).then((x) => {
    receivedTxs.value = x.tx_responses;
  });
  blockchain.rpc.getDistributionDelegatorRewards(address).then((x) => {
    rewards.value = x;
  });
  blockchain.rpc.getStakingDelegations(address).then((x) => {
    delegations.value = x.delegation_responses;
  });
  if (!isMetamask) {
    blockchain.rpc.getBankBalances(address).then((x) => {
      balances.value = x.balances;
    });
  }
  blockchain.rpc.getStakingDelegatorUnbonding(address).then((x) => {
    unbonding.value = x.unbonding_responses;
    x.unbonding_responses?.forEach((y) => {
      y.entries.forEach((z) => {
        unbondingTotal.value += Number(z.balance);
      });
    });
  });
}

const withdrawRewardsTransaction = () => {
  loadingMessage.value = 'Withdrawing KII Rewards...';
  withdrawRewardsBalance(
    blockchain.current?.assets[0].base ?? '',
    loading,
    loadingMessage
  );
};

function updateEvent() {
  loadAccount(kiiConvertedAddress);
}

const walletRewardBalance = computed(() => rewardBalance.value);
const isMetamask = computed(() => walletStore.connectedWallet?.wallet === 'Metamask')
const isLoading = computed(() => loading.value);
</script>
<template>
  <div v-if="account">
    <!-- address -->
    <div class="bg-base-100 dark:bg-base100 px-4 pt-3 pb-4 rounded mb-4 shadow">
      <div class="flex items-center">
        <!-- img -->
        <div class="inline-flex relative w-11 h-11 rounded-md">
          <div class="w-11 h-11 absolute rounded-md opacity-10 bg-primary"></div>
          <div class="w-full inline-flex items-center align-middle flex-none justify-center">
            <Icon icon="mdi-qrcode" class="text-primary" style="width: 27px; height: 27px" />
          </div>
        </div>
        <!-- content -->
        <div class="flex flex-1 flex-col truncate pl-4">
          <h2 class="text-sm card-title">{{ $t('account.address') }}:</h2>
          <span class="text-xs truncate"> {{ address }}</span>
        </div>
      </div>
    </div>

    <!-- Assets -->
    <div class="bg-base-100 dark:bg-base100 px-4 pt-3 pb-4 rounded mb-4 shadow">
      <div class="flex justify-between">
        <h2 class="card-title mb-4">{{ $t('account.assets') }}</h2>
        <!-- button -->
        <div class="flex justify-end mb-4 pr-5">
          <!-- <label
              v-if="!hideButtons"
              for="send"
              class="btn btn-primary btn-sm mr-2 hover:text-black dark:hover:text-white"
              @click="dialog.open('send', {}, updateEvent)"
              >{{ $t('account.btn_send') }}</label
            > -->
          <!-- <label
              v-if="!hideButtons"
              for="transfer"
              class="btn btn-primary btn-sm  hover:text-black dark:hover:text-white"
              @click="
                dialog.open(
                  'transfer',
                  {
                    chain_name: blockchain.current?.prettyName,
                  },
                  updateEvent
                )
              "
              >{{ $t('account.btn_transfer') }}</label
            > -->
        </div>
      </div>
      <div class="grid md:!grid-cols-3">
        <div class="md:!col-span-1">
          <DonutChart :series="totalAmountByCategory" :labels="labels" />
        </div>
        <div class="mt-4 md:!col-span-2 md:!mt-0 md:!ml-4">
          <!-- list-->
          <div class="">
            <!--balances  -->
            <div class="flex items-center px-4 mb-2" v-for="(balanceItem, index) in balances" :key="index">
              <div class="w-9 h-9 rounded overflow-hidden flex items-center justify-center relative mr-4">
                <Icon icon="mdi-account-cash" class="text-info" size="20" />
                <div class="absolute top-0 bottom-0 left-0 right-0 bg-info opacity-20"></div>
              </div>
              <div class="flex-1">
                <div class="text-sm font-semibold">
                  {{ format.formatToken(balanceItem) }}
                </div>
                <div class="text-xs">
                  {{
                    format.calculatePercent(balanceItem?.amount, totalAmount)
                  }}
                </div>
              </div>
              <div class="text-xs truncate relative py-1 px-3 rounded-full w-fit text-primary dark:invert mr-2">
                <span class="inset-x-0 inset-y-0 opacity-10 absolute bg-primary dark:invert text-sm"></span>
                ${{ format.formatToken(balanceItem) }}
              </div>
            </div>
            <!--delegations  -->
            <div class="flex items-center px-4 mb-2" v-for="(delegationItem, index) in delegations" :key="index">
              <div class="w-9 h-9 rounded overflow-hidden flex items-center justify-center relative mr-4">
                <Icon icon="mdi-user-clock" class="text-warning" size="20" />
                <div class="absolute top-0 bottom-0 left-0 right-0 bg-warning opacity-20"></div>
              </div>
              <div class="flex-1">
                <div class="text-sm font-semibold">
                  {{ format.formatToken(delegationItem?.balance) }}
                </div>
                <div class="text-xs">
                  {{
                    format.calculatePercent(
                      delegationItem?.balance?.amount,
                      totalAmount
                    )
                  }}
                </div>
              </div>
              <div class="text-xs truncate relative py-1 px-3 rounded-full w-fit text-primary dark:invert mr-2">
                <span class="inset-x-0 inset-y-0 opacity-10 absolute bg-primary dark:invert text-sm"></span>
                ${{ format.tokenValue(delegationItem?.balance) }}
              </div>
            </div>
            <!-- rewards.total -->
            <div class="flex items-center px-4 mb-2" v-for="(rewardItem, index) in rewards.total" :key="index">
              <div class="w-9 h-9 rounded overflow-hidden flex items-center justify-center relative mr-4">
                <Icon icon="mdi-account-arrow-up" class="text-success" size="20" />
                <div class="absolute top-0 bottom-0 left-0 right-0 bg-success opacity-20"></div>
              </div>
              <div class="flex-1">
                <div class="text-sm font-semibold">
                  {{ format.formatToken(rewardItem) }}
                </div>
                <div class="text-xs">
                  {{ format.calculatePercent(rewardItem.amount, totalAmount) }}
                </div>
              </div>
              <div class="text-xs truncate relative py-1 px-3 rounded-full w-fit text-primary dark:invert mr-2">
                <span class="inset-x-0 inset-y-0 opacity-10 absolute bg-primary dark:invert text-sm"></span>${{
                  format.tokenValue(rewardItem) }}
              </div>
            </div>
            <!-- mdi-account-arrow-right -->
            <div class="flex items-center px-4">
              <div class="w-9 h-9 rounded overflow-hidden flex items-center justify-center relative mr-4">
                <Icon icon="mdi-account-arrow-right" class="text-error" size="20" />
                <div class="absolute top-0 bottom-0 left-0 right-0 bg-error opacity-20"></div>
              </div>
              <div class="flex-1">
                <div class="text-sm font-semibold">
                  {{
                    format.formatToken({
                      amount: String(unbondingTotal),
                      denom: stakingStore.params.bond_denom,
                    })
                  }}
                </div>
                <div class="text-xs">
                  {{ format.calculatePercent(unbondingTotal, totalAmount) }}
                </div>
              </div>
              <div class="text-xs truncate relative py-1 px-3 rounded-full w-fit text-primary dark:invert mr-2">
                <span class="inset-x-0 inset-y-0 opacity-10 absolute bg-primary dark:invert"></span>
                ${{
                  format.tokenValue({
                    amount: String(unbondingTotal),
                    denom: stakingStore.params.bond_denom,
                  })
                }}
              </div>
            </div>
          </div>
          <div class="mt-4 text-lg font-semibold mr-5 pl-5 border-t pt-4 text-right">
            {{ $t('account.total_value') }}: ${{ totalValue }}
          </div>
        </div>
      </div>
    </div>

    <!-- Delegations -->
    <div class="bg-base-100 dark:bg-base100 px-4 pt-3 pb-4 rounded mb-4 shadow" :class="baseStore.isV3Metamask ? 'hidden' : ''">
      <div class="flex justify-between">
        <h2 class="card-title mb-4">{{ $t('account.delegations') }}</h2>
        <div class="flex justify-end mb-4">
          <label v-if="!hideButtons" for="delegate"
            class="btn btn-primary btn-sm mr-2 hover:text-black dark:hover:text-white"
            :class="isKiichain ? 'hidden' : ''" @click="dialog.open('delegate', {}, updateEvent)">{{
              $t('account.btn_delegate') }}</label>
          <RouterLink v-if="!hideButtons" :to="`/${chain}/staking`" :class="!isKiichain ? 'hidden' : ''"
            class="btn btn-primary btn-sm mr-2 hover:text-black dark:hover:text-white">{{ $t('account.btn_delegate') }}
          </RouterLink>
          <label v-if="!hideButtons" for="withdraw"
            class="btn btn-primary btn-sm hover:text-black dark:hover:text-white" :class="!isKiichain ? '' : 'hidden'"
            @click="dialog.open('withdraw', {}, updateEvent)">{{ $t('account.btn_withdraw') }}</label>
          <label v-if="!hideButtons" class="btn btn-primary btn-sm hover:text-black dark:hover:text-white"
            :class="isKiichain ? '' : 'hidden'" @click="showRewardsModal = true">
            {{ $t('account.btn_withdraw') }}
          </label>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="table w-full text-sm table-zebra">
          <thead>
            <tr>
              <th class="py-3">{{ $t('account.validator') }}</th>
              <th class="py-3">{{ $t('account.delegation') }}</th>
              <th class="py-3">{{ $t('account.rewards') }}</th>
              <th class="py-3 text-center" v-if="!hideButtons">
                {{ $t('account.action') }}
              </th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr v-if="delegations.length === 0">
              <td colspan="10">
                <div class="text-center">
                  {{ $t('account.no_delegations') }}
                </div>
              </td>
            </tr>
            <tr v-for="(v, index) in delegations" :key="index">
              <td class="text-caption text-primary py-3">
                <RouterLink :to="`/${chain}/staking/${v.delegation.validator_address}`"
                  class="text-primary dark:invert">{{
                    format.validatorFromBech32(
                      v.delegation.validator_address
                    ) || v.delegation.validator_address
                  }}</RouterLink>
              </td>
              <td class="py-3">
                {{ format.formatToken(v.balance, true, '0,0.[000000]') }}
              </td>
              <td class="py-3">
                {{
                  format.formatTokens(
                    rewards?.rewards?.find(
                      (x) =>
                        x.validator_address === v.delegation.validator_address
                    )?.reward
                  )
                }}
              </td>
              <td class="py-3">
                <div v-if="v.balance" class="flex justify-center">
                  <!-- <label
                    v-if="!hideButtons"
                    for="delegate"
                    class="btn btn-primary btn-xs mr-2 hover:text-black dark:hover:text-white"
                    @click="
                      dialog.open(
                        'delegate',
                        {
                          validator_address: v.delegation.validator_address,
                        },
                        updateEvent
                      )
                    "
                    >{{ $t('account.btn_delegate') }}</label
                  > -->
                  <label v-if="!hideButtons" for="redelegate"
                    class="btn btn-primary btn-xs mr-2 hover:text-black dark:hover:text-white" @click="
                      dialog.open(
                        'redelegate',
                        {
                          validator_address: v.delegation.validator_address,
                        },
                        updateEvent
                      )
                      ">{{ $t('account.btn_redelegate') }}</label>
                  <label v-if="!hideButtons" for="unbond"
                    class="btn btn-primary btn-xs hover:text-black dark:hover:text-white" @click="
                      dialog.open(
                        'unbond',
                        {
                          validator_address: v.delegation.validator_address,
                        },
                        updateEvent
                      )
                      ">{{ $t('account.btn_unbond') }}</label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Unbonding Delegations -->
    <div class="bg-base-100 dark:bg-base100 px-4 pt-3 pb-4 rounded mb-4 shadow"
      v-if="unbonding && unbonding.length > 0">
      <h2 class="card-title mb-4">{{ $t('account.unbonding_delegations') }}</h2>
      <div class="overflow-x-auto">
        <table class="table text-sm w-full">
          <thead>
            <tr>
              <th class="py-3">{{ $t('account.creation_height') }}</th>
              <th class="py-3">{{ $t('account.initial_balance') }}</th>
              <th class="py-3">{{ $t('account.balance') }}</th>
              <th class="py-3">{{ $t('account.completion_time') }}</th>
            </tr>
          </thead>
          <tbody class="text-sm" v-for="(v, index) in unbonding" :key="index">
            <tr>
              <td class="text-caption text-primary py-3 bg-slate-200" colspan="10">
                <RouterLink :to="`/${chain}/staking/${v.validator_address}`">{{
                  v.validator_address
                }}</RouterLink>
              </td>
            </tr>
            <tr v-for="(entry, i) in v.entries" :key="i">
              <td class="py-3">{{ entry.creation_height }}</td>
              <td class="py-3">
                {{
                  format.formatToken(
                    {
                      amount: entry.initial_balance,
                      denom: stakingStore.params.bond_denom,
                    },
                    true,
                    '0,0.[00]'
                  )
                }}
              </td>
              <td class="py-3">
                {{
                  format.formatToken(
                    {
                      amount: entry.balance,
                      denom: stakingStore.params.bond_denom,
                    },
                    true,
                    '0,0.[00]'
                  )
                }}
              </td>
              <td class="py-3">
                <Countdown :time="new Date(entry.completion_time).getTime() -
                  new Date().getTime()
                  " />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Transactions -->
    <div class="bg-base-100 dark:bg-base100 px-4 pt-3 pb-4 rounded mb-4 shadow">
      <h2 class="card-title mb-4">{{ $t('account.transactions') }}</h2>
      <div class="overflow-x-auto">
        <table class="table w-full text-sm">
          <thead>
            <tr>
              <th class="py-3">{{ $t('account.height') }}</th>
              <th class="py-3">{{ $t('account.hash') }}</th>
              <th class="py-3">{{ $t('account.messages') }}</th>
              <th class="py-3">{{ $t('account.time') }}</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr v-if="txs.length === 0">
              <td colspan="10">
                <div class="text-center">
                  {{ $t('account.no_transactions') }}
                </div>
              </td>
            </tr>
            <tr v-for="(v, index) in combinedTxs" :key="index">
              <td class="text-sm py-3">
                <RouterLink :to="`/${chain}/block/${v.height}`" class="text-primary dark:invert">{{ v.height }}
                </RouterLink>
              </td>
              <td class="truncate py-3" style="max-width: 200px">
                <RouterLink :to="`/${chain}/tx/${v.txhash}`" class="text-primary dark:invert">
                  {{ v.txhash }}
                </RouterLink>
              </td>
              <td class="flex items-center py-3">
                <div class="mr-2">
                  {{ format.messages(v.tx.body.messages, props.address) }}
                </div>
                <Icon v-if="v.code === 0" icon="mdi-check" class="text-success text-lg" />
                <Icon v-else icon="mdi-multiply" class="text-error text-lg" />
              </td>
              <td class="py-3">
                {{ format.toLocaleDate(v.timestamp) }}
                <span class="text-xs">({{ format.toDay(v.timestamp, 'from') }})</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Account -->
    <div class="bg-base-100 dark:bg-base100 px-4 pt-3 pb-4 rounded mb-4 shadow">
      <h2 class="card-title mb-4">{{ $t('account.acc') }}</h2>
      <DynamicComponent :value="account" />
    </div>

    <Teleport to="body">
      <div :class="isKiichain ? '' : 'hidden'">
        <!-- Rewards Modal -->
        <Modal :show="showRewardsModal === true" @close="showRewardsModal = false">
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
                      `Outstanding Rewards Balance: ${isKiichain
                        ? format.formatToken(walletRewardBalance)
                        : format.formatToken(
                          walletStore.balanceOfStakingToken,
                          false
                        )
                      }`
                    }}</span>
                  </div>
                  <div class="flex justify-center w-full py-2">
                    <button class="w-full rounded-lg bg-[#432ebe] text-white p-2" @click="withdrawRewardsTransaction()">
                      Withdraw KII Rewards
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Modal>
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
  <div v-else class="text-no text-sm">{{ $t('account.error') }}</div>
</template>
