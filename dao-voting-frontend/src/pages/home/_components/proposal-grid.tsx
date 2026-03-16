import EmptyState from "@/components/shared/empty-state";
import type { Proposal } from "@/lib/types/dao.types";

import ProposalCard from "./proposal-card";

type ProposalGridProps = {
  current_unix: number;
  proposals: Proposal[];
  is_submitting: boolean;
  on_vote_yes: (proposal_id: number) => Promise<void>;
  on_vote_no: (proposal_id: number) => Promise<void>;
  on_execute: (proposal_id: number) => Promise<void>;
};

export default function ProposalGrid({
  current_unix,
  proposals,
  is_submitting,
  on_vote_yes,
  on_vote_no,
  on_execute,
}: ProposalGridProps) {
  if (!proposals.length) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {proposals.map((proposal) => (
        <ProposalCard
          key={proposal.id}
          current_unix={current_unix}
          proposal={proposal}
          is_submitting={is_submitting}
          on_vote_yes={() => on_vote_yes(proposal.id)}
          on_vote_no={() => on_vote_no(proposal.id)}
          on_execute={() => on_execute(proposal.id)}
        />
      ))}
    </div>
  );
}
