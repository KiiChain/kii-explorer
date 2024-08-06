<script lang="ts" setup>
import { CosmosRestClient } from '@/libs/client';
import { useBlockchain, useDashboard, useFormatter } from '@/stores';
import type { Coin, CoinWithPrice, Delegation } from '@/types';
import { fromBech32, toBase64, toBech32, toHex } from '@cosmjs/encoding';
import { Icon } from '@iconify/vue';
import { computed } from 'vue';
import { ref } from 'vue';
import {
  scanLocalKeys,
  type AccountEntry,
  scanCompatibleAccounts,
  type LocalKey,
  kiiConvertedAddress,
  isEvmAddress,
} from './utils';
import axios from 'axios';

const dashboard = useDashboard();
const chainStore = useBlockchain();
const format = useFormatter();
const sourceAddress = ref(''); //
const requestTokenLoader = ref(false);
const requestTokenMessage = ref('');
const requestTokenErrorMessage = ref('');
const selectedSource = ref({} as LocalKey); //
const importStep = ref('step1');

const conf = ref(
  JSON.parse(localStorage.getItem('imported-addresses') || '{}') as Record<
    string,
    AccountEntry[]
  >
);
const balances = ref({} as Record<string, CoinWithPrice[]>);
const delegations = ref({} as Record<string, Delegation[]>);

// initial loading queue
// load balances
Object.values(conf.value).forEach((imported) => {
  let promise = Promise.resolve();
  for (let i = 0; i < imported.length; i++) {
    promise = promise.then(
      () =>
        new Promise((resolve) => {
          // continue only if the page is living
          if (imported[i].endpoint) {
            loadBalances(
              imported[i].endpoint || '',
              imported[i].address
            ).finally(() => resolve());
          } else {
            resolve();
          }
        })
    );
  }
});

const accounts = computed(() => {
  let a = [] as {
    key: string;
    subaccounts: {
      account: AccountEntry;
      delegation: CoinWithPrice;
      balances: CoinWithPrice[];
    }[];
  }[];
  Object.values(conf.value).forEach((x) => {
    const composition = x.map((entry) => {
      const d = delegations.value[entry.address];
      let delegation = {} as CoinWithPrice;
      if (d && d.length > 0) {
        d.forEach((b) => {
          delegation.amount = (
            Number(b.balance.amount) + Number(delegation.amount || 0)
          ).toFixed();
          delegation.denom = b.balance.denom;
        });
        delegation.value = format.tokenValueNumber(delegation);
        delegation.change24h = format.priceChanges(delegation.denom);
      }
      return {
        account: entry,
        delegation,
        balances: balances.value[entry.address]
          ? balances.value[entry.address].map((x) => {
            const value = format.tokenValueNumber(x);
            return {
              amount: x.amount,
              denom: x.denom,
              value,
              change24h: format.priceChanges(x.denom),
            };
          })
          : [],
      };
    });
    if (x.at(0))
      a.push({ key: x.at(0)?.address || ' ', subaccounts: composition });
  });
  return a;
});

const addresses = computed(() => {
  return accounts.value.flatMap((x) =>
    x.subaccounts.map((a) => a.account.address)
  );
  // const temp = [] as string[]
  // accounts.value.forEach((x) => x.accounts.forEach(a => {
  //   temp.push(a.account.address)
  // }));
  // return temp
});

const totalValue = computed(() => {
  return accounts.value
    .flatMap((x) => x.subaccounts)
    .reduce((s, e) => {
      s += e.delegation.value || 0;
      e.balances.forEach((b) => {
        s += b.value || 0;
      });
      return s;
    }, 0);
});

const totalChange = computed(() => {
  return accounts.value
    .flatMap((x) => x.subaccounts)
    .reduce((s, e) => {
      s += ((e.delegation.change24h || 0) * (e.delegation.value || 0)) / 100;
      e.balances.forEach((b) => {
        s += ((b.change24h || 0) * (b.value || 0)) / 100;
      });
      return s;
    }, 0);
});

