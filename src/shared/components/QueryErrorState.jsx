export default function QueryErrorState({
  title = "Unable to load data",
  error,
  onRetry,
}) {
  return (
    <div className="flex min-h-[300px] items-center justify-center bg-white">
      <div className="flex max-w-md flex-col items-center px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <span className="text-2xl">!</span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          {error?.response
            ? "We couldn't load the data. Please try again."
            : "We couldn't connect to the server. Please check your internet connection and try again."}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}