import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { removeHtmlClass, toggleHtmlClass } from "../../js/intjava";
import { axiosInstance, renderUrl, renderUrl2 } from "../../config";
import FPOForm from "../../components/FPOForm";
import jwtDecode from "jwt-decode";
import moment from "moment";
import PermissionHandler from "../../components/PermissionHandler";

const Myfpo = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;

  const [fpo, setFPO] = useState(null);
  const [error, seterror] = useState("");
  const [totalleaders, settotalleaders] = useState(0);
  const [showeditfpo, setshoweditfpo] = useState(false);
  const [firstfpo, setfirstfpo] = useState(false);
  const [isEdit, setisEdit] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);

  const fetchFPO = async () => {
    try {
      setImageUploaded(false);
      const response = await axiosInstance.get(`fpo/getmyfpo/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setImageUploaded(true);
        console.log(response.data);
        if (!response.data.fpo) {
          seterror("FPO not created");
          setshoweditfpo(true);
          setfirstfpo(true);
        }
        setFPO(response.data.fpo);
        settotalleaders(response.data.fpoleaders);
      }
      console.log(response);
    } catch (error) {
      setImageUploaded(false);
      console.log(error.response.data.error);
      console.error("Failed to fetch FPO details:", error);
    }
  };

  console.log(fpo);
  useEffect(() => {
    fetchFPO();
  }, []);

  const onsave = (image) => {
    setshoweditfpo(false);
    setfirstfpo(false);
    fetchFPO();
  };

  const oncancel = () => {
    setshoweditfpo(!showeditfpo);
    setisEdit(false);
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
            {/* <!-- Navbar --> */}
            <Topbar imageUploaded={imageUploaded} />
            {/* <!-- / Navbar --> */}

            {/* <!-- Content wrapper --> */}
            <div className="content-wrapper">
              {/* <!-- Content --> */}

              <div className="container-xxl flex-grow-1 container-p-y">
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="py-3 mb-4">My FPO</h4>
                  {!firstfpo && (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setshoweditfpo(!showeditfpo);
                        setisEdit(true);
                      }}
                    >
                      {!showeditfpo ? (
                        <>
                          <i className="fa-solid fa-pen"></i>&nbsp;Edit FPO
                        </>
                      ) : (
                        <>My FPO </>
                      )}
                    </button>
                  )}
                </div>
                {fpo &&
                  !fpo.promoter &&
                  // !fpo.registeredOn &&
                  !fpo.sharePerMember &&
                  !fpo.numberOfDirectors && (
                    <div className="alert alert-primary" role="alert">
                      Please Complete your FPO profile first
                    </div>
                  )}

                {!showeditfpo && (
                  <div className="my-fpo-main">
                    <div className="my-fpodetails row">
                      <div className="fpo-img col-md-4">
                        <div className="p-3 card d-flex fpo-pic-main justify-content-center align-items-center flex-column">
                          <img
                            src={
                              fpo?.fpopic
                                ? `${renderUrl2}${fpo?.fpopic}`
                                : "/assets/img/avatars/1.png"
                            }
                            alt="fpo"
                            className="fpopic shadow"
                          />
                          <h4 className="py-3 text-capitalize fpo-name-heading">
                            {fpo?.name}
                          </h4>
                        </div>
                      </div>
                      <div className="col-md-8 d-md-block d-flex justify-content-center mt-md-0 mt-3">
                        {" "}
                        <div className="row w-100 justify-content-center px-3">
                          <div className="col-md-6 ">
                            <div className="row w-100  rounded shadow bg-white p-3 mx-0 mb-2">
                              <div className="col-2 fpo-icons">
                                <i className="fa-solid fa-user"></i>
                              </div>{" "}
                              <div className="col-10  fpo-icons d-flex justify-content-between  align-items-center ">
                                <span>FPO Owner</span>
                                <i
                                  style={{ cursor: "pointer" }}
                                  class="fa-solid fa-circle-info"
                                  data-bs-toggle="collapse"
                                  data-bs-target="#collapseExample"
                                  aria-expanded="false"
                                  aria-controls="collapseExample"
                                  title="You can edit Fpo owner in Profile"
                                ></i>
                              </div>
                              <div className="col-12">
                                <div class="collapse" id="collapseExample">
                                  <p className="text-center my-1 text-danger">
                                    You can edit Fpo owner in Profile
                                  </p>
                                </div>
                              </div>
                              <div className="col-12 fpo-info text-center">
                                {fpo?.admin.username}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 ">
                            <div className="row w-100  rounded shadow bg-white p-3 mx-0 mb-2">
                              <div className="col-2 fpo-icons1">
                                <i className="fa-solid fa-users"></i>
                              </div>{" "}
                              <div className="col-10  fpo-icons">Members</div>
                              <div className="col-12 fpo-info text-center">
                                {fpo?.members}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 ">
                            <div className="row w-100  rounded shadow bg-white p-3 mx-0 mb-2">
                              <div className="col-2 fpo-icons2 ">
                                <i className="fa-regular fa-calendar-days"></i>
                              </div>{" "}
                              <div className="col-10  fpo-icons">
                                Registered On
                              </div>
                              <div className="col-12 fpo-info text-center">
                                {fpo?.createdAt && (
                                  <>
                                    {" "}
                                    {moment(fpo?.createdAt).format(
                                      "Do MMMM YYYY"
                                    )}{" "}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 ">
                            <div className="row w-100  rounded shadow bg-white p-3 mx-0 mb-2">
                              <div className="col-2 fpo-icons ">
                                <i className="fa-solid fa-arrow-up-right-dots"></i>
                              </div>{" "}
                              <div className="col-10  fpo-icons">Promoter</div>
                              <div className="col-12 fpo-info text-center">
                                {fpo?.promoter || "N/A"}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 ">
                            <div className="row w-100  rounded shadow bg-white p-3 mx-0 mb-2">
                              <div className="col-2 fpo-icons1 ">
                                <i className="fa-solid fa-layer-group"></i>
                              </div>{" "}
                              <div className="col-10  fpo-icons">
                                Share per member
                              </div>
                              <div className="col-12 fpo-info text-center">
                                {fpo?.sharePerMember || "N/A"}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 ">
                            <div className="row w-100  rounded shadow bg-white p-3 mx-0 mb-2">
                              <div className="col-2 fpo-icons2 ">
                                <i className="fa-solid fa-user-tie"></i>
                              </div>{" "}
                              <div className="col-10  fpo-icons ">
                                No. of Directors
                              </div>
                              <div className="col-12 fpo-info text-center">
                                {fpo?.numberOfDirectors || "N/A"}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 ">
                            <div className="row w-100  rounded shadow bg-white p-3 mx-0 mb-2">
                              <div className="col-2 fpo-icons ">
                                <i className="fa-solid fa-user-tie"></i>
                              </div>{" "}
                              <div className="col-10  fpo-icons ">
                              FPO leaders
                              </div>
                              <div className="col-12 fpo-info text-center">
                                {totalleaders}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 ">
                            <div className="row w-100  rounded shadow bg-white p-3 mx-0 mb-2">
                              <div className="col-2 fpo-icons2 ">
                                <i className="fa-solid fa-chart-line"></i>
                              </div>{" "}
                              <div className="col-10  fpo-icons ">
                                FPO capital
                              </div>
                              <div className="col-12 fpo-info text-center">
                                ₹{fpo?.totalFpoCapital}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 ">
                            <div className="row w-100  rounded shadow bg-white p-3 mx-0 mb-2">
                              <div className="col-2 fpo-icons1 ">
                                <i className="fa-solid fa-mountain-city"></i>
                              </div>{" "}
                              <div className="col-10  fpo-icons ">
                                Villages Served
                              </div>
                              <div className="col-12 fpo-info text-center">
                                {fpo?.villagesServed}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 ">
                            <div className="row w-100  rounded shadow bg-white p-3 mx-0 mb-2">
                              <div className="col-2 fpo-icons ">
                                <i className="fa-solid fa-cubes-stacked"></i>
                              </div>{" "}
                              <div className="col-10  fpo-icons ">Products</div>
                              <div className="col-12 fpo-info text-center">
                                {fpo?.products.length}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="fpo_products">
                          <div className="card">
                            <div className="card-header">
                              <h4>Products</h4>
                            </div>
                            <div className="card-body">
                              <div className="d-flex gap-2 align-items-center ">
                                {fpo?.products.map((el, index) => (
                                  <span
                                    key={index}
                                    className="rounded border px-3 py-2 border-primary text-primary"
                                  >
                                    {el}
                                  </span>
                                ))}

                                {fpo?.products?.length === 0 &&
                                  "NO products found"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {(showeditfpo || firstfpo) && (
                  <FPOForm fpo={fpo} oncancel={oncancel} onSave={onsave} />
                )}
              </div>
            </div>
            {/* <!-- Content wrapper --> */}
          </div>
          {/* <!-- / Layout page --> */}
        </div>

        {/* //   <!-- Overlay --> */}
        <div className="layout-overlay layout-menu-toggle"></div>
      </div>
      {/* // <!-- / Layout wrapper --> */}
    </div>
  );
};

export default Myfpo;
