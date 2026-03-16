import Button from "@/components/shared/button";

type ErrorStateProps = {
  message: string;
  on_retry: () => void;
};

export default function ErrorState({ message, on_retry }: ErrorStateProps) {
  return (
    <div className="rounded-3xl border border-rose-400/20 bg-rose-500/10 p-5">
      <h3 className="text-lg font-semibold text-rose-300">
        Something went wrong
      </h3>
      <p className="mt-2 text-sm text-rose-200/80">{message}</p>

      <Button variant="danger" className="mt-4" onClick={on_retry}>
        Try again
      </Button>
    </div>
  );
}
