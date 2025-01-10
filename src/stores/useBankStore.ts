import { defineStore } from 'pinia';
import dayjs from 'dayjs';

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
import axios from 'axios';
import { RPC } from '@/libs';

export const useBankStore = defineStore('bankstore', {
  state: () => {
    return {
      supply: {} as Coin,
      balances: {} as Record<string, Coin[]>,
      totalSupply: { supply: [] as Coin[] },
      ibcDenoms: {} as Record<string, DenomTrace>,
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
    async fetchTopDenomOwnersV3() {
      try {
        const rpcEndpoint = this.blockchain.getRpcEndpoint;

        const response = await axios.get(`${rpcEndpoint}${RPC.genesis}`);

        const genesisData = response.data;

        // Extracting denom owners from the genesis data
        const denomOwners = genesisData.genesis.app_state.bank.balances.map(
          (balance: any) => ({
            address: balance.address,
            balance: {
              denom: balance.coins[0]?.denom || 'unknown',
              amount: balance.coins[0]?.amount || '0',
            },
          })
        );

        // Returning the modified response structure
        return { denom_owners: denomOwners };
      } catch (err) {
        console.log(err);
      }
    },
    async fetchDenomOwnerV3() {},
    async fetchSupply(denom: string) {
      return this.blockchain.rpc.getBankSupplyByDenom(denom);
    },
    async fetchDenomOwners(denom: string): Promise<DenomOwner[]> {
      let key = undefined;
      let fetch = true;
      let allData: DenomOwner[] = [];

      while (fetch) {
        const pageRequest = new PageRequest();
        pageRequest.key = encodeURIComponent(key ?? '');

        let data: any;

        if (this.blockchain.chainName === 'Testnet Oro') {
          data = await this.fetchTopDenomOwnersV3();
        } else {
          data = await this.blockchain.rpc.getBankDenomOwners(
            denom,
            pageRequest
          );
        }

        allData = [...allData, ...data.denom_owners];

        key = data.pagination?.next_key;

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
        pageRequest.key = encodeURIComponent(key ?? '');

        let data: any;

        if (this.blockchain.chainName === 'Testnet Oro') {
          data = await this.fetchTopDenomOwnersV3();
        } else {
          data = await this.blockchain.rpc.getBankDenomOwners(
            denom,
            pageRequest
          );
        }

        allData = [...allData, ...data.denom_owners];

        key = data.pagination?.next_key;

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
    async fetchLatestTxs(totalCount: number): Promise<TxResponse[]> {
      let key = undefined;
      let fetch = true;
      let allData: TxResponse[] = [];
      let currentPage = 1;

      // Current date
      let currentDate = dayjs();
      let oneMonthAgoDate = currentDate.subtract(1, 'month');

      const totalPage = Math.ceil(totalCount / 100);

      while (fetch && currentPage <= totalPage && currentPage < 3) {
        const data = await this.blockchain.rpc.getLatestTxs(currentPage);

        if (data.tx_responses.length) {
          allData = [...allData, ...data.tx_responses];
        } else {
          fetch = false;
        }

        const givenDate = dayjs(
          data.tx_responses[data.tx_responses.length - 1].timestamp
        );

        if (givenDate.isBefore(oneMonthAgoDate)) {
          break;
        }

        currentPage = currentPage + 1;
      }

      return allData;
    },
    async fetchLatestTxsEvm(): Promise<{
      transactions: TxResponse[];
      quantity: any;
    }> {
      const data = await this.blockchain.rpc.getLatestTxsEvm();
      return data!;
    },
  },
});
