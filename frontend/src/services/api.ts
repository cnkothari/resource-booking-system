import axios, { AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

interface ApiErrorBody {
  message?: string;
  details?: { field: string; message: string }[];
}

/**
 * Normalise any axios/server error into a single human-readable message that
 * thunks can store and components can render.
 */
export const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorBody>;
    const body = axiosError.response?.data;
    if (body?.details && body.details.length > 0) {
      return body.details.map((d) => d.message).join(', ');
    }
    if (body?.message) return body.message;
    if (axiosError.code === 'ERR_NETWORK') {
      return 'Cannot reach the server. Is the API running?';
    }
    return axiosError.message;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
};
