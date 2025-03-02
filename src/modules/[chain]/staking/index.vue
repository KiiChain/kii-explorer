<script lang="ts" setup>
import {
  useBaseStore,
  useBlockchain,
  useFormatter,
  useMintStore,
  useStakingStore,
  useTxDialog,
  useWalletStore,
} from '@/stores';
import { computed } from '@vue/reactivity';
import { onMounted, ref } from 'vue';
import { Icon } from '@iconify/vue';
import type { Key, SlashingParam, Validator } from '@/types';
import { formatSeconds } from '@/libs/utils';
import { getRewardsBalance, getWalletBalance, stakeToValidator } from '@/libs/web3';
import Modal from '@/components/Modal.vue';
// @ts-ignore
import PulseLoader from 'vue-spinner/src/PulseLoader.vue'
import { toETHAddress } from '../../../libs/address';

const staking = useStakingStore();
const base = useBaseStore();
const format = useFormatter();
const dialog = useTxDialog();
const chainStore = useBlockchain();
const mintStore = useMintStore();
const walletStore = useWalletStore();

const cache = JSON.parse(localStorage.getItem('avatars') || '{}');
const avatars = ref(cache || {});
const latest = ref({} as Record<string, number>);
const yesterday = ref({} as Record<string, number>);
const tab = ref('active');
const unbondList = ref([] as Validator[]);
const slashing = ref({} as SlashingParam);
const showStakeModal = ref(false);
const selectedValidator = ref('');
const toStakeAmount = ref(0);
const loading = ref(false);
const evmWalletBalance = ref();
const rewardBalance = ref();
const loadingMessage = ref('');

const props = defineProps(['validator', 'chain']);
const isKiichain = props.chain === 'kiichain';

onMounted(async() => {
  staking.fetchInacitveValdiators().then((res) => {
    unbondList.value = res;
  });
  chainStore.rpc.getSlashingParams().then((res) => {
    slashing.value = res.params;
  });
  if(isKiichain){
    evmWalletBalance.value = await getWalletBalance(chainStore.current?.assets[0].base ?? '')
    rewardBalance.value = await getRewardsBalance(chainStore.current?.assets[0].base ?? '')
  }
});

async function fetchChange() {
  let page = 0;

  let height = Number(base.latest?.block?.header?.height || 0);
  if (height > 14400) {
    height -= 14400;
  } else {
    height = 1;
  }
  // voting power in 24h ago
  while (page < staking.validators.length && height > 0) {
    await base.fetchValidatorByHeight(height, page).then((x) => {
      x.validators.forEach((v) => {
        yesterday.value[v.pub_key.key] = Number(v.voting_power);
      });
    });
    page += 100;
  }

  page = 0;
  // voting power for now
  while (page < staking.validators.length) {
    await base.fetchLatestValidators(page).then((x) => {
      x.validators.forEach((v) => {
        latest.value[v.pub_key.key] = Number(v.voting_power);
      });
    });
    page += 100;
  }
}

const changes = computed(() => {
  const changes = {} as Record<string, number>;
  Object.keys(latest.value).forEach((k) => {
    const l = latest.value[k] || 0;
    const y = yesterday.value[k] || 0;
    changes[k] = l - y;
  });
  return changes;
});

const change24 = (key: Key) => {
  const txt = key.key;
  // const n: number = latest.value[txt];
  // const o: number = yesterday.value[txt];
  // // console.log( txt, n, o)
  // return n > 0 && o > 0 ? n - o : 0;
  return changes.value[txt];
};

const change24Text = (key?: Key) => {
  if (!key) return '';
  const v = change24(key);
  return v && v !== 0 ? format.showChanges(v) : '';
};

const change24Color = (key?: Key) => {
  if (!key) return '';
  const v = change24(key);
  if (v > 0) return 'text-success';
  if (v < 0) return 'text-error';
};

const calculateRank = function (position: number) {
  let sum = 0;
  for (let i = 0; i < position; i++) {
    sum += Number(staking.validators[i]?.delegator_shares);
  }
  const percent = sum / staking.totalPower;

  switch (true) {
    case tab.value === 'active' && percent < 0.33:
      return 'error';
    case tab.value === 'active' && percent < 0.67:
      return 'warning';
    default:
      return 'info';
  }
};

