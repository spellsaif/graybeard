export function formatTimestamp(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toISOString().split('T')[0];
}
