import type { Coin, Transaction, TxResponse } from '@/types';
import kiichain from '../../chains/testnet/kiichain.json';
import { ethers } from 'ethers';
import certificationAbi from '../assets/abi/certifications.json';

const getTransactionEVM = async (
  transactionHash: string,
  provider: ethers.providers.JsonRpcProvider
) => {
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
    amount: ethers.utils.formatEther(BigInt(receipt.value)), // Convert tkii to Kii
    denom: assetSymbol,
  };

  const fee: Coin[] = [
    {
      amount: ethers.utils.formatEther(BigInt(receipt.gas)), // Convert tkii to Kii,
      denom: assetSymbol,
    },
  ];

  return {
    height: transaction.BlockNumber.toString(),
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

export function decodeCertificationEvent(data: string) {
  // Decode the log
  const certificationInterface = new ethers.utils.Interface(certificationAbi);
  const decodedLog = certificationInterface.decodeEventLog(
    'CertificationCreatedEvent',
    data
  );
  const dateNumber = parseInt(decodedLog[5]._hex, 16);
  const date = new Date(dateNumber * 1000);

  const element = {
    name: decodedLog[0],
    id: decodedLog[1],
    courseName: decodedLog[2],
    hoursAmount: decodedLog[3],
    courseDicatedBy: decodedLog[4],
    createdAt: date,
    isValid: decodedLog[6],
  };
  return element;
}
