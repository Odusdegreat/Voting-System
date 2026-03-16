import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Button from "@/components/shared/button";

type CreateProposalModalProps = {
  is_open: boolean;
  is_submitting: boolean;
  on_close: () => void;
  on_submit: (payload: {
    title: string;
    description: string;
    duration_in_seconds: number;
  }) => Promise<void>;
};

export default function CreateProposalModal({
  is_open,
  is_submitting,
  on_close,
  on_submit,
}: CreateProposalModalProps) {
  const [title, set_title] = useState("");
  const [description, set_description] = useState("");
  const [duration_in_hours, set_duration_in_hours] = useState("1");

  async function handle_submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const duration = Number(duration_in_hours);

    if (!title.trim() || !description.trim() || duration <= 0) return;

    await on_submit({
      title: title.trim(),
      description: description.trim(),
      duration_in_seconds: duration * 3600,
    });

    set_title("");
    set_description("");
    set_duration_in_hours("1");
    on_close();
  }

  return (
    <AnimatePresence>
      {is_open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#0a1020] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold">Create Proposal</h3>
                <p className="mt-2 text-sm text-white/60">
                  Fill in the proposal details and set a voting duration.
                </p>
              </div>

              <button
                onClick={on_close}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <form className="space-y-4" onSubmit={handle_submit}>
              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Title
                </label>
                <input
                  value={title}
                  onChange={(event) => set_title(event.target.value)}
                  placeholder="Build DAO frontend"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-white/25"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(event) => set_description(event.target.value)}
                  placeholder="Should the DAO prioritize the frontend dashboard this sprint?"
                  rows={5}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-white/25"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Duration in hours
                </label>
                <input
                  value={duration_in_hours}
                  onChange={(event) =>
                    set_duration_in_hours(event.target.value)
                  }
                  type="number"
                  min="1"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-white/25"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={on_close}>
                  Cancel
                </Button>

                <Button type="submit" is_loading={is_submitting}>
                  Submit Proposal
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
