import { defineStore } from 'pinia';
import { useBlockchain } from '@/stores';
import { decodeTxRaw, type DecodedTxRaw } from '@cosmjs/proto-signing';
import dayjs from 'dayjs';
import type { Block, PaginatedResponse, SmartContract, TxResponse } from '@/types';
import { hashTx } from '@/libs';
import { fromBase64 } from '@cosmjs/encoding';

export const useBaseStore = defineStore('baseStore', {
  state: () => {
    return {
      earlest: {} as Block,
      latest: {} as Block,
      recents: [] as Block[],
      theme: (window.localStorage.getItem('theme') || 'dark') as
        | 'light'
        | 'dark',
      recentEvmBlocks: [] as Block[],
      recentEvmTxs: [] as TxResponse[],
      evmTxsQuantity: 0 as number,
    };
  },
  getters: {
    blocktime(): number {
      if (this.earlest && this.latest) {
        if (
          this.latest.block?.header?.height !==
          this.earlest.block?.header?.height
        ) {
          const diff = dayjs(this.latest.block?.header?.time).diff(
            this.earlest.block?.header?.time
          );
          const blocks =
            Number(this.latest.block.header.height) -
            Number(this.earlest.block.header.height);
          return diff / blocks;
        }
      }
      return 6000;
    },
    blockchain() {
      return useBlockchain();
    },
    currentChainId(): string {
      return this.latest.block?.header.chain_id || '';
    },
    txsInRecents() {
      const txs = [] as {
        height: string;
        hash: string;
        tx: DecodedTxRaw;
      }[];
      this.recents.forEach((b) =>
        b.block?.data?.txs.forEach((tx: string) => {
          if (tx) {
            const raw = fromBase64(tx);
            try {
              txs.push({
                height: b.block.header.height,
                hash: hashTx(raw),
                tx: decodeTxRaw(raw),
              });
            } catch (e) {
              console.error(e);
            }
          }
        })
      );
      return txs.sort((a, b) => {
        return Number(b.height) - Number(a.height);
      });
    },
    evmRecentBlocks(): Block[] {
      return this.recentEvmBlocks;
    },
    evmRecentTxs(): TxResponse[] {
      return this.recentEvmTxs;
    },
    evmTxsCount(): number {
      return this.evmTxsQuantity;
    },
  },
  actions: {
    async initial() {
      this.fetchLatest();
    },
    async clearRecentBlocks() {
      this.recents = [];
    },
    async fetchLatest() {
      this.latest = await this.blockchain.rpc?.getBaseBlockLatest();
      if (
        !this.earlest ||
        this.earlest?.block?.header?.chain_id !=
          this.latest?.block?.header?.chain_id
      ) {
        //reset earlest and recents
        this.earlest = this.latest;
        this.recents = [];
      }
      //check if the block exists in recents
      if (
        this.recents.findIndex(
          (x) => x?.block_id?.hash === this.latest?.block_id?.hash
        ) === -1
      ) {
        if (this.recents.length >= 50) {
          this.recents.shift();
        }
        this.recents.push(this.latest);
      }
      return this.latest;
    },
    updateTxCount(count: number) {
      this.evmTxsQuantity = count;
    },
    updateTx(txs: TxResponse[]) {
      this.recentEvmTxs = txs;
    },

    async fetchValidatorByHeight(height?: number, offset = 0) {
      return this.blockchain.rpc.getBaseValidatorsetAt(String(height), offset);
    },
    async fetchLatestValidators(offset = 0) {
      return this.blockchain.rpc.getBaseValidatorsetLatest(offset);
    },
    async fetchBlock(height?: number | string) {
      return this.blockchain.rpc.getBaseBlockAt(String(height));
    },
    async fetchAbciInfo() {
      return this.blockchain.rpc.getBaseNodeInfo();
    },
    // async fetchNodeInfo() {
    //     return this.blockchain.rpc.no()
    // }
    async fetchLatestEvmBlocks(): Promise<Block[]> {
      this.recentEvmBlocks = await this.blockchain.rpc.getBaseLatestBlocksEvm();
      return this.recentEvmBlocks;
    },
    async fetchLatestEvmTxs(): Promise<TxResponse[]> {
      const { transactions, quantity } =
        await this.blockchain.rpc.getLatestTxsEvm();
      this.recentEvmTxs = transactions;
      this.evmTxsQuantity = quantity;
      return this.recentEvmTxs;
    },
    async fetchSmartContracts(page: number, limit: number): Promise<PaginatedResponse & { smartContracts?: SmartContract[] }> {
      return await this.blockchain.rpc.getSmartContracts(page, limit);
    }
  },
});
