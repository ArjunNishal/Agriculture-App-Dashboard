import React, { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { Link } from "react-router-dom";
import { axiosInstance, renderUrl } from "../../config";
import Swal from "sweetalert2";
import moment from "moment";
import jwtDecode from "jwt-decode";
import Pagination from "../../components/Pagination";
import PermissionHandler from "../../components/PermissionHandler";
const Allfpo = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  const [fpos, setfpos] = useState([]);
  const [error, setError] = useState(null);
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [aboutus, setaboutus] = useState("");
  const [selectedquery, setselectedquery] = useState("");

  const [queries, setqueries] = useState([]);
  const [searchvalue, setsearchvalue] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setitemsPerPage] = useState(10);
  const [totalpages, settotalpages] = useState(0);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const fetchQueryList = async (fpo) => {
    try {
      // let url = "query/allquery";

      // if (decoded.role === "fpoadmin") {
      let url = `query/queries/fpo/${fpo}`;
      // }

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      setqueries(response.data.data);
    } catch (err) {
      console.log(err);
      setError("Error while fetching admin list");
    }
  };

  const fetchAdminList = async () => {
    try {
      // Update the URL to include a query parameter to filter by role
      const response = await axiosInstance.get(
        `fpo/allfpo?page=${currentPage}&limit=${itemsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data.fpos);
      settotalpages(response.data.fpos.totalRecord);
      setfpos(response.data.fpos.results);
    } catch (err) {
      setError("Error while fetching admin list");
    }
  };

  useEffect(() => {
    fetchAdminList();
  }, [currentPage]);

  useEffect(() => {
    fetchAdminList();
  }, []);

  const handleSearch = async (val) => {
    try {
      const apiUrl = "admin-auth/search";
      const modelName = "FPO";

      const mongodbQuery = {
        $or: [
          { name: { $regex: val, $options: "i" } },
          // { email: { $regex: val, $options: "i" } },
          // { mobileno: { $regex: val, $options: "i" } },
        ],
      };

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
        setfpos(response.data.data);
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
      fetchAdminList();
    } else if (value !== "" && value) {
      handleSearch(value);
    }
    setsearchvalue(value);
  };

  const [editFpo, setEditFpo] = useState(null);
  const [showfpodetails, setshowfpodetails] = useState(false);
  const [selectedfpo, setselectedfpo] = useState(null);

  const [fpoData, setFPOData] = useState(null);

  const fetchData = async (fpoId) => {
    try {
      const response = await axiosInstance.get(`fpo/fpodata/${fpoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFPOData(response.data.data);
      console.log("fpodata", response.data.data);
    } catch (error) {
      console.error("Error fetching FPO data:", error.message);
    }
  };
  // useEffect(() => {
  //   fetchData();
  // }, [fpoId]);

  const [editFormData, setEditFormData] = useState({
    name: "",
    // registeredOn: "",
    promoter: "",
    sharePerMember: "",
    numberOfDirectors: "",
  });

  const openEditModal = (fpo) => {
    console.log(fpo);
    setEditFpo(fpo);
    setEditFormData({
      name: "",
      promoter: "",
      sharePerMember: "",
      numberOfDirectors: "",
    });
    setEditFormData({
      name: fpo?.name,
      // registeredOn: moment(fpo.registeredOn).format("YYYY-MM-DD"),
      promoter: fpo?.promoter,
      sharePerMember: fpo?.sharePerMember,
      // members: fpo?.members ,
      totalFpoCapital: fpo?.totalFpoCapital,
      villagesServed: fpo?.villagesServed,
      numberOfDirectors: fpo?.numberOfDirectors,
      productsarray: fpo?.productsarray,
    });
  };

  console.log("editFormData", editFormData);

  // Function to handle form input changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // Function to submit the edited FPO details
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
        console.log(response);
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

  const getPrivacyPolicy = async (fpoId) => {
    try {
      const response = await axiosInstance.get(`query/privacy-policy/${fpoId}`);
      if (response.status === 200) {
        setPrivacyPolicy(response.data.privacyPolicy);
      }
    } catch (error) {
      console.error("Error fetching privacy policy:", error);
      //   throw new Error("Error fetching privacy policy");
    }
  };
  const getaboutus = async (fpoId) => {
    try {
      const response = await axiosInstance.get(`query/aboutus/${fpoId}`);
      if (response.status === 200) {
        setaboutus(response.data.aboutus);
      }
    } catch (error) {
      console.error("Error fetching privacy policy:", error);
      //   throw new Error("Error fetching privacy policy");
    }
  };

  const toggleSurveyStatus = async (id, activate, fpoid) => {
    try {
      const response = await axiosInstance.patch(
        `admin-auth/update-fig-status/${id}/${activate}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedSurvey = response.data;

      // const index = figs.findIndex((fig) => fig._id === id);
      // if (index !== -1) {
      //   figs[index] = updatedSurvey;
      fetchData(fpoid);
      // }
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
              {/* Content */}
              {!showfpodetails && (
                <div className="container-xxl flex-grow-1 container-p-y">
                  <h4 className="py-3 mb-4">
                    <span className="text-muted fw-light">FPO /</span> FPO's
                    list
                  </h4>
                  {/* Basic Bootstrap Table */}
                  <div className="card">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="card-header">All FPO</h5>
                      <div className="nav-item d-flex align-items-center border px-2  me-2 rounded">
                        <i className="bx bx-search fs-4 lh-0"></i>
                        <input
                          type="text"
                          className="form-control border-0 shadow-none ps-1 ps-sm-2"
                          placeholder="Search..."
                          aria-label="Search..."
                          onChange={(e) => handlesearchevent(e)}
                        />
                      </div>{" "}
                    </div>{" "}
                    {searchvalue && (
                      <div className="px-3">
                        <p className="text-center">
                          <b>Showing results for : </b>
                          {searchvalue}
                        </p>
                      </div>
                    )}
                    <div>
                      <div className="table-responsive text-nowrap">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>S.NO.</th>
                              <th>
                                <b>FPO</b>
                              </th>
                              <th>
                                <b>Members</b>
                              </th>
                              <th>
                                <b>Promoter</b>
                              </th>
                              <th>
                                <b>Share per Member</b>
                              </th>
                              <th>
                                <b>No. of Directors</b>
                              </th>
                              <th>
                                <b>Fpo Capital</b>
                              </th>
                              <th>
                                <b>FPO Owner</b>
                              </th>
                              <th>
                                <b>Registered On</b>
                              </th>
                              <th>
                                <b>Status</b>
                              </th>
                              <th>
                                <b>Actions</b>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="table-border-bottom-0">
                            {fpos.map((el, index) => (
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
                                    <span className="fw-medium">{el.name}</span>
                                  </Link>
                                </td>
                                <td>{el.members}</td>
                                <td>{el.promoter}</td>
                                <td>{el.sharePerMember}</td>
                                <td>{el.numberOfDirectors}</td>
                                <td>₹{el.totalFpoCapital}</td>
                                <td>{el?.admin?.username}</td>
                                <td>
                                  {" "}
                                  {moment(el.createdAt).format(
                                    " Do MMMM YYYY "
                                  )}
                                </td>
                                <td>
                                  <div className="d-flex align-items-center ">
                                    {" "}
                                    <span
                                      className={`badge  me-1 ${
                                        el.isBlocked
                                          ? "bg-label-danger"
                                          : "bg-label-primary"
                                      }`}
                                    >
                                      <i
                                        className={`fa-solid  fa-circle fa-beat-fade ${
                                          el.isBlocked
                                            ? "text-danger"
                                            : "text-success"
                                        }`}
                                      ></i>
                                      &nbsp;
                                      {el.isBlocked ? "Blocked" : "Active"}
                                    </span>
                                  </div>
                                  {/* <div className="dropdown">
                                <button
                                  type="button"
                                  className="btn p-0 dropdown-toggle hide-arrow"
                                  data-bs-toggle="dropdown"
                                >
                                  <i className="bx bx-dots-vertical-rounded" />
                                </button>
                                <div className="dropdown-menu">
                                  <a
                                    className="dropdown-item"
                                    href="javascript:void(0);"
                                  >
                                    <i className="bx bx-block me-1" /> Block
                                  </a>
                                  <a
                                    className="dropdown-item"
                                    href="javascript:void(0);"
                                  >
                                    <i className="bx bx-trash me-1" /> Delete
                                  </a>
                                </div>
                              </div> */}
                                </td>
                                <td>
                                  <div className="d-flex ">
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
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>{" "}
                        {fpos.length === 0 && (
                          <>
                            <p className="text-center">No FPO's found</p>
                          </>
                        )}
                      </div>
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
                    <div
                      className="modal fade"
                      id="modalCenter"
                      tabindex="-1"
                      aria-hidden="true"
                    >
                      <div
                        className="modal-dialog modal-lg modal-dialog-centered"
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
                            <form className="row mx-0">
                              <div className="mb-3 col-md-6 col-12">
                                <label
                                  htmlFor="editName"
                                  className="form-label"
                                >
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
                              {/* <div className="mb-3 col-md-6 col-12">
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
                              <div className="mb-3 col-md-6 col-12">
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
                              <div className="mb-3 col-md-6 col-12">
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
                              <div className="mb-3 col-md-6 col-12">
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
                              <div className="mb-3 col-md-6 col-12">
                                <label
                                  htmlFor="editNumberOfDirectors"
                                  className="form-label"
                                >
                                  FPO Capital
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="edittotalFpoCapital"
                                  name="totalFpoCapital"
                                  value={editFormData.totalFpoCapital}
                                  onChange={handleEditFormChange}
                                />
                              </div>
                              <div className="mb-3 col-md-6 col-12">
                                <label
                                  htmlFor="editNumberOfDirectors"
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
                              <div className="mb-3 col-md-6 col-12">
                                <label
                                  htmlFor="editNumberOfDirectors"
                                  className="form-label"
                                >
                                  Products
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="editproductsarray"
                                  name="productsarray"
                                  value={editFormData.productsarray}
                                  onChange={handleEditFormChange}
                                />
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
                </div>
              )}
              {showfpodetails && selectedfpo && (
                <div className="container-xxl flex-grow-1 container-p-y">
                  <h4 className="py-3 mb-4">
                    <span
                      className="text-muted all_fpo_backbtn fw-light"
                      onClick={() => {
                        setshowfpodetails(false);
                        setselectedfpo(null);
                      }}
                    >
                      {selectedfpo && showfpodetails && (
                        <i className="fa-solid  fa-angle-left"></i>
                      )}
                      &nbsp;FPO List /
                    </span>{" "}
                    {selectedfpo.name}
                  </h4>
                  <div className="my-fpo-main">
                    <div className="my-fpodetails row ">
                      <div className="fpo-img mb-2 col-md-4 col-12">
                        <div className="p-3 card d-flex fpo-pic-main justify-content-center align-items-center flex-md-column gap-2 flex-row">
                          <img
                            src={
                              selectedfpo?.fpopic
                                ? `${renderUrl}uploads/fpo/${selectedfpo?.fpopic}`
                                : "/assets/img/avatars/1.png"
                            }
                            alt="fpo"
                            className="fpopic shadow"
                          />
                          <h4 className="pt-3 text-capitalize fpo-name-heading">
                            {selectedfpo?.name}
                          </h4>
                        </div>
                      </div>
                      <div className="col-md-8">
                        {" "}
                        <div className="row mx-0">
                          <div className="col-md-6 ">
                            <div className="row w-100  rounded shadow bg-white p-3 mx-0 mb-2">
                              <div className="col-2 fpo-icons">
                                <i className="fa-solid fa-user"></i>
                              </div>{" "}
                              <div className="col-10  fpo-icons">Admin</div>
                              <div className="col-12 fpo-info text-center">
                                {selectedfpo?.admin.username}
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
                                {selectedfpo?.members}
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
                                {moment(selectedfpo?.createdAt).format(
                                  "Do MMMM YYYY"
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
                                {selectedfpo?.promoter}
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
                                {selectedfpo?.sharePerMember}
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
                                {selectedfpo?.numberOfDirectors}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>{" "}
                  <div className="row mx-0">
                    <div className="col-12"></div>
                  </div>
                  <div className="accordion mt-3" id="accordionExample">
                    {/* fig */}
                    <div className="card accordion-item active">
                      <h2 className="accordion-header" id="headingOne">
                        <button
                          type="button"
                          className="accordion-button"
                          data-bs-toggle="collapse"
                          data-bs-target="#accordionfig"
                          aria-expanded="true"
                          aria-controls="accordionfig"
                        >
                          FIG's
                        </button>
                      </h2>

                      <div
                        id="accordionfig"
                        className="accordion-collapse collapse show"
                        data-bs-parent="#accordionExample"
                      >
                        <div className="accordion-body">
                          <div className="fpo_data_details_main">
                            <div className="fpo_data_inner">
                              <div className="my-2 d-flex gap-2 justify-content-end">
                                <Link
                                  to={`/leaders?fpo=${selectedfpo._id}`}
                                  className="btn btn-outline-primary"
                                >
                                  All FPO Leaders
                                </Link>
                                <Link
                                  to={`/leaderreq?fpo=${selectedfpo._id}`}
                                  className="btn btn-outline-primary"
                                >
                                  Leaders Requests
                                </Link>
                                <Link
                                  to={`/contentcreators?fpo=${selectedfpo._id}`}
                                  className="btn btn-outline-primary"
                                >
                                  Content creators
                                </Link>
                              </div>
                              <hr />
                              <p>
                                <b>All FIG of {selectedfpo.name}</b>
                              </p>
                              <div className="table-responsive text-nowrap">
                                <table className="table">
                                  <thead>
                                    <tr>
                                      <th>
                                        <b>FIG</b>
                                      </th>
                                      <th>
                                        <b>Leader</b>
                                      </th>
                                      <th>
                                        <b>Location</b>
                                      </th>
                                      <th>
                                        <b>Members</b>
                                      </th>
                                      <th>
                                        <b>Meeting</b>
                                      </th>
                                      <th>
                                        <b>Status</b>
                                      </th>
                                      {(decoded.permissions?.includes(
                                        "editfigstatus"
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
                                    {fpoData?.figs?.map((el, index) => (
                                      <tr key={index}>
                                        <td>
                                          {/* <i className="fab fa-angular fa-lg text-danger me-3" /> */}
                                          <Link to={`/singlefig/${el._id}`}>
                                            <span className="fw-medium">
                                              {el.name}
                                            </span>
                                          </Link>
                                        </td>
                                        <td>
                                          {el.leaderId?.firstname}{" "}
                                          {el.leaderId?.lastname}
                                        </td>
                                        <td>{el.location}</td>
                                        <td>
                                          {/* <span className="badge bg-label-primary me-1">
                                     Active
                                   </span> */}

                                          {el.Joinedmembers.length}
                                        </td>

                                        <td>{el.meetings.length}</td>
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
                                          "editfigstatus"
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
                                                        toggleSurveyStatus(
                                                          el._id,
                                                          0,
                                                          el.fpo
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
                                                          el._id,
                                                          2,
                                                          el.fpo
                                                        )
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
                                                        toggleSurveyStatus(
                                                          el._id,
                                                          1,
                                                          el.fpo
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
                                                          el._id,
                                                          2,
                                                          el.fpo
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
                                                      toggleSurveyStatus(
                                                        el._id,
                                                        0,
                                                        el.fpo
                                                      )
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
                                {fpoData?.figs?.length === 0 && (
                                  <div>
                                    <p className="text-center my-3">
                                      No News Categories found
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* news grps */}
                    <div className="card accordion-item ">
                      <h2 className="accordion-header" id="headingOne">
                        <button
                          type="button"
                          className="accordion-button"
                          data-bs-toggle="collapse"
                          data-bs-target="#accordionOne"
                          aria-expanded="true"
                          aria-controls="accordionOne"
                        >
                          News Categories
                        </button>
                      </h2>

                      <div
                        id="accordionOne"
                        className="accordion-collapse collapse"
                        data-bs-parent="#accordionExample"
                      >
                        <div className="accordion-body">
                          <div className="fpo_data_details_main">
                            <div className="fpo_data_inner">
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
                                    </tr>
                                  </thead>
                                  <tbody className="table-border-bottom-0">
                                    {fpoData?.newsGroups?.map((el, index) => (
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
                                        <td>{el?.memberId?.name}</td>
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
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {fpoData?.newsGroups?.length === 0 && (
                                  <div>
                                    <p className="text-center my-3">
                                      No News Categories found
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* radios */}
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
                          All Radios
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
                            <div className="fpo_data_inner">
                              <div className="table-responsive text-nowrap">
                                <table className="table">
                                  <thead>
                                    <tr>
                                      {/* <th>
                                        <b>S. No.</b>
                                      </th> */}
                                      <th>
                                        <b>Heading</b>
                                      </th>
                                      <th>
                                        <b>Image</b>
                                      </th>
                                      {/* <th>
                                        <b>Recording</b>
                                      </th> */}
                                      <th>
                                        <b>Posted by</b>
                                      </th>
                                      <th>
                                        <b>FPO name</b>
                                      </th>
                                      <th>
                                        <b>Status</b>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="table-border-bottom-0">
                                    {fpoData?.radios?.map((el, index) => (
                                      <tr key={index}>
                                        {/* <td>{index + 1}</td> */}
                                        <td>
                                          {/* <i className="fab fa-angular fa-lg text-danger me-3" /> */}
                                          <Link
                                            to={`/radio/${el._id}`}
                                            //   onClick={() => setshowfigdetails(el)}
                                          >
                                            <span className="fw-medium">
                                              {el.heading}
                                            </span>
                                          </Link>
                                        </td>
                                        <td>
                                          <img
                                            src={`${renderUrl}uploads/radio/${el.image}`}
                                            // width={100}
                                            className="intoggle-table-image"
                                            alt="cat-img"
                                          />
                                        </td>
                                        <td>{el.host}</td>
                                        {/* <td>{el.recording}</td> */}
                                        <td>{el?.fpo?.name}</td>
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
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {fpoData?.radios?.length === 0 && (
                                  <div>
                                    <p className="text-center my-3">
                                      No figs found
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* surveys */}
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
                            <div className="fpo_data_inner">
                              <div className="table-responsive text-nowrap">
                                <table className="table">
                                  <thead>
                                    <tr>
                                      <th>
                                        <b>Title</b>
                                      </th>
                                      <th>
                                        <b>No. of questions</b>
                                      </th>
                                      <th>
                                        <b>Responses</b>
                                      </th>
                                      <th>
                                        <b>FPO responses</b>
                                      </th>
                                      <th>
                                        <b>Status</b>
                                      </th>
                                      <th>
                                        <b>Created By</b>
                                      </th>
                                      <th>
                                        <b>Date</b>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="table-border-bottom-0">
                                    {fpoData?.surveys?.map((el, index) => (
                                      <tr key={index}>
                                        <td>
                                          {/* <i className="fab fa-angular fa-lg text-danger me-3" /> */}
                                          <Link to={`/singlesurvey/${el._id}`}>
                                            <span className="fw-medium">
                                              {el.title}
                                            </span>
                                          </Link>
                                        </td>
                                        <td>{el.questions?.length}</td>
                                        <td>{el.responses}</td>
                                        <td>
                                          {/* <span className="badge bg-label-primary me-1">
                                Active
                              </span> */}

                                          {el.figRes?.length}
                                        </td>
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
                                              &nbsp;
                                              {el.status
                                                ? "active"
                                                : "inactive"}
                                            </span>
                                          </div>
                                        </td>
                                        <td>{el.createdBy?.username}</td>
                                        <td>
                                          {" "}
                                          {moment(el.createdAt).format(
                                            " Do MMMM YYYY "
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {fpoData?.surveys?.length === 0 && (
                                  <div>
                                    <p className="text-center my-3">
                                      No Surveys found
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* privacy policy */}
                    <div className="card accordion-item">
                      <h2 className="accordion-header" id="headingThree">
                        <button
                          type="button"
                          className="accordion-button collapsed"
                          data-bs-toggle="collapse"
                          data-bs-target="#accordionfour"
                          aria-expanded="false"
                          aria-controls="accordionfour"
                        >
                          Privacy Policy
                        </button>
                      </h2>
                      <div
                        id="accordionfour"
                        className="accordion-collapse collapse"
                        aria-labelledby="headingThree"
                        data-bs-parent="#accordionExample"
                      >
                        <div className="accordion-body">
                          <div className="fpo_data_details_main">
                            <div className="fpo_data_inner">
                              <div
                                className="privacy_policy_fpo_details"
                                dangerouslySetInnerHTML={{
                                  __html: privacyPolicy,
                                }}
                              ></div>
                              {(!privacyPolicy || privacyPolicy === "") && (
                                <>
                                  <p className="text-danger">
                                    <b>No Privacy policy Added.</b>
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* about us */}
                    <div className="card accordion-item">
                      <h2 className="accordion-header" id="headingThree">
                        <button
                          type="button"
                          className="accordion-button collapsed"
                          data-bs-toggle="collapse"
                          data-bs-target="#accordionfive"
                          aria-expanded="false"
                          aria-controls="accordionfive"
                        >
                          About us
                        </button>
                      </h2>
                      <div
                        id="accordionfive"
                        className="accordion-collapse collapse"
                        aria-labelledby="headingThree"
                        data-bs-parent="#accordionExample"
                      >
                        <div className="accordion-body">
                          <div className="fpo_data_details_main">
                            <div className="fpo_data_inner">
                              <div
                                className="privacy_policy_fpo_details"
                                dangerouslySetInnerHTML={{
                                  __html: aboutus,
                                }}
                              ></div>
                              {(!aboutus || aboutus === "") && (
                                <>
                                  <p className="text-danger">
                                    <b>No About us details Added.</b>
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* queries */}
                    <div className="card accordion-item">
                      <h2 className="accordion-header" id="headingThree">
                        <button
                          type="button"
                          className="accordion-button collapsed"
                          data-bs-toggle="collapse"
                          data-bs-target="#accordionsix"
                          aria-expanded="false"
                          aria-controls="accordionsix"
                        >
                          Queries
                        </button>
                      </h2>
                      <div
                        id="accordionsix"
                        className="accordion-collapse collapse"
                        aria-labelledby="headingThree"
                        data-bs-parent="#accordionExample"
                      >
                        <div className="accordion-body">
                          <div className="fpo_data_details_main">
                            <div className="fpo_data_inner">
                              <div className="table-responsive text-nowrap">
                                <table className="table">
                                  <thead>
                                    <tr>
                                      <th>
                                        <b>Name</b>
                                      </th>
                                      <th>
                                        <b>Mobile</b>
                                      </th>
                                      <th>
                                        <b>Message</b>
                                      </th>
                                      <th>
                                        <b>FPO</b>
                                      </th>
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
                                    {queries?.map((el, index) => (
                                      <tr key={index}>
                                        <td>
                                          {/* <i className="fab fa-angular fa-lg text-danger me-3" /> */}
                                          {/* <Link to={`/singlesurvey/${el._id}`}> */}
                                          <span className="fw-medium">
                                            {el.name}
                                          </span>
                                          {/* </Link> */}
                                        </td>
                                        <td>{el.phone}</td>
                                        <td>
                                          <div className="d-flex">
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
                                              data-bs-target="#basicModal23456"
                                              onClick={() =>
                                                setselectedquery(el)
                                              }
                                            >
                                              <i className="fa-solid fa-eye"></i>
                                            </button>
                                          </div>
                                        </td>
                                        <td>{el.fpo?.name}</td>
                                        <td>
                                          {" "}
                                          {moment(el.createdAt).format(
                                            " Do MMMM YYYY "
                                          )}
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
                                            {/* <div className="dropdown">
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
                                                        toggleSurveyStatus(
                                                          el._id,
                                                          0
                                                        )
                                                      }
                                                    >
                                                      <i className="fa-solid fa-circle text-success"></i>{" "}
                                                      Resolved
                                                    </a>
                                                    <a
                                                      className="dropdown-item"
                                                      href="javascript:void(0);"
                                                      onClick={() =>
                                                        toggleSurveyStatus(
                                                          el._id,
                                                          2
                                                        )
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
                                                        toggleSurveyStatus(
                                                          el._id,
                                                          1
                                                        )
                                                      }
                                                    >
                                                      <i className="fa-solid fa-circle text-warning"></i>{" "}
                                                      Pending
                                                    </a>
                                                    <a
                                                      className="dropdown-item"
                                                      href="javascript:void(0);"
                                                      onClick={() =>
                                                        toggleSurveyStatus(
                                                          el._id,
                                                          2
                                                        )
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
                                                      toggleSurveyStatus(
                                                        el._id,
                                                        0
                                                      )
                                                    }
                                                  >
                                                    <i className="fa-solid fa-circle text-success"></i>{" "}
                                                    Resolved
                                                  </a>
                                                )}
                                              </div>
                                            </div> */}
                                            {/* )} */}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {queries.length === 0 && (
                                  <div>
                                    <p className="text-center my-3">
                                      No Queries found
                                    </p>
                                  </div>
                                )}
                                <div
                                  className="modal fade"
                                  id="basicModal23456"
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
                                            {moment(
                                              selectedquery?.createdAt
                                            ).format(" Do MMMM YYYY ")}
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
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* //   <!-- Overlay --> */}
        <div className="layout-overlay layout-menu-toggle"></div>
      </div>
      {/* // <!-- / Layout wrapper --> */}
    </div>
  );
};

export default Allfpo;
