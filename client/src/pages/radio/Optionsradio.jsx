import jwtDecode from "jwt-decode";
import React, { useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { axiosInstance } from "../../config";
import Lottie from "lottie-react";
import Swal from "sweetalert2";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import episodeani from "./episodeani.json";
import seasonani from "./seasonani.json";
import radioani from "./radioani.json";
import categoriesani from "./categoriesani.json";
import { Link } from "react-router-dom";
import PermissionHandler from "../../components/PermissionHandler";

const Optionsradio = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;

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
              {/* {figs && ( */}
              {decoded.role === "fpoadmin" ? (
                <div className="container-xxl flex-grow-1 container-p-y">
                  <h4 className="py-3 mb-4">
                    <span className="text-muted fw-light">Training/</span> Add New
                  </h4>
                  <div className="radio_options_int_main">
                    <div className="radio_options_inner">
                      <div className="row mx-0">
                        <div className="col-md-3 col-12 mb-2">
                          <div className="card radio_options_card">
                            <div className="card-body">
                              <div className="row mx-0">
                                <div className="col-12">
                                  <div className="option_img d-flex justify-content-center align-items-center">
                                    <Lottie
                                      className="lottie_ani"
                                      animationData={categoriesani}
                                      loop={true}
                                      autoplay={true}
                                    />
                                  </div>
                                </div>
                                <div className="col-12">
                                  <div className="options_link text-center">
                                    <Link
                                      to="/addradiocat"
                                      className="btn px-1 py-2 btn-lg btn-primary btn-block"
                                    >
                                      <b>Category</b>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                              {/* addradiocat
addradio
addseason
addepisode */}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3 col-12 mb-2">
                          <div className="card radio_options_card">
                            <div className="card-body">
                              <div className="row mx-0">
                                <div className="col-12">
                                  <div className="option_img d-flex justify-content-center align-items-center">
                                    <Lottie
                                      className="lottie_ani"
                                      animationData={radioani}
                                      loop={true}
                                      autoplay={true}
                                    />
                                  </div>
                                </div>
                                <div className="col-12">
                                  <div className="options_link text-center">
                                    <Link
                                      to="/addradio"
                                      className="btn px-1 py-2 btn-lg btn-primary btn-block"
                                    >
                                      <b>Training</b>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                              {/* addradiocat
addradio
addseason
addepisode */}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3 col-12 mb-2">
                          <div className="card radio_options_card">
                            <div className="card-body">
                              <div className="row mx-0">
                                <div className="col-12">
                                  <div className="option_img d-flex justify-content-center align-items-center">
                                    <Lottie
                                      className="lottie_ani"
                                      animationData={seasonani}
                                      loop={true}
                                      autoplay={true}
                                    />
                                  </div>
                                </div>
                                <div className="col-12">
                                  <div className="options_link text-center">
                                    <Link
                                      to="/addseason"
                                      className="btn px-1 py-2 btn-lg btn-primary btn-block"
                                    >
                                      <b>Season</b>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                              {/* addradiocat
addradio
addseason
addepisode */}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3 col-12 mb-2">
                          <div className="card radio_options_card">
                            <div className="card-body">
                              <div className="row mx-0">
                                <div className="col-12">
                                  <div className="option_img d-flex justify-content-center align-items-center">
                                    <Lottie
                                      className="lottie_ani"
                                      animationData={episodeani}
                                      loop={true}
                                      autoplay={true}
                                    />
                                  </div>
                                </div>
                                <div className="col-12">
                                  <div className="options_link text-center">
                                    <Link
                                      to="/addepisode"
                                      className="btn px-1 py-2 btn-lg btn-primary btn-block"
                                    >
                                      <b>Episode</b>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                              {/* addradiocat
addradio
addseason
addepisode */}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Unauthorisedpage />
              )}
              {/* )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Optionsradio;
