import React, { useState, useEffect } from "react";

const Pagination = ({ totalItems, itemsPerPage, onPageChange }) => {
  // const [currentPage, setCurrentPage] = useState(1);
  // const [itemsPerPage, setitemsPerPage] = useState(10);
  // const [totalpages, settotalpages] = useState(0);

  // const handlePageChange = (page) => {
  //   setCurrentPage(page);
  // };

  // <Pagination
  //             totalItems={totalpages}
  //             itemsPerPage={itemsPerPage}
  //             onPageChange={handlePageChange}
  //           />

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, settotalPages] = useState(1);

  // console.log(totalItems,"totalitems")

  useEffect(() => {
    onPageChange(currentPage);
  }, [currentPage, onPageChange]);

  useEffect(() => {
    console.log(totalItems, "totalItems");
    settotalPages(Math.ceil(totalItems / itemsPerPage));
  }, [totalItems, itemsPerPage]);

  //   const totalPages =

  const renderPageNumbers = () => {
    const pages = [];

    // When on the first 3 pages or the last 2 pages
    if (currentPage <= 3 || currentPage > totalPages - 2) {
      for (let i = 1; i <= Math.min(5, totalPages); i++) {
        pages.push(
          <li
            key={i}
            className={`page-item int-pg-item ${
              currentPage === i ? "active" : ""
            }`}
          >
            <button className="page-link" onClick={() => handlePageClick(i)}>
              {i}
            </button>
          </li>
        );
      }

      if (totalPages > 5) {
        pages.push(
          <li key="ellipsis1" className="page-item int-pg-item disabled">
            <span className="page-link">...</span>
          </li>
        );
        pages.push(
          <li
            key={totalPages - 1}
            className={`page-item int-pg-item ${
              currentPage === totalPages - 1 ? "active" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => handlePageClick(totalPages - 1)}
            >
              {totalPages - 1}
            </button>
          </li>
        );

        pages.push(
          <li
            key={totalPages}
            className={`page-item int-pg-item ${
              currentPage === totalPages ? "active" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => handlePageClick(totalPages)}
            >
              {totalPages}
            </button>
          </li>
        );
      }
    } else {
      // When not on the first 3 pages or the last 2 pages
      pages.push(
        <li
          key={1}
          className={`page-item int-pg-item ${
            currentPage === 1 ? "active" : ""
          }`}
        >
          <button className="page-link" onClick={() => handlePageClick(1)}>
            1
          </button>
        </li>
      );

      pages.push(
        <li key="ellipsis2" className="page-item int-pg-item disabled">
          <span className="page-link">...</span>
        </li>
      );

      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(
          <li
            key={i}
            className={`page-item int-pg-item ${
              currentPage === i ? "active" : ""
            }`}
          >
            <button className="page-link" onClick={() => handlePageClick(i)}>
              {i}
            </button>
          </li>
        );
      }

      pages.push(
        <li key="ellipsis3" className="page-item int-pg-item disabled">
          <span className="page-link">...</span>
        </li>
      );

      pages.push(
        <li
          key={totalPages}
          className={`page-item int-pg-item ${
            currentPage === totalPages ? "active" : ""
          }`}
        >
          <button
            className="page-link"
            onClick={() => handlePageClick(totalPages)}
          >
            {totalPages}
          </button>
        </li>
      );
    }

    return pages;
  };

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <nav aria-label="Page int-pagination-main navigation ">
      <ul className="pagination  align-items-center justify-content-end">
        <li className="page-item">
          <p className="my-0 mx-3">
            Showing {itemsPerPage > totalItems ? totalItems : itemsPerPage} of{" "}
            {totalItems} entries
          </p>
        </li>
        <li
          className={`page-item int-pg-item ${
            currentPage === 1 ? "disabled" : ""
          }`}
        >
          <button
            className="page-link"
            onClick={() => handlePageClick(currentPage - 1)}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
        </li>
        {renderPageNumbers()}
        <li
          className={`page-item int-pg-item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <button
            className="page-link"
            onClick={() => handlePageClick(currentPage + 1)}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
