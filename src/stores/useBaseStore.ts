import { BLOCK_LIMIT } from '@/contants/transactions';
import { hashTx } from '@/libs';
import { fetchRecentTransactionsEVM } from '@/libs/web3';
import { useBlockchain, useWalletStore } from '@/stores';
import type {
  Block,
  PaginatedSmartContractResponse,
  SmartContract,
  TxResponse,
} from '@/types';
import { fromBase64 } from '@cosmjs/encoding';
import { decodeTxRaw, type DecodedTxRaw } from '@cosmjs/proto-signing';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import dayjs from 'dayjs';
import { defineStore } from 'pinia';

interface BaseState {
  earlest: Block;
  latest: Block;
  recents: Block[];
  theme: 'light' | 'dark';
  recentTxs: TxResponse[];
  txsQuantity: number;
  evmTxsQuantity: number;
  smartContracts: SmartContract[];
  smartContractQuantity: number;
}

export const useBaseStore = defineStore('baseStore', {
  state: (): BaseState => {
    return {
      earlest: {} as Block,
      latest: {} as Block,
      recents: [],
      theme: (window.localStorage.getItem('theme') || 'dark') as
        | 'light'
        | 'dark',
      recentTxs: [],
      txsQuantity: 0,
      evmTxsQuantity: 0,
      smartContracts: [],
      smartContractQuantity: 0,
    };
  },
  getters: {
    isV2(): boolean {
      return this.blockchain.chainName === 'kiichain';
    },
    isV3(): boolean {
      return this.blockchain.chainName === 'Testnet Oro';
    },
    isV3Metamask(): boolean {
      return (
        this.isV3 && this.walletStore.connectedWallet?.wallet === 'Metamask'
      );
    },
    isV3Cosmos(): boolean {
      return (
        this.isV3 && this.walletStore.connectedWallet?.wallet === 'Metamask'
      );
    },
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
    walletStore() {
      return useWalletStore();
    },
    currentChainId(): string {
      return this.latest.block?.header.chain_id || '';
    },
    txsInRecents() {
      const txs = [] as {
        timestamp: string;
        height: string;
        txhash: string;
        tx: DecodedTxRaw;
        fromAddress: string;
      }[];
      this.recents.forEach((b) =>
        b.block?.data?.txs.forEach((tx: string) => {
          if (tx) {
            const raw = fromBase64(tx);
            const decodedTx = decodeTxRaw(raw);
            const fromAddress = MsgSend.decode(
              decodedTx.body.messages[0].value
            ).fromAddress;
            try {
              txs.push({
                timestamp: b.block.header.time,
                height: b.block.header.height,
                txhash: hashTx(raw),
                tx: decodedTx,
                ...(MsgSend.decode(decodedTx.body.messages[0].value) && {
                  fromAddress,
                }),
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
    getRecentBlocks(): Block[] {
      return this.recents;
    },
    getRecentTxs(): TxResponse[] {
      return this.recentTxs;
    },
    txsCount(): number {
      return this.txsQuantity;
    },
    getSmartContracts(): SmartContract[] {
      return this.smartContracts;
    },
    getSmartContractQuantity(): number {
      return this.smartContractQuantity;
    },
    getBlockRangeFromRecents(): { startBlock: number; endBlock: number } {
      if (this.recents.length === 0) {
        throw new Error('No recent blocks found.');
      }

      // Extract heights and convert them to numbers
      const heights = this.recents.map((recent) =>
        parseInt(recent.block.header.height, 10)
      );

      // Find the minimum and maximum heights
      const startBlock = Math.min(...heights);
      const endBlock = Math.max(...heights);

      return { startBlock, endBlock };
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
        if (
          !this.recents.some(
            (block) => block.block_id.hash === this.latest.block_id.hash
          )
        ) {
          this.recents.push(this.latest);
        }
      }
      return this.latest;
    },
    async fetchRecentBlocks() {
      // Fetch the latest block
      const latestHeight = +(await this.blockchain.rpc?.getBaseBlockLatest())
        .block.header.height;

      // Clear any previous results if necessary
      this.recents = [];

      // Fetch the latest 50 blocks and push them to recents
      for (let i = 0; i < BLOCK_LIMIT; i++) {
        const height = latestHeight - i;
        const block = await this.blockchain.rpc?.getBaseBlockAt(height);
        if (block) {
          this.recents.push(block);
        }
      }
    },

    updateTxCount(count: number) {
      this.txsQuantity = count;
    },
    updateTx(txs: TxResponse[]) {
      // Sort by timestamp, assuming it is a Date or a comparable format
      this.recentTxs = txs.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
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
    async fetchLatestEvmBlocks() {
      this.recents = await this.blockchain.rpc.getBaseLatestBlocksEvm();
    },
    async fetchLatestEvmTxs(): Promise<TxResponse[]> {
      const { transactions, quantity } =
        this.blockchain.chainName === 'Testnet Oro'
          ? await fetchRecentTransactionsEVM(
              this.getBlockRangeFromRecents.startBlock,
              this.getBlockRangeFromRecents.endBlock
            )
          : await this.blockchain.rpc.getLatestTxsEvm();
      this.recentTxs = transactions;
      this.txsQuantity = quantity;
      return this.recentTxs;
    },
    async fetchSmartContracts(
      page: number
    ): Promise<PaginatedSmartContractResponse> {
      const result = await this.blockchain.rpc.getSmartContracts(page);
      this.smartContractQuantity = result.quantity;
      this.smartContracts = result.smartContracts;
      return result;
    },
  },
});