function isFeatured(
  endpoints: string[],
  who?: { website?: string; moniker: string }
) {
  if (!endpoints || !who) return false;
  return (
    endpoints.findIndex(
      (x) =>
        (who.website &&
          who.website
            ?.substring(0, who.website?.lastIndexOf('.'))
            .endsWith(x)) ||
        who?.moniker?.toLowerCase().search(x.toLowerCase()) > -1
    ) > -1
  );
}

const list = computed(() => {
  if (tab.value === 'active') {
    return staking.validators.map((x, i) => ({
      v: x,
      rank: calculateRank(i),
      logo: logo(x.description.identity),
    }));
  } else if (tab.value === 'featured') {
    const endpoint = chainStore.current?.endpoints?.rest?.map(
      (x) => x.provider
    );
    if (endpoint) {
      endpoint.push('ping');
      return staking.validators
        .filter((x) => isFeatured(endpoint, x.description))
        .map((x, i) => ({
          v: x,
          rank: 'primary',
          logo: logo(x.description.identity),
        }));
    }
    return [];
  }
  return unbondList.value.map((x, i) => ({
    v: x,
    rank: 'primary',
    logo: logo(x.description.identity),
  }));
});

const loadAvatars = () => {
  // fetch avatar from keybase
  let promise = Promise.resolve();
  staking.validators.forEach((item) => {
    promise = promise.then(
      () =>
        new Promise((resolve) => {
          const identity = item.description?.identity;
          if (identity && !avatars.value[identity]) {
            staking.keybase(identity).then((d) => {
              if (Array.isArray(d.them) && d.them.length > 0) {
                const uri = String(d.them[0]?.pictures?.primary?.url).replace(
                  'https://s3.amazonaws.com/keybase_processed_uploads/',
                  ''
                );
                if (uri) {
                  avatars.value[identity] = uri;
                  localStorage.setItem(
                    'avatars',
                    JSON.stringify(avatars.value)
                  );
                }
              }
              resolve();
            });
          } else {
            resolve();
          }
        })
    );
  });
};

const logo = (identity?: string) => {
  if (!identity || !avatars.value[identity]) return '';
  const url = avatars.value[identity] || '';
  return url.startsWith('http')
    ? url
    : `https://s3.amazonaws.com/keybase_processed_uploads/${url}`;
};

fetchChange();
loadAvatars();

const stakeTransaction = (validatorAddress: string, toStakeAmount: number) => {
  loadingMessage.value = "Converting KII to sKII (Staked KII)..."
  stakeToValidator(validatorAddress, toStakeAmount, loading, loadingMessage);
};

const walletBalance = computed(() => evmWalletBalance.value);
const walletRewardBalance = computed(() => rewardBalance.value);

