import jwtDecode from "jwt-decode";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { axiosInstance } from "../../config";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import Swal from "sweetalert2";
import Pagination from "../../components/Pagination";
import PermissionHandler from "../../components/PermissionHandler";

const SingleNG = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  //   console.log(decoded);
  const { gid } = useParams("");
  const [figs, setfigs] = useState([]);
  const [error, setError] = useState(null);
  //   setshowfigdetails
  const [showfigdetails, setshowfigdetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setitemsPerPage] = useState(10);
  const [totalpages, settotalpages] = useState(0);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const fetchFIGs = async () => {
    try {
      let url = `news/admin/get-all-news/${gid}?page=${currentPage}&limit=${itemsPerPage}`;

      //   if (decoded.role === "fpoadmin") {
      //     url = `survey/fposurvey/${id}`;
      //   }

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      settotalpages(response.data.data.AllNews.totalRecord);
      setfigs(response.data.data.AllNews.results);
    } catch (err) {
      console.log(err);
      setError("Error while fetching admin list");
    }
  };

  useEffect(() => {
    fetchFIGs();
  }, [gid, currentPage]);

  const toggleSurveyStatus = async (id, activate) => {
    try {
      const response = await axiosInstance.patch(
        `news/admin/update-news-status/${id}/${activate}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedSurvey = response.data;

      const index = figs.findIndex((fig) => fig._id === id);
      if (index !== -1) {
        figs[index] = updatedSurvey;
        fetchFIGs();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // delete news
  const handleDelete = async (newsId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this news entry!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        console.log(token);
        const response = await axiosInstance.post(
          `news/admin/delete-news`,
          { newsid: newsId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          Swal.fire("Deleted!", "News entry deleted successfully.", "success");
          fetchFIGs();
        }
      } else {
        Swal.fire("Cancelled", "Your news entry is safe :)", "info");
      }
    } catch (error) {
      console.error("Error:", error.message);
      Swal.fire("Error", "Failed to delete news entry", "error");
    }
  };
  return (
    <div>
      {/* <!-- Layout wrapper --> */}
      <div className="layout-wrapper layout-content-navbar">
        <div className="layout-container">
          {/* <!-- Menu --> */}

          <Navigation />
          {/* <!-- / Menu --> */}

          {/* <!-- Layout container --> */}
          <div className="layout-page">
            <Topbar />
            {/* <!-- / Layout page --> */}
            <div className="content-wrapper">
              {decoded.role === "superadmin" ||
              decoded.permissions?.includes("newsp") ? (
                <div className="container-xxl flex-grow-1 container-p-y">
                  <h4 className="py-3 mb-4">
                    <span className="text-muted fw-light">
                      News Categories /
                    </span>
                    All news
                  </h4>
                  {/* Basic Bootstrap Table */}
                  <div className="card">
                    <h5 className="card-header">All news</h5>
                    <div className="table-responsive text-nowrap">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>
                              <b>S.No.</b>
                            </th>
                            <th>
                              <b>TITLE</b>
                            </th>
                            <th>
                              <b>DESCRIPTION</b>
                            </th>
                            <th>
                              <b>POSTED BY</b>
                            </th>
                            <th>
                              <b>IMAGES</b>
                            </th>
                            <th>
                              <b>STATUS</b>
                            </th>
                            <th>
                              <b>Reports</b>
                            </th>
                            {(decoded.permissions?.includes("editnewsstatus") ||
                              decoded.role === "superadmin") && (
                              <th>
                                <b>ACTION</b>
                              </th>
                            )}
                            {/* {decoded.role === "fpoadmin" && (
                            <th>
                              <b>Actions</b>
                            </th>
                          )} */}
                          </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                          {figs.map((el, index) => (
                            <tr key={index}>
                              <td>
                                {currentPage === 1 ? (
                                  <>{index + 1}</>
                                ) : (
                                  <>{index + 1 + (currentPage - 1) * 10}</>
                                )}
                              </td>
                              <td>
                                {/* <i className="fab fa-angular fa-lg text-danger me-3" /> */}
                                {/* {el?.newsGroup?.status === 1 ? ( */}
                                <Link
                                  to={`/singlenews/${el._id}`}
                                  //   onClick={() => setshowfigdetails(el)}
                                >
                                  <span className="fw-medium">{el.title}</span>
                                </Link>
                                {/* ) : ( */}
                                {/* <span className="fw-medium">{el.title}</span> */}
                                {/* )} */}
                              </td>
                              <td>{el.description}</td>
                              <td>{el.postedBy}</td>
                              <td>
                                {/* <span className="badge bg-label-primary me-1">
                                Active
                              </span> */}

                                {el?.images?.length}
                              </td>

                              {/* <td>{el.meetings.length}</td> */}
                              <td>
                                <div className="d-flex align-items-center">
                                  {" "}
                                  <span
                                    className={`badge  me-1 ${
                                      el.status === 1
                                        ? "bg-label-success"
                                        : el.status === 2
                                        ? "bg-label-danger"
                                        : "bg-label-warning"
                                    }`}
                                  >
                                    <i className="fa-solid fa-circle fa-beat-fade"></i>
                                    &nbsp;
                                    {el.status === 1
                                      ? "active"
                                      : el.status === 2
                                      ? "blocked"
                                      : "inactive"}
                                  </span>
                                </div>
                              </td>
                              <td>{el.reportCount}</td>
                              {(decoded.permissions?.includes(
                                "editnewsstatus"
                              ) ||
                                decoded.role === "superadmin") && (
                                <td>
                                  <div className="d-flex gap-2">
                                    <div className="dropdown">
                                      <button
                                        type="button"
                                        className="btn btn-primary  dropdown-toggle hide-arrow"
                                        data-bs-toggle="dropdown"
                                      >
                                        <i className="fa-solid fa-pen-to-square"></i>
                                      </button>
                                      <div className="dropdown-menu">
                                        {el.status === 1 ? (
                                          <>
                                            <a
                                              className="dropdown-item"
                                              href="javascript:void(0);"
                                              onClick={() =>
                                                toggleSurveyStatus(el._id, 0)
                                              }
                                            >
                                              <i className="fa-solid fa-circle text-warning"></i>{" "}
                                              Deactivate
                                            </a>
                                            <a
                                              className="dropdown-item"
                                              href="javascript:void(0);"
                                              onClick={() =>
                                                toggleSurveyStatus(el._id, 2)
                                              }
                                            >
                                              <i className="fa-solid fa-circle text-danger"></i>{" "}
                                              Block
                                            </a>
                                          </>
                                        ) : el.status === 0 ? (
                                          <>
                                            <a
                                              className="dropdown-item"
                                              href="javascript:void(0);"
                                              onClick={() =>
                                                toggleSurveyStatus(el._id, 1)
                                              }
                                            >
                                              <i className="fa-solid fa-circle text-success"></i>{" "}
                                              Activate
                                            </a>
                                            <a
                                              className="dropdown-item"
                                              href="javascript:void(0);"
                                              onClick={() =>
                                                toggleSurveyStatus(el._id, 2)
                                              }
                                            >
                                              <i className="fa-solid fa-circle text-danger"></i>{" "}
                                              Block
                                            </a>
                                          </>
                                        ) : (
                                          <a
                                            className="dropdown-item"
                                            href="javascript:void(0);"
                                            onClick={() =>
                                              toggleSurveyStatus(el._id, 0)
                                            }
                                          >
                                            <i className="fa-solid fa-circle text-success"></i>{" "}
                                            Unblock
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      className="btn btn-outline-danger"
                                      onClick={() => handleDelete(el._id)}
                                    >
                                      <i className="fa-solid fa-trash"></i>
                                    </button>
                                  </div>
                                </td>
                              )}
                              {/* <td>
                              {" "}
                              {moment(el.createdAt).format(" Do MMMM YYYY ")}
                            </td> */}
                              {/* {decoded.role === "fpoadmin" && (
                              <td>
                                <div>
                                  <Link
                                    className="btn btn-sm btn-outline-primary"
                                    to={`/editsurvey/${el._id}`}
                                  >
                                    <i className="bx bx-edit-alt me-1" /> Edit
                                  </Link>
                                </div>
                              </td>
                            )} */}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {figs.length === 0 && (
                        <div>
                          <p className="text-center my-3">No News found</p>
                        </div>
                      )}
                    </div>
                    {/* {!searchvalue && ( */}
                    <div className="py-2 px-3">
                      <Pagination
                        totalItems={totalpages}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                      />
                    </div>
                    {/* )} */}
                  </div>
                </div>
              ) : (
                <Unauthorisedpage />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleNG;
