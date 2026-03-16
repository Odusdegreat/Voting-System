import { motion } from "framer-motion";

import Badge from "@/components/shared/badge";
import Button from "@/components/shared/button";
import type { Proposal } from "@/lib/types/dao.types";
import {
  format_countdown,
  format_date_from_unix,
  truncate_address,
} from "@/lib/utils";

type ProposalCardProps = {
  current_unix: number;
  proposal: Proposal;
  is_submitting: boolean;
  on_vote_yes: () => Promise<void>;
  on_vote_no: () => Promise<void>;
  on_execute: () => Promise<void>;
};

export default function ProposalCard({
  current_unix,
  proposal,
  is_submitting,
  on_vote_yes,
  on_vote_no,
  on_execute,
}: ProposalCardProps) {
  const has_ended = proposal.deadline <= current_unix;

  function get_status_badge() {
    if (!proposal.executed && !has_ended) {
      return <Badge label="Active" tone="success" />;
    }

    if (!proposal.executed && has_ended) {
      return <Badge label="Ready to execute" tone="warning" />;
    }

    if (proposal.executed && proposal.passed) {
      return <Badge label="Passed" tone="success" />;
    }

    return <Badge label="Failed" tone="danger" />;
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="rounded-4xl border border-white/10 bg-white/6 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-white/45">Proposal #{proposal.id}</p>
          <h3 className="mt-2 text-xl font-bold">{proposal.title}</h3>
        </div>

        {get_status_badge()}
      </div>

      <p className="mt-4 text-sm leading-7 text-white/68">
        {proposal.description}
      </p>

      <div className="mt-5 grid gap-3 rounded-3xl border border-white/8 bg-[#0d1326]/75 p-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-white/45">Created by</p>
          <p className="mt-1 font-medium">
            {truncate_address(proposal.created_by)}
          </p>
        </div>

        <div>
          <p className="text-white/45">Deadline</p>
          <p className="mt-1 font-medium">
            {format_date_from_unix(proposal.deadline)}
          </p>
        </div>

        <div>
          <p className="text-white/45">Countdown</p>
          <p className="mt-1 font-medium">
            {format_countdown(proposal.deadline)}
          </p>
        </div>

        <div>
          <p className="text-white/45">Result</p>
          <p className="mt-1 font-medium">
            Yes {proposal.yes_votes} / No {proposal.no_votes}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Button
          variant="secondary"
          is_loading={is_submitting}
          disabled={has_ended || proposal.executed}
          onClick={on_vote_yes}
        >
          Vote Yes
        </Button>

        <Button
          variant="secondary"
          is_loading={is_submitting}
          disabled={has_ended || proposal.executed}
          onClick={on_vote_no}
        >
          Vote No
        </Button>

        <Button
          variant="primary"
          is_loading={is_submitting}
          disabled={!has_ended || proposal.executed}
          onClick={on_execute}
        >
          Execute
        </Button>
      </div>
    </motion.article>
  );
}
