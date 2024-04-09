import { defineStore } from 'pinia';

import { useBlockchain } from './useBlockchain';
import { useStakingStore } from './useStakingStore';
import {
  PageRequest,
  type Coin,
  type DenomOwner,
  type DenomTrace,
  type Tx,
  type TxResponse,
} from '@/types';

export const useBankStore = defineStore('bankstore', {
  state: () => {
    return {
      supply: {} as Coin,
      balances: {} as Record<string, Coin[]>,
      totalSupply: { supply: [] as Coin[] },
      ibcDenoms: {} as Record<string, DenomTrace>
    };
  },
  getters: {
    blockchain() {
      return useBlockchain();
    },
    staking() {
      return useStakingStore();
    },
  },
  actions: {
    initial() {
      this.$reset();
      this.supply = {} as Coin;
      const denom =
        this.staking.params.bond_denom ||
        this.blockchain.current?.assets[0].base;
      if (denom) {
        this.blockchain.rpc.getBankSupplyByDenom(denom).then((res) => {
          if (res.amount) this.supply = res.amount;
        });
      }
    },
    async fetchSupply(denom: string) {
      return this.blockchain.rpc.getBankSupplyByDenom(denom);
    },
    async fetchDenomOwners(denom: string): Promise<DenomOwner[]> {
      let key = undefined;
      let fetch = true;
      let allData: DenomOwner[] = [];

      while (fetch) {
        const pageRequest = new PageRequest();
        pageRequest.key = encodeURIComponent(key ?? '') ;

        const data = await this.blockchain.rpc.getBankDenomOwners(
          denom,
          pageRequest
        );

        allData = [...allData, ...data.denom_owners];

        key = data.pagination.next_key;

        if (!key) {
          fetch = false;
        }
      }

      return allData;
    },
    async fetchTopDenomOwners(denom: string): Promise<DenomOwner[]> {
      let key = undefined;
      let fetch = true;
      let allData: DenomOwner[] = [];

      while (fetch) {
        const pageRequest = new PageRequest();
        pageRequest.key = encodeURIComponent(key ?? '') ;

        const data = await this.blockchain.rpc.getBankDenomOwners(
          denom,
          pageRequest
        );

        allData = [...allData, ...data.denom_owners];

        key = data.pagination.next_key;

        if (!key) {
          fetch = false;
        }
      }

      allData.sort(
        (a, b) => Number(b.balance.amount) - Number(a.balance.amount)
      );

      return allData.slice(0, 100);
    },
    async fetchDenomTrace(denom: string) {
      const hash = denom.replace('ibc/', '');
      let trace = this.ibcDenoms[hash];
      if (!trace) {
        trace = (await this.blockchain.rpc.getIBCAppTransferDenom(hash))
          .denom_trace;
        this.ibcDenoms[hash] = trace;
      }
      return trace;
    },
    async fetchLatestTxs(denom: string): Promise<TxResponse[]> {
      const pageRequest = new PageRequest();
      pageRequest.limit = 20;
      const data = await this.blockchain.rpc.getLatestTxs();

      return data.tx_responses;
    },
    async fetchLatestTxsEvm(denom: string): Promise<TxResponse[]> {
      const pageRequest = new PageRequest();
      pageRequest.limit = 20;
      const data = await this.blockchain.rpc.getLatestTxsEvm();

      return data.tx_responses;
    },
  },
});
