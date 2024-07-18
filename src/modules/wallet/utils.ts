import { addressEnCode } from '@/libs';
import { useDashboard } from '@/stores';
import { fromBech32, fromHex, toBech32 } from '@cosmjs/encoding';

export interface AccountEntry {
  chainName: string;
  logo: string;
  address: string;
  coinType: string;
  endpoint?: string;
  compatiable?: boolean;
}

export interface LocalKey {
  cosmosAddress: string;
  hdPath: string;
}

export function scanLocalKeys() {
  const connected = [] as LocalKey[];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('m/44')) {
      const wallet = JSON.parse(localStorage.getItem(key) || '');
      if (wallet) {
        connected.push(wallet);
      }
    }
  }
  return connected;
}

export function scanCompatibleAccounts(keys: LocalKey[]) {
  const dashboard = useDashboard();
  const available = [] as AccountEntry[];
  keys.forEach((wallet) => {
    console.log('Dashboard:', dashboard);
    Object.values(dashboard.chains).forEach((chain) => {
      let address = '';
      if (!isEvmAddress(wallet.cosmosAddress)) {
        const { data: cosmosData } = fromBech32(wallet.cosmosAddress);
        address = toBech32(chain.bech32Prefix, cosmosData);
      } else {
        address = wallet.cosmosAddress;
      }
      available.push({
        chainName: chain.chainName,
        logo: chain.logo,
        address: address,
        coinType: chain.coinType,
        compatiable: wallet.hdPath.indexOf(chain.coinType) > 0,
        endpoint: chain.endpoints.rest?.at(0)?.address,
      });
    });
  });
  return available;
}

export function kiiConvertedAddress(address: string): string {
  if (isEvmAddress(address)) {
    return addressEnCode('kii', fromHex(address.replace('0x', '')));
  }
  return address;
}

export function isEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
