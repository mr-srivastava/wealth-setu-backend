export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary" />
        <span className="text-lg font-medium text-muted-foreground">Loading...</span>
      </div>
    </div>
  );
} 