import jwtDecode from "jwt-decode";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { axiosInstance, renderUrl } from "../../config";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import moment from "moment";
import Swal from "sweetalert2";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import PermissionHandler from "../../components/PermissionHandler";

const FigSingle = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  //   console.log(decoded);
  const { fgid } = useParams("");
  const [figs, setfigs] = useState({});
  // /admin-fig/:id

  const fetchFIGs = async () => {
    try {
      let url = `admin-auth/admin-fig/${fgid}`;

      //   if (decoded.role === "fpoadmin") {
      //     url = `survey/fposurvey/${id}`;
      //   }

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setfigs(response.data);
      console.log();
      // setallvalues();
    } catch (err) {
      console.log(err);
      // setError("Error while fetching admin list");
    }
  };

  useEffect(() => {
    fetchFIGs();
  }, [fgid]);

  const [error, setError] = useState(null);

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
              {/* {figs && ( */}
              <div className="container-xxl flex-grow-1 container-p-y">
                <h4 className="py-3 mb-4">
                  <Link to="/allfpo" className="text-muted fw-light">
                    {" "}
                    <i className="fa-solid fa-angle-left"></i>&nbsp;All FIG's /
                  </Link>{" "}
                  {figs.name}
                </h4>
                <div className="fig-details">
                  <div className="card">
                    <div className="row m-0 ">
                      <div className="col-md-4 p-3">
                        <b>FIG Name</b>
                      </div>
                      <div className="col-md-8 p-3">
                        : &nbsp;&nbsp; {figs?.name}
                      </div>
                      <div className="col-md-4 p-3">
                        <b>Location</b>
                      </div>
                      <div className="col-md-8 p-3">
                        : &nbsp;&nbsp; {figs?.location}
                      </div>
                      <div className="col-md-4 p-3">
                        <b>Leader</b>
                      </div>
                      <div className="col-md-8 p-3">
                        : &nbsp;&nbsp; {figs?.leaderId?.firstname}
                      </div>
                      <div className="col-md-4 p-3">
                        <b>Members</b>
                      </div>
                      <div className="col-md-8 p-3">
                        : &nbsp;&nbsp; {figs?.Joinedmembers?.length}
                      </div>
                    </div>
                  </div>
                </div>
                {/* leaders */}
                {/* <div className="accordion mt-3" id="accordionExample">
                  <div className="card accordion-item active">
                    <h2 className="accordion-header" id="headingOne">
                      <button
                        type="button"
                        className="accordion-button"
                        data-bs-toggle="collapse"
                        data-bs-target="#accordionOne"
                        aria-expanded="true"
                        aria-controls="accordionOne"
                      >
                        FIG leaders
                      </button>
                    </h2>

                    <div
                      id="accordionOne"
                      className="accordion-collapse collapse show"
                      data-bs-parent="#accordionExample"
                    >
                      <div className="accordion-body">
                        <div className="fpo_data_details_main">
                          <div className="fpo_data_inner">
                         
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card accordion-item">
                    <h2 className="accordion-header" id="headingTwo">
                      <button
                        type="button"
                        className="accordion-button collapsed"
                        data-bs-toggle="collapse"
                        data-bs-target="#accordionTwo"
                        aria-expanded="false"
                        aria-controls="accordionTwo"
                      >
                        Content creators
                      </button>
                    </h2>
                    <div
                      id="accordionTwo"
                      className="accordion-collapse collapse"
                      aria-labelledby="headingTwo"
                      data-bs-parent="#accordionExample"
                    >
                      <div className="accordion-body">
                        <div className="fpo_data_details_main">
                          <div className="fpo_data_inner"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card accordion-item">
                    <h2 className="accordion-header" id="headingThree">
                      <button
                        type="button"
                        className="accordion-button collapsed"
                        data-bs-toggle="collapse"
                        data-bs-target="#accordionThree"
                        aria-expanded="false"
                        aria-controls="accordionThree"
                      >
                        Surveys
                      </button>
                    </h2>
                    <div
                      id="accordionThree"
                      className="accordion-collapse collapse"
                      aria-labelledby="headingThree"
                      data-bs-parent="#accordionExample"
                    >
                      <div className="accordion-body">
                        <div className="fpo_data_details_main">
                          <div className="fpo_data_inner"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div> */}
                {/* <div className="card">
                  <h5 className="card-header">FIG leaders</h5>
                </div> */}
                {/* content creators */}
                {/*  */}
              </div>
              {/* )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FigSingle;
