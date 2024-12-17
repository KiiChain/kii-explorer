import bankAbi from '@/assets/abi/bank.json';
import rewardsAbi from '@/assets/abi/rewards.json';
import stakingAbi from '@/assets/abi/staking.json';
import swapAbi from '@/assets/abi/swap.json';
import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  formatUnits,
  http,
  parseEther,
} from 'viem';
import type { Ref } from 'vue';
import { operatorAddressToAccount, toETHAddress } from './address';
import { convertTransaction } from './ethers';

export const BANK_CONTRACT_ADDRESS =
  '0x4381dC2aB14285160c808659aEe005D51255adD7';
export const STAKING_CONTRACT_ADDRESS =
  '0xd9A998CaC66092748FfEc7cFBD155Aae1737C2fF';
export const SWAP_CONTRACT_ADDRESS =
  '0xF948f57612E05320A6636a965cA4fbaed3147A0f';
export const REWARDS_CONTRACT_ADDRESS =
  '0x55684e2cA2bace0aDc512C1AFF880b15b8eA7214';

const chain = window.location.pathname.split('/')[1];

export const testnetV2EVM = defineChain({
  id: 123454321,
  name: 'Kiichain Tesnet',
  nativeCurrency: { name: 'kii', symbol: 'kii', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://a.sentry.testnet.kiivalidator.com:8645'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Kiichain Testnet',
      url: 'https://app.kiiglobal.io/kiichain',
      apiUrl: '',
    },
  },
  contracts: {},
});

export const testnetV3EVM = defineChain({
  id: 0xae3f3,
  name: 'Kiichain Tesnet',
  nativeCurrency: { name: 'kii', symbol: 'kii', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://uno.sentry.testnet.v3.kiivalidator.com:8547',
        'https://dos.sentry.testnet.v3.kiivalidator.com:8547',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Kiichain Tesnet',
      url: 'https://app.kiiglobal.io/kiichain',
      apiUrl: '',
    },
  },
  contracts: {},
});

export const testnet = chain === 'Testnet Oro' ? testnetV3EVM : testnetV2EVM;

export const publicClient = createPublicClient({
  chain: testnet,
  transport: http(),
});

export const walletClient =
  (window as any).ethereum &&
  createWalletClient({
    chain: testnet,
    transport: custom((window as any).ethereum),
  });

export const [account] = (await walletClient?.getAddresses()) || [];

// Define a function to fetch the last 20 transactions
export async function fetchRecentTransactionsEVM(
  startBlock: number,
  endBlock: number
) {
  const PAGE_NUMBER = 1; // Set this as needed
  const TRANSACTIONS_TO_FETCH = 10; // Example number, adjust as needed
  const BLOCK_LIMIT = 100; // Maximum blocks to scan if not overridden
  let transactions: any[] = [];
  let success = true;
  let errorMessage = '';

  try {
    let blocksChecked = 0;

    for (
      let currentBlock = endBlock;
      currentBlock >= startBlock;
      currentBlock--
    ) {
      if (
        transactions.length >= TRANSACTIONS_TO_FETCH ||
        blocksChecked >= BLOCK_LIMIT
      ) {
        break;
      }

      const blockHex = `0x${currentBlock.toString(16)}` as `0x${string}`;
      const block = await publicClient.request({
        method: 'eth_getBlockByNumber',
        params: [blockHex, true],
      });

      if (block && block.transactions) {
        const formattedTransactions = block.transactions.map((tx: any) => ({
          transaction: {
            type: tx.type,
            chainId: tx.chainId,
            nonce: tx.nonce,
            to: tx.to,
            gas: tx.gas,
            gasPrice: tx.gasPrice || null,
            maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
            maxFeePerGas: tx.maxFeePerGas,
            value: tx.value,
            input: tx.input,
            accessList: tx.accessList || [],
            v: tx.v,
            r: tx.r,
            s: tx.s,
            yParity: tx.yParity,
            hash: tx.hash,
          },
          sender: tx.from,
          success: true, // Assuming success if no error is indicated
          timestamp: parseInt(block.timestamp, 16) * 1000, // Convert from seconds to milliseconds
          BlockNumber: parseInt(block.number || '', 16),
        }));

        transactions.push(...formattedTransactions);
      }

      blocksChecked++;
    }

    transactions = transactions
      .slice(0, TRANSACTIONS_TO_FETCH)
      .map((transaction) => {
        return convertTransaction(transaction);
      });
  } catch (error) {
    success = false;
    errorMessage = `Error fetching transactions: ${error}`;
    console.error(errorMessage);
  }

  return {
    success,
    errorMessage,
    transactions,
    quantity: transactions.length,
    page: PAGE_NUMBER,
  };
}

