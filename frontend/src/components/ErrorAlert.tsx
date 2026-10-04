/**
 * Error alert component for displaying error messages.
 * Reusable across all pages and components.
 */

interface ErrorAlertProps {
  message: string | null;
  className?: string;
}

export function ErrorAlert({ message, className = '' }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div className={`rounded-lg border border-red-200 bg-red-50 p-3 ${className}`}>
      <p className="text-sm text-red-800">{message}</p>
    </div>
  );
}
