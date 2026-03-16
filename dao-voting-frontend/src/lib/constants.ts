export const dao_contract_address = import.meta.env
  .VITE_DAO_CONTRACT_ADDRESS as string;

export const vote_choice = {
  none: 0,
  yes: 1,
  no: 2,
} as const;
