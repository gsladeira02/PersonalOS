export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="logo" aria-label="PersonalOS">
      <div className="logo-mark">PO</div>
      {!compact && <span>PersonalOS</span>}
    </div>
  );
}
