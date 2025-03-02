import { fetchData } from '@/libs';
import { DEFAULT } from '@/libs';
import {
  adapter,
  type Request,
  type RequestRegistry,
  type AbstractRegistry,
  findApiProfileByChain,
  findApiProfileBySDKVersion,
  registryChainProfile,
  registryVersionProfile,
  withCustomRequest,
} from './registry';
import {
  PageRequest,
  type Coin,
  type BlocksEvmResponse,
  type TxResponse,
  type Transaction,
  type PaginatedSmartContractResponse,
} from '@/types';
import { convertTransaction } from './ethers';
import { watchArray } from '@vueuse/core';

export class BaseRestClient<R extends AbstractRegistry> {
  endpoint: string;
  registry: R;
  constructor(endpoint: string, registry: R) {
    this.endpoint = endpoint;
    this.registry = registry;
  }
  async request<T>(request: Request<T>, args: Record<string, any>, query = '') {
    let url = `${this.endpoint}${request.url}${query}`;
    Object.keys(args).forEach((k) => {
      url = url.replace(`{${k}}`, args[k] || '');
    });
    return fetchData<T>(url, request.adapter);
  }
}

// dynamic all custom request implementations
function registeCustomRequest() {
  const extensions: Record<string, any> = import.meta.glob('./clients/*.ts', {
    eager: true,
  });
  Object.values(extensions).forEach((m) => {
    if (m.store === 'version') {
      registryVersionProfile(m.name, withCustomRequest(DEFAULT, m.requests));
    } else {
      registryChainProfile(m.name, withCustomRequest(DEFAULT, m.requests));
    }
  });
}

registeCustomRequest();

export class CosmosRestClient extends BaseRestClient<RequestRegistry> {
  static newDefault(endpoint: string) {
    return new CosmosRestClient(endpoint, DEFAULT);
  }

  static newStrategy(endpoint: string, chain: any) {
    let req;
    if (chain) {
      // find by name first
      req = findApiProfileByChain(chain.chainName);
      // if not found. try sdk version
      if (!req && chain.versions?.cosmosSdk) {
        req = findApiProfileBySDKVersion(chain.versions?.cosmosSdk);
      }
    }
    return new CosmosRestClient(endpoint, req || DEFAULT);
  }

