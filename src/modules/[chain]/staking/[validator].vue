<script setup lang="ts">
import {
  useBlockchain,
  useFormatter,
  useMintStore,
  useStakingStore,
  useTxDialog,
  useWalletStore,
} from '@/stores';
import { onMounted, computed, ref } from 'vue';
import { Icon } from '@iconify/vue';
import CommissionRate from '@/components/ValidatorCommissionRate.vue';
import {
  consensusPubkeyToHexAddress,
  operatorAddressToAccount,
  pubKeyToValcons,
  valoperToPrefix,
} from '@/libs';
import type { Coin, Delegation, PaginatedTxs, Validator } from '@/types';
import Modal from '@/components/Modal.vue';
import { getRewardsBalance, getWalletBalance, stakeToValidator, withdrawRewardsBalance } from '@/libs/web3';
// @ts-ignore
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import { toETHAddress } from '../../../libs/address';

const props = defineProps(['validator', 'chain']);

const staking = useStakingStore();
const blockchain = useBlockchain();
const format = useFormatter();
const dialog = useTxDialog();
const walletStore = useWalletStore();

const validator: string = props.validator;

const v = ref({} as Validator);
const cache = JSON.parse(localStorage.getItem('avatars') || '{}');
const avatars = ref(cache || {});
const identity = ref('');
const rewards = ref([] as Coin[] | undefined);
const commission = ref([] as Coin[] | undefined);
const addresses = ref(
  {} as {
    account: string;
    operAddress: string;
    hex: string;
    valCons: string;
  }
);
const selfBonded = ref({} as Delegation);
const showStakeModal = ref(false);
const showRewardsModal = ref(false);
const selectedValidator = ref('');
const toStakeAmount = ref(0);
const loading = ref(false);
const evmWalletBalance = ref()
const rewardBalance = ref()
const loadingMessage = ref('');

const isKiichain = props.chain === 'kiichain';

addresses.value.account = operatorAddressToAccount(validator);
// load self bond
staking
  .fetchValidatorDelegation(validator, addresses.value.account)
  .then((x) => {
    if (x) {
      selfBonded.value = x.delegation_response;
    }
  });

const txs = ref({} as PaginatedTxs);

blockchain.rpc.getTxsBySender(addresses.value.account).then((x) => {
  txs.value = x;
});

const apr = computed(() => {
  const rate = v.value.commission?.commission_rates.rate || 0;
  const inflation = useMintStore().inflation;
  if (Number(inflation)) {
    return format.percent((1 - Number(rate)) * Number(inflation));
  }
  return '-';
});

const selfRate = computed(() => {
  if (selfBonded.value.balance?.amount) {
    return format.calculatePercent(
      selfBonded.value.balance.amount,
      v.value.tokens
    );
  }
  return '-';
});
const logo = (identity?: string) => {
  if (!identity) return '';
  const url = avatars.value[identity] || '';
  return url.startsWith('http')
    ? url
    : `https://s3.amazonaws.com/keybase_processed_uploads/${url}`;
};
onMounted(async() => {
  if (validator) {
    staking.fetchValidator(validator).then((res) => {
      v.value = res.validator;
      identity.value = res.validator?.description?.identity || '';
      if (identity.value && !avatars.value[identity.value]) {
        staking.keybase(identity.value).then((d) => {
          if (Array.isArray(d.them) && d.them.length > 0) {
            const uri = String(d.them[0]?.pictures?.primary?.url).replace(
              'https://s3.amazonaws.com/keybase_processed_uploads/',
              ''
            );
            if (uri) {
              avatars.value[identity.value] = uri;
              localStorage.setItem('avatars', JSON.stringify(avatars.value));
            }
          }
        });
      }
      const prefix = valoperToPrefix(v.value.operator_address) || '<Invalid>';
      addresses.value.hex = consensusPubkeyToHexAddress(
        v.value.consensus_pubkey
      );
      addresses.value.valCons = pubKeyToValcons(
        v.value.consensus_pubkey,
        prefix
      );
    });
    blockchain.rpc
      .getDistributionValidatorOutstandingRewards(validator)
      .then((res) => {
        rewards.value = res.rewards?.rewards?.sort(
          (a, b) => Number(b.amount) - Number(a.amount)
        );
        res.rewards?.rewards?.forEach((x) => {
          if (x.denom.startsWith('ibc/')) {
            format.fetchDenomTrace(x.denom);
          }
        });
      });
    blockchain.rpc.getDistributionValidatorCommission(validator).then((res) => {
      commission.value = res.commission?.commission?.sort(
        (a, b) => Number(b.amount) - Number(a.amount)
      );
      res.commission?.commission?.forEach((x) => {
        if (x.denom.startsWith('ibc/')) {
          format.fetchDenomTrace(x.denom);
        }
      });
    });
    if(isKiichain){
      evmWalletBalance.value = await getWalletBalance(blockchain.current?.assets[0].base ?? '')
      rewardBalance.value = await getRewardsBalance(blockchain.current?.assets[0].base ?? '')
    }
  }
});
let showCopyToast = ref(0);
const copyWebsite = async (url: string) => {
  if (!url) {
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    showCopyToast.value = 1;
    setTimeout(() => {
      showCopyToast.value = 0;
    }, 1000);
  } catch (err) {
    showCopyToast.value = 2;
    setTimeout(() => {
      showCopyToast.value = 0;
    }, 1000);
  }
};
const tipMsg = computed(() => {
  return showCopyToast.value === 2
    ? { class: 'error', msg: 'Copy Error!' }
    : { class: 'success', msg: 'Copy Success!' };
});

