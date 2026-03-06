interface ErrorMessageProps {
  message?: string
  onRetry?: () => void
}

export const ErrorMessage = ({ 
  message = 'An error occurred. Please try again.', 
  onRetry 
}: ErrorMessageProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 rounded-full bg-danger-100 p-3">
        <svg
          className="h-6 w-6 text-danger-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">Error</h3>
      <p className="mb-4 text-gray-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
