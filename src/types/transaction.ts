import type { Coin, Key, PaginatedResponse } from './common';

export interface Message {
  '@type': string;
  from_address?: string;
  to_address?: string;
  delegator_address?: string;
  validator_address?: string;
  amount: Coin | Coin[];
}
export interface Tx {
  '@type'?: string;
  body: {
    messages: Message[];
    memo: string;
    timeout_height: string;
    extension_options: any[];
    non_critical_extension_options: any[];
  };
  auth_info: {
    signer_infos: [
      {
        public_key: Key;
        mode_info: {
          single?: {
            mode: string; // "SIGN_MODE_DIRECT"
          };
        };
        sequence: string;
      }
    ];
    fee: {
      amount: Coin[];
      gas_limit: string;
      payer: string;
      granter: string;
    };
  };
  signatures: string[];
}

export interface Attributes {
  index?: boolean;
  key: string;
  value: string;
}

export interface TxResponse {
  height: string;
  txhash: string;
  codespace: string;
  code: number;
  data: string;
  raw_log: string;
  logs: [
    {
      msg_index: number;
      log: string;
      events: Attributes[];
    }
  ];
  info: '';
  gas_wanted: string;
  gas_used: string;
  tx: Tx;
  timestamp: string;
  events: {
    type: string;
    attributes: Attributes[];
  }[];
}

export interface PaginatedTxs extends PaginatedResponse {
  txs: Tx[];
  tx_responses: TxResponse[];
  total: number;
}

export interface EvmTransactionResponse {
  success: boolean;
  errorMessage: string;
  transactions: Transaction[];
  quantity: number;
}

export interface Transaction {
  transaction: Receipt;
  sender: string;
  success: boolean;
  timestamp: string;
  BlockNumber: number;
}

export interface Receipt {
  type: string;
  chainId: string;
  nonce: string;
  to: string;
  gas: string;
  gasPrice?: string;
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
  value: string;
  input: string;
  accessList?: any[];
  v: string;
  r: string;
  s: string;
  yParity?: string;
  hash: string;
}
