import { type Coin, type TxResponse } from '@/types';
import kiichain from '../../chains/testnet/kiichain.json';
import { ethers, TransactionResponse } from 'ethers';

const getTransactionEVM = async (
  transactionHash: string,
  provider: ethers.JsonRpcProvider
): Promise<TransactionResponse | null> => {
  try {
    return await provider.getTransaction(transactionHash);
  } catch (error) {
    console.error('Error getting the transaction from hash:', error);
    return null;
  }
};

export const getTransactionsEVM = async (): Promise<
  TxResponse[] | undefined
> => {
  try {
    const provider = new ethers.JsonRpcProvider(kiichain.rpc[0]);
    if (!provider) throw new Error('Missing provider');
    const blockNumber = await provider.getBlockNumber();
    const userTransactions: TxResponse[] = [];
    const blocksPerPage = 5000;
    const startBlock = blockNumber - blocksPerPage;

    const rawblocks = await Promise.all(
      Array.from(
        { length: blocksPerPage },
        (_, index) => startBlock! - index
      ).map(async (blockNumber) => provider.getBlock(blockNumber, true))
    );

    const blocks = rawblocks.filter((block) => block && block.transactions);
    const transactionPromises = blocks.flatMap((block) => {
      if (!block || !block.transactions) return [];
      return block.transactions.map(async (hash) => {
        const transaction = await getTransactionEVM(hash, provider);
        if (transaction) {
          return convertTransaction(transaction, block);
        }
      });
    });

    const transactions = await Promise.all(transactionPromises);
    const validTransactions = transactions.filter(
      (tx): tx is TxResponse => tx !== null
    );
    userTransactions.push(...validTransactions!);
    return userTransactions;
  } catch (error) {
    console.error('Error fetching the transaction history:', error);
  }
};

const convertTransaction = (
  transaction: TransactionResponse,
  block: ethers.Block
): TxResponse => {
  const amount: Coin = {
    amount: ethers.formatEther(transaction.value),
    denom: kiichain.assets[0].symbol,
  };
  const fee: Coin[] = [
    {
      amount: '',
      denom: kiichain.assets[0].symbol,
    },
  ];
  return {
    height: transaction.blockNumber!.toString(),
    code: transaction.type,
    data: transaction.data,
    codespace: '',
    events: [],
    gas_used: transaction.gasLimit.toString(),
    gas_wanted: '',
    logs: [
      {
        msg_index: 0,
        log: '',
        events: [],
      },
    ],
    timestamp: new Date(block.timestamp * 1000).toISOString(),
    txhash: transaction.hash,
    info: '',
    raw_log: '',
    tx: {
      signatures: [],
      auth_info: {
        fee: {
          gas_limit: transaction.gasLimit.toString(),
          granter: '',
          payer: '',
          amount: fee,
        },
        signer_infos: [
          {
            public_key: {
              '@type': '',
              key: '',
            },
            mode_info: {
              single: {
                mode: '',
              },
            },
            sequence: '',
          },
        ],
      },
      body: {
        extension_options: [],
        memo: '',
        messages: [
          {
            from_address: transaction.from,
            to_address: transaction.to!,
            amount: amount,
            '@type': '',
          },
        ],
        non_critical_extension_options: [],
        timeout_height: '',
      },
      '@type': 'TransactionResponse',
    },
  };
};