  // Auth Module
  async getAuthAccounts(page?: PageRequest) {
    if (!page) page = new PageRequest();
    const query = `?${page.toQueryString()}`;
    return this.request(this.registry.auth_accounts, {}, query);
  }
  async getAuthAccount(address: string) {
    return this.request(this.registry.auth_account_address, { address });
  }
  // Bank Module
  async getBankParams() {
    return this.request(this.registry.bank_params, {});
  }
  async getBankBalances(address: string) {
    return this.request(this.registry.bank_balances_address, { address });
  }
  async getBankDenomMetadata() {
    return this.request(this.registry.bank_denoms_metadata, {});
  }
  async getBankDenomOwners(denom: string, page?: PageRequest) {
    if (!page) page = new PageRequest();
    const query = `?${page.toQueryString()}`;
    return this.request(this.registry.bank_denom_owners, { denom }, query);
  }
  async getBankSupply(page?: PageRequest) {
    if (!page) page = new PageRequest();
    const query = `?${page.toQueryString()}`;
    return this.request(this.registry.bank_supply, {}, query);
  }
  async getBankSupplyByDenom(denom: string) {
    let supply;
    try {
      supply = await this.request(this.registry.bank_supply_by_denom, {
        denom,
      });
    } catch (err) {
      // will move this to sdk version profile later
      supply = await this.request(
        {
          url: '/cosmos/bank/v1beta1/supply/by_denom?denom={denom}',
          adapter,
        } as Request<{ amount: Coin }>,
        { denom }
      );
    }
    return supply;
  }
  // Distribution Module
  async getDistributionParams() {
    return this.request(this.registry.distribution_params, {});
  }
  async getDistributionCommunityPool() {
    return this.request(this.registry.distribution_community_pool, {});
  }
  async getDistributionDelegatorRewards(delegator_addr: string) {
    return this.request(this.registry.distribution_delegator_rewards, {
      delegator_addr,
    });
  }
  async getDistributionValidatorCommission(validator_address: string) {
    return this.request(this.registry.distribution_validator_commission, {
      validator_address,
    });
  }
  async getDistributionValidatorOutstandingRewards(validator_address: string) {
    return this.request(
      this.registry.distribution_validator_outstanding_rewards,
      { validator_address }
    );
  }
  async getDistributionValidatorSlashes(validator_address: string) {
    return this.request(this.registry.distribution_validator_slashes, {
      validator_address,
    });
  }
  // Slashing
  async getSlashingParams() {
    return this.request(this.registry.slashing_params, {});
  }
  async getSlashingSigningInfos() {
    const query = '?pagination.limit=300';
    return this.request(this.registry.slashing_signing_info, {}, query);
  }
  // Gov
  async getGovParamsVoting() {
    return this.request(this.registry.gov_params_voting, {});
  }
  async getGovParamsDeposit() {
    return this.request(this.registry.gov_params_deposit, {});
  }
  async getGovParamsTally() {
    return this.request(this.registry.gov_params_tally, {});
  }
  async getGovProposals(status: string, page?: PageRequest) {
    if (!page) page = new PageRequest();
    page.reverse = true;
    const query = `?proposal_status={status}&${page.toQueryString()}`;
    return this.request(this.registry.gov_proposals, { status }, query);
  }
  async getGovProposal(proposal_id: string) {
    return this.request(this.registry.gov_proposals_proposal_id, {
      proposal_id,
    });
  }
  async getGovProposalDeposits(proposal_id: string) {
    return this.request(this.registry.gov_proposals_deposits, { proposal_id });
  }
  async getGovProposalTally(proposal_id: string) {
    return this.request(this.registry.gov_proposals_tally, { proposal_id });
  }
  async getGovProposalVotes(proposal_id: string, page?: PageRequest) {
    if (!page) page = new PageRequest();
    page.reverse = true;
    const query = `?proposal_status={status}&${page.toQueryString()}`;
    return this.request(
      this.registry.gov_proposals_votes,
      { proposal_id },
      query
    );
  }
  async getGovProposalVotesVoter(proposal_id: string, voter: string) {
    return this.request(this.registry.gov_proposals_votes_voter, {
      proposal_id,
      voter,
    });
  }
  // staking
  async getStakingDelegations(delegator_addr: string) {
    return this.request(this.registry.staking_deletations, { delegator_addr });
  }
  async getStakingDelegatorRedelegations(delegator_addr: string) {
    return this.request(this.registry.staking_delegator_redelegations, {
      delegator_addr,
    });
  }
  async getStakingDelegatorUnbonding(delegator_addr: string) {
    return this.request(this.registry.staking_delegator_unbonding_delegations, {
      delegator_addr,
    });
  }
  async getStakingDelegatorValidators(delegator_addr: string) {
    return this.request(this.registry.staking_delegator_validators, {
      delegator_addr,
    });
  }
  async getStakingParams() {
    return this.request(this.registry.staking_params, {});
  }
  async getStakingPool() {
    return this.request(this.registry.staking_pool, {});
  }
  async getStakingValidators(status: string, limit = 200) {
    return this.request(this.registry.staking_validators, { status, limit });
  }
  async getStakingValidator(validator_addr: string) {
    return this.request(this.registry.staking_validators_address, {
      validator_addr,
    });
  }
  async getStakingValidatorsDelegations(validator_addr: string) {
    return this.request(this.registry.staking_validators_delegations, {
      validator_addr,
    });
  }
  async getStakingValidatorsDelegationsDelegator(
    validator_addr: string,
    delegator_addr: string
  ) {
    return this.request(
      this.registry.staking_validators_delegations_delegator,
      { validator_addr, delegator_addr }
    );
  }
  async getStakingValidatorsDelegationsUnbonding(
    validator_addr: string,
    delegator_addr: string
  ) {
    return this.request(
      this.registry.staking_validators_delegations_unbonding_delegations,
      { validator_addr, delegator_addr }
    );
  }

  //tendermint
  async getBaseAbciQuery() {
    return this.request(this.registry.base_tendermint_abci_query, {});
  }
  async getBaseBlockLatest() {
    return this.request(this.registry.base_tendermint_block_latest, {});
  }
  async getBaseBlockAt(height: string | number) {
    return this.request(this.registry.base_tendermint_block_height, { height });
  }
  async getBaseLatestBlocksEvm() {
    const response = await fetch(DEFAULT.kii_backend_blocks.url);
    const blocksResponse: BlocksEvmResponse = await response.json();
    const sortedBlocks = blocksResponse.blocks.blocks.sort(
      (a, b) => b.blockNumber - a.blockNumber
    );
    const latestBlocksPromise = sortedBlocks.slice(0, 20).map(async (block) => {
      return await this.getBaseBlockAt(block.blockNumber);
    });
    const latestBlocks = await Promise.all(latestBlocksPromise);
    return latestBlocks;
  }
  async getBaseNodeInfo() {
    return this.request(this.registry.base_tendermint_node_info, {});
  }
  async getBaseValidatorsetAt(height: string | number, offset: number) {
    const query = `?pagination.limit=100&pagination.offset=${offset}`;
    return this.request(
      this.registry.base_tendermint_validatorsets_height,
      {
        height,
      },
      query
    );
  }
  async getBaseValidatorsetLatest(offset: number) {
    const query = `?pagination.limit=100&pagination.offset=${offset}`;
    return this.request(
      this.registry.base_tendermint_validatorsets_latest,
      {},
      query
    );
  }
  // tx
  async getTxsBySender(sender: string, page?: PageRequest) {
    if (!page) page = new PageRequest();
    const query = `?&events=message.sender='${sender}'&order_by=2&pagination.limit=${
      page.limit
    }&pagination.offset=${page.offset || 0}`;
    return this.request(this.registry.tx_txs, {}, query);
  }
  // tx received
  async getTxsReceived(address: string, page?: PageRequest) {
    if (!page) page = new PageRequest();
    const query = `?&events=transfer.recipient='${address}'&order_by=2&pagination.limit=${
      page.limit
    }&pagination.offset=${page.offset || 0}`;
    return this.request(this.registry.tx_txs, {}, query);
  }
  // query ibc sending msgs
  // ?&pagination.reverse=true&events=send_packet.packet_src_channel='${channel}'&events=send_packet.packet_src_port='${port}'
  // query ibc receiving msgs
  // ?&pagination.reverse=true&events=recv_packet.packet_dst_channel='${channel}'&events=recv_packet.packet_dst_port='${port}'
  async getTxs(query: string, params: any, page?: PageRequest) {
    if (!page) page = new PageRequest();
    return this.request(
      this.registry.tx_txs,
      params,
      `${query}&${page.toQueryString()}`
    );
  }
  async getTxsCount() {
    const query = `?&events=message.action='/cosmos.bank.v1beta1.MsgSend'&pagination.limit=1&pagination.count_total=true`;

    const response = await this.request(this.registry.tx_txs, {}, query);

    // Check if pagination exists
    const total = response.pagination
      ? +(response?.pagination?.total || 0)
      : +(response.total || 0);

    return total;
  }

