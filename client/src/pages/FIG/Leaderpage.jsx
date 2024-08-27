import jwtDecode from "jwt-decode";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { axiosInstance } from "../../config";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import moment from "moment";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import PermissionHandler from "../../components/PermissionHandler";

const Leaderpage = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  //   console.log(decoded);
  const { uid } = useParams("");
  const [figs, setfigs] = useState(null);
  const [error, setError] = useState(null);
  //   setshowfigdetails
  const [showfigdetails, setshowfigdetails] = useState(null);
  const fetchFIGs = async () => {
    try {
      let url = `admin-auth/get-FIGLeader/${uid}`;

      //   if (decoded.role === "fpoadmin") {
      //     url = `survey/fposurvey/${id}`;
      //   }

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      setfigs(response.data);
    } catch (err) {
      console.log(err);
      setError("Error while fetching admin list");
    }
  };

  useEffect(() => {
    fetchFIGs();
  }, [uid]);

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

      //   const index = figs.findIndex((fig) => fig._id === id);
      //   if (index !== -1) {
      // figs[index] = updatedSurvey;
      fetchFIGs();
      //   }
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
              decoded.permissions?.includes("figp") ? (
                <>
                  {figs && (
                    <div className="container-xxl flex-grow-1 container-p-y">
                      <h4 className="py-3 mb-4">
                        <span className="text-muted fw-light">Member/</span>{" "}
                        {figs?.role?.role}
                      </h4>
                      <div className="fig-details">
                        <div className="card">
                          <div className="row m-0 ">
                            <div className="col-md-4 p-3">
                              <b>Name</b>
                            </div>
                            <div className="col-md-8 p-3">
                              : &nbsp;&nbsp; {figs?.firstname || "N/A"}&nbsp;
                              {figs?.lastname}
                            </div>
                            <div className="col-md-4 p-3">
                              <b>Location</b>
                            </div>
                            <div className="col-md-8 p-3">
                              : &nbsp;&nbsp; {figs?.location || "N/A"}
                            </div>
                            <div className="col-md-4 p-3">
                              <b>Phone </b>
                            </div>
                            <div className="col-md-8 p-3">
                              : &nbsp;&nbsp; {figs?.phone || "N/A"}
                            </div>
                            <div className="col-md-4 p-3">
                              <b>Role</b>
                            </div>
                            <div className="col-md-8 p-3">
                              : &nbsp;&nbsp; {figs?.role?.role || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="accordion mt-5" id="accordionExample">
                        <div className="accordion-item my-3 rounded shadow">
                          <h2 className="accordion-header">
                            <button
                              className="accordion-button"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#collapseOne"
                              aria-expanded="true"
                              aria-controls="collapseOne"
                            >
                              Owned FIG's
                            </button>
                          </h2>
                          <div
                            id="collapseOne"
                            className="accordion-collapse collapse show"
                            data-bs-parent="#accordionExample"
                          >
                            <div className="accordion-body">
                              <div className="table-responsive text-nowrap">
                                <table className="table">
                                  <thead>
                                    <tr>
                                      <th>
                                        <b>S.No.</b>
                                      </th>
                                      <th>
                                        <b>NAME</b>
                                      </th>
                                      <th>
                                        <b>LOCATION</b>
                                      </th>
                                      <th>
                                        <b>Members</b>
                                      </th>
                                      <th>
                                        <b>STATUS</b>
                                      </th>
                                      {/* <th>
                              <b>STATUS</b>
                            </th>
                            <th>
                              <b>Reports</b>
                            </th>
                            <th>
                              <b>ACTION</b>
                            </th> */}
                                      {/* {decoded.role === "fpoadmin" && (
                            <th>
                              <b>Actions</b>
                            </th>
                          )} */}
                                    </tr>
                                  </thead>
                                  <tbody className="table-border-bottom-0">
                                    {figs.FIGOwned.map((el, index) => (
                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{el?.name}</td>
                                        <td>{el?.location}</td>
                                        <td>{el?.Joinedmembers.length}</td>
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
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {figs.FIGOwned.length === 0 && (
                                  <div>
                                    <p className="text-center my-3">
                                      No FIG owned.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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

export default Leaderpage;
