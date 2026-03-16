import { motion } from "framer-motion";

import Button from "@/components/shared/button";
import WalletChip from "@/components/shared/wallet-chip";
import { truncate_address } from "@/lib/utils";

type HeroSectionProps = {
  wallet_address: string;
  is_connected: boolean;
  is_loading: boolean;
  on_connect: () => void;
};

export default function HeroSection({
  wallet_address,
  is_connected,
  is_loading,
  on_connect,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.26)] backdrop-blur-2xl sm:p-8 lg:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.2),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.14),_transparent_30%)]" />

      <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <span className="inline-flex rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-medium text-white/70">
              Decentralized Governance • Clean UX • Animated Interface
            </span>

            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
              Build and manage your DAO voting system with confidence
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
              Connect your wallet, create proposals, vote smoothly, and execute
              decisions after deadlines — all from one polished dashboard.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {is_connected ? (
                <WalletChip address={truncate_address(wallet_address)} />
              ) : (
                <Button is_loading={is_loading} onClick={on_connect}>
                  Connect Wallet
                </Button>
              )}

              <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/65">
                Works with MetaMask on localhost
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="grid gap-4"
        >
          <div className="rounded-3xl border border-white/10 bg-[#0d1326]/85 p-5">
            <p className="text-sm text-white/55">Governance cycle</p>
            <div className="mt-5 flex items-center justify-between">
              <div className="rounded-2xl bg-white/7 px-4 py-3 text-sm">
                Create
              </div>
              <div className="h-px flex-1 bg-white/10" />
              <div className="rounded-2xl bg-white/7 px-4 py-3 text-sm">
                Vote
              </div>
              <div className="h-px flex-1 bg-white/10" />
              <div className="rounded-2xl bg-white/7 px-4 py-3 text-sm">
                Execute
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0d1326]/85 p-5">
            <p className="text-sm text-white/55">Frontend goal</p>
            <p className="mt-3 text-xl font-semibold">
              Smooth, responsive, and easy to demo in your portfolio.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
