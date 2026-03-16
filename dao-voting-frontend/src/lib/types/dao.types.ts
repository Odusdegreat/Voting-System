export type Proposal = {
  id: number;
  title: string;
  description: string;
  deadline: number;
  yes_votes: number;
  no_votes: number;
  executed: boolean;
  passed: boolean;
  created_by: string;
};

export type CreateProposalPayload = {
  title: string;
  description: string;
  duration_in_seconds: number;
};
