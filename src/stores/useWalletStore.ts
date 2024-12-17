import { getWalletBalance } from '@/libs/web3';
import router from '@/router';
import type {
  Coin,
  Delegation,
  DelegatorRewards,
  UnbondingResponses,
  WalletConnected,
} from '@/types';
import { fromBech32, toBech32 } from '@cosmjs/encoding';
import { defineStore } from 'pinia';
import { useBlockchain } from './useBlockchain';
import { useStakingStore } from './useStakingStore';

interface BaseState {
  balances: Coin[];
  delegations: Delegation[];
  unbonding: UnbondingResponses[];
  rewards: DelegatorRewards;
  wallet: WalletConnected;
  evmWalletBalance: Coin;
}

export const useWalletStore = defineStore('walletStore', {
  state: (): BaseState => {
    return {
      balances: [],
      delegations: [],
      unbonding: [],
      rewards: {total: [], rewards: []},
      wallet: {} as WalletConnected,
      evmWalletBalance: {} as Coin,
    };
  },
  getters: {
    connectedWallet(): WalletConnected {
      if(this.wallet.cosmosAddress){
        localStorage.setItem(this.wallet.hdPath, JSON.stringify(this.wallet))
        return this.wallet
      }
      const chainStore = useBlockchain();
      const key = chainStore.defaultHDPath;
      const connected = JSON.parse(localStorage.getItem(key) || '{}');
      return connected
    },
    balanceOfStakingToken(): Coin {
      const stakingStore = useStakingStore();
      return (
        this.balances.find(
          (x) => x.denom === stakingStore.params.bond_denom
        ) || { amount: '0', denom: stakingStore.params.bond_denom }
      );
    },
    stakingAmount() {
      const stakingStore = useStakingStore();
      let amt = 0;
      let denom = stakingStore.params.bond_denom;
      this.delegations.forEach((i) => {
        amt += Number(i.balance.amount);
        denom = i.balance.denom;
      });
      return { amount: String(amt), denom };
    },
    rewardAmount(): Coin {
      const stakingStore = useStakingStore();
      // @ts-ignore
      const reward = this.rewards.total?.find(
        (x: Coin) => x.denom === stakingStore.params.bond_denom
      );
      return reward || { amount: '0', denom: stakingStore.params.bond_denom };
    },
    unbondingAmount() {
      let amt = 0;
      this.unbonding.forEach((i) => {
        i.entries.forEach((e) => {
          amt += Number(e.balance);
        });
      });

      const stakingStore = useStakingStore();
      return { amount: String(amt), denom: stakingStore.params.bond_denom };
    },
    currentAddress() {
      if (!this.connectedWallet?.cosmosAddress) return '';
      const { prefix, data } = fromBech32(this.connectedWallet.cosmosAddress);
      const chainStore = useBlockchain();
      return toBech32(chainStore.current?.bech32Prefix || prefix, data);
    },
    shortAddress() {
      const address: string = this.currentAddress
      if(address.length > 4) {
        return `${address.substring(address.length -4)}`
      }
      return ""
    }
  },
  actions: {
    async loadMyAsset() {
      const chainStore = useBlockchain();
      if (!this.currentAddress) return;
      chainStore.rpc.getBankBalances(this.currentAddress).then((x) => {
        this.balances = x.balances;
      });
      chainStore.rpc
        .getStakingDelegations(this.currentAddress)
        .then((x) => {
          this.delegations = x.delegation_responses;
        });
      chainStore.rpc
        .getStakingDelegatorUnbonding(this.currentAddress)
        .then((x) => {
          this.unbonding = x.unbonding_responses;
        });
      chainStore.rpc
        .getDistributionDelegatorRewards(this.currentAddress)
        .then((x) => {
          this.rewards = x;
        });
     await this.myEvmBalance();
    },
    async myEvmBalance(address?: `0x${string}`) {
      const chainStore = useBlockchain();
      this.evmWalletBalance = await getWalletBalance(
        chainStore.current?.assets[0].base ?? '',
        address
      )
    },
    disconnect() {
      const chainStore = useBlockchain();
      const key = chainStore.defaultHDPath;
      localStorage.removeItem(key);
      this.$reset()
    },
    setConnectedWallet(value: WalletConnected) {
      if(value) this.wallet = value 
    },
    suggestChain() {
      router.push({path: '/wallet/keplr'})
    }
  },
});