import type { Coin, Transaction, TxResponse } from '@/types';
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

export const convertTransaction = (transaction: Transaction): TxResponse => {
  const { transaction: receipt } = transaction;
  const { assets } = kiichain;
  const assetSymbol = assets[0].symbol;

  const amount: Coin = {
    amount: ethers.formatEther(receipt.value),
    denom: assetSymbol,
  };

  const fee: Coin[] = [
    {
      amount: '',
      denom: assetSymbol,
    },
  ];

  return {
    height: '',
    code: parseInt(receipt.type, 16),
    data: '',
    codespace: '',
    events: [],
    gas_used: receipt.gas,
    gas_wanted: '',
    logs: [
      {
        msg_index: 0,
        log: '',
        events: [],
      },
    ],
    timestamp: transaction.timestamp,
    txhash: receipt.hash,
    info: '',
    raw_log: '',
    tx: {
      signatures: [],
      auth_info: {
        fee: {
          gas_limit: '',
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
            from_address: transaction.sender,
            to_address: receipt.to,
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
