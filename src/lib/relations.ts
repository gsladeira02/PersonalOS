export function studentName(record: { students?: { full_name?: string | null } | { full_name?: string | null }[] | null } | null | undefined) {
  const related = record?.students;
  if (Array.isArray(related)) return related[0]?.full_name || '—';
  return related?.full_name || '—';
}
