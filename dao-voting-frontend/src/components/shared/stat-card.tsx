import { motion } from "framer-motion";

type StatCardProps = {
  label: string;
  value: number | string;
  icon: string;
};

export default function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-white/60">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-tight">{value}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-xl">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
