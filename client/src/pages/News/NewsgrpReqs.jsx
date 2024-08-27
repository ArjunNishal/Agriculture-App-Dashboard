import React, { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { axiosInstance } from "../../config";
import jwtDecode from "jwt-decode";
import moment from "moment";
import { Link } from "react-router-dom";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import PermissionHandler from "../../components/PermissionHandler";
const NewsgrpReqs = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  console.log(decoded);

  const [figs, setfigs] = useState([]);
  const [error, setError] = useState(null);
  //   setshowfigdetails
  const [showfigdetails, setshowfigdetails] = useState(null);
  const fetchFIGs = async () => {
    try {
      let url = "news/get-unverifiedNG";

      if (decoded.role === "fpoadmin") {
        url = `news/get-unverifiedNG/${decoded.fpo}`;
      }

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      setfigs(response.data.data);
    } catch (err) {
      console.log(err);
      setError("Error while fetching admin list");
    }
  };

  useEffect(() => {
    fetchFIGs();
  }, []);

  const toggleSurveyStatus = async (id, activate) => {
    try {
      const response = await axiosInstance.patch(
        `admin-auth/update-newsGroup-status/${id}/${activate}`,
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
              decoded.permissions?.includes("editnewsgrpreqs") ? (
                <>
                  {!showfigdetails && (
                    <div className="container-xxl flex-grow-1 container-p-y">
                      <h4 className="py-3 mb-4">
                        <span className="text-muted fw-light">News /</span> News
                        Group Requests
                      </h4>
                      {/* Basic Bootstrap Table */}
                      <div className="card">
                        <h5 className="card-header">News Group Requests</h5>
                        <div className="table-responsive text-nowrap">
                          <table className="table">
                            <thead>
                              <tr>
                                <th>
                                  <b>Group Name</b>
                                </th>
                                <th>
                                  <b>Phone</b>
                                </th>
                                <th>
                                  <b>Location</b>
                                </th>
                                <th>
                                  <b>Owner</b>
                                </th>
                                <th>
                                  <b>Status</b>
                                </th>
                                {/* <th>
                              <b>Status</b>
                            </th> */}
                                {(decoded.permissions?.includes(
                                  "editnewsgrpreqs"
                                ) ||
                                  decoded.role === "superadmin") && (
                                  <th>
                                    <b>Action</b>
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
                                    {/* <i className="fab fa-angular fa-lg text-danger me-3" /> */}
                                    <Link
                                      to={`/newsgrp/${el._id}`}
                                      //   onClick={() => setshowfigdetails(el)}
                                    >
                                      <span className="fw-medium">
                                        {el.name}
                                      </span>
                                    </Link>
                                  </td>
                                  <td>{el.phone}</td>
                                  <td>{el.location}</td>
                                  <td>
                                    {/* <span className="badge bg-label-primary me-1">
                                Active
                              </span> */}

                                    {el?.memberId?.name}
                                  </td>

                                  {/* <td>{el.meetings.length}</td> */}
                                  <td>
                                    <div className="d-flex align-items-center">
                                      {" "}
                                      <span
                                        className={`badge  me-1 ${
                                          el.status === 1
                                            ? "bg-label-primary"
                                            : el.status === 2
                                            ? "bg-label-danger"
                                            : "bg-label-warning"
                                        }`}
                                      >
                                        <i
                                          className={`fa-solid  fa-circle fa-beat-fade ${
                                            el.status === 1
                                              ? "text-success"
                                              : el.status === 2
                                              ? "text-danger"
                                              : "text-warning"
                                          }`}
                                        ></i>
                                        &nbsp;
                                        {el.status === 1
                                          ? "active"
                                          : el.status === 2
                                          ? "blocked"
                                          : "inactive"}
                                      </span>
                                    </div>
                                  </td>
                                  {(decoded.permissions?.includes(
                                    "editnewsgrpreqs"
                                  ) ||
                                    decoded.role === "superadmin") && (
                                    <td>
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
                              <p className="text-center my-3">No News Requests found</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {showfigdetails && (
                    <div className="container-xxl flex-grow-1 container-p-y">
                      <h4 className="py-3 mb-4">
                        <button
                          className="btn btn-primary me-2"
                          onClick={() => {
                            setshowfigdetails(null);
                          }}
                        >
                          {" "}
                          <i className="fa-solid fa-angle-left"></i> &nbsp; FIG
                          list
                        </button>
                        <span className="text-muted fw-light">All FIG's /</span>{" "}
                        selected fig
                      </h4>
                      <div className="fig-details">
                        <div className="card">
                          <div className="row m-0 ">
                            <div className="col-md-4 p-3">
                              <b>FIG Name</b>
                            </div>
                            <div className="col-md-8 p-3">
                              : &nbsp;&nbsp; {showfigdetails.name}
                            </div>
                            <div className="col-md-4 p-3">
                              <b>Location</b>
                            </div>
                            <div className="col-md-8 p-3">
                              : &nbsp;&nbsp; {showfigdetails.location}
                            </div>
                            <div className="col-md-4 p-3">
                              <b>Leader</b>
                            </div>
                            <div className="col-md-8 p-3">
                              {/* : &nbsp;&nbsp; {showfigdetails?.leaderId?.name} */}
                            </div>
                            <div className="col-md-4 p-3">
                              <b>Members</b>
                            </div>
                            <div className="col-md-8 p-3">
                              {/* : &nbsp;&nbsp; {showfigdetails.Joinedmembers.length} */}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* <div className="fig-details">
                    <table className="table fig-details-table">
                      <tbody>
                        <tr>
                          <th colSpan={1}>Name</th>
                          <td>{showfigdetails.name}</td>
                        </tr>
                        <tr>
                          <th colSpan={1}>Location</th>
                          <td>{showfigdetails.location}</td>
                        </tr>
                        <tr>
                          <th colSpan={1}>Leader</th>
                          <td>{showfigdetails?.leaderId?.name}</td>
                        </tr>
                        <tr>
                          <th colSpan={1}>Members</th>
                          <td>{showfigdetails.Joinedmembers.length}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div> */}
                      {/* <div className="fig-details">
                    <table className="table fig-details-table">
                      <tbody>
                        <tr>
                          <th colSpan={1}>Name</th>
                          <td>{showfigdetails.name}</td>
                        </tr>
                        <tr>
                          <th colSpan={1}>Location</th>
                          <td>{showfigdetails.location}</td>
                        </tr>
                        <tr>
                          <th colSpan={1}>Leader</th>
                          <td>{showfigdetails?.leaderId?.name}</td>
                        </tr>
                        <tr>
                          <th colSpan={1}>Members</th>
                          <td>{showfigdetails.Joinedmembers.length}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="fig-details">
                    <table className="table fig-details-table">
                      <tbody>
                        <tr>
                          <th colSpan={1}>Name</th>
                          <td>{showfigdetails.name}</td>
                        </tr>
                        <tr>
                          <th colSpan={1}>Location</th>
                          <td>{showfigdetails.location}</td>
                        </tr>
                        <tr>
                          <th colSpan={1}>Leader</th>
                          <td>{showfigdetails?.leaderId?.name}</td>
                        </tr>
                        <tr>
                          <th colSpan={1}>Members</th>
                          <td>{showfigdetails.Joinedmembers.length}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div> */}
                    </div>
                  )}
                </>
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
export default NewsgrpReqs;