const stakeTransaction = (validatorAddress: string, toStakeAmount: number) => {
  loadingMessage.value = "Converting KII to sKII (Staked KII)..."
  stakeToValidator(validatorAddress, toStakeAmount, loading, loadingMessage);
};

const withdrawRewardsTransaction = () => {
  loadingMessage.value = "Withdrawing KII Rewards..."
  withdrawRewardsBalance(blockchain.current?.assets[0].base ?? '', loading, loadingMessage);
};

const walletBalance = computed(() => evmWalletBalance.value);
const walletRewardBalance = computed(() => rewardBalance.value);

</script>
<template>
  <div>
    <div
      class="bg-base-100 dark:bg-base100 px-4 pt-3 pb-4 rounded shadow border-indigo-500"
    >
      <div class="flex flex-col lg:!flex-row pt-2 pb-1">
        <div class="flex-1">
          <div class="flex">
            <div class="avatar mr-4 relative w-24 rounded-lg overflow-hidden">
              <div class="w-24 rounded-lg absolute opacity-10"></div>
              <div class="w-24 rounded-lg">
                <img
                  v-if="avatars[identity] !== 'undefined'"
                  v-lazy="logo(identity)"
                  class="object-contain"
                />
                <Icon
                  v-else
                  class="text-4xl"
                  :icon="`mdi-help-circle-outline`"
                />
              </div>
            </div>
            <div class="mx-2">
              <h4>{{ v.description?.moniker }}</h4>
              <div class="text-sm mb-4">
                {{ v.description?.identity || '-' }}
              </div>
              <label
                for="delegate"
                class="btn btn-primary btn-sm w-full hover:text-black dark:hover:text-white"
                :class="isKiichain ? 'hidden' : ''"
                @click="
                  dialog.open('delegate', {
                    validator_address: v.operator_address,
                  })
                "
                >{{ $t('account.btn_delegate') }}</label
              >
              <label
                class="btn btn-primary btn-sm w-full hover:text-black dark:hover:text-white"
                :class="isKiichain ? '' : 'hidden'"
                @click="
                  ((selectedValidator = v.operator_address) && (showStakeModal = true) && (showRewardsModal = false))
                "
                >{{ $t('account.btn_delegate') }}</label
              >
              <Teleport to="body">
                <!-- Stake Modal -->
                <Modal
                  :show="((selectedValidator === v.operator_address) && (showStakeModal === true))"
                  @close="((selectedValidator = '') && (showStakeModal = false))"
                >
                  <template #header>
                    <h1 class="text-2xl">Stake KII</h1>
                  </template>
                  <template #body>
                    <div class="w-full">
                      Stake your KII to the many validators and to earn more KII!
                      <div class="py-4">
                        Use <span class="text-green-500">KII</span> to stake in
                        validators for rewards.
                      </div>
                      <div class="w-full">
                        <div class="flex-col">
                          <div class="flex justify-center py-2">
                            <span class="text-green-500">{{
                              `KII Balance: ${isKiichain?format.formatToken(walletBalance):format.formatToken(
                                walletStore.balanceOfStakingToken,
                                false
                              )}`
                            }}</span>
                          </div>
                          <div class="flex flex-col justify-center gap-4 py-2">
                            <input
                              class="w-full rounded p-1"
                              type="number"
                              placeholder="Enter number of tokens to stake..."
                              min="0.000001"
                              step="0.000001"
                              v-model.number="toStakeAmount"
                            />
                            <span class="truncate">{{
                              `Validator: ${toETHAddress(v.operator_address)}`
                            }}</span>
                          </div>
                          <div class="flex justify-center w-full py-2">
                            <button
                              class="w-full rounded-lg bg-[#432ebe] text-white p-2"
                              @click="
                                stakeTransaction(
                                  v.operator_address,
                                  toStakeAmount
                                )
                              "
                            >
                              Stake KII
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </Modal>

                <!-- Rewards Modal -->
                <Modal
                  :show="((selectedValidator === v.operator_address) && (showRewardsModal === true))"
                  @close="((selectedValidator = '') && (showRewardsModal = false))"
                >
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
                              `Outstanding Rewards Balance: ${isKiichain?format.formatToken(walletRewardBalance):format.formatToken(
                                walletStore.balanceOfStakingToken,
                                false
                              )}`
                            }}</span>
                          </div>
                          <div class="flex justify-center w-full py-2">
                            <button
                              class="w-full rounded-lg bg-[#432ebe] text-white p-2"
                              @click="
                                withdrawRewardsTransaction()
                              "
                            >
                              Withdraw KII Rewards
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </Modal>

                <!-- Loading Modal -->
                <Modal :show="loading" @close="loading = false">
                  <template #header>
                    <h1 class="text-2xl">{{ loadingMessage }}</h1>
                  </template>
                  <template #body>
                    <PulseLoader />
                  </template>
                  <template #footer>
                    <div />
                  </template>
                </Modal>
              </Teleport>
            </div>
          </div>
          <div class="m-4 text-sm">
            <p class="text-sm mb-3 font-medium">{{ $t('staking.about_us') }}</p>
            <div class="card-list">
              <div class="flex items-center mb-2">
                <Icon icon="mdi-web" class="text-xl mr-1" />
                <span class="font-bold mr-2"
                  >{{ $t('staking.website') }}:
                </span>
                <a
                  :href="v?.description?.website || '#'"
                  :class="
                    v?.description?.website
                      ? 'cursor-pointer'
                      : 'cursor-default'
                  "
                >
                  {{ v.description?.website || '-' }}
                </a>
              </div>
              <div class="flex items-center">
                <Icon icon="mdi-email-outline" class="text-xl mr-1" />
                <span class="font-bold mr-2"
                  >{{ $t('staking.contact') }}:
                </span>
                <a
                  v-if="v.description?.security_contact"
                  :href="'mailto:' + v.description.security_contact || '#'"
                  class="cursor-pointer"
                >
                  {{ v.description?.security_contact || '-' }}
                </a>
              </div>
            </div>
            <p class="text-sm mt-4 mb-3 font-medium">
              {{ $t('staking.validator_status') }}
            </p>
            <div class="card-list">
              <div class="flex items-center mb-2">
                <Icon icon="mdi-shield-account-outline" class="text-xl mr-1" />
                <span class="font-bold mr-2">{{ $t('staking.status') }}: </span
                ><span>
                  {{ String(v.status).replace('BOND_STATUS_', '') }}
                </span>
              </div>
              <div class="flex items-center">
                <Icon icon="mdi-shield-alert-outline" class="text-xl mr-1" />
                <span class="font-bold mr-2">{{ $t('staking.jailed') }}: </span>
                <span> {{ v.jailed || '-' }} </span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex-1">
          <div class="flex flex-col justify-between">
            <div class="flex mb-2">
              <div
                class="flex items-center justify-center rounded w-10 h-10"
                style="border: 1px solid #666"
              >
                <Icon icon="mdi-coin" class="text-3xl" />
              </div>
              <div class="ml-3 flex flex-col justify-center">
                <h4>
                  {{
                    format.formatToken2({
                      amount: v.tokens,
                      denom: staking.params.bond_denom,
                    })
                  }}
                </h4>
                <span class="text-sm">{{ $t('staking.total_bonded') }}</span>
              </div>
            </div>
            <div class="flex mb-2">
              <div
                class="flex items-center justify-center rounded w-10 h-10"
                style="border: 1px solid #666"
              >
                <Icon icon="mdi-percent" class="text-3xl" />
              </div>
              <div class="ml-3 flex flex-col justify-center">
                <h4>
                  {{ format.formatToken(selfBonded.balance) }} ({{ selfRate }})
                </h4>
                <span class="text-sm">{{ $t('staking.self_bonded') }}</span>
              </div>
            </div>

            <div class="flex mb-2">
              <div
                class="flex items-center justify-center rounded w-10 h-10"
                style="border: 1px solid #666"
              >
                <Icon icon="mdi-account-tie" class="text-3xl" />
              </div>

              <div class="ml-3 flex flex-col">
                <h4>
                  {{ v.min_self_delegation }} {{ staking.params.bond_denom }}
                </h4>
                <span class="text-sm">{{ $t('staking.min_self') }}</span>
              </div>
            </div>
            <div class="flex mb-2">
              <div
                class="flex items-center justify-center rounded w-10 h-10"
                style="border: 1px solid #666"
              >
                <Icon icon="mdi-finance" class="text-3xl" />
              </div>
              <div class="ml-3 flex flex-col justify-center">
                <h4>{{ apr }}</h4>
                <span class="text-sm">{{ $t('staking.annual_profit') }}</span>
              </div>
            </div>

            <div class="flex mb-2">
              <div
                class="flex items-center justify-center rounded w-10 h-10"
                style="border: 1px solid #666"
              >
                <Icon
                  icon="mdi:arrow-down-bold-circle-outline"
                  class="text-3xl"
                />
              </div>
              <div class="ml-3 flex flex-col justify-center">
                <h4>{{ v.unbonding_height }}</h4>
                <span class="text-sm">{{
                  $t('staking.unbonding_height')
                }}</span>
              </div>
            </div>

            <div class="flex mb-2">
              <div
                class="flex items-center justify-center rounded w-10 h-10"
                style="border: 1px solid #666"
              >
                <Icon icon="mdi-clock" class="text-3xl" />
              </div>
              <div class="ml-3 flex flex-col justify-center">
                <h4
                  v-if="
                    v.unbonding_time && !v.unbonding_time.startsWith('1970')
                  "
                >
                  {{ format.toDay(v.unbonding_time, 'from') }}
                </h4>
                <h4 v-else>-</h4>
                <span class="text-sm">{{ $t('staking.unbonding_time') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="text-sm px-4 pt-3 border-t">{{ v.description?.details }}</div>
    </div>

    <div class="mt-3 grid grid-cols-1 md:!grid-cols-3 gap-4">
      <div>
        <CommissionRate :commission="v.commission"></CommissionRate>
      </div>
      <div
        class="bg-base-100 dark:bg-base100 rounded shadow relative overflow-auto"
      >
        <div class="text-lg font-semibold text-main px-4 pt-4">
          {{ $t('staking.commissions_&_rewards') }}
        </div>
        <div
          class="px-4 mt-1 flex flex-col justify-between pb-4"
          style="height: calc(100% - 50px)"
        >
          <div class="overflow-auto flex-1">
            <div class="text-sm mb-2">{{ $t('staking.commissions') }}</div>
            <div
              v-for="(i, k) in commission"
              :key="`reward-${k}`"
              color="info"
              label
              variant="outlined"
              class="mr-1 mb-1 badge text-xs"
            >
              {{ format.formatToken2(i) }}
            </div>
            <div class="text-sm mb-2 mt-2">
              {{ $t('staking.outstanding') }} {{ $t('account.rewards') }}
            </div>
            <div
              v-for="(i, k) in rewards"
              :key="`reward-${k}`"
              class="mr-1 mb-1 badge text-xs"
            >
              {{ format.formatToken2(i) }}
            </div>
          </div>
          <div class="">
            <label
              for="withdraw_commission"
              class="btn btn-primary w-full hover:text-black dark:hover:text-white"
              :class="isKiichain?'hidden':''"
              @click="
                dialog.open('withdraw_commission', {
                  validator_address: v.operator_address,
                })
              "
              >{{ $t('account.btn_withdraw') }}</label
            >
            <label
              class="btn btn-primary w-full hover:text-black dark:hover:text-white"
              :class="isKiichain?'':'hidden'"
              @click="((selectedValidator = v.operator_address) && (showRewardsModal = true) && (showStakeModal = false))"
              >{{ $t('account.btn_withdraw') }}</label>
          </div>
        </div>
      </div>
      <div class="bg-base-100 dark:bg-base100 rounded shadow overflow-x-auto">
        <div class="px-4 pt-4 mb-2 text-main font-lg font-semibold">
          {{ $t('staking.addresses') }}
        </div>
        <div class="px-4 pb-4">
          <div class="mb-3">
            <div class="text-sm flex">
              {{ $t('staking.account_addr') }}
              <Icon
                icon="mdi:content-copy"
                class="ml-2 cursor-pointer"
                v-show="addresses.account"
                @click="copyWebsite(addresses.account || '')"
              />
            </div>
            <RouterLink
              class="text-xs text-primary"
              :to="`/${chain}/account/${addresses.account}`"
            >
              {{ addresses.account }}
            </RouterLink>
          </div>
          <div class="mb-3">
            <div class="text-sm flex">
              {{ $t('staking.operator_addr') }}
              <Icon
                icon="mdi:content-copy"
                class="ml-2 cursor-pointer"
                v-show="v.operator_address"
                @click="copyWebsite(v.operator_address || '')"
              />
            </div>
            <div class="text-xs">
              {{ v.operator_address }}
            </div>
          </div>
          <div class="mb-3">
            <div class="text-sm flex">
              {{ $t('staking.hex_addr') }}
              <Icon
                icon="mdi:content-copy"
                class="ml-2 cursor-pointer"
                v-show="addresses.hex"
                @click="copyWebsite(addresses.hex || '')"
              />
            </div>
            <div class="text-xs">{{ addresses.hex }}</div>
          </div>
          <div class="mb-3">
            <div class="text-sm flex">
              {{ $t('staking.signer_addr') }}
              <Icon
                icon="mdi:content-copy"
                class="ml-2 cursor-pointer"
                v-show="addresses.valCons"
                @click="copyWebsite(addresses.valCons || '')"
              />
            </div>
            <div class="text-xs">{{ addresses.valCons }}</div>
          </div>
          <div>
            <div class="text-sm flex">
              {{ $t('staking.consensus_pub_key') }}
              <Icon
                icon="mdi:content-copy"
                class="ml-2 cursor-pointer"
                v-show="v.consensus_pubkey"
                @click="copyWebsite(JSON.stringify(v.consensus_pubkey) || '')"
              />
            </div>
            <div class="text-xs">{{ v.consensus_pubkey }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-5 bg-base-100 dark:bg-base100 shadow rounded p-4">
      <div class="text-lg mb-4 font-semibold">
        {{ $t('account.transactions') }}
      </div>
      <div class="rounded overflow-auto">
        <table class="table validatore-table w-full">
          <thead>
            <th class="text-left pl-4" style="position: relative; z-index: 2">
              {{ $t('account.height') }}
            </th>
            <th class="text-left pl-4">{{ $t('account.hash') }}</th>
            <th class="text-left pl-4" width="40%">
              {{ $t('account.messages') }}
            </th>
            <th class="text-left pl-4">{{ $t('account.time') }}</th>
          </thead>
          <tbody>
            <tr v-for="(item, i) in txs.tx_responses" :key="i">
              <td class="text-sm text-primary">
                <RouterLink
                  :to="`/${props.chain}/block/${item.height}`"
                  class="text-primary dark:invert"
                  >{{ item.height }}</RouterLink
                >
              </td>
              <td class="truncate text-primary" style="max-width: 200px">
                <RouterLink
                  :to="`/${props.chain}/tx/${item.txhash}`"
                  class="text-primary dark:invert"
                >
                  {{ item.txhash }}
                </RouterLink>
              </td>
              <td>
                <div class="flex items-center">
                  <span class="mr-2">{{
                    format.messages(item.tx.body.messages)
                  }}</span>
                  <Icon
                    v-if="item.code === 0"
                    icon="mdi-check"
                    class="text-yes"
                  />
                  <Icon v-else icon="mdi-multiply" class="text-no" />
                </div>
              </td>
              <td width="150">{{ format.toDay(item.timestamp, 'from') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="toast" v-show="showCopyToast === 1">
      <div class="alert alert-success">
        <div class="text-xs md:!text-sm">
          <span>{{ tipMsg.msg }}</span>
        </div>
      </div>
    </div>
    <div class="toast" v-show="showCopyToast === 2">
      <div class="alert alert-error">
        <div class="text-xs md:!text-sm">
          <span>{{ tipMsg.msg }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.validatore-table.table :where(th, td) {
  padding: 0.6rem 1rem;
  font-size: 14px;
}
</style>
