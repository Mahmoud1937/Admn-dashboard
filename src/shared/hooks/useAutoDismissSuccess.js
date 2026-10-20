import { useEffect } from "react";

export default function useAutoDismissSuccess({ isSuccess, reset }) {
  useEffect(() => {
    if (!isSuccess) return;
    const timeout = setTimeout(reset, 4000);
    return () => clearTimeout(timeout);
  }, [isSuccess, reset]);
}
