import React, { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { axiosInstance } from "../../config";
import jwtDecode from "jwt-decode";
import moment from "moment";
import { Link } from "react-router-dom";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import Pagination from "../../components/Pagination";
import PermissionHandler from "../../components/PermissionHandler";

const QueryList = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  console.log(decoded);
  const [surveys, setsurveys] = useState([]);
  const [error, setError] = useState(null);
  const [selectedquery, setselectedquery] = useState("");
  const [searchvalue, setsearchvalue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setitemsPerPage] = useState(10);
  const [totalpages, settotalpages] = useState(0);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const fetchQueryList = async () => {
    try {
      let url = `query/allquery?page=${currentPage}&limit=${itemsPerPage}`;

      if (decoded.role === "fpoadmin") {
        url = `query/queries/fpo/${decoded.fpo}?page=${currentPage}&limit=${itemsPerPage}`;
      }

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      settotalpages(response.data.data.totalRecord);
      setsurveys(response.data.data.results);
    } catch (err) {
      console.log(err);
      setError("Error while fetching admin list");
    }
  };

  useEffect(() => {
    fetchQueryList();
  }, []);
  useEffect(() => {
    fetchQueryList();
  }, [currentPage]);

  const toggleSurveyStatus = async (id, activate) => {
    try {
      console.log(id);
      const response = await axiosInstance.post(
        `query/status/query/${id}`,
        {
          status: activate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedSurvey = response.data;

      const index = surveys.findIndex((survey) => survey._id === id);
      if (index !== -1) {
        surveys[index] = updatedSurvey;
        fetchQueryList();
      }
    } catch (error) {
      console.log(error);
      console.error("Error:", error);
    }
  };
  const handleSearch = async (val) => {
    try {
      const apiUrl = "admin-auth/search";
      const modelName = "Query";

      // const mongodbQuery = {
      //   $or: [
      //     { name: { $regex: val, $options: "i" } },
      //     { phone: { $regex: val, $options: "i" } },
      //     // { radio: rid },
      //   ],
      // };
      let mongodbQuery;

      if (decoded.role === "superadmin") {
        mongodbQuery = {
          $or: [
            { name: { $regex: val, $options: "i" } },
            { phone: { $regex: val, $options: "i" } },
            // { radio: rid },
          ],
        };
      } else if (decoded.role === "fpoadmin") {
        mongodbQuery = {
          $and: [
            {
              $or: [
                { name: { $regex: val, $options: "i" } },
                { phone: { $regex: val, $options: "i" } },
              ],
            },
            { fpo: decoded.fpo },
          ],
        };
      }

      const response = await axiosInstance.post(
        apiUrl,
        {
          query: mongodbQuery,
          model: modelName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setsurveys(response.data.data);
        // setSearchResults(response.data.data);
      } else {
        console.error("Error:", response.data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handlesearchevent = (e) => {
    const value = e.target.value;
    if (value === "") {
      fetchQueryList();
    } else if (value !== "" && value) {
      handleSearch(value);
    }
    setsearchvalue(value);
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
              {/* Content */}
              {decoded.role === "superadmin" ||
              decoded.permissions?.includes("surveyp") ? (
                <div className="container-xxl flex-grow-1 container-p-y">
                  <h4 className="py-3 mb-4">
                    <span className="text-muted fw-light">Query /</span> Queries
                    list
                  </h4>

                  {/* Basic Bootstrap Table */}
                  <div className="card">
                    <div className="d-flex justify-content-between align-items-center">
                      {" "}
                      <h5 className="card-header">Queries list</h5>{" "}
                      <div className="d-flex align-items-center gap-3">
                        <div className="nav-item d-flex align-items-center  me-2 border px-2 rounded">
                          <i className="bx bx-search fs-4 lh-0"></i>
                          <input
                            type="text"
                            className="form-control border-0 shadow-none ps-1 ps-sm-2"
                            placeholder="Search..."
                            aria-label="Search..."
                            onChange={(e) => handlesearchevent(e)}
                          />
                        </div>
                      </div>
                    </div>{" "}
                    {searchvalue && (
                      <div className="px-3">
                        <p className="text-center">
                          <b>Showing results for : </b>
                          {searchvalue}
                        </p>
                      </div>
                    )}
                    <div className="table-responsive text-nowrap">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>
                              <b>S.NO.</b>
                            </th>
                            <th>
                              <b>Name</b>
                            </th>
                            <th>
                              <b>Mobile</b>
                            </th>
                            <th>
                              <b>Message</b>
                            </th>
                            {decoded.role === "superadmin" && (
                              <th>
                                <b>FPO</b>
                              </th>
                            )}
                            <th>
                              <b>Date</b>
                            </th>
                            {/* {(decoded.role === "superadmin" ||
                              (decoded.role === "fpoadmin" &&
                                decoded.permissions?.includes(
                                  "editsurvey"
                                ))) && ( */}
                            <th>
                              <b>Actions</b>
                            </th>
                            {/* )} */}
                          </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                          {surveys?.map((el, index) => (
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
                                {/* <Link to={`/singlesurvey/${el._id}`}> */}
                                <span className="fw-medium">{el.name}</span>
                                {/* </Link> */}
                              </td>
                              <td>{el.phone}</td>
                              <td>
                                <div className="d-flex justify-content-between">
                                  <div
                                    className="message_div_query"
                                    style={{
                                      maxWidth: "200px",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {el.message}
                                  </div>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#basicModal"
                                    onClick={() => setselectedquery(el)}
                                  >
                                    <i className="fa-solid fa-eye"></i>
                                  </button>
                                </div>
                              </td>
                              {decoded.role === "superadmin" && (
                                <td>
                                  {decoded.role === "superadmin" ? (
                                    <Link
                                      to={`/singlefpo/${el.fpo?._id}`}
                                      // onClick={() => {
                                      //   setshowfpodetails(true);
                                      //   setselectedfpo(el);
                                      //   fetchData(el._id);
                                      //   fetchQueryList(el._id);
                                      //   getPrivacyPolicy(el._id);
                                      //   getaboutus(el._id);
                                      // }}
                                    >
                                      <span className="fw-medium">
                                        {el.fpo?.name}
                                      </span>
                                    </Link>
                                  ) : (
                                    <>{el.fpo?.name}</>
                                  )}
                                </td>
                              )}
                              <td>
                                {" "}
                                {moment(el.createdAt).format(" Do MMMM YYYY ")}
                              </td>
                              <td>
                                <div className="d-flex align-items-center justify-content-start">
                                  {" "}
                                  <span
                                    className={`badge  me-1 ${
                                      el.status === 1
                                        ? "bg-label-warning"
                                        : el.status === 0
                                        ? "bg-label-success"
                                        : "bg-label-danger"
                                    }`}
                                  >
                                    <i
                                      className={`fa-solid  fa-circle fa-beat-fade ${
                                        el.status === 1
                                          ? "text-warning"
                                          : el.status === 0
                                          ? "text-success"
                                          : "text-danger"
                                      }`}
                                    ></i>
                                    &nbsp;
                                    {el.status === 1
                                      ? "Pending"
                                      : el.status === 0
                                      ? "Resolved"
                                      : "Declined"}
                                  </span>
                                  {/* {(decoded.role === "superadmin" ||
                                    decoded.permissions?.includes(
                                      "deactivatesurvey"
                                    )) && ( */}
                                  <div className="dropdown">
                                    <button
                                      type="button"
                                      className="btn   dropdown-toggle hide-arrow"
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
                                            <i className="fa-solid fa-circle text-success"></i>{" "}
                                            Resolved
                                          </a>
                                          <a
                                            className="dropdown-item"
                                            href="javascript:void(0);"
                                            onClick={() =>
                                              toggleSurveyStatus(el._id, 2)
                                            }
                                          >
                                            <i className="fa-solid fa-circle text-danger"></i>{" "}
                                            Decline
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
                                            <i className="fa-solid fa-circle text-warning"></i>{" "}
                                            Pending
                                          </a>
                                          <a
                                            className="dropdown-item"
                                            href="javascript:void(0);"
                                            onClick={() =>
                                              toggleSurveyStatus(el._id, 2)
                                            }
                                          >
                                            <i className="fa-solid fa-circle text-danger"></i>{" "}
                                            Decline
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
                                          Resolved
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                  {/* )} */}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {surveys?.length === 0 && (
                        <div>
                          <p className="text-center my-3">No Queries found</p>
                        </div>
                      )}
                      <div
                        className="modal fade"
                        id="basicModal"
                        tabIndex={-1}
                        aria-hidden="true"
                      >
                        <div className="modal-dialog" role="document">
                          <div className="modal-content">
                            <div className="modal-header">
                              <h5
                                className="modal-title"
                                id="exampleModalLabel1"
                              >
                                Message Details
                              </h5>
                              <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                              />
                            </div>
                            <div className="modal-body">
                              <div className="message_main">
                                <p>
                                  <b>Name : </b>
                                  {selectedquery?.name}
                                </p>
                                <p>
                                  <b>Mobile : </b>
                                  {selectedquery?.phone}
                                </p>
                                <p>
                                  <b>Date : </b>
                                  {moment(selectedquery?.createdAt).format(
                                    " Do MMMM YYYY "
                                  )}
                                </p>
                                <hr />
                                <p>
                                  <b>Message</b>
                                </p>
                                <p className="message_div">
                                  {selectedquery?.message}
                                </p>
                              </div>
                            </div>
                            <div className="modal-footer">
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                data-bs-dismiss="modal"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>{" "}
                    {!searchvalue && (
                      <div className="py-2 px-3">
                        <Pagination
                          totalItems={totalpages}
                          itemsPerPage={itemsPerPage}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    )}
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

export default QueryList;
