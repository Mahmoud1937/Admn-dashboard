import { Link } from "react-router-dom";
import { MapPinned } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[300px] items-center justify-center bg-white">
      <div className="flex max-w-md flex-col items-center px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700">
          <MapPinned size={26} aria-hidden="true" />
        </div>

        <p className="text-sm font-semibold text-blue-700">404</p>
        <h1 className="mt-1 text-lg font-semibold text-gray-900">
          Page not found
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          The page you are looking for does not exist or may have been moved.
        </p>

        <Link
          to="/"
          className="mt-5 cursor-pointer rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
