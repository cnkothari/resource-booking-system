interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => (
  <div className="flex flex-col items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
    <span>{message}</span>
    {onRetry && (
      <button type="button" onClick={onRetry} className="btn-secondary">
        Try again
      </button>
    )}
  </div>
);

export default ErrorMessage;
