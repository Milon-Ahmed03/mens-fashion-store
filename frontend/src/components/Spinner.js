export default function Spinner({ className = 'py-20' }) {
  return (
    <div className={`flex justify-center ${className}`}>
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-ink" />
    </div>
  );
}
