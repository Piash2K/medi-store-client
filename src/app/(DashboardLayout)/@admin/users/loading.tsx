export default function AdminUsersLoading() {
  return (
    <section className="w-full p-1">
      <div className="flex min-h-[45vh] items-center justify-center rounded-xl border bg-card">
        <div className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Loading users...</span>
        </div>
      </div>
    </section>
  );
}
