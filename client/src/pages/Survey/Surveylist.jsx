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

const Surveylist = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  console.log(decoded);
  const [surveys, setsurveys] = useState([]);
  const [error, setError] = useState(null);
  const [searchvalue, setsearchvalue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setitemsPerPage] = useState(10);
  const [totalpages, settotalpages] = useState(0);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const fetchsurveyList = async () => {
    try {
      let url = `survey/surveylist?page=${currentPage}&limit=${itemsPerPage}`;

      if (decoded.role === "fpoadmin") {
        url = `survey/fposurvey/${id}?page=${currentPage}&limit=${itemsPerPage}`;
      }

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      setsurveys(response.data.Surveys.results);
      settotalpages(response.data.Surveys.totalRecord);
    } catch (err) {
      console.log(err);
      setError("Error while fetching admin list");
    }
  };

  useEffect(() => {
    fetchsurveyList();
  }, []);
  useEffect(() => {
    fetchsurveyList();
  }, [currentPage]);

  const toggleSurveyStatus = async (id, activate) => {
    try {
      const response = await axiosInstance.post(
        `survey/activate/${id}`,
        {
          activate,
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
        fetchsurveyList();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSearch = async (val) => {
    try {
      const apiUrl = "admin-auth/search";
      const modelName = "Survey";

      let mongodbQuery;

      let title;

      if (decoded.role === "superadmin") {
        mongodbQuery = {
          $or: [
            { title: { $regex: val, $options: "i" } },
            // { "fpo.name": { $regex: val, $options: "i" } },
            // { email: { $regex: val, $options: "i" } },
            // { mobileno: { $regex: val, $options: "i" } },
          ],
        };
      } else if (decoded.role === "fpoadmin") {
        mongodbQuery = {
          $and: [
            {
              $or: [
                { title: { $regex: val, $options: "i" } },
                // { "fpo.name": { $regex: val, $options: "i" } },
                // { email: { $regex: val, $options: "i" } },
                // { mobileno: { $regex: val, $options: "i" } },
              ],
            },
            { createdBy: id },
          ],
        };
      }

      const response = await axiosInstance.post(
        apiUrl,
        {
          query: mongodbQuery,
          model: modelName,
          title: val,
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
      fetchsurveyList();
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
                    <span className="text-muted fw-light">Survey /</span> Survey
                    list
                  </h4>
                  {/* Basic Bootstrap Table */}
                  <div className="card">
                    <div className="d-flex justify-content-between align-items-center">
                      {" "}
                      <h5 className="card-header">Surveys</h5>{" "}
                      <div className="nav-item d-flex align-items-center me-2 border px-2 rounded">
                        <i className="bx bx-search fs-4 lh-0"></i>
                        <input
                          type="text"
                          className="form-control border-0  shadow-none ps-1 ps-sm-2"
                          placeholder="Search..."
                          aria-label="Search..."
                          onChange={(e) => handlesearchevent(e)}
                        />
                      </div>
                    </div>
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
                              <b>Title</b>
                            </th>
                            <th>
                              <b>No. of questions</b>
                            </th>
                            <th>
                              <b>Responses</b>
                            </th>
                            {decoded.role === "superadmin" && (
                              <th>
                                <b>FPO</b>
                              </th>
                            )}
                            {decoded.role === "superadmin" && (
                              <th>
                                <b>FPO responses</b>
                              </th>
                            )}
                            <th>
                              <b>Status</b>
                            </th>
                            <th>
                              <b>Created By</b>
                            </th>
                            <th>
                              <b>Date</b>
                            </th>
                            {(decoded.role === "superadmin" ||
                              (decoded.role === "fpoadmin" &&
                                decoded.permissions?.includes(
                                  "editsurvey"
                                ))) && (
                              <th>
                                <b>Actions</b>
                              </th>
                            )}
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
                                <Link to={`/singlesurvey/${el._id}`}>
                                  <span className="fw-medium">{el.title}</span>
                                </Link>
                              </td>
                              <td>{el.questions?.length}</td>
                              <td>{el.responses}</td>
                              {decoded.role === "superadmin" && (
                                <td>
                                  {el?.globalsurvey &&
                                  el?.globalsurvey === true ? (
                                    "Global survey"
                                  ) : decoded.role === "superadmin" ? (
                                    <Link
                                      to={`/singlefpo/${el?.fpo?._id}`}
                                      //   onClick={() => setshowfigdetails(el)}
                                    >
                                      <span className="fw-medium">
                                        {el?.fpo?.name}
                                      </span>
                                    </Link>
                                  ) : (
                                    el?.fpo?.name || "N/A"
                                  )}
                                </td>
                              )}
                              {decoded.role === "superadmin" && (
                                <td>
                                  {/* <span className="badge bg-label-primary me-1">
                                Active
                              </span> */}

                                  {el.figRes?.length}
                                </td>
                              )}
                              <td>
                                <div className="d-flex align-items-center justify-content-between">
                                  {" "}
                                  <span
                                    className={`badge  me-1 ${
                                      el.status
                                        ? "bg-label-primary"
                                        : "bg-label-danger"
                                    }`}
                                  >
                                    <i className="fa-solid fa-circle fa-beat-fade"></i>
                                    &nbsp;{el.status ? "active" : "inactive"}
                                  </span>
                                  {(decoded.role === "superadmin" ||
                                    decoded.permissions?.includes(
                                      "deactivatesurvey"
                                    )) && (
                                    <div className="dropdown">
                                      <button
                                        type="button"
                                        className="btn  dropdown-toggle hide-arrow"
                                        data-bs-toggle="dropdown"
                                      >
                                        <i className="fa-solid fa-pen-to-square"></i>
                                      </button>
                                      <div className="dropdown-menu">
                                        {el.status ? (
                                          <a
                                            className="dropdown-item"
                                            href="javascript:void(0);"
                                            onClick={() =>
                                              toggleSurveyStatus(el._id, false)
                                            }
                                          >
                                            <i className="fa-solid fa-circle text-danger"></i>{" "}
                                            Deactivate
                                          </a>
                                        ) : (
                                          <a
                                            className="dropdown-item"
                                            href="javascript:void(0);"
                                            onClick={() =>
                                              toggleSurveyStatus(el._id, true)
                                            }
                                          >
                                            <i className="fa-solid fa-circle text-success"></i>{" "}
                                            Activate
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>{el.createdBy?.username}</td>
                              <td>
                                {" "}
                                {moment(el.createdAt).format(" Do MMMM YYYY ")}
                              </td>
                              {decoded.role === "superadmin" ? (
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
                              ) : decoded.role === "fpoadmin" &&
                                decoded.permissions?.includes("editsurvey") ? (
                                <>
                                  {" "}
                                  <td>
                                    <div>
                                      {el.globalsurvey ? (
                                        ""
                                      ) : (
                                        <Link
                                          className="btn btn-sm btn-outline-primary"
                                          to={`/editsurvey/${el._id}`}
                                        >
                                          <i className="bx bx-edit-alt me-1" />{" "}
                                          Edit
                                        </Link>
                                      )}
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <td></td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {surveys.length === 0 && (
                        <div>
                          <p className="text-center my-3">No Surveys found</p>
                        </div>
                      )}
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

export default Surveylist;
