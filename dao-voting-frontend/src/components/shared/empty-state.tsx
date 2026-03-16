export default function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-white/12 bg-white/5 p-10 text-center">
      <h3 className="text-lg font-semibold">No proposals yet</h3>
      <p className="mt-2 text-sm text-white/60">
        Connect your wallet and create the first DAO proposal.
      </p>
    </div>
  );
}