</script>
<template>
  <div>
    <div
      class="bg-base-100 dark:bg-base100 rounded-lg grid sm:grid-cols-1 md:grid-cols-4 p-4"
    >
      <div class="flex">
        <span>
          <div
            class="relative w-9 h-9 rounded overflow-hidden flex items-center justify-center mr-2"
          >
            <Icon class="text-success" icon="mdi:trending-up" size="32" />
            <div
              class="absolute top-0 left-0 bottom-0 right-0 opacity-20 bg-success"
            ></div>
          </div>
        </span>
        <span>
          <div class="font-bold">{{ format.percent(mintStore.inflation) }}</div>
          <div class="text-xs">{{ $t('staking.inflation') }}</div>
        </span>
      </div>
      <div class="flex">
        <span>
          <div
            class="relative w-9 h-9 rounded overflow-hidden flex items-center justify-center mr-2"
          >
            <Icon class="text-warning" icon="mdi:lock-open-outline" size="32" />
            <div
              class="absolute top-0 left-0 bottom-0 right-0 opacity-20 bg-warning"
            ></div>
          </div>
        </span>
        <span>
          <div class="font-bold">
            {{ formatSeconds(staking.params?.unbonding_time) }}
          </div>
          <div class="text-xs">{{ $t('staking.unbonding_time') }}</div>
        </span>
      </div>
      <div class="flex">
        <span>
          <div
            class="relative w-9 h-9 rounded overflow-hidden flex items-center justify-center mr-2"
          >
            <Icon
              class="text-error"
              icon="mdi:alert-octagon-outline"
              size="32"
            />
            <div
              class="absolute top-0 left-0 bottom-0 right-0 opacity-20 bg-error"
            ></div>
          </div>
        </span>
        <span>
          <div class="font-bold">
            {{ format.percent(slashing.slash_fraction_double_sign) }}
          </div>
          <div class="text-xs">{{ $t('staking.double_sign_slashing') }}</div>
        </span>
      </div>
      <div class="flex">
        <span>
          <div
            class="relative w-9 h-9 rounded overflow-hidden flex items-center justify-center mr-2"
          >
            <Icon class="text-error" icon="mdi:pause" size="32" />
            <div
              class="absolute top-0 left-0 bottom-0 right-0 opacity-20 bg-error"
            ></div>
          </div>
        </span>
        <span>
          <div class="font-bold">
            {{ format.percent(slashing.slash_fraction_downtime) }}
          </div>
          <div class="text-xs">{{ $t('staking.downtime_slashing') }}</div>
        </span>
      </div>
    </div>

    <div>
      <div class="flex items-center justify-between py-1">
        <div class="tabs tabs-boxed bg-transparent">
          <a
            class="tab text-gray-400"
            :class="{ 'tab-active': tab === 'featured' }"
            @click="tab = 'featured'"
            >{{ $t('staking.popular') }}</a
          >
          <a
            class="tab text-gray-400"
            :class="{ 'tab-active': tab === 'active' }"
            @click="tab = 'active'"
            >{{ $t('staking.active') }}</a
          >
          <a
            class="tab text-gray-400"
            :class="{ 'tab-active': tab === 'inactive' }"
            @click="tab = 'inactive'"
            >{{ $t('staking.inactive') }}</a
          >
        </div>

        <div class="text-lg font-semibold">
          {{ list.length }}/{{ staking.params.max_validators }}
        </div>
      </div>

      <div class="bg-base-100 dark:bg-base100 px-4 pt-3 pb-4 rounded shadow">
        <div class="overflow-x-auto">
          <table class="table staking-table w-full">
            <thead>
              <tr>
                <th
                  scope="col"
                  class="uppercase"
                  style="width: 3rem; position: relative"
                >
                  {{ $t('staking.rank') }}
                </th>
                <th scope="col" class="uppercase">
                  {{ $t('staking.validator') }}
                </th>
                <th scope="col" class="text-right uppercase">
                  {{ $t('staking.voting_power') }}
                </th>
                <th scope="col" class="text-right uppercase">
                  {{ $t('staking.24h_changes') }}
                </th>
                <th scope="col" class="text-right uppercase">
                  {{ $t('staking.commission') }}
                </th>
                <th scope="col" class="text-center uppercase">
                  {{ $t('staking.actions') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="({ v, rank, logo }, i) in list"
                :key="v.operator_address"
                class="hover:bg-gray-100 dark:hover:bg-[#384059]"
              >
                <!-- 👉 rank -->
                <td>
                  <div
                    class="text-xs truncate relative px-2 py-1 rounded-full w-fit"
                    :class="`text-${rank}`"
                  >
                    <span
                      class="inset-x-0 inset-y-0 opacity-10 absolute"
                      :class="`bg-${rank}`"
                    ></span>
                    {{ i + 1 }}
                  </div>
                </td>
                <!-- 👉 Validator -->
                <td>
                  <div
                    class="flex items-center overflow-hidden"
                    style="max-width: 300px"
                  >
                    <div
                      class="avatar mr-4 relative w-8 h-8 rounded-full overflow-hidden"
                    >
                      <div
                        class="w-8 h-8 rounded-full bg-gray-400 absolute opacity-10"
                      ></div>
                      <div class="w-8 h-8 rounded-full">
                        <img v-if="logo" :src="logo" class="object-contain" />
                        <Icon
                          v-else
                          class="text-4xl"
                          :icon="`mdi-help-circle-outline`"
                        />
                      </div>
                    </div>

                    <div class="flex flex-col">
                      <span
                        class="text-sm text-primary dark:invert whitespace-nowrap overflow-hidden"
                      >
                        <RouterLink
                          :to="{
                            name: 'chain-staking-validator',
                            params: {
                              validator: v.operator_address,
                            },
                          }"
                          class="font-weight-medium"
                        >
                          {{ v.description?.moniker }}
                        </RouterLink>
                      </span>
                      <span class="text-xs">{{
                        v.description?.website || v.description?.identity || '-'
                      }}</span>
                    </div>
                  </div>
                </td>

                <!-- 👉 Voting Power -->
                <td class="text-right">
                  <div class="flex flex-col">
                    <h6 class="text-sm font-weight-medium whitespace-nowrap">
                      {{
                        format.formatToken(
                          {
                            amount: parseInt(v.tokens).toString(),
                            denom: staking.params.bond_denom,
                          },
                          true,
                          '0,0'
                        )
                      }}
                    </h6>
                    <span class="text-xs">{{
                      format.calculatePercent(
                        v.delegator_shares,
                        staking.totalPower
                      )
                    }}</span>
                  </div>
                </td>
                <!-- 👉 24h Changes -->
                <td
                  class="text-right text-xs"
                  :class="change24Color(v.consensus_pubkey)"
                >
                  {{ change24Text(v.consensus_pubkey) }}
                </td>
                <!-- 👉 commission -->
                <td class="text-right text-xs">
                  {{
                    format.formatCommissionRate(
                      v.commission?.commission_rates?.rate
                    )
                  }}
                </td>
                <!-- 👉 Action -->
                <td class="text-center">
                  <div
                    v-if="v.jailed"
                    class="badge badge-error gap-2 text-white"
                  >
                    {{ $t('staking.jailed') }}
                  </div>

                  <label
                    for="delegate"
                    class="btn btn-xs btn-primary rounded-sm capitalize hover:text-black dark:hover:text-white"
                    :class="isKiichain ? 'hidden' : ''"
                    @click="
                      dialog.open('delegate', {
                        validator_address: v.operator_address,
                      })
                    "
                    >{{ $t('account.btn_delegate') }}</label
                  >
                  <label
                    class="btn btn-xs btn-primary rounded-sm capitalize hover:text-black dark:hover:text-white"
                    :class="isKiichain ? '' : 'hidden'"
                    @click="
                      (selectedValidator = v.operator_address) &&
                        (showStakeModal = true)
                    "
                    >{{ $t('account.btn_delegate') }}</label
                  >
                  <Teleport to="body">
                    <!-- Stake Modal -->
                    <Modal
                      :show="
                        selectedValidator === v.operator_address &&
                        (showStakeModal = true)
                      "
                      @close="
                        (selectedValidator = '') && (showStakeModal = false)
                      "
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="divider"></div>
        <div class="flex flex-row items-center">
          <div
            class="text-xs truncate relative py-2 px-4 rounded-md w-fit text-error mr-2"
          >
            <span
              class="inset-x-0 inset-y-0 opacity-10 absolute bg-error"
            ></span>
            {{ $t('staking.top') }} 33%
          </div>
          <div
            class="text-xs truncate relative py-2 px-4 rounded-md w-fit text-warning"
          >
            <span
              class="inset-x-0 inset-y-0 opacity-10 absolute bg-warning"
            ></span>
            {{ $t('staking.top') }} 67%
          </div>
          <div class="text-xs hidden md:!block pl-2">
            {{ $t('staking.description') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<route>
  {
    meta: {
      i18n: 'staking',
      order: 3,
      icon: 'ph:coin-fill'
    }
  }
</route>

<style>
.staking-table.table :where(th, td) {
  padding: 8px 5px;
  background: transparent;
}
</style>
