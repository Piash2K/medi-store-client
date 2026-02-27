export default function LoginLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-8">
      <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">Loading login...</span>
      </div>
    </div>
  );
}
