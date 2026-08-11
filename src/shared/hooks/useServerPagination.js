import { useState, useEffect } from "react";

function getPageNumbers(currentPage, totalPages, windowSize = 2) {
  const pages = [];
  const start = Math.max(1, currentPage - windowSize);
  const end = Math.min(totalPages, currentPage + windowSize);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
}
export function useServerPagination({ resetKey } = {}) {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(undefined);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPageNumber(1);

  }, [resetKey]);


  const lockPageSize = (backendPageSize) => {
    if (pageSize === undefined && backendPageSize) {
      setPageSize(backendPageSize);
    }
  };

  const goToPage = (page, totalPages) => {
    if (page < 1 || page > totalPages || page === pageNumber) return;
    setPageNumber(page);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageNumber(1);
  };

  return {
    pageNumber,
    pageSize,
    setPageNumber,
    goToPage,
    handlePageSizeChange,
    lockPageSize,
    getPageNumbers,
  };
}