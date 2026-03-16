export const dao_voting_system_abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "member",
        type: "address",
      },
    ],
    name: "MemberAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "member",
        type: "address",
      },
    ],
    name: "MemberRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "proposal_id",
        type: "uint256",
      },
      { indexed: false, internalType: "bool", name: "passed", type: "bool" },
      {
        indexed: false,
        internalType: "uint256",
        name: "yes_votes",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "no_votes",
        type: "uint256",
      },
    ],
    name: "ProposalExecuted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "proposal_id",
        type: "uint256",
      },
      { indexed: false, internalType: "string", name: "title", type: "string" },
      {
        indexed: false,
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "created_by",
        type: "address",
      },
    ],
    name: "ProposalCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "proposal_id",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "voter",
        type: "address",
      },
      { indexed: false, internalType: "uint8", name: "choice", type: "uint8" },
    ],
    name: "Voted",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "_member", type: "address" }],
    name: "add_member",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_title", type: "string" },
      { internalType: "string", name: "_description", type: "string" },
      {
        internalType: "uint256",
        name: "_duration_in_seconds",
        type: "uint256",
      },
    ],
    name: "create_proposal",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_proposal_id", type: "uint256" },
    ],
    name: "execute_proposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_proposal_id", type: "uint256" },
    ],
    name: "get_proposal",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "string", name: "title", type: "string" },
          { internalType: "string", name: "description", type: "string" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "uint256", name: "yes_votes", type: "uint256" },
          { internalType: "uint256", name: "no_votes", type: "uint256" },
          { internalType: "bool", name: "executed", type: "bool" },
          { internalType: "bool", name: "passed", type: "bool" },
          { internalType: "address", name: "created_by", type: "address" },
        ],
        internalType: "struct DAOVotingSystem.Proposal",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_proposal_id", type: "uint256" },
      { internalType: "address", name: "_voter", type: "address" },
    ],
    name: "get_vote_status",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "is_member",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "proposal_count",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_member", type: "address" }],
    name: "remove_member",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_proposal_id", type: "uint256" },
      { internalType: "uint8", name: "_choice", type: "uint8" },
    ],
    name: "vote_on_proposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