// Adding Model Boxes
const sourceOptions = computed(() => {
  // scan all connected wallet
  const keys = scanLocalKeys();
  // parser options from all existed keys
  Object.values(conf.value).forEach((x) => {
    const [first] = x;
    if (first) {
      let hex = ""
      if (isEvmAddress(first.address)) {
        hex = first.address
      } else {
        const { data } = fromBech32(first.address);
        hex = toHex(data);
      }
      if (
        keys.findIndex(
          (k) => toHex(fromBech32(k.cosmosAddress).data) === hex
        ) === -1
      ) {
        keys.push({
          cosmosAddress: first.address,
          hdPath: `m/44/${first.coinType}/0'/0/0`,
        });
      }
    }
  });

  // parse options from an given address
  if (sourceAddress.value) {
    const convertedAddress = kiiConvertedAddress(sourceAddress.value)
    const { prefix } = fromBech32(convertedAddress);
    const chain = Object.values(dashboard.chains).find(
      (x) => x.bech32Prefix === prefix
    );
    if (chain) {
      keys.push({
        cosmosAddress: sourceAddress.value,
        hdPath: `m/44/${chain.coinType}/0'/0/0`,
      });
    }
  }
  if (!selectedSource.value.cosmosAddress && keys.length > 0) {
    selectedSource.value = keys[0];
  }
  return keys;
});

const availableAccount = computed(() => {
  if (selectedSource.value.cosmosAddress) {
    return scanCompatibleAccounts([selectedSource.value]).filter(
      (x) => !addresses.value.includes(x.address)
    );
  }
  return [];
});

// helper functions
// remove address from the list
function removeAddress(addr: string) {
  const newConf = {} as Record<string, AccountEntry[]>;
  Object.keys(conf.value).forEach((key) => {
    const acc = conf.value[key].filter((x) => x.address !== addr);
    if (acc.length > 0) newConf[key] = acc;
  });
  conf.value = newConf;
  localStorage.setItem('imported-addresses', JSON.stringify(conf.value));
}

// add address to the local list
async function addAddress(acc: AccountEntry) {
  let key = ""
  if (!isEvmAddress(acc.address)) {
    const { data } = fromBech32(acc.address);
    key = toBase64(data);
  }
  key = acc.address
  if (conf.value[key]) {
    // existed
    if (conf.value[key].findIndex((x) => x.address === acc.address) > -1) {
      return;
    }
    conf.value[key].push(acc);
  } else {
    conf.value[key] = [acc];
  }

  // also add chain to favorite
  if (!dashboard?.favoriteMap?.[acc.chainName]) {
    dashboard.favoriteMap[acc.chainName] = true;
    window.localStorage.setItem(
      'favoriteMap',
      JSON.stringify(dashboard.favoriteMap)
    );
  }

  if (acc.endpoint) {
    loadBalances(acc.endpoint, acc.address);
  }
  localStorage.setItem('imported-addresses', JSON.stringify(conf.value));
}

// load balances for an address
async function loadBalances(endpoint: string, address: string) {
  const client = CosmosRestClient.newDefault(endpoint);
  await client.getBankBalances(address).then((res) => {
    balances.value[address] = res.balances.filter((x) => x.denom.length < 10);
  });
  await client.getStakingDelegations(address).then((res) => {
    delegations.value[address] = res.delegation_responses;
  });
}

