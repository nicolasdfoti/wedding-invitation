export default function Progress({ reserved, total }) {
  if (!total) return null;
  const percent = Math.round((reserved / total) * 100);
  return (
    <div className="max-w-sm mx-auto text-center">
      <p className="text-sm text-gray-600" id="progress-label">
        <span className="font-semibold text-gray-800 tabular-nums">{reserved}</span> de{' '}
        <span className="tabular-nums">{total}</span> regalos ya tienen dueño 💛
      </p>
      <div
        className="mt-3 h-[3px] rounded-full bg-peach/40 overflow-hidden"
        role="progressbar"
        aria-labelledby="progress-label"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={reserved}
      >
        <div className="h-full rounded-full bg-accent transition-[width] duration-700" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
