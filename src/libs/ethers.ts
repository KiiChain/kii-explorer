import type { Coin, Transaction, TxResponse } from '@/types';
import { ADDRESS_PRECOMPILE_ADDRESS, BANK_PRECOMPILE_ABI, BANK_PRECOMPILE_ADDRESS } from '@sei-js/evm';
import { ethers } from 'ethers';
import kiichain from '../../chains/testnet/kiichain.json';
import addressAbi from '../assets/abi/address.json';
import certificationAbi from '../assets/abi/certifications.json';


export async function sendV3(address: string, amount: number, updateProgress: (progress: number, message: string) => void) {
  // Check if MetaMask (or another browser wallet) is available
  if (typeof (window as any).ethereum === "undefined") {
    console.error("MetaMask is not installed.");
    return;
  }

  try {
    updateProgress(10, "Initializing transaction...");

    // Initialize the provider using BrowserProvider (ethers v6)
    const provider = new ethers.BrowserProvider((window as any).ethereum);

    // Get the signer (user's wallet)
    const signer = await provider.getSigner();
    const fromAddress = await signer.getAddress();
    console.log("Signer address:", fromAddress);

    updateProgress(30, "Preparing transaction...");

    const addrContract = new ethers.Contract(ADDRESS_PRECOMPILE_ADDRESS, addressAbi, signer);
    const cosmosAddress = await addrContract.getKiiAddr(address);
    const contract = new ethers.Contract(BANK_PRECOMPILE_ADDRESS, BANK_PRECOMPILE_ABI, signer);

    // Adjust amount based on token decimals
    const tokenDecimals = 18; // Use the token's actual decimal places
    const adjustedAmount = ethers.parseUnits(amount.toString(), tokenDecimals);

    const transactionRequest = { value: adjustedAmount };
    const estimatedGas = await signer.estimateGas(transactionRequest);
    const gasLimit = (estimatedGas * BigInt(1000)) / BigInt(100);

    updateProgress(50, "Sending transaction to the blockchain...");

    // Perform the send transaction
    const tx = await contract.sendNative(cosmosAddress, {
      ...transactionRequest,
      gasLimit,
    });
    console.log("Transaction sent, waiting for confirmation...");

    // Poll for confirmation with real-time updates
    const interval = setInterval(async () => {
      const receipt = await provider.getTransactionReceipt(tx.hash);
      if (receipt && (await receipt.confirmations()) > 0) {
        clearInterval(interval);
        updateProgress(100, "Transaction confirmed!");
        console.log("Transaction confirmed!", receipt);
      } else {
        updateProgress(75, "Waiting for confirmation...");
      }
    }, 1000);

    // Wait for the transaction to be confirmed
    const receipt = await tx.wait();
    return receipt;

  } catch (err: any) {
    console.error("Error sending transaction:", err);
    updateProgress(0, "Transaction failed: " + err?.message);
    throw err;
  }
}


const getTransactionEVM = async (
  transactionHash: string,
  provider: ethers.JsonRpcProvider
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
    amount: ethers.formatEther(BigInt(receipt.value)), // Convert tkii to Kii
    denom: assetSymbol,
  };

  const fee: Coin[] = [
    {
      amount: ethers.formatEther(BigInt(receipt.gas)), // Convert tkii to Kii,
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
  const certificationInterface = new ethers.Interface(certificationAbi);
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
