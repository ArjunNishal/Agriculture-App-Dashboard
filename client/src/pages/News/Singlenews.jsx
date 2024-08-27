import jwtDecode from "jwt-decode";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { axiosInstance, renderUrl, renderUrl2 } from "../../config";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import moment from "moment";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import PermissionHandler from "../../components/PermissionHandler";
import ReactPlayer from "react-player";

import video from "./file_example_AVI_480_750kB.avi";

const Singlenews = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  //   console.log(decoded);
  const { nid } = useParams("");
  const [figs, setfigs] = useState(null);
  const [error, setError] = useState(null);
  //   setshowfigdetails
  const [showfigdetails, setshowfigdetails] = useState(null);
  const fetchFIGs = async () => {
    try {
      let url = `news/get-news/${nid}`;

      //   if (decoded.role === "fpoadmin") {
      //     url = `survey/fposurvey/${id}`;
      //   }

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data, "data ===========");
      setfigs(response.data.data);
    } catch (err) {
      console.log(err);
      setError("Error while fetching admin list");
    }
  };

  useEffect(() => {
    fetchFIGs();
  }, [nid]);

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
              decoded.permissions?.includes("newsp") ? (
                <>
                  {" "}
                  {figs && (
                    <div className="container-xxl flex-grow-1 container-p-y">
                      <h4 className="py-3 mb-4">
                        <span className="text-muted fw-light">All News/</span>{" "}
                        News
                      </h4>
                      <div className="fig-details">
                        <div className="card">
                          <div className="row">
                            <div className="col-md-6 col-12">
                              <div>
                                <h5 className="text-center my-2">
                                  Images and videos
                                </h5>

                                {figs?.images ? (
                                  <div className="row px-2 col-12 align-items-center">
                                    {figs?.images.map((el, index) => (
                                      <div key={index} className="col-md-6">
                                        <div className="news-imgs p-3">
                                          {el.mediaType === "image" ||
                                          el.mediaType === "thumbnail" ? (
                                            <>
                                              <img
                                                src={`${renderUrl2}${el.media}`}
                                                alt="image"
                                              />
                                            </>
                                          ) : el.mediaType === "video" ? (
                                            <>
                                              <ReactPlayer
                                                url={`${renderUrl2}${el.media}`}
                                                controls={true}
                                                width="100%"
                                                height="100%"
                                              />
                                            </>
                                          ) : (
                                            <></>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6 col-12">
                              <div className="row m-0 pt-3">
                                <div className="col-md-4 p-3">
                                  <b>Title</b>
                                </div>
                                <div className="col-md-8 p-3">
                                  : &nbsp;&nbsp; {figs?.title}
                                </div>
                                {/* <div className="col-md-4 p-3">
                                  <b>News Type</b>
                                </div>
                                <div className="col-md-8 p-3">
                                  : &nbsp;&nbsp; {figs?.news_type}
                                </div> */}
                                <div className="col-md-4 p-3">
                                  <b>Posted By</b>
                                </div>
                                <div className="col-md-8 p-3">
                                  : &nbsp;&nbsp;{" "}
                                  {/* <Link to={`/member/${figs.postedUserId}`}> */}
                                  {figs?.postedBy}
                                  {/* </Link> */}
                                </div>
                                <div className="col-md-4 p-3">
                                  <b>Date</b>
                                </div>
                                <div className="col-md-8 p-3">
                                  : &nbsp;&nbsp;{" "}
                                  {moment(figs?.createdAt).format(
                                    "Do MMMM YYYY , hh:mm a"
                                  )}
                                </div>
                                <div className="col-md-4 p-3">
                                  <b>Seen By</b>
                                </div>
                                <div className="col-md-8 p-3">
                                  : &nbsp;&nbsp;{figs.seenBy.length}
                                </div>
                                <div className="col-md-4 p-3">
                                  <b>Status</b>
                                </div>
                                <div className="col-md-8 p-3">
                                  <div className="d-flex align-items-center">
                                    : &nbsp;&nbsp;{" "}
                                    <span
                                      className={`badge  me-3 ${
                                        figs.status === 1
                                          ? "bg-label-success"
                                          : figs.status === 2
                                          ? "bg-label-danger"
                                          : "bg-label-warning"
                                      }`}
                                    >
                                      <i className="fa-solid fa-circle fa-beat-fade"></i>
                                      &nbsp;
                                      {figs.status === 1
                                        ? "active"
                                        : figs.status === 2
                                        ? "blocked"
                                        : "inactive"}
                                    </span>
                                    {(decoded.permissions?.includes(
                                      "editnewsstatus"
                                    ) ||
                                      decoded.role === "superadmin") && (
                                      <div className="dropdown d-flex">
                                        <button
                                          type="button"
                                          className="btn btn-primary btn-sm dropdown-toggle hide-arrow"
                                          data-bs-toggle="dropdown"
                                        >
                                          <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <div className="dropdown-menu">
                                          {figs.status === 1 ? (
                                            <>
                                              <a
                                                className="dropdown-item"
                                                href="javascript:void(0);"
                                                onClick={() =>
                                                  toggleSurveyStatus(
                                                    figs._id,
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
                                                    figs._id,
                                                    2
                                                  )
                                                }
                                              >
                                                <i className="fa-solid fa-circle text-danger"></i>{" "}
                                                Block
                                              </a>
                                            </>
                                          ) : figs.status === 0 ? (
                                            <>
                                              <a
                                                className="dropdown-item"
                                                href="javascript:void(0);"
                                                onClick={() =>
                                                  toggleSurveyStatus(
                                                    figs._id,
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
                                                    figs._id,
                                                    2
                                                  )
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
                                                toggleSurveyStatus(figs._id, 0)
                                              }
                                            >
                                              <i className="fa-solid fa-circle text-success"></i>{" "}
                                              Unblock
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
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
                              Seen by
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
                                      {/* <th>
                                        <b>LOCATION</b>
                                      </th> */}
                                      <th>
                                        <b>PHONE</b>
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
                                    {figs.seenBy.map((el, index) => (
                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>
                                          {el?.firstname} {el?.lastname}
                                        </td>
                                        {/* <td>{el?.location}</td> */}
                                        <td>{el?.phone}</td>
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
                                {figs.seenBy.length === 0 && (
                                  <div>
                                    <p className="text-center my-3">
                                      No one saw this news.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="accordion-item my-3 rounded shadow">
                          <h2 className="accordion-header">
                            <button
                              className="accordion-button collapsed"
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target="#collapseTwo"
                              aria-expanded="false"
                              aria-controls="collapseTwo"
                            >
                              Reported by
                            </button>
                          </h2>
                          <div
                            id="collapseTwo"
                            className="accordion-collapse collapse"
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
                                        <b>Reporter</b>
                                      </th>
                                      <th>
                                        <b>Reason</b>
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
                                    {figs.reportedBy.map((el, index) => (
                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>
                                          {el?._id?.firstname}{" "}
                                          {el?._id?.lastname}
                                        </td>
                                        <td>{el.reason}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {figs.reportedBy.length === 0 && (
                                  <div>
                                    <p className="text-center my-3">
                                      {" "}
                                      No one reported this news.
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

export default Singlenews;
