export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-400/30 bg-red-50 p-4 text-sm text-red-700">
      {message}
    </div>
  );
}
