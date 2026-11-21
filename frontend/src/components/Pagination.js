export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const nums = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) nums.push(i);

  const btn = 'min-w-[2.25rem] rounded-md border px-3 py-1.5 text-sm transition';
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
      <button className={`${btn} border-gray-300 hover:border-ink disabled:opacity-40`} disabled={page === 1} onClick={() => onChange(page - 1)}>
        Prev
      </button>
      {nums[0] > 1 && <span className="px-1 text-gray-400">...</span>}
      {nums.map((n) => (
        <button key={n} onClick={() => onChange(n)} className={`${btn} ${n === page ? 'border-ink bg-ink text-white' : 'border-gray-300 hover:border-ink'}`}>
          {n}
        </button>
      ))}
      {nums[nums.length - 1] < pages && <span className="px-1 text-gray-400">...</span>}
      <button className={`${btn} border-gray-300 hover:border-ink disabled:opacity-40`} disabled={page === pages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  );
}
