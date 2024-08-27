import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import Topbar from "../components/Topbar";
import { removeHtmlClass, toggleHtmlClass } from "../js/intjava";
import { axiosInstance, renderUrl, renderUrl2 } from "../config";
import jwtDecode from "jwt-decode";
import moment from "moment";
import FPOForm from "../components/FPOForm";
import Swal from "sweetalert2";
import PermissionHandler from "../components/PermissionHandler";

export default function Admin() {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;

  const [fpo, setFPO] = useState(null);
  const [error, seterror] = useState("");
  const [totalleaders, settotalleaders] = useState(0);
  const [showeditfpo, setshoweditfpo] = useState(false);
  const [firstfpo, setfirstfpo] = useState(false);
  const [isEdit, setisEdit] = useState(false);
  const [editFpo, setEditFpo] = useState(null);

  const fetchFPO = async () => {
    try {
      const response = await axiosInstance.get(`fpo/getmyfpo/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        console.log(response.data);
        if (response.data.fpo.length === 0) {
          seterror("FPO not created");
          setshoweditfpo(true);
          setfirstfpo(true);
        }
        setFPO(response.data.fpo);
        settotalleaders(response.data.fpoleaders);
      }
      console.log(response);
    } catch (error) {
      console.log(error.response.data.error);
      console.error("Failed to fetch FPO details:", error);
    }
  };

  console.log(fpo);
  useEffect(() => {
    fetchFPO();
  }, []);

  const [fpos, setfpos] = useState([]);
  // const [error, setError] = useState(null);

  const fetchAdminList = async () => {
    try {
      // Update the URL to include a query parameter to filter by role
      const response = await axiosInstance.get(
        "fpo/allfpo?page=1&limit=1000000000000000000000000000000000000000000000000",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setfpos(response.data.fpos.results);
      console.log(
        response.data.fpos.results,
        "fpo's**************************************************"
      );
    } catch (err) {
      seterror("Error while fetching admin list");
    }
  };

  useEffect(() => {
    fetchAdminList();
  }, []);

  const [editFormData, setEditFormData] = useState({
    name: "",
    // registeredOn: "",
    promoter: "",
    sharePerMember: "",
    numberOfDirectors: "",
    totalFpoCapital: "",
    villagesServed: "",
    productsarray: "",
  });

  // Function to handle form input changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const openEditModal = (fpo) => {
    setEditFpo(fpo);
    setEditFormData({
      name: fpo.name,
      // registeredOn: moment(fpo.registeredOn).format("YYYY-MM-DD"),
      promoter: fpo.promoter,
      sharePerMember: fpo.sharePerMember,
      numberOfDirectors: fpo.numberOfDirectors,
      totalFpoCapital: fpo.totalFpoCapital,
      villagesServed: fpo.villagesServed,
      productsarray: fpo.productsarray,
    });
  };
  const submitEditForm = async () => {
    // Show a confirmation dialog
    const result = await Swal.fire({
      title: "Confirmation",
      text: "Are you sure you want to update these FPO details?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });
    if (result.isConfirmed) {
      // User confirmed, proceed with the form submission
      try {
        // Make a request to update FPO details
        const response = await axiosInstance.put(
          `fpo/edit/${editFpo._id}`,
          editFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Update the FPO list with the edited FPO
        const updatedFpos = fpos.map((fpo) =>
          fpo._id === editFpo._id ? response.data.fpo : fpo
        );

        setfpos(updatedFpos);
        setEditFpo(null);

        // Show a success message
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "FPO details updated successfully.",
        });
      } catch (err) {
        console.error(err);

        // Show an error message
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "An error occurred while editing FPO details.",
        });
      }
    }
  };

  const onsave = () => {
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
            <Topbar />

            {/* <!-- / Navbar --> */}

            {/* <!-- Content wrapper --> */}
            <div className="content-wrapper">
              {/* <!-- Content --> */}

              {decoded.role === "fpoadmin" && (
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
                      <div className="my-fpodetails row ">
                        <div className="fpo-img col-md-4">
                          <div className="p-3 card d-flex fpo-pic-main justify-content-center align-items-center flex-column">
                            <img
                              src={
                                fpo?.fpopic
                                  ? `${renderUrl2}${fpo?.fpopic}`
                                  : "/assets/img/avatars/1.png"
                              }
                              onError={(e) => {
                                e.target.src = "/assets/img/avatars/1.png"; // Set a default image if the specified image fails to load
                              }}
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
                                <div className="col-10  fpo-icons">
                                  FPO Owner
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
                                      {moment(fpo?.createdAt).format(
                                        "Do MMMM YYYY"
                                      )}
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
                                <div className="col-10  fpo-icons">
                                  Promoter
                                </div>
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
                                <div className="col-10  fpo-icons ">
                                  Products
                                </div>
                                <div className="col-12 fpo-info text-center">
                                  {fpo?.products.length}
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
              )}

              {decoded.role === "superadmin" && (
                <div className="container-xxl flex-grow-1 container-p-y">
                  <div className="d-flex justify-content-between align-items-center">
                    <h4 className="py-3 mb-4">FPO's</h4>
                  </div>
                  <div className="row mx-0 justify-content-center">
                    {fpos.map((el, index) => (
                      <div key={index} className="col-md-6 col-12 mb-2">
                        <div className="card">
                          <div className="card-body">
                            <div className="row justify-content-md-between align-items-center justify-content-center flex-wrap">
                              <div className="d-flex col-md-10 col-12 align-items-center gap-2">
                                <div className="">
                                  <div className="fpo_image_dashboard d-flex justify-content-center">
                                    <img
                                      src={
                                        el?.fpopic
                                          ? `${renderUrl}uploads/fpo/${el?.fpopic}`
                                          : "/assets/img/avatars/1.png"
                                      }
                                      alt="logo"
                                      onError={(e) => {
                                        e.target.src =
                                          "/assets/img/avatars/1.png";
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="">
                                  <div className="fponame_dashboard">
                                    <Link
                                      to={`/singlefpo/${el._id}`}
                                      // onClick={() => {
                                      //   setshowfpodetails(true);
                                      //   setselectedfpo(el);
                                      //   fetchData(el._id);
                                      //   fetchQueryList(el._id);
                                      //   getPrivacyPolicy(el._id);
                                      //   getaboutus(el._id);
                                      // }}
                                    >
                                      <h5 className="m-0">{el.name}</h5>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                              <div className=" text-md-center text-end col-md-2 col-12">
                                <button
                                  type="button"
                                  data-bs-toggle="modal"
                                  data-bs-target="#modalCenter"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => openEditModal(el)}
                                >
                                  <i className="bx bxs-pencil"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    className="modal fade"
                    id="modalCenter"
                    tabindex="-1"
                    aria-hidden="true"
                  >
                    <div
                      className="modal-dialog modal-dialog-centered"
                      role="document"
                    >
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title" id="modalCenterTitle">
                            Edit FPO details
                          </h5>
                          <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                          ></button>
                        </div>
                        <div className="modal-body">
                          <form>
                            <div className="mb-3">
                              <label htmlFor="editName" className="form-label">
                                Name
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="editName"
                                name="name"
                                value={editFormData.name}
                                onChange={handleEditFormChange}
                              />
                            </div>
                            {/* <div className="mb-3">
                              <label
                                htmlFor="editRegisteredOn"
                                className="form-label"
                              >
                                Registered On
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                id="editRegisteredOn"
                                name="registeredOn"
                                value={editFormData.registeredOn}
                                onChange={handleEditFormChange}
                              />
                            </div> */}
                            <div className="mb-3">
                              <label
                                htmlFor="editPromoter"
                                className="form-label"
                              >
                                Promoter
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="editPromoter"
                                name="promoter"
                                value={editFormData.promoter}
                                onChange={handleEditFormChange}
                              />
                            </div>
                            <div className="mb-3">
                              <label
                                htmlFor="editSharePerMember"
                                className="form-label"
                              >
                                Share per Member
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="editSharePerMember"
                                name="sharePerMember"
                                value={editFormData.sharePerMember}
                                onChange={handleEditFormChange}
                              />
                            </div>
                            <div className="mb-3">
                              <label
                                htmlFor="editNumberOfDirectors"
                                className="form-label"
                              >
                                No. of Directors
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="editNumberOfDirectors"
                                name="numberOfDirectors"
                                value={editFormData.numberOfDirectors}
                                onChange={handleEditFormChange}
                              />
                            </div>
                            <div className="mb-3">
                              <label
                                htmlFor="editfpocapital"
                                className="form-label"
                              >
                                FPO capital
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                id="editfpocapital"
                                name="totalFpoCapital"
                                value={editFormData.totalFpoCapital}
                                onChange={handleEditFormChange}
                              />
                            </div>
                            <div className="mb-3">
                              <label
                                htmlFor="editvillagesServed"
                                className="form-label"
                              >
                                Villages Served
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="editvillagesServed"
                                name="villagesServed"
                                value={editFormData.villagesServed}
                                onChange={handleEditFormChange}
                              />
                            </div>
                            <div className="mb-3">
                              <label
                                htmlFor="editproducts"
                                className="form-label"
                              >
                                Products
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="editproducts"
                                name="productsarray"
                                value={editFormData.productsarray}
                                onChange={handleEditFormChange}
                              />
                              <span className="text-danger">
                                Enter product names with comma (",") after each
                              </span>
                            </div>
                          </form>
                        </div>
                        <div className="modal-footer">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            data-bs-dismiss="modal"
                            onClick={() => setEditFpo(null)}
                          >
                            Close
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary"
                            data-bs-dismiss="modal"
                            onClick={submitEditForm}
                          >
                            Save changes
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="container-xxl flex-grow-1 container-p-y">
                <div className="row">
                  {/* <div className="col-lg-8 mb-4 order-0">
                    <div className="card">
                      <div className="d-flex align-items-end row">
                        <div className="col-sm-7">
                          <div className="card-body">
                            <h5 className="card-title text-primary">
                              Congratulations John! 🎉
                            </h5>
                            <p className="mb-4">
                              You have done{" "}
                              <span className="fw-medium">72%</span> more sales
                              today. Check your new badge in your profile.
                            </p>

                            <a
                              href="javascript:;"
                              className="btn btn-sm btn-outline-primary"
                            >
                              View Badges
                            </a>
                          </div>
                        </div>
                        <div className="col-sm-5 text-center text-sm-left">
                          <div className="card-body pb-0 px-0 px-md-4">
                            <img
                              src="../assets/img/illustrations/man-with-laptop-light.png"
                              height="140"
                              alt="View Badge User"
                              data-app-dark-img="illustrations/man-with-laptop-dark.png"
                              data-app-light-img="illustrations/man-with-laptop-light.png"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> */}
                  <div className="col-lg-4 col-md-4 order-1">
                    <div className="row">
                      {/* <div className="col-lg-6 col-md-12 col-6 mb-4">
                        <div className="card">
                          <div className="card-body">
                            <div className="card-title d-flex align-items-start justify-content-between">
                              <div className="avatar flex-shrink-0">
                                <img
                                  src="../assets/img/icons/unicons/chart-success.png"
                                  alt="chart success"
                                  className="rounded"
                                />
                              </div>
                              <div className="dropdown">
                                <button
                                  className="btn p-0"
                                  type="button"
                                  id="cardOpt3"
                                  data-bs-toggle="dropdown"
                                  aria-haspopup="true"
                                  aria-expanded="false"
                                >
                                  <i className="bx bx-dots-vertical-rounded"></i>
                                </button>
                                <div
                                  className="dropdown-menu dropdown-menu-end"
                                  aria-labelledby="cardOpt3"
                                >
                                  <a
                                    className="dropdown-item"
                                    href="javascript:void(0);"
                                  >
                                    View More
                                  </a>
                                  <a
                                    className="dropdown-item"
                                    href="javascript:void(0);"
                                  >
                                    Delete
                                  </a>
                                </div>
                              </div>
                            </div>
                            <span className="fw-medium d-block mb-1">
                              Profit
                            </span>
                            <h3 className="card-title mb-2">$12,628</h3>
                            <small className="text-success fw-medium">
                              <i className="bx bx-up-arrow-alt"></i> +72.80%
                            </small>
                          </div>
                        </div>
                      </div> */}
                      {/* <div className="col-lg-6 col-md-12 col-6 mb-4">
                        <div className="card">
                          <div className="card-body">
                            <div className="card-title d-flex align-items-start justify-content-between">
                              <div className="avatar flex-shrink-0">
                                <img
                                  src="../assets/img/icons/unicons/wallet-info.png"
                                  alt="Credit Card"
                                  className="rounded"
                                />
                              </div>
                              <div className="dropdown">
                                <button
                                  className="btn p-0"
                                  type="button"
                                  id="cardOpt6"
                                  data-bs-toggle="dropdown"
                                  aria-haspopup="true"
                                  aria-expanded="false"
                                >
                                  <i className="bx bx-dots-vertical-rounded"></i>
                                </button>
                                <div
                                  className="dropdown-menu dropdown-menu-end"
                                  aria-labelledby="cardOpt6"
                                >
                                  <a
                                    className="dropdown-item"
                                    href="javascript:void(0);"
                                  >
                                    View More
                                  </a>
                                  <a
                                    className="dropdown-item"
                                    href="javascript:void(0);"
                                  >
                                    Delete
                                  </a>
                                </div>
                              </div>
                            </div>
                            <span>Sales</span>
                            <h3 className="card-title text-nowrap mb-1">
                              $4,679
                            </h3>
                            <small className="text-success fw-medium">
                              <i className="bx bx-up-arrow-alt"></i> +28.42%
                            </small>
                          </div>
                        </div>
                      </div> */}
                    </div>
                  </div>
                  {/* <!-- Total Revenue --> */}
                  {/* <div className="col-12 col-lg-8 order-2 order-md-3 order-lg-2 mb-4">
                    <div className="card">
                      <div className="row row-bordered g-0">
                        <div className="col-md-8">
                          <h5 className="card-header m-0 me-2 pb-3">
                            Total Revenue
                          </h5>
                          <div id="totalRevenueChart" className="px-2"></div>
                        </div>
                        <div className="col-md-4">
                          <div className="card-body">
                            <div className="text-center">
                              <div className="dropdown">
                                <button
                                  className="btn btn-sm btn-outline-primary dropdown-toggle"
                                  type="button"
                                  id="growthReportId"
                                  data-bs-toggle="dropdown"
                                  aria-haspopup="true"
                                  aria-expanded="false"
                                >
                                  2022
                                </button>
                                <div
                                  className="dropdown-menu dropdown-menu-end"
                                  aria-labelledby="growthReportId"
                                >
                                  <a
                                    className="dropdown-item"
                                    href="javascript:void(0);"
                                  >
                                    2021
                                  </a>
                                  <a
                                    className="dropdown-item"
                                    href="javascript:void(0);"
                                  >
                                    2020
                                  </a>
                                  <a
                                    className="dropdown-item"
                                    href="javascript:void(0);"
                                  >
                                    2019
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div id="growthChart"></div>
                          <div className="text-center fw-medium pt-3 mb-2">
                            62% Company Growth
                          </div>

                          <div className="d-flex px-xxl-4 px-lg-2 p-4 gap-xxl-3 gap-lg-1 gap-3 justify-content-between">
                            <div className="d-flex">
                              <div className="me-2">
                                <span className="badge bg-label-primary p-2">
                                  <i className="bx bx-dollar text-primary"></i>
                                </span>
                              </div>
                              <div className="d-flex flex-column">
                                <small>2022</small>
                                <h6 className="mb-0">$32.5k</h6>
                              </div>
                            </div>
                            <div className="d-flex">
                              <div className="me-2">
                                <span className="badge bg-label-info p-2">
                                  <i className="bx bx-wallet text-info"></i>
                                </span>
                              </div>
                              <div className="d-flex flex-column">
                                <small>2021</small>
                                <h6 className="mb-0">$41.2k</h6>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> */}
                  {/* <!--/ Total Revenue --> */}
                  {/* <div className="col-12 col-md-8 col-lg-4 order-3 order-md-2">
                    <div className="row">
                      <div className="col-6 mb-4">
                        <div className="card">
                          <div className="card-body">
                            <div className="card-title d-flex align-items-start justify-content-between">
                              <div className="avatar flex-shrink-0">
                                <img
                                  src="../assets/img/icons/unicons/paypal.png"
                                  alt="Credit Card"
                                  className="rounded"
                                />
                              </div>
                              <div className="dropdown">
                                <button
                                  className="btn p-0"
                                  type="button"
                                  id="cardOpt4"
                                  data-bs-toggle="dropdown"
                                  aria-haspopup="true"
                                  aria-expanded="false"
                                >
                                  <i className="bx bx-dots-vertical-rounded"></i>
                                </button>
                                <div
                                  className="dropdown-menu dropdown-menu-end"
                                  aria-labelledby="cardOpt4"
                                >
                                  <a
                                    className="dropdown-item"
                                    href="javascript:void(0);"
                                  >
                                    View More
                                  </a>
                                  <a
                                    className="dropdown-item"
                                    href="javascript:void(0);"
                                  >
                                    Delete
                                  </a>
                                </div>
                              </div>
                            </div>
                            <span className="d-block mb-1">Payments</span>
                            <h3 className="card-title text-nowrap mb-2">
                              $2,456
                            </h3>
                            <small className="text-danger fw-medium">
                              <i className="bx bx-down-arrow-alt"></i> -14.82%
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="col-6 mb-4">
                        <div className="card">
                          <div className="card-body">
                            <div className="card-title d-flex align-items-start justify-content-between">
                              <div className="avatar flex-shrink-0">
                                <img
                                  src="../assets/img/icons/unicons/cc-primary.png"
                                  alt="Credit Card"
                                  className="rounded"
                                />
                              </div>
                              <div className="dropdown">
                                <button
                                  className="btn p-0"
                                  type="button"
                                  id="cardOpt1"
                                  data-bs-toggle="dropdown"
                                  aria-haspopup="true"
                                  aria-expanded="false"
                                >
                                  <i className="bx bx-dots-vertical-rounded"></i>
                                </button>
                                <div
                                  className="dropdown-menu"
                                  aria-labelledby="cardOpt1"
                                >
                                  <a
                                    className="dropdown-item"
                                    href="javascript:void(0);"
                                  >
                                    View More
                                  </a>
                                  <a
                                    className="dropdown-item"
                                    href="javascript:void(0);"
                                  >
                                    Delete
                                  </a>
                                </div>
                              </div>
                            </div>
                            <span className="fw-medium d-block mb-1">
                              Transactions
                            </span>
                            <h3 className="card-title mb-2">$14,857</h3>
                            <small className="text-success fw-medium">
                              <i className="bx bx-up-arrow-alt"></i> +28.14%
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12 mb-4">
                        <div className="card">
                          <div className="card-body">
                            <div className="d-flex justify-content-between flex-sm-row flex-column gap-3">
                              <div className="d-flex flex-sm-column flex-row align-items-start justify-content-between">
                                <div className="card-title">
                                  <h5 className="text-nowrap mb-2">
                                    Profile Report
                                  </h5>
                                  <span className="badge bg-label-warning rounded-pill">
                                    Year 2021
                                  </span>
                                </div>
                                <div className="mt-sm-auto">
                                  <small className="text-success text-nowrap fw-medium">
                                    <i className="bx bx-chevron-up"></i> 68.2%
                                  </small>
                                  <h3 className="mb-0">$84,686k</h3>
                                </div>
                              </div>
                              <div id="profileReportChart"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> */}
                </div>
                {/* <div className="row"> */}
                {/* <!-- Order Statistics --> */}
                {/* <div className="col-md-6 col-lg-4 col-xl-4 order-0 mb-4">
                    <div className="card h-100">
                      <div className="card-header d-flex align-items-center justify-content-between pb-0">
                        <div className="card-title mb-0">
                          <h5 className="m-0 me-2">Order Statistics</h5>
                          <small className="text-muted">
                            42.82k Total Sales
                          </small>
                        </div>
                        <div className="dropdown">
                          <button
                            className="btn p-0"
                            type="button"
                            id="orederStatistics"
                            data-bs-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                            <i className="bx bx-dots-vertical-rounded"></i>
                          </button>
                          <div
                            className="dropdown-menu dropdown-menu-end"
                            aria-labelledby="orederStatistics"
                          >
                            <a
                              className="dropdown-item"
                              href="javascript:void(0);"
                            >
                              Select All
                            </a>
                            <a
                              className="dropdown-item"
                              href="javascript:void(0);"
                            >
                              Refresh
                            </a>
                            <a
                              className="dropdown-item"
                              href="javascript:void(0);"
                            >
                              Share
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className="d-flex flex-column align-items-center gap-1">
                            <h2 className="mb-2">8,258</h2>
                            <span>Total Orders</span>
                          </div>
                          <div id="orderStatisticsChart"></div>
                        </div>
                        <ul className="p-0 m-0">
                          <li className="d-flex mb-4 pb-1">
                            <div className="avatar flex-shrink-0 me-3">
                              <span className="avatar-initial rounded bg-label-primary">
                                <i className="bx bx-mobile-alt"></i>
                              </span>
                            </div>
                            <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                              <div className="me-2">
                                <h6 className="mb-0">Electronic</h6>
                                <small className="text-muted">
                                  Mobile, Earbuds, TV
                                </small>
                              </div>
                              <div className="user-progress">
                                <small className="fw-medium">82.5k</small>
                              </div>
                            </div>
                          </li>
                          <li className="d-flex mb-4 pb-1">
                            <div className="avatar flex-shrink-0 me-3">
                              <span className="avatar-initial rounded bg-label-success">
                                <i className="bx bx-closet"></i>
                              </span>
                            </div>
                            <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                              <div className="me-2">
                                <h6 className="mb-0">Fashion</h6>
                                <small className="text-muted">
                                  T-shirt, Jeans, Shoes
                                </small>
                              </div>
                              <div className="user-progress">
                                <small className="fw-medium">23.8k</small>
                              </div>
                            </div>
                          </li>
                          <li className="d-flex mb-4 pb-1">
                            <div className="avatar flex-shrink-0 me-3">
                              <span className="avatar-initial rounded bg-label-info">
                                <i className="bx bx-home-alt"></i>
                              </span>
                            </div>
                            <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                              <div className="me-2">
                                <h6 className="mb-0">Decor</h6>
                                <small className="text-muted">
                                  Fine Art, Dining
                                </small>
                              </div>
                              <div className="user-progress">
                                <small className="fw-medium">849k</small>
                              </div>
                            </div>
                          </li>
                          <li className="d-flex">
                            <div className="avatar flex-shrink-0 me-3">
                              <span className="avatar-initial rounded bg-label-secondary">
                                <i className="bx bx-football"></i>
                              </span>
                            </div>
                            <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                              <div className="me-2">
                                <h6 className="mb-0">Sports</h6>
                                <small className="text-muted">
                                  Football, Cricket Kit
                                </small>
                              </div>
                              <div className="user-progress">
                                <small className="fw-medium">99</small>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div> */}
                {/* <!--/ Order Statistics --> */}

                {/* <!-- Expense Overview --> */}
                {/* <div className="col-md-6 col-lg-4 order-1 mb-4">
                    <div className="card h-100">
                      <div className="card-header">
                        <ul className="nav nav-pills" role="tablist">
                          <li className="nav-item">
                            <button
                              type="button"
                              className="nav-link active"
                              role="tab"
                              data-bs-toggle="tab"
                              data-bs-target="#navs-tabs-line-card-income"
                              aria-controls="navs-tabs-line-card-income"
                              aria-selected="true"
                            >
                              Income
                            </button>
                          </li>
                          <li className="nav-item">
                            <button
                              type="button"
                              className="nav-link"
                              role="tab"
                            >
                              Expenses
                            </button>
                          </li>
                          <li className="nav-item">
                            <button
                              type="button"
                              className="nav-link"
                              role="tab"
                            >
                              Profit
                            </button>
                          </li>
                        </ul>
                      </div>
                      <div className="card-body px-0">
                        <div className="tab-content p-0">
                          <div
                            className="tab-pane fade show active"
                            id="navs-tabs-line-card-income"
                            role="tabpanel"
                          >
                            <div className="d-flex p-4 pt-3">
                              <div className="avatar flex-shrink-0 me-3">
                                <img
                                  src="../assets/img/icons/unicons/wallet.png"
                                  alt="User"
                                />
                              </div>
                              <div>
                                <small className="text-muted d-block">
                                  Total Balance
                                </small>
                                <div className="d-flex align-items-center">
                                  <h6 className="mb-0 me-1">$459.10</h6>
                                  <small className="text-success fw-medium">
                                    <i className="bx bx-chevron-up"></i>
                                    42.9%
                                  </small>
                                </div>
                              </div>
                            </div>
                            <div id="incomeChart"></div>
                            <div className="d-flex justify-content-center pt-4 gap-2">
                              <div className="flex-shrink-0">
                                <div id="expensesOfWeek"></div>
                              </div>
                              <div>
                                <p className="mb-n1 mt-1">Expenses This Week</p>
                                <small className="text-muted">
                                  $39 less than last week
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> */}
                {/* <!--/ Expense Overview --> */}

                {/* <!-- Transactions --> */}
                {/* <div className="col-md-6 col-lg-4 order-2 mb-4">
                    <div className="card h-100">
                      <div className="card-header d-flex align-items-center justify-content-between">
                        <h5 className="card-title m-0 me-2">Transactions</h5>
                        <div className="dropdown">
                          <button
                            className="btn p-0"
                            type="button"
                            id="transactionID"
                            data-bs-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                            <i className="bx bx-dots-vertical-rounded"></i>
                          </button>
                          <div
                            className="dropdown-menu dropdown-menu-end"
                            aria-labelledby="transactionID"
                          >
                            <a
                              className="dropdown-item"
                              href="javascript:void(0);"
                            >
                              Last 28 Days
                            </a>
                            <a
                              className="dropdown-item"
                              href="javascript:void(0);"
                            >
                              Last Month
                            </a>
                            <a
                              className="dropdown-item"
                              href="javascript:void(0);"
                            >
                              Last Year
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="card-body">
                        <ul className="p-0 m-0">
                          <li className="d-flex mb-4 pb-1">
                            <div className="avatar flex-shrink-0 me-3">
                              <img
                                src="../assets/img/icons/unicons/paypal.png"
                                alt="User"
                                className="rounded"
                              />
                            </div>
                            <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                              <div className="me-2">
                                <small className="text-muted d-block mb-1">
                                  Paypal
                                </small>
                                <h6 className="mb-0">Send money</h6>
                              </div>
                              <div className="user-progress d-flex align-items-center gap-1">
                                <h6 className="mb-0">+82.6</h6>
                                <span className="text-muted">USD</span>
                              </div>
                            </div>
                          </li>
                          <li className="d-flex mb-4 pb-1">
                            <div className="avatar flex-shrink-0 me-3">
                              <img
                                src="../assets/img/icons/unicons/wallet.png"
                                alt="User"
                                className="rounded"
                              />
                            </div>
                            <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                              <div className="me-2">
                                <small className="text-muted d-block mb-1">
                                  Wallet
                                </small>
                                <h6 className="mb-0">Mac'D</h6>
                              </div>
                              <div className="user-progress d-flex align-items-center gap-1">
                                <h6 className="mb-0">+270.69</h6>
                                <span className="text-muted">USD</span>
                              </div>
                            </div>
                          </li>
                          <li className="d-flex mb-4 pb-1">
                            <div className="avatar flex-shrink-0 me-3">
                              <img
                                src="../assets/img/icons/unicons/chart.png"
                                alt="User"
                                className="rounded"
                              />
                            </div>
                            <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                              <div className="me-2">
                                <small className="text-muted d-block mb-1">
                                  Transfer
                                </small>
                                <h6 className="mb-0">Refund</h6>
                              </div>
                              <div className="user-progress d-flex align-items-center gap-1">
                                <h6 className="mb-0">+637.91</h6>
                                <span className="text-muted">USD</span>
                              </div>
                            </div>
                          </li>
                          <li className="d-flex mb-4 pb-1">
                            <div className="avatar flex-shrink-0 me-3">
                              <img
                                src="../assets/img/icons/unicons/cc-success.png"
                                alt="User"
                                className="rounded"
                              />
                            </div>
                            <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                              <div className="me-2">
                                <small className="text-muted d-block mb-1">
                                  Credit Card
                                </small>
                                <h6 className="mb-0">Ordered Food</h6>
                              </div>
                              <div className="user-progress d-flex align-items-center gap-1">
                                <h6 className="mb-0">-838.71</h6>
                                <span className="text-muted">USD</span>
                              </div>
                            </div>
                          </li>
                          <li className="d-flex mb-4 pb-1">
                            <div className="avatar flex-shrink-0 me-3">
                              <img
                                src="../assets/img/icons/unicons/wallet.png"
                                alt="User"
                                className="rounded"
                              />
                            </div>
                            <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                              <div className="me-2">
                                <small className="text-muted d-block mb-1">
                                  Wallet
                                </small>
                                <h6 className="mb-0">Starbucks</h6>
                              </div>
                              <div className="user-progress d-flex align-items-center gap-1">
                                <h6 className="mb-0">+203.33</h6>
                                <span className="text-muted">USD</span>
                              </div>
                            </div>
                          </li>
                          <li className="d-flex">
                            <div className="avatar flex-shrink-0 me-3">
                              <img
                                src="../assets/img/icons/unicons/cc-warning.png"
                                alt="User"
                                className="rounded"
                              />
                            </div>
                            <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                              <div className="me-2">
                                <small className="text-muted d-block mb-1">
                                  Mastercard
                                </small>
                                <h6 className="mb-0">Ordered Food</h6>
                              </div>
                              <div className="user-progress d-flex align-items-center gap-1">
                                <h6 className="mb-0">-92.45</h6>
                                <span className="text-muted">USD</span>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div> */}
                {/* <!--/ Transactions --> */}
                {/* </div> */}
              </div>
              {/* <!-- / Content --> */}

              {/* <!-- Footer --> */}
              {/* <footer className="content-footer footer bg-footer-theme">
                <div className="container-xxl d-flex flex-wrap justify-content-end py-2 flex-md-row flex-column">
                  <div className="mb-2 mb-md-0">
                    ©<script>document.write(new Date().getFullYear());</script>,
                    made with ❤️ by
                    <a
                      href="https://themeselection.com"
                      target="_blank"
                      className="footer-link fw-medium"
                    >
                      ThemeSelection
                    </a>
                  </div>
                  <div className="d-none d-lg-inline-block">
                    <a
                      href="https://themeselection.com/license/"
                      className="footer-link me-4"
                      target="_blank"
                    >
                      License
                    </a>
                    <a
                      href="https://themeselection.com/"
                      target="_blank"
                      className="footer-link me-4"
                    >
                      More Themes
                    </a>

                    <a
                      href="https://demos.themeselection.com/sneat-bootstrap-html-admin-template/documentation/"
                      target="_blank"
                      className="footer-link me-4"
                    >
                      Documentation
                    </a>

                    <a
                      href="https://github.com/themeselection/sneat-html-admin-template-free/issues"
                      target="_blank"
                      className="footer-link me-4"
                    >
                      Support
                    </a>
                  </div>
                </div>
              </footer> */}
              {/* <!-- / Footer --> */}

              <div className="content-backdrop fade"></div>
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
}
