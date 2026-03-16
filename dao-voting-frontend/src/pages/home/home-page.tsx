import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import Button from "@/components/shared/button";
import StatCard from "@/components/shared/stat-card";
import { use_dao_store } from "@/store/dao.store";

import CreateProposalModal from "./_components/create-proposal-modal";
import ErrorState from "./_components/error-state";
import HeroSection from "./_components/hero-section";
import LoadingState from "./_components/loading-state";
import ProposalGrid from "./_components/proposal-grid";

export default function HomePage() {
  const [is_modal_open, set_is_modal_open] = useState(false);
  const [current_unix, set_current_unix] = useState(0);

  const {
    wallet_address,
    is_connected,
    is_loading,
    is_submitting,
    is_member,
    owner_address,
    proposal_count,
    proposals,
    error_message,
    connect_wallet,
    load_dao_data,
    create_proposal,
    vote_on_proposal,
    execute_proposal,
    clear_error,
  } = use_dao_store();

  useEffect(() => {
    if (is_connected) {
      void load_dao_data();
    }
  }, [is_connected, load_dao_data]);

  useEffect(() => {
    const update_current_unix = () => {
      set_current_unix(Math.floor(Date.now() / 1000));
    };

    update_current_unix();

    const interval_id = window.setInterval(update_current_unix, 1000);

    return () => window.clearInterval(interval_id);
  }, []);

  const stats = useMemo(() => {
    const active_count = proposals.filter(
      (proposal) => !proposal.executed && proposal.deadline > current_unix,
    ).length;

    const executed_count = proposals.filter(
      (proposal) => proposal.executed,
    ).length;

    return {
      total: proposal_count,
      active: active_count,
      executed: executed_count,
      role: is_member ? "Member" : "Visitor",
    };
  }, [current_unix, is_member, proposal_count, proposals]);

  return (
    <>
      <div className="space-y-8">
        <HeroSection
          wallet_address={wallet_address}
          is_connected={is_connected}
          is_loading={is_loading}
          on_connect={() => void connect_wallet()}
        />

        {error_message ? (
          <ErrorState
            message={error_message}
            on_retry={() => {
              clear_error();
              void load_dao_data();
            }}
          />
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total proposals" value={stats.total} icon="All" />
          <StatCard label="Active proposals" value={stats.active} icon="Now" />
          <StatCard
            label="Executed proposals"
            value={stats.executed}
            icon="Done"
          />
          <StatCard label="Your role" value={stats.role} icon="User" />
        </section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Governance dashboard</h2>
              <p className="mt-2 text-sm text-white/60">
                Owner: {owner_address || "Not loaded"}
              </p>
            </div>

            <Button
              disabled={!is_connected || !is_member}
              onClick={() => set_is_modal_open(true)}
            >
              Create Proposal
            </Button>
          </div>
        </motion.section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">All proposals</h2>
            <p className="mt-2 text-sm text-white/60">
              Vote on active proposals or execute expired ones.
            </p>
          </div>

          {is_loading ? (
            <LoadingState />
          ) : (
            <ProposalGrid
              current_unix={current_unix}
              proposals={proposals}
              is_submitting={is_submitting}
              on_vote_yes={async (proposal_id) => {
                await vote_on_proposal(proposal_id, 1);
              }}
              on_vote_no={async (proposal_id) => {
                await vote_on_proposal(proposal_id, 2);
              }}
              on_execute={execute_proposal}
            />
          )}
        </section>
      </div>

      <CreateProposalModal
        is_open={is_modal_open}
        is_submitting={is_submitting}
        on_close={() => set_is_modal_open(false)}
        on_submit={create_proposal}
      />
    </>
  );
}