async function requestTestnetTokens(address: string) {
  try {
    // Get the saved address
    const importedAddresses = JSON.parse(window.localStorage.getItem('imported-addresses')!)
    const chainInfo: AccountEntry = importedAddresses[address]

    // Toggle loader
    requestTokenLoader.value = true;
    requestTokenErrorMessage.value = '';
    requestTokenMessage.value = '';

    // Make API request
    const apiUrl = import.meta.env.VITE_APP_FAUCET_API_URL;
    let chain = "kiichain"
    if (chainInfo.chainName === "kii") {
      chain = "kiiventador"
    }
    const response = await axios.get(
      `${apiUrl}/faucet?address=${address}&chainId=${chain}`
    );
    requestTokenMessage.value = response.data;
    // Clear the message after 5 seconds
    setTimeout(() => {
      requestTokenMessage.value = '';
    }, 5000); // 5000 milliseconds = 5 seconds
  } catch (error) {
    console.error('Error while requesting testnet tokens:', error);
    requestTokenErrorMessage.value = 'Error: Unable to request testnet tokens';
  } finally {
    // Reset loader
    requestTokenLoader.value = false;
  }
}
</script>
<template>
  <div>
    <div class="w-full flex h-full my-12"
      style="background: url('/assets/Coins.png') no-repeat, url('/assets/Coins.png') no-repeat; background-size: 50%; background-position: 75% -5%, 120% -5%;">
      <div class="w-[40%] pl-4">
        <div class="relative w-full">
          <img src="/assets/bg_radial_gradients.png" style="max-width: unset;"
            class="z-[0] absolute top-0 -bottom-12 my-auto -left-24 right-0 mx-auto w-[110%]" />
          <h1 style="
          font-family: 'Montserrat', sans-serif;
          font-size: 60px;
          font-weight: 600;
          line-height: 73.14px;
          background: radial-gradient(circle at bottom,#C0FFFF 5%, #B8FFFF 10%, #4F43A1 90%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        " class="my-16 z-[1] relative">
            Welcome to<br />KiiChain's faucet
          </h1>
        </div>

        <div class="text-white my-6 pl-4">
          <div class="font-bold">How to use KiiChain's faucet</div>
          <ol style="list-style-type: decimal;" class="my-4 px-4">
            <li>Set up your testnet wallet here</li>
            <li>Insert your wallet address</li>
            <li>Claim your KII</li>
          </ol>
        </div>

        <div class="text-white space-y-2 pl-4 w-2/3">
          <div class="font-bold">Wallet Address</div>
          <div v-for="{ key, subaccounts } in accounts" class="space-y-4">
            <div class="flex justify-self-center">
              <div class="mx-2 p-2">
                <svg :fill="chainStore.current?.themeColor || '#666CFF'" height="28px" width="28px" version="1.1"
                  id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 487.5 487.5" xml:space="preserve">
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <g>
                      <g>
                        <path
                          d="M437,12.3C437,5.5,431.5,0,424.7,0H126.3C84.4,0,50.4,34.1,50.4,75.9v335.7c0,41.9,34.1,75.9,75.9,75.9h298.5 c6.8,0,12.3-5.5,12.3-12.3V139.6c0-6.8-5.5-12.3-12.3-12.3H126.3c-28.3,0-51.4-23.1-51.4-51.4S98,24.5,126.3,24.5h298.5 C431.5,24.5,437,19,437,12.3z M126.3,151.8h286.2V463H126.3c-28.3,0-51.4-23.1-51.4-51.4V131.7 C88.4,144.2,106.5,151.8,126.3,151.8z">
                        </path>
                        <path
                          d="M130.5,64.8c-6.8,0-12.3,5.5-12.3,12.3s5.5,12.3,12.3,12.3h280.1c6.8,0,12.3-5.5,12.3-12.3s-5.5-12.3-12.3-12.3H130.5z">
                        </path>
                        <path
                          d="M178,397.7c6.3,2.4,13.4-0.7,15.8-7.1l17.9-46.8h62.7c0.5,0,0.9-0.1,1.3-0.1l17.9,46.9c1.9,4.9,6.5,7.9,11.4,7.9 c1.5,0,2.9-0.3,4.4-0.8c6.3-2.4,9.5-9.5,7.1-15.8l-54-141.2c-3-7.9-10.4-13-18.8-13c-8.4,0-15.8,5.1-18.8,13l-54,141.2 C168.5,388.2,171.7,395.2,178,397.7z M243.7,260l22.7,59.3h-45.3L243.7,260z">
                        </path>
                      </g>
                    </g>
                  </g>
                </svg>
              </div>
              <div class="flex flex-col space-x-3">
                <div>
                  <div class="max-w-md overflow-hidden">
                    <div class="font-bold">{{ key }}</div>
                  </div>
                  <div class="dropdown">
                    <label tabindex="0" class="cursor-pointer">{{ subaccounts.length }} addresses</label>
                    <ul tabindex="0" class="-left-14 dropdown-content menu p-2 shadow bg-base-200 rounded-box z-50">
                      <li v-for="x in subaccounts">
                        <a>
                          <img :src="x.account.logo" class="w-8 h-8 mr-2" />
                          <span class="font-bold capitalize">{{ x.account.chainName }} <br />
                            <span class="text-xs font-normal sm:w-16 sm:overflow-hidden">{{ x.account.address }}</span>
                          </span>
                          <label class="btn btn-xs !btn-error" @click="removeAddress(x.account.address)">Remove</label>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <span class="text-accent" v-if="requestTokenLoader">Requesting testnet tokens</span>
                <span class="text-yes">{{ requestTokenMessage }}</span>
                <span class="text-error">{{ requestTokenErrorMessage }}</span>
              </div>

            </div>
            <div class="">
              <a href="#address-modal"
                class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                <svg class="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"
                  aria-hidden="true">
                  <path
                    d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
                  <path
                    d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
                </svg>
                Import Address
              </a>
              <RouterLink to="/wallet/keplr">
                <span class="btn btn-link text-white">Add chain to Keplr</span>
              </RouterLink>
            </div>

            <div class="brand-gradient-border-2">
              <div class="btn btn-sm btn-primary hover:text-black dark:hover:text-white w-full"
                @click="requestTestnetTokens(key)">
                Claim your tokens
              </div>
            </div>


          </div>
        </div>
      </div>
      <div class="grow"
        style="background: url('/assets/KII-Coin_1.png') no-repeat; background-position: center; background-size: contain;" />
    </div>

    <!-- Put this part before </body> tag -->
    <div class="modal" id="address-modal">
      <div class="modal-box">
        <a href="#" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</a>
        <h3 class="font-bold text-lg mb-2">Derive Account From Address</h3>
        <div v-show="importStep === 'step1'">
          <ul class="menu">
            <li v-for="source in sourceOptions" @click="
              selectedSource = source;
            importStep = 'step2';
            ">
              <a><label class="overflow-hidden flex flex-col">
                  <div class="font-bold">{{ source.cosmosAddress }}</div>
                  <div class="text-xs">{{ source.hdPath }}</div>
                </label></a>
            </li>
          </ul>
          <label class="my-2 p-2">
            <input v-model="sourceAddress" class="input input-bordered w-full input-sm" placeholder="Input an address"
              @change="importStep = 'step2'" />
          </label>
        </div>

        <div v-show="importStep === 'step2'" class="py-4 max-h-72 overflow-y-auto">
          <table class="table table-compact">
            <tr v-for="acc in availableAccount">
              <td>
                <div class="flex items-center space-x-2">
                  <div class="avatar">
                    <div class="mask mask-squircle w-8 h-8">
                      <img :src="acc.logo" :alt="acc.address" />
                    </div>
                  </div>
                  <div>
                    <div class="tooltip" :class="acc.compatiable ? 'tooltip-success' : 'tooltip-error'
                      " :data-tip="`Coin Type: ${acc.coinType}`">
                      <div class="font-bold capitalize" :class="acc.compatiable ? 'text-green-500' : 'text-red-500'
                        ">
                        {{ acc.chainName }}
                      </div>
                    </div>
                    <div class="text-xs opacity-50 hidden md:!block">
                      {{ acc.address }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="text-right">
                <span class="btn !bg-yes !border-yes btn-xs text-white" @click="addAddress(acc)">
                  <Icon icon="mdi:plus" />
                </span>
              </td>
            </tr>
          </table>
        </div>

        <div class="modal-action mt-2 mb-0">
          <a href="#" class="btn btn-primary btn-sm hover:text-black dark:hover:text-white"
            @click="importStep = 'step1'">Close</a>
        </div>

      </div>
    </div>
  </div>
</template>
