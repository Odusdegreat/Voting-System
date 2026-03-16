type WalletChipProps = {
  address: string;
};

export default function WalletChip({ address }: WalletChipProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
      {address}
    </div>
  );
}