export async function buySkii(
  amount: number,
  loading?: Ref<boolean>,
  sellMode?: boolean
) {
  try {
    if (loading) {
      loading.value = true;
    }
    const functionSignature = sellMode ? 'sellSkii' : 'buySkii';
    const { request } = await publicClient.simulateContract({
      account,
      address: SWAP_CONTRACT_ADDRESS,
      abi: swapAbi,
      functionName: functionSignature,
      args: sellMode ? [amount] : [],
      value: sellMode ? 0n : parseEther(amount.toString()),
    });
    const hash = await walletClient.writeContract(request);
    const transaction = await publicClient.waitForTransactionReceipt({
      hash: hash,
    });
    if (loading && transaction) {
      loading.value = false;
    }
    return transaction;
  } catch (err) {
    console.log(err);
    if (loading) {
      loading.value = false;
    }
  }
}

export async function stakeToValidator(
  validatorAddress: string,
  amount: number,
  loading?: Ref<boolean>,
  loadingMessage?: Ref<string>
) {
  try {
    const valAcc = operatorAddressToAccount(validatorAddress);
    const valHexAcc = toETHAddress(valAcc);
    if (loading) {
      loading.value = true;
    }

    // convert to sKii
    await buySkii(amount, loading)
      .then(async (tx) => {
        if (tx) {
          if (loading && loadingMessage) {
            loading.value = true;
            loadingMessage.value = 'Staking sKII to validator...';
          }
          const { request } = await publicClient.simulateContract({
            account,
            address: STAKING_CONTRACT_ADDRESS,
            abi: stakingAbi,
            functionName: 'delegate',
            args: [valHexAcc, amount * 10 ** 6],
          });
          const hash = await walletClient.writeContract(request);
          const transaction = await publicClient.waitForTransactionReceipt({
            hash: hash,
          });
          if (loading && transaction && loadingMessage) {
            loading.value = false;
            loadingMessage.value = '';
          }
          window.location.reload();
        }
      })
      .catch((err) => console.log(err));
  } catch (err) {
    if (loading) {
      loading.value = false;
    }
  }
}

export async function send(
  address: string,
  amount: number,
  denom: string,
  loading?: Ref<boolean>
) {
  try {
    let valHexAcc = toETHAddress(address);
    if (loading) {
      loading.value = true;
    }
    const { request } = await publicClient.simulateContract({
      account,
      address: BANK_CONTRACT_ADDRESS,
      abi: bankAbi,
      functionName: 'send',
      args: [account, valHexAcc, denom, amount * 10 ** 6],
    });
    const hash = await walletClient.writeContract(request);
    const transaction = await publicClient.waitForTransactionReceipt({
      hash: hash,
    });
    if (loading && transaction) {
      loading.value = false;
    }
  } catch (err) {
    // already hex
    if (loading) {
      loading.value = true;
    }
    const { request } = await publicClient.simulateContract({
      account,
      address: BANK_CONTRACT_ADDRESS,
      abi: bankAbi,
      functionName: 'send',
      args: [account, address, denom, amount * 10 ** 6],
    });
    const hash = await walletClient.writeContract(request);
    const transaction = await publicClient.waitForTransactionReceipt({
      hash: hash,
    });
    if (loading && transaction) {
      loading.value = false;
    }
  } finally {
    if (loading) {
      loading.value = false;
    }
  }
}

export const getEvmTransactionInfo = async (hash: string) => {
  const transactionReceipt = await publicClient.getTransactionReceipt({
    hash: hash as any,
  });

  return transactionReceipt;
};

export const getWalletBalance = async (
  denom: string,
  address?: `0x${string}`
) => {
  const balance = await publicClient.getBalance({
    address: address ?? account,
  });

  return {
    denom: denom,
    amount: formatUnits(balance, 12),
  };
};

