import { BrowserProvider, Contract, isAddress } from "ethers";
import { create } from "zustand";

import { dao_voting_system_abi } from "@/lib/abi/dao-voting-system.abi";
import { dao_contract_address } from "@/lib/constants";
import type { CreateProposalPayload, Proposal } from "@/lib/types/dao.types";

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

type DaoStore = {
  wallet_address: string;
  is_connected: boolean;
  is_loading: boolean;
  is_submitting: boolean;
  is_member: boolean;
  owner_address: string;
  proposals: Proposal[];
  proposal_count: number;
  error_message: string;
  connect_wallet: () => Promise<void>;
  load_dao_data: () => Promise<void>;
  create_proposal: (payload: CreateProposalPayload) => Promise<void>;
  vote_on_proposal: (proposal_id: number, choice: 1 | 2) => Promise<void>;
  execute_proposal: (proposal_id: number) => Promise<void>;
  clear_error: () => void;
};

declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
    };
  }
}

function get_browser_provider() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  return new BrowserProvider(window.ethereum);
}

async function get_dao_contract(provider: BrowserProvider) {
  if (!dao_contract_address) {
    throw new Error(
      "DAO contract address is missing. Set VITE_DAO_CONTRACT_ADDRESS in dao-voting-frontend/.env.local.",
    );
  }

  if (!isAddress(dao_contract_address)) {
    throw new Error(
      `DAO contract address is invalid: ${dao_contract_address}`,
    );
  }

  const network = await provider.getNetwork();
  const contract_code = await provider.getCode(dao_contract_address);

  if (contract_code === "0x") {
    if (network.chainId === 31337n) {
      throw new Error(
        `No DAO contract is deployed at ${dao_contract_address} on Localhost 31337. Run "npx hardhat node" and then "npx hardhat run scripts/deploy.ts --network localhost".`,
      );
    }

    throw new Error(
      `No DAO contract was found at ${dao_contract_address} on chain ${network.chainId.toString()}. Switch MetaMask to Localhost 31337 or update VITE_DAO_CONTRACT_ADDRESS to the deployed contract for this network.`,
    );
  }

  const signer = await provider.getSigner();

  return new Contract(dao_contract_address, dao_voting_system_abi, signer);
}

function get_error_message(error: unknown, fallback: string) {
  if (error instanceof Error) {
    if (error.message.includes("could not decode result data")) {
      return "The configured contract address does not match a deployed DAO contract on the current network.";
    }

    return error.message;
  }

  return fallback;
}

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

export const use_dao_store = create<DaoStore>((set, get) => ({
  wallet_address: "",
  is_connected: false,
  is_loading: false,
  is_submitting: false,
  is_member: false,
  owner_address: "",
  proposals: [],
  proposal_count: 0,
  error_message: "",

  clear_error: () => set({ error_message: "" }),

  connect_wallet: async () => {
    try {
      set({ is_loading: true, error_message: "" });

      const provider = get_browser_provider();
      const accounts = (await provider.send(
        "eth_requestAccounts",
        [],
      )) as string[];

      if (!accounts?.length) {
        throw new Error("No wallet account found");
      }

      set({
        wallet_address: accounts[0],
        is_connected: true,
      });

      await get().load_dao_data();
    } catch (error) {
      set({
        error_message:
          error instanceof Error ? error.message : "Failed to connect wallet",
      });
    } finally {
      set({ is_loading: false });
    }
  },

  load_dao_data: async () => {
    try {
      set({ is_loading: true, error_message: "" });

      const provider = get_browser_provider();
      const contract = await get_dao_contract(provider);
      const signer = await provider.getSigner();

      const wallet_address =
        get().wallet_address || (await signer.getAddress());
      const [proposal_count_raw, owner_address, member_status] =
        await Promise.all([
          contract.proposal_count(),
          contract.owner(),
          contract.is_member(wallet_address),
        ]);

      const total = Number(proposal_count_raw);
      const proposal_promises = [];

      for (let index = 1; index <= total; index += 1) {
        proposal_promises.push(contract.get_proposal(index));
      }

      const proposal_results = await Promise.all(proposal_promises);
      const proposals = proposal_results
        .map(map_proposal)
        .sort((a, b) => b.id - a.id);

      set({
        proposals,
        proposal_count: total,
        owner_address,
        is_member: member_status,
      });
    } catch (error) {
      set({
        error_message: get_error_message(error, "Failed to load DAO data"),
      });
    } finally {
      set({ is_loading: false });
    }
  },

  create_proposal: async (payload) => {
    try {
      set({ is_submitting: true, error_message: "" });

      const provider = get_browser_provider();
      const contract = await get_dao_contract(provider);

      const tx = await contract.create_proposal(
        payload.title,
        payload.description,
        payload.duration_in_seconds,
      );

      await tx.wait();
      await get().load_dao_data();
    } catch (error) {
      set({
        error_message: get_error_message(error, "Failed to create proposal"),
      });
    } finally {
      set({ is_submitting: false });
    }
  },

  vote_on_proposal: async (proposal_id, choice) => {
    try {
      set({ is_submitting: true, error_message: "" });

      const provider = get_browser_provider();
      const contract = await get_dao_contract(provider);

      const tx = await contract.vote_on_proposal(proposal_id, choice);
      await tx.wait();

      await get().load_dao_data();
    } catch (error) {
      set({
        error_message: get_error_message(error, "Failed to vote on proposal"),
      });
    } finally {
      set({ is_submitting: false });
    }
  },

  execute_proposal: async (proposal_id) => {
    try {
      set({ is_submitting: true, error_message: "" });

      const provider = get_browser_provider();
      const contract = await get_dao_contract(provider);

      const tx = await contract.execute_proposal(proposal_id);
      await tx.wait();

      await get().load_dao_data();
    } catch (error) {
      set({
        error_message: get_error_message(error, "Failed to execute proposal"),
      });
    } finally {
      set({ is_submitting: false });
    }
  },
}));
