import { BrowserProvider, Contract, isAddress } from "ethers";

import { dao_voting_system_abi } from "@/lib/abi/dao-voting-system.abi";
import { dao_contract_address } from "@/lib/constants";
import type { CreateProposalPayload, Proposal } from "@/lib/types/dao.types";
import "@/lib/types/wallet.types";

type RawProposal = {
  id: bigint;
  title: string;
  description: string;
  deadline: bigint;
  yes_votes: bigint;
  no_votes: bigint;
  executed: boolean;
  passed: boolean;
  created_by: string;
};

function map_proposal(raw: RawProposal): Proposal {
  return {
    id: Number(raw.id),
    title: raw.title,
    description: raw.description,
    deadline: Number(raw.deadline),
    yes_votes: Number(raw.yes_votes),
    no_votes: Number(raw.no_votes),
    executed: raw.executed,
    passed: raw.passed,
    created_by: raw.created_by,
  };
}

class DaoService {
  private getEthereumProvider() {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    return window.ethereum;
  }

  private getBrowserProvider() {
    return new BrowserProvider(this.getEthereumProvider());
  }

  private async getContract() {
    if (!dao_contract_address) {
      throw new Error(
        "DAO contract address is missing. Set VITE_DAO_CONTRACT_ADDRESS in dao-voting-frontend/.env.local.",
      );
    }

    if (!isAddress(dao_contract_address)) {
      throw new Error(`DAO contract address is invalid: ${dao_contract_address}`);
    }

    const provider = this.getBrowserProvider();
    const signer = await provider.getSigner();

    return new Contract(dao_contract_address, dao_voting_system_abi, signer);
  }

  async connectWallet(): Promise<string> {
    const provider = this.getBrowserProvider();
    const accounts = (await provider.send("eth_requestAccounts", [])) as string[];

    if (!accounts.length) {
      throw new Error("No wallet account found");
    }

    return accounts[0];
  }

  async getConnectedAccount(): Promise<string | null> {
    const provider = this.getBrowserProvider();
    const accounts = (await provider.send("eth_accounts", [])) as string[];

    return accounts[0] ?? null;
  }

  async getChainId(): Promise<number> {
    const provider = this.getBrowserProvider();
    const network = await provider.getNetwork();

    return Number(network.chainId);
  }

  async getProposalCount(): Promise<number> {
    const contract = await this.getContract();
    const count = await contract.proposal_count();

    return Number(count);
  }

  async getProposalById(proposal_id: number): Promise<Proposal> {
    const contract = await this.getContract();
    const proposal = (await contract.get_proposal(proposal_id)) as RawProposal;

    return map_proposal(proposal);
  }

  async getAllProposals(): Promise<Proposal[]> {
    const count = await this.getProposalCount();

    if (count === 0) {
      return [];
    }

    const proposals = await Promise.all(
      Array.from({ length: count }, (_, index) =>
        this.getProposalById(index + 1),
      ),
    );

    return proposals.sort((left, right) => right.id - left.id);
  }

  async isMember(wallet_address: string): Promise<boolean> {
    const contract = await this.getContract();
    return contract.is_member(wallet_address) as Promise<boolean>;
  }

  async getOwnerAddress(): Promise<string> {
    const contract = await this.getContract();
    return contract.owner() as Promise<string>;
  }

  async getVoteStatus(proposal_id: number, wallet_address: string): Promise<number> {
    const contract = await this.getContract();
    const vote_status = await contract.get_vote_status(proposal_id, wallet_address);

    return Number(vote_status);
  }

  async createProposal(payload: CreateProposalPayload): Promise<string> {
    if (!payload.title.trim()) {
      throw new Error("Proposal title is required");
    }

    if (!payload.description.trim()) {
      throw new Error("Proposal description is required");
    }

    if (payload.duration_in_seconds <= 0) {
      throw new Error("Proposal duration must be greater than zero");
    }

    const contract = await this.getContract();
    const transaction = await contract.create_proposal(
      payload.title.trim(),
      payload.description.trim(),
      payload.duration_in_seconds,
    );

    await transaction.wait();

    return transaction.hash;
  }

  async voteOnProposal(proposal_id: number, choice: 1 | 2): Promise<string> {
    const contract = await this.getContract();
    const transaction = await contract.vote_on_proposal(proposal_id, choice);

    await transaction.wait();

    return transaction.hash;
  }

  async executeProposal(proposal_id: number): Promise<string> {
    const contract = await this.getContract();
    const transaction = await contract.execute_proposal(proposal_id);

    await transaction.wait();

    return transaction.hash;
  }
}

const dao_service = new DaoService();

export default dao_service;