export const getRewardsBalance = async (denom: string) => {
  try {
    const rewardsBalance = await publicClient.readContract({
      address: REWARDS_CONTRACT_ADDRESS,
      abi: rewardsAbi,
      functionName: 'getOutstandingRewards',
      args: [account],
    });
    return {
      denom: (rewardsBalance as any)[0].denom,
      amount: formatUnits((rewardsBalance as any)[0].amount, 12),
    };
  } catch (err) {
    console.log(err);
    return {
      denom: denom,
      amount: '0',
    };
  }
};

export const withdrawRewardsBalance = async (
  denom: string,
  loading?: Ref<boolean>,
  loadingMessage?: Ref<string>
) => {
  try {
    // get reward balance
    const rewardBalance = await getRewardsBalance(denom);

    // withdraw rewards
    if (loading && loadingMessage) {
      loading.value = true;
      loadingMessage.value = 'Withdrawing Rewards...';
    }
    const { request } = await publicClient.simulateContract({
      account,
      address: REWARDS_CONTRACT_ADDRESS,
      abi: rewardsAbi,
      functionName: 'withdrawAllDepositorRewards',
      args: [account],
    });
    const hash = await walletClient.writeContract(request);
    await publicClient
      .waitForTransactionReceipt({ hash: hash })
      .then(async (transactionReceipt) => {
        if (loading && transactionReceipt && loadingMessage) {
          loading.value = false;
          loadingMessage.value = 'Converting sKII (Staked KII) to KII...';
        }

        // sell sKii
        await buySkii(Number(rewardBalance.amount), loading, true).then(
          async (tx) => {
            if (tx) {
              if (loading && tx && loadingMessage) {
                loading.value = false;
                loadingMessage.value = '';
              }
              window.location.reload();
            }
          }
        );
      })
      .catch((err) => {
        console.log(err);
        if (loading && loadingMessage) {
          loading.value = false;
          loadingMessage.value = '';
        }
      });
  } catch (err) {
    console.log(err);
    if (loading && loadingMessage) {
      loading.value = false;
      loadingMessage.value = '';
    }
  }
};

export async function redelegateStake(
  validatorSrcAddress: string,
  validatorDestAddress: string,
  amount: number,
  loading?: Ref<boolean>,
  loadingMessage?: Ref<string>
) {
  try {
    const valAcc = operatorAddressToAccount(validatorSrcAddress);
    const valHexAcc = toETHAddress(valAcc);
    const valAccDest = operatorAddressToAccount(validatorDestAddress);
    const valHexAccDest = toETHAddress(valAccDest);
    if (loading) {
      loading.value = true;
    }

    if (loading && loadingMessage) {
      loading.value = true;
      loadingMessage.value = `Relocating Stake to validator ${valHexAccDest}`;
    }
    const { request } = await publicClient.simulateContract({
      account,
      address: STAKING_CONTRACT_ADDRESS,
      abi: stakingAbi,
      functionName: 'beginRedelegate',
      args: [valHexAcc, valHexAccDest, amount * 10 ** 6],
    });
    const hash = await walletClient.writeContract(request);
    const transaction = await publicClient.waitForTransactionReceipt({
      hash: hash,
    });
    if (loading && transaction && loadingMessage) {
      loading.value = false;
      loadingMessage.value = '';
    }
    window.location.reload();
  } catch (err) {
    if (loading) {
      loading.value = false;
    }
  }
}

export async function undelegateStake(
  validatorAddress: string,
  amount: number,
  loading?: Ref<boolean>,
  loadingMessage?: Ref<string>
) {
  try {
    const valAcc = operatorAddressToAccount(validatorAddress);
    const valHexAcc = toETHAddress(valAcc);
    if (loading) {
      loading.value = true;
    }

    if (loading && loadingMessage) {
      loading.value = true;
      loadingMessage.value = `Undelegating Stake from validator ${valHexAcc}`;
    }
    const { request } = await publicClient.simulateContract({
      account,
      address: STAKING_CONTRACT_ADDRESS,
      abi: stakingAbi,
      functionName: 'undelegate',
      args: [valHexAcc, amount * 10 ** 6],
    });
    const hash = await walletClient.writeContract(request);
    const transaction = await publicClient.waitForTransactionReceipt({
      hash: hash,
    });
    if (loading && transaction && loadingMessage) {
      loading.value = false;
      loadingMessage.value = '';
    }
    window.location.reload();
  } catch (err) {
    if (loading) {
      loading.value = false;
    }
  }
}
