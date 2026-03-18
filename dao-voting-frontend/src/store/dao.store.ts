import { BrowserProvider, Contract, isAddress } from "ethers";
import { create } from "zustand";

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

type DaoStore = {
  wallet_address: string;
  is_connected: boolean;
  is_loading: boolean;
  is_submitting: boolean;
  is_member: boolean;
  owner_address: string;
  proposals: Proposal[];
  proposal_count: number;
  chain_id: number | null;
  network_name: string;
  error_message: string;
  initialize_wallet: () => Promise<void>;
  connect_wallet: () => Promise<void>;
  load_dao_data: () => Promise<void>;
  create_proposal: (payload: CreateProposalPayload) => Promise<void>;
  vote_on_proposal: (proposal_id: number, choice: 1 | 2) => Promise<void>;
  execute_proposal: (proposal_id: number) => Promise<void>;
  clear_error: () => void;
};

const configured_chain_id_raw = import.meta.env.VITE_DAO_CHAIN_ID as
  | string
  | undefined;
const configured_chain_id = configured_chain_id_raw
  ? Number(configured_chain_id_raw)
  : null;

function get_network_name(chain_id: bigint | number) {
  const normalized_chain_id = Number(chain_id);

  switch (normalized_chain_id) {
    case 1:
      return "Ethereum Mainnet";
    case 11155111:
      return "Sepolia";
    case 17000:
      return "Holesky";
    case 84532:
      return "Base Sepolia";
    case 80002:
      return "Polygon Amoy";
    case 421614:
      return "Arbitrum Sepolia";
    case 11155420:
      return "OP Sepolia";
    case 43113:
      return "Avalanche Fuji";
    case 97:
      return "BSC Testnet";
    case 31337:
      return "Localhost 31337";
    default:
      return `Chain ${normalized_chain_id}`;
  }
}

function get_browser_provider() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  return new BrowserProvider(window.ethereum);
}

async function get_network_details(provider: BrowserProvider) {
  const network = await provider.getNetwork();
  const chain_id = Number(network.chainId);

  return {
    chain_id,
    network_name: get_network_name(network.chainId),
  };
}

async function validate_contract(provider: BrowserProvider) {
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

  const { chain_id, network_name } = await get_network_details(provider);

  if (
    configured_chain_id !== null &&
    Number.isFinite(configured_chain_id) &&
    chain_id !== configured_chain_id
  ) {
    throw new Error(
      `MetaMask is connected to ${network_name}. Switch to ${get_network_name(configured_chain_id)} or update VITE_DAO_CHAIN_ID to match your deployed testnet.`,
    );
  }

  const contract_code = await provider.getCode(dao_contract_address);

  if (contract_code === "0x") {
    throw new Error(
      `No DAO contract was found at ${dao_contract_address} on ${network_name}. Update VITE_DAO_CONTRACT_ADDRESS to the deployed contract for this network.`,
    );
  }
}

async function get_read_contract(provider: BrowserProvider) {
  await validate_contract(provider);

  return new Contract(dao_contract_address, dao_voting_system_abi, provider);
}

async function get_write_contract(provider: BrowserProvider) {
  await validate_contract(provider);
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
  chain_id: null,
  network_name: "",
  error_message: "",

  clear_error: () => set({ error_message: "" }),

  initialize_wallet: async () => {
    if (!window.ethereum) {
      set({
        wallet_address: "",
        is_connected: false,
        is_member: false,
        owner_address: "",
        proposals: [],
        proposal_count: 0,
        chain_id: null,
        network_name: "",
      });
      return;
    }

    try {
      set({ is_loading: true, error_message: "" });

      const provider = get_browser_provider();
      const accounts = (await provider.send("eth_accounts", [])) as string[];
      const { chain_id, network_name } = await get_network_details(provider);

      if (!accounts.length) {
        set({
          wallet_address: "",
          is_connected: false,
          chain_id,
          network_name,
        });
        await get().load_dao_data();
        return;
      }

      set({
        wallet_address: accounts[0],
        is_connected: true,
        chain_id,
        network_name,
      });

      await get().load_dao_data();
    } catch (error) {
      set({
        error_message: get_error_message(error, "Failed to initialize wallet"),
      });
    } finally {
      set({ is_loading: false });
    }
  },

  connect_wallet: async () => {
    try {
      set({ is_loading: true, error_message: "" });

      const provider = get_browser_provider();
      const accounts = (await provider.send(
        "eth_requestAccounts",
        [],
      )) as string[];
      const { chain_id, network_name } = await get_network_details(provider);

      if (!accounts?.length) {
        throw new Error("No wallet account found");
      }

      set({
        wallet_address: accounts[0],
        is_connected: true,
        chain_id,
        network_name,
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
      const contract = await get_read_contract(provider);
      const accounts = (await provider.send("eth_accounts", [])) as string[];

      const wallet_address = get().wallet_address || accounts[0] || "";
      const { chain_id, network_name } = await get_network_details(provider);
      const [proposal_count_raw, owner_address] = await Promise.all([
        contract.proposal_count(),
        contract.owner(),
      ]);
      const member_status = wallet_address
        ? await contract.is_member(wallet_address)
        : false;

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
        wallet_address,
        is_connected: Boolean(wallet_address),
        chain_id,
        network_name,
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
      const contract = await get_write_contract(provider);

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
      const contract = await get_write_contract(provider);

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
      const contract = await get_write_contract(provider);

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
