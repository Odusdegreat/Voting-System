export default function LoadingState() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-72 animate-pulse rounded-[2rem] border border-white/10 bg-white/6"
        />
      ))}
    </div>
  );
}
