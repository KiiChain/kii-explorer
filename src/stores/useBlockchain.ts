import { defineStore } from 'pinia';
import {
  useDashboard,
  type ChainConfig,
  type Endpoint,
  EndpointType,
} from './useDashboard';
import type {
  NavGroup,
  NavLink,
  NavSectionTitle,
  VerticalNavItems,
} from '@/layouts/types';
import { useRouter } from 'vue-router';
import { CosmosRestClient } from '@/libs/client';
import {
  useBankStore,
  useGovStore,
  useMintStore,
  useStakingStore,
  useWalletStore,
} from '.';
// import { useBlockModule } from '@/modules/[chain]/block/block';
import { hexToRgb, rgbToHsl } from '@/libs/utils';

interface IEndpoint {
  type?: EndpointType;
  address: string;
  provider: string;
}

interface State {
  status: Record<string, string>;
  rest: string;
  chainName: string;
  endpoint: IEndpoint;
  rpcEndpoint: string;
  connErr: string;
}

export const useBlockchain = defineStore('blockchain', {
  state: (): State => ({
    status: {},
    rest: '',
    chainName: '',
    endpoint: {
      address: '',
      provider: '',
    },
    rpcEndpoint: '',
    connErr: ''
  }),
  getters: {
    current(): ChainConfig | undefined {
      return this.dashboard.chains[this.chainName];
    },
    logo(): string {
      return this.current?.logo || '';
    },
    altLogo(): string {
      return this.current?.altLogo || '';
    },
    defaultHDPath(): string {
      const cointype = this.current?.coinType || '118';
      return `m/44'/${cointype}/0'/0/0`;
    },
    dashboard() {
      return useDashboard();
    },
    isConsumerChain() {
      // @ts-ignore
      return this.current && this.current.providerChain;
    },
    getRpcEndpoint(): string {
      return this.rpcEndpoint;
    },
    computedChainMenu() {
      let currNavItem: VerticalNavItems = [];
      let section2Item: VerticalNavItems = [];
      const router = useRouter();
      let routes = router?.getRoutes()?.filter(route => !route.meta.disabled) || [];

      if (this.current && routes) {
        if (this.current?.themeColor) {
          const { color } = hexToRgb(this.current?.themeColor);
          const { h, s, l } = rgbToHsl(color);
          const themeColor = h + ' ' + s + '% ' + l + '%';
          document.body.style.setProperty('--p', `${themeColor}`);
          // document.body.style.setProperty('--p', `${this.current?.themeColor}`);
        } else {
          document.body.style.setProperty('--p', '237.65 100% 70%');
        }

        const exploreNav = {
          meta: {
            i18n: 'explore',
            section: '',
            order: 1,
            icon: 'mdi:magnify',
          },
          path: `/${this.chainName}`,
        };

        const newRoute = {
          path: '/new-route',
          meta: {
            i18n: 'newRoute',
            icon: 'new-icon',
            order: 50,
            section: false
          }
        };

        const children = [...routes, exploreNav]
          .filter((x) => x.meta.i18n && !x.meta.section)
          .filter(
            (x) =>
              !this.current?.features ||
              this.current.features.includes(String(x.meta.i18n))
          )
          .map((x) => ({
            title: `module.${x.meta.i18n}`,
            to: { path: x.path.replace(':chain', this.chainName) },
            icon: { icon: x.meta.icon as string, size: '22' },
            i18n: true,
            order: Number(x.meta.order || 100),
          }))
          .sort((a, b) => a.order - b.order);

        children.push({
          title: `Token Faucet`,
          to: { path: '/wallet/accounts' },
          icon: { icon: 'ion:water', size: '22' },
          i18n: true,
          order: Number(newRoute.meta.order || 100),
        });

        children.push({
          title: `Smart Contracts`,
          to: { path: '/smart-contracts' },
          icon: { icon: 'material-symbols:contract', size: '22' },
          i18n: true,
          order: Number(newRoute.meta.order || 100),
        });

        currNavItem = [
          {
            title: this.current?.prettyName || this.chainName || '',
            icon: {
              image: this.current.logo,
              altImage: this.current.altLogo,
              size: '22',
            },
            i18n: false,
            badgeContent: this.isConsumerChain ? 'Consumer' : undefined,
            badgeClass: 'bg-error',
            children
          },
        ];

        section2Item = [
          {
            title: '',
            i18n: false,
            children: routes
              .filter((x) => x.meta.i18n && x.meta.section === 2)
              .filter(
                (x) =>
                  !this.current?.features ||
                  this.current.features.includes(String(x.meta.i18n))
              ) // filter none-custom module
              .map((x) => ({
                title: `module.${x.meta.i18n}`,
                to: { path: x.path.replace(':chain', this.chainName) },
                icon: { icon: x.meta.icon as string, size: '22' },
                meta: { weight: (x.meta.weight as string) || '' },
                i18n: true,
                order: Number(x.meta.order || 100),
              }))
              .sort((a, b) => a.order - b.order),
          },
        ];
      }
      // compute favorite menu
      const favNavItems: VerticalNavItems = [];
      Object.keys(this.dashboard.favoriteMap).forEach((name) => {
        const ch = this.dashboard.chains[name];
        if (ch && this.dashboard.favoriteMap?.[name]) {
          favNavItems.push({
            title: ch.prettyName || ch.chainName || name,
            to: { path: `/${ch.chainName || name}` },
            icon: { image: ch.logo, size: '22' },
          });
        }
      });

      // combine all together
      return [...currNavItem, ...section2Item];
    },
  },
  actions: {
    async initial() {
      // this.current?.themeColor {
      //     const { global } = useTheme();
      //     global.current
      // }

      if (this.chainName === 'kiichain3') {
        this.setupV3RPCEndpoint();
      } else {
        useMintStore().initial();
      }
      useWalletStore().$reset();
      await this.randomSetupEndpoint();
      await useStakingStore().init();
      useBankStore().initial();
      useGovStore().initial();
      // useBlockModule().initial();
    },
    setupV3RPCEndpoint() {
      const all = this.current?.endpoints?.rpc;
        if (all) {
          const rn = Math.random();
          const endpoint = all[Math.floor(rn * all.length)];
          this.rpcEndpoint = endpoint.address;
        }
    },
    async randomSetupEndpoint() {
      const end = localStorage.getItem(`endpoint-${this.chainName}`);
      if (end) {
        this.setRestEndpoint(JSON.parse(end));
      } else {
        const all = this.current?.endpoints?.rest;
        if (all) {
          const rn = Math.random();
          const endpoint = all[Math.floor(rn * all.length)];
          await this.setRestEndpoint(endpoint);
        }
      }
    },

    async setRestEndpoint(endpoint: Endpoint) {
      this.connErr = '';
      this.endpoint = endpoint;
      this.rpc = CosmosRestClient.newStrategy(endpoint.address, this.current);
      localStorage.setItem(
        `endpoint-${this.chainName}`,
        JSON.stringify(endpoint)
      );
    },
    setCurrent(name: string) {
      if (name !== this.chainName) {
        this.chainName = name;
      }
    },
    supportModule(mod: string) {
      return !this.current?.features || this.current.features.includes(mod);
    },
  },
});