  async getTxsCountEvm() {
    const query = `?&query=transfer.msg_index='0'&pagination.count_total=true`;
    return (await this.request(this.registry.tx_txs, {}, query)).total;
  }
  async getLatestTxs(page: number) {
    const query = `?events=message.action='/cosmos.bank.v1beta1.MsgSend'&order_by=2&page=${page}`;
    return this.request(this.registry.tx_txs, {}, `${query}`);
  }
  async getLatestTxsEvm(page?: PageRequest) {
    const response = await fetch(DEFAULT.kii_backend_transactions.url);
    const transactionsResponse = await response.json();
    const transactions: TxResponse[] = transactionsResponse.transactions.map(
      (transaction: Transaction) => {
        return convertTransaction(transaction);
      }
    );
    const tx = transactions.sort(
      (a, b) => parseInt(b.timestamp) - parseInt(a.timestamp)
    );
    return {
      transactions: tx,
      quantity: transactionsResponse.quantity,
    };
  }
  async getTxsByWalletEvm(walletAddress: string): Promise<TxResponse[]> {
    const response = await fetch(
      DEFAULT.kii_backend_transactions_by_wallet.url + walletAddress
    );
    const transactionsResponse = await response.json();
    const transactions: TxResponse[] = transactionsResponse.transactions.map(
      (transaction: Transaction) => {
        return convertTransaction(transaction);
      }
    );
    const tx = transactions.sort(
      (a, b) => parseInt(b.timestamp) - parseInt(a.timestamp)
    );
    return tx;
  }
  async getTxsAt(height: string | number) {
    return this.request(this.registry.tx_txs_block, { height });
  }
  async getTx(hash: string) {
    return this.request(this.registry.tx_hash, { hash });
  }

  // mint
  async getMintParam() {
    return this.request(this.registry.mint_params, {});
  }
  async getMintInflation() {
    return this.request(this.registry.mint_inflation, {});
  }
  async getMintAnnualProvisions() {
    return this.request(this.registry.mint_annual_provisions, {});
  }

  // ibc
  async getIBCAppTransferDenom(hash: string) {
    return this.request(this.registry.ibc_app_transfer_denom_traces_hash, {
      hash,
    });
  }
  async getIBCConnections(page?: PageRequest) {
    if (!page) page = new PageRequest();
    const query = `?${page.toQueryString()}`;
    return this.request(
      this.registry.ibc_core_connection_connections,
      {},
      query
    );
  }
  async getIBCConnectionsById(connection_id: string) {
    return this.request(
      this.registry.ibc_core_connection_connections_connection_id,
      { connection_id }
    );
  }
  async getIBCConnectionsClientState(connection_id: string) {
    return this.request(
      this.registry.ibc_core_connection_connections_connection_id_client_state,
      { connection_id }
    );
  }
  async getIBCConnectionsChannels(connection_id: string) {
    return this.request(this.registry.ibc_core_channel_connections_channels, {
      connection_id,
    });
  }
  async getIBCChannels() {
    return this.request(this.registry.ibc_core_channel_channels, {});
  }
  async getIBCChannelAcknowledgements(channel_id: string, port_id: string) {
    return this.request(
      this.registry.ibc_core_channel_channels_acknowledgements,
      { channel_id, port_id }
    );
  }
  async getIBCChannelNextSequence(channel_id: string, port_id: string) {
    return this.request(this.registry.ibc_core_channel_channels_next_sequence, {
      channel_id,
      port_id,
    });
  }
  async getSmartContracts(page: number) {
    const url = `${DEFAULT.kii_backend_smart_contracts.url}?page=${page}`;
    const response = await fetch(url);
    const smartContractsResponse: PaginatedSmartContractResponse =
      await response.json();
    return smartContractsResponse;
  }
}
