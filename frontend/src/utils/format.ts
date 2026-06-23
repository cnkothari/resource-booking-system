import { BookingTag } from '../types';

export const formatDateTime = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { dateStyle: 'medium' });
};

/**
 * Convert an ISO timestamp to the `YYYY-MM-DDTHH:mm` shape a
 * <input type="datetime-local"> expects (in the user's local timezone).
 */
export const toInputDateTime = (iso: string | null | undefined): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

/** Convert a datetime-local input value to a full ISO string for the API. */
export const inputDateTimeToIso = (value: string): string => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

interface TagStyle {
  label: string;
  className: string;
}

export const bookingTagStyles: Record<BookingTag, TagStyle> = {
  upcoming: { label: 'Upcoming / Active', className: 'bg-emerald-100 text-emerald-700' },
  past: { label: 'Past', className: 'bg-slate-200 text-slate-600' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
};
