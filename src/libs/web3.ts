import {
  defineChain,
  createWalletClient,
  createPublicClient,
  http,
  custom,
  parseUnits,
  parseEther,
} from 'viem';
import stakingAbi from '@/assets/abi/staking.json';
import bankAbi from '@/assets/abi/bank.json';
import swapAbi from '@/assets/abi/swap.json';
import { operatorAddressToAccount, toETHAddress } from './address';
import type { Ref } from 'vue';

export const BANK_CONTRACT_ADDRESS =
  '0x4381dC2aB14285160c808659aEe005D51255adD7';
export const STAKING_CONTRACT_ADDRESS =
  '0xd9A998CaC66092748FfEc7cFBD155Aae1737C2fF';
export const SWAP_CONTRACT_ADDRESS = '0xF948f57612E05320A6636a965cA4fbaed3147A0f'

export const testnet = defineChain({
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

export const publicClient = createPublicClient({
  chain: testnet,
  transport: http(),
});

export const walletClient = createWalletClient({
  chain: testnet,
  transport: custom((window as any).ethereum),
});

export const [account] = await walletClient.getAddresses();

export async function stakeToValidator(
  validatorAddress: string,
  amount: number,
  loading?: Ref<boolean>
) {
  try {
    const valAcc = operatorAddressToAccount(validatorAddress);
    const valHexAcc = toETHAddress(valAcc);
    if(loading){
        loading.value = true;
    }
    const { request } = await publicClient.simulateContract({
      account,
      address: STAKING_CONTRACT_ADDRESS,
      abi: stakingAbi,
      functionName: 'delegate',
      args: [valHexAcc, amount * 10 ** 6],
    });
    const hash = await walletClient.writeContract(request);
    const transaction = await publicClient.waitForTransactionReceipt( 
      { hash: hash }
    )
    if(loading && transaction){
      loading.value = false;
    }
  } catch (err) {
    if(loading){
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
    if(loading){
      loading.value = true;
    }
    const { request } = await publicClient.simulateContract({
      account,
      address: BANK_CONTRACT_ADDRESS,
      abi: bankAbi,
      functionName: 'send',
      args: [
        valHexAcc,
        [
          {
            denom: denom,
            amount: amount * 10 ** 6,
          },
        ],
      ],
    });
    const hash = await walletClient.writeContract(request);
    const transaction = await publicClient.waitForTransactionReceipt( 
      { hash: hash }
    )
    if(loading && transaction){
      loading.value = false;
    }
  } catch (err) {
    // already hex
    if(loading){
      loading.value = true;
    }
    const { request } = await publicClient.simulateContract({
      account,
      address: BANK_CONTRACT_ADDRESS,
      abi: bankAbi,
      functionName: 'send',
      args: [
        address,
        [
          {
            denom: denom,
            amount: amount * 10 ** 6,
          },
        ],
      ],
    });
    const hash = await walletClient.writeContract(request);
    const transaction = await publicClient.waitForTransactionReceipt( 
      { hash: hash }
    )
    if(loading && transaction){
      loading.value = false;
    }
  }
  finally {
    if(loading){
      loading.value = false;
    }
  }
}

export async function buySkii(
  amount: number,
  loading?: Ref<boolean>
) {
  try {
    if(loading){
        loading.value = true;
    }
    const data = await publicClient.readContract({
      address: BANK_CONTRACT_ADDRESS,
      abi: bankAbi,
      functionName: 'getAllSpendableBalances',
      args:[SWAP_CONTRACT_ADDRESS]
    })
    const { request } = await publicClient.simulateContract({
      account,
      address: SWAP_CONTRACT_ADDRESS,
      abi: swapAbi,
      functionName: 'buySkii',
      value: parseEther(amount.toString()) ,
    });
    const hash = await walletClient.writeContract(request);
    const transaction = await publicClient.waitForTransactionReceipt( 
      { hash: hash }
    )
    if(loading && transaction){
      loading.value = false;
    }
  } catch (err) {
    console.log(err)
    if(loading){
      loading.value = false;
    }
  }
}
