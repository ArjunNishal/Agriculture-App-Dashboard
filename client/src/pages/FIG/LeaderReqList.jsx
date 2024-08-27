import React, { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { axiosInstance } from "../../config";
import jwtDecode from "jwt-decode";
import moment from "moment";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import PermissionHandler from "../../components/PermissionHandler";

const LeaderReqList = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  console.log(decoded);

  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const fpo = searchParams.get("fpo");

  const [figs, setfigs] = useState([]);
  const [error, setError] = useState(null);
  //   setshowfigdetails
  const [showfigdetails, setshowfigdetails] = useState(null);
  const fetchFIGs = async () => {
    try {
      let url = "admin-auth/get-Unverified-FIGLeader";

      if (decoded.role === "fpoadmin") {
        url = `admin-auth/get-Unverified-FIGLeader/${decoded.fpo}`;
      }

      if (decoded.role === "superadmin" && fpo !== null) {
        console.log("running", fpo);
        url = `admin-auth/get-Unverified-FIGLeader/${fpo}`;
      }

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      setfigs(response.data);
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
        `admin-auth/update-FIGLeader/${id}/${activate}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedSurvey = response.data;

      //   const index = figs.findIndex((fig) => fig._id === id);
      //   if (index !== -1) {
      // figs[index] = updatedSurvey;
      fetchFIGs();
      //   }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const navigate = useNavigate("");
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
              {" "}
              {decoded.role === "superadmin" ||
              decoded.permissions?.includes("figleaderreqs") ? (
                <div className="container-xxl flex-grow-1 container-p-y">
                  <h4 className="py-3 mb-4">
                    <Link
                      to={``}
                      className="text-muted all_fpo_backbtn fw-light"
                      onClick={() => navigate(-1)}
                    >
                      <i className="fa-solid  fa-angle-left"></i>
                      &nbsp;FPO /
                    </Link>{" "}
                    FPO Leaders list
                  </h4>
                  {/* Basic Bootstrap Table */}
                  <div className="card">
                    <h5 className="card-header">FPO leaders Requests</h5>
                    <div className="table-responsive text-nowrap">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>
                              <b>Name</b>
                            </th>
                            <th>
                              <b>Phone</b>
                            </th>
                            <th>
                              <b>Location</b>
                            </th>
                            <th>
                              <b>Owned FIG's</b>
                            </th>
                            <th>
                              <b>STATUS</b>
                            </th>
                            <th>
                              <b>ACTION</b>
                            </th>
                            {/* <th>
                                <b>Date</b>
                              </th>
                              {decoded.role === "fpoadmin" && (
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
                                  to={`/member/${el?.memberId?._id}`}
                                  // onClick={() => setshowfigdetails(el)}
                                >
                                  {/* <span className="fw-medium">
                                    {el?.memberId?.firstname || "N/A"}
                                  </span> */}
                                  <span className="fw-medium">
                                    {el?.memberId?.firstname
                                      ? `${el?.memberId?.firstname} ${el?.memberId?.lastname}`
                                      : `N/A`}
                                  </span>
                                </Link>
                              </td>
                              <td>{el?.memberId?.phone || "N/A"}</td>
                              <td>{el?.memberId?.location || "N/A"}</td>
                              <td>
                                {/* <span className="badge bg-label-primary me-1">
                                    Active
                                  </span> */}

                                {/* {el.Joinedmembers.length} */}
                                {el?.memberId?.FIGOwned?.length || "N/A"}
                              </td>

                              {/* <td>{el.status}</td> */}
                              <td>
                                <div className="d-flex align-items-center">
                                  {" "}
                                  <span
                                    className={`badge  me-1 ${
                                      el.approved === 1
                                        ? "bg-label-primary"
                                        : el.approved === 2
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
                                    {el.approved === 1
                                      ? "approved"
                                      : el.approved === 2
                                      ? "blocked"
                                      : "unapproved"}
                                  </span>
                                </div>
                              </td>
                              <td>
                                {" "}
                                {/* {moment(el.createdAt).format(" Do MMMM YYYY ")} */}
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
                                            toggleSurveyStatus(
                                              el?.memberId?._id,
                                              0
                                            )
                                          }
                                        >
                                          <i className="fa-solid fa-circle text-warning"></i>{" "}
                                          Deactivate
                                        </a>
                                        <a
                                          className="dropdown-item"
                                          href="javascript:void(0);"
                                          onClick={() =>
                                            toggleSurveyStatus(
                                              el?.memberId?._id,
                                              2
                                            )
                                          }
                                        >
                                          <i className="fa-solid fa-circle text-danger"></i>{" "}
                                          Block
                                        </a>
                                      </>
                                    ) : el.status === 2 ? (
                                      <>
                                        <a
                                          className="dropdown-item"
                                          href="javascript:void(0);"
                                          onClick={() =>
                                            toggleSurveyStatus(
                                              el?.memberId?._id,
                                              0
                                            )
                                          }
                                        >
                                          <i className="fa-solid fa-circle text-danger"></i>{" "}
                                          Unblock
                                        </a>
                                      </>
                                    ) : (
                                      <>
                                        <a
                                          className="dropdown-item"
                                          href="javascript:void(0);"
                                          onClick={() =>
                                            toggleSurveyStatus(
                                              el?.memberId?._id,
                                              1
                                            )
                                          }
                                        >
                                          <i className="fa-solid fa-circle text-success"></i>{" "}
                                          Activate
                                        </a>
                                        <a
                                          className="dropdown-item"
                                          href="javascript:void(0);"
                                          onClick={() =>
                                            toggleSurveyStatus(
                                              el?.memberId?._id,
                                              2
                                            )
                                          }
                                        >
                                          <i className="fa-solid fa-circle text-danger"></i>{" "}
                                          Block
                                        </a>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </td>
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
                          <p className="text-center my-3">
                            No FPO leaders Requests found
                          </p>
                        </div>
                      )}
                    </div>
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

export default LeaderReqList;
