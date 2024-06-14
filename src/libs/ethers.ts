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
    const blocksPerPage = 40000;
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
  const { value, blockNumber, type, data, gasLimit, hash, from, to } =
    transaction;
  const { assets } = kiichain;
  const assetSymbol = assets[0].symbol;

  const amount: Coin = {
    amount: ethers.formatEther(value),
    denom: assetSymbol,
  };

  const fee: Coin[] = [
    {
      amount: '',
      denom: assetSymbol,
    },
  ];

  return {
    height: blockNumber!.toString(),
    code: type,
    data: data,
    codespace: '',
    events: [],
    gas_used: gasLimit.toString(),
    gas_wanted: '',
    logs: [
      {
        msg_index: 0,
        log: '',
        events: [],
      },
    ],
    timestamp: new Date(block.timestamp * 1000).toISOString(),
    txhash: hash,
    info: '',
    raw_log: '',
    tx: {
      signatures: [],
      auth_info: {
        fee: {
          gas_limit: gasLimit.toString(),
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
            from_address: from,
            to_address: to!,
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
