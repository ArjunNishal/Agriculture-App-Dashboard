import React, { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { Link } from "react-router-dom";
import { axiosInstance } from "../../config";
import Swal from "sweetalert2";
import Pagination from "../../components/Pagination";
import PermissionHandler from "../../components/PermissionHandler";

const Fpoadmins = () => {
  const token = localStorage.getItem("admin");
  const [admins, setAdmins] = useState([]);
  const [searchvalue, setsearchvalue] = useState("");
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setitemsPerPage] = useState(10);
  const [totalpages, settotalpages] = useState(0);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const fetchAdminList = async () => {
    try {
      // Update the URL to include a query parameter to filter by role
      const response = await axiosInstance.get(
        `admin-log/adminslist?page=${currentPage}&limit=${itemsPerPage}`,
        {
          params: { role: "fpoadmin" },

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      settotalpages(response.data.admins.totalRecord);
      setAdmins(response.data.admins.results);
    } catch (err) {
      console.log(err);
      setError("Error while fetching admin list");
    }
  };

  useEffect(() => {
    fetchAdminList();
  }, []);

  useEffect(() => {
    fetchAdminList();
  }, [currentPage]);

  const handleSearch = async (val) => {
    try {
      const apiUrl = "admin-auth/search";
      const modelName = "Admin";

      const mongodbQuery = {
        $or: [
          { username: { $regex: val, $options: "i" } },
          { email: { $regex: val, $options: "i" } },
          { mobileno: { $regex: val, $options: "i" } },
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
        setAdmins(response.data.data);
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
  // block admin

  const handleBlockUnblock = (adminId, isBlocked) => {
    Swal.fire({
      title: isBlocked ? "Block Admin" : "Unblock Admin",
      text: `Are you sure you want to ${
        isBlocked ? "block" : "unblock"
      } this admin?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        // If confirmed, make the API request to block/unblock the admin
        makeBlockUnblockRequest(adminId, isBlocked);
      }
    });
  };

  const makeBlockUnblockRequest = async (adminId, isBlocked) => {
    try {
      const response = await axiosInstance.put(
        "admin-log/block",
        {
          adminId,
          isBlocked,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedAdmins = admins.map((admin) => {
        if (admin._id === adminId) {
          admin.isBlocked = isBlocked;
        }
        return admin;
      });
      setAdmins(updatedAdmins);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "An error occurred while blocking/unblocking the admin.",
      });
    }
  };
  // edit admin details
  const [editAdmin, setEditAdmin] = useState(null);
  const [editFormData, setEditFormData] = useState({
    username: "",
    email: "",
    password: "",
    permissions: [],
  });

  console.log(editFormData.permissions);

  const openEditModal = (admin) => {
    const lengthofpermssions = admin?.permissions[0].split(",");
    console.log(
      admin?.permissions,
      "admin?.permissions before",
      lengthofpermssions
    );
    setnewsp(false);
    setradiop(false);
    setFIGp(false);
    setsurveyp(false);
    setthemep(false);
    setEditAdmin(admin);
    setEditFormData({
      username: admin.username,
      email: admin.email,
      password: admin.password,
      permissions: admin?.permissions || [],
    });
    if (admin.permissions.includes("surveyp")) {
      setsurveyp(true);
    }
    if (admin.permissions.includes("figp")) {
      setFIGp(true);
    }
    if (admin.permissions.includes("newsp")) {
      setnewsp(true);
    }
    if (admin.permissions.includes("radiop")) {
      setradiop(true);
    }
    if (admin.permissions.includes("themep")) {
      setthemep(true);
    }
    if (!admin.permissions || admin.permissions.length === 0) {
      setsurveyp(false);
      setFIGp(false);
      setnewsp(false);
      setradiop(false);
      setthemep(false);
    }
    // if (admin?.permissions) {
    //   const userp = admin.permissions;
    //   if (userp.includes("")) {
    //     setSurveySection((prevState) => ({
    //       ...prevState,
    //       addNewSurvey: !prevState.addNewSurvey,
    //     }));
    //   }
    // }
  };
  // Function to handle form input changes
  const [showPassword, setShowPassword] = useState(false);
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };
  // Function to submit the form data to the backend
  const submitEditForm = async () => {
    // Show a confirmation dialog using SweetAlert2
    Swal.fire({
      title: "Confirm Update",
      text: "Are you sure you want to update this admin's details?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Update",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Make a request to update admin details
          const response = await axiosInstance.put(
            `admin-log/edit/${editAdmin._id}`,
            editFormData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Update the admin list with the edited admin
          const updatedAdmins = admins.map((admin) =>
            admin._id === editAdmin._id ? response.data.admin : admin
          );

          setAdmins(updatedAdmins);

          // Close the edit modal
          setEditAdmin(null);

          // Show a success message using SweetAlert2
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Admin details updated successfully.",
          });
        } catch (err) {
          console.error(err);

          // Show an error message using SweetAlert2
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "An error occurred while editing the admin details.",
          });
        }
      }
    });
  };

  // permissions
  const [surveyp, setsurveyp] = useState(false);
  const [FIGp, setFIGp] = useState(false);
  const [newsp, setnewsp] = useState(false);
  const [radiop, setradiop] = useState(false);
  const [themep, setthemep] = useState(false);
  // console.log(surveyp);

  // survey check change
  useEffect(() => {
    if (!surveyp) {
      setEditFormData((prevData) => ({
        ...prevData,
        permissions: prevData.permissions.filter(
          (permission) =>
            permission !== "surveyp" &&
            permission !== "addnewsurvey" &&
            permission !== "editsurvey" &&
            permission !== "deactivatesurvey"
        ),
      }));
    }
    if (surveyp && !editFormData.permissions.includes("surveyp")) {
      const surveyPermissions = [
        "surveyp",
        "addnewsurvey",
        "editsurvey",
        "deactivatesurvey",
      ];
      setEditFormData((prevData) => ({
        ...prevData,
        permissions: [
          ...prevData.permissions,
          ...surveyPermissions.filter(
            (permission) => !prevData.permissions.includes(permission)
          ),
        ],
      }));
    }
  }, [surveyp]);

  // radio check change
  useEffect(() => {
    if (!radiop) {
      setEditFormData((prevData) => ({
        ...prevData,
        permissions: prevData.permissions.filter(
          (permission) =>
            permission !== "radiop" &&
            permission !== "addradio" &&
            permission !== "addradiocategory" &&
            permission !== "editradiocategory" &&
            permission !== "editradiodetails" &&
            permission !== "seasonlist" &&
            permission !== "editseasonstatus" &&
            permission !== "editseasondetails" &&
            permission !== "addseason"
        ),
      }));
    } else if (!editFormData.permissions.includes("radiop")) {
      const radioPermissions = [
        "radiop",
        "addradio",
        "addradiocategory",
        "editradiocategory",
        "editradiodetails",
        "seasonlist",
        "editseasonstatus",
        "editseasondetails",
        "addseason",
      ];
      setEditFormData((prevData) => ({
        ...prevData,
        permissions: [
          ...prevData.permissions,
          ...radioPermissions.filter(
            (permission) => !prevData.permissions.includes(permission)
          ),
        ],
      }));
    }
  }, [radiop]);

  // console.log(editFormData.permissions);

  // news check change
  useEffect(() => {
    if (!newsp) {
      setEditFormData((prevData) => ({
        ...prevData,
        permissions: prevData.permissions.filter(
          (permission) =>
            permission !== "newsp" &&
            permission !== "editnewsgrpstatus" &&
            permission !== "editnewsstatus" &&
            permission !== "editnewsgrpreqs"
        ),
      }));
    } else if (!editFormData.permissions.includes("newsp")) {
      const newsPermissions = [
        "newsp",
        "editnewsgrpstatus",
        "editnewsstatus",
        "editnewsgrpreqs",
      ];
      setEditFormData((prevData) => ({
        ...prevData,
        permissions: [
          ...prevData.permissions,
          ...newsPermissions.filter(
            (permission) => !prevData.permissions.includes(permission)
          ),
        ],
      }));
    }
  }, [newsp]);

  // FIG check change
  useEffect(() => {
    if (!FIGp) {
      setEditFormData((prevData) => ({
        ...prevData,
        permissions: prevData.permissions.filter(
          (permission) =>
            permission !== "figp" &&
            permission !== "editfigstatus" &&
            permission !== "editfigleaderstatus" &&
            permission !== "figleaderreqs" &&
            permission !== "members" &&
            permission !== "contentcreators" &&
            permission !== "leadercumcreator"
        ),
      }));
    } else if (!editFormData.permissions.includes("figp")) {
      const figPermissions = [
        "figp",
        "editfigstatus",
        "editfigleaderstatus",
        "figleaderreqs",
        "members",
        "contentcreators",
        "leadercumcreator",
      ];
      setEditFormData((prevData) => ({
        ...prevData,
        permissions: [
          ...prevData.permissions,
          ...figPermissions.filter(
            (permission) => !prevData.permissions.includes(permission)
          ),
        ],
      }));
    }
  }, [FIGp]);

  useEffect(() => {
    if (!themep) {
      setEditFormData((prevData) => ({
        ...prevData,
        permissions: prevData.permissions.filter(
          (permission) =>
            permission !== "logo" &&
            permission !== "iconscolor" &&
            permission !== "themecolor" &&
            permission !== "language" &&
            permission !== "banners" &&
            permission !== "support" &&
            permission !== "themep" &&
            permission !== "backgroundcolor" &&
            permission !== "sectioncolor"
        ),
      }));
    } else if (!editFormData.permissions.includes("themep")) {
      const themePermissions = [
        "logo",
        "iconscolor",
        "themecolor",
        "language",
        "banners",
        "support",
        "themep",
        "backgroundcolor",
        "sectioncolor",
      ];
      setEditFormData((prevData) => ({
        ...prevData,
        permissions: [
          ...prevData.permissions,
          ...themePermissions.filter(
            (permission) => !prevData.permissions.includes(permission)
          ),
        ],
      }));
    }
  }, [themep]);

  const handleoptionsp = (e) => {
    console.log(e.target.name, e.target.checked);
    if (
      e.target.checked === true &&
      !editFormData.permissions.includes(`${e.target.name}`)
    ) {
      setEditFormData((prevData) => ({
        ...prevData,
        permissions: [...prevData.permissions, e.target.name],
      }));
    } else if (
      e.target.checked === false &&
      editFormData.permissions.includes(`${e.target.name}`)
    ) {
      setEditFormData((prevData) => ({
        ...prevData,
        permissions: prevData.permissions.filter(
          (permission) => permission !== e.target.name
        ),
      }));
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
              <div className="container-xxl flex-grow-1 container-p-y">
                <h4 className="py-3 mb-4">
                  <span className="text-muted fw-light">FPO admins /</span>{" "}
                  Admins list
                </h4>
                {/* Basic Bootstrap Table */}
                <div className="card">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-header">Admins</h5>
                    <div className="d-flex align-items-center gap-3">
                      <div className="nav-item d-flex align-items-center border px-2 rounded">
                        <i className="bx bx-search fs-4 lh-0"></i>
                        <input
                          type="text"
                          className="form-control border-0 shadow-none ps-1 ps-sm-2"
                          placeholder="Search..."
                          aria-label="Search..."
                          onChange={(e) => handlesearchevent(e)}
                        />
                      </div>
                      <Link to="/addfpo" className="btn btn-primary me-2">
                        <i className="fa-solid fa-plus"></i>&nbsp;Add FPO Admin
                      </Link>
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
                  <div>
                    <div className="table-responsive text-nowrap">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>
                              <b>S.No.</b>
                            </th>
                            <th>
                              <b>Admin</b>
                            </th>
                            <th>
                              <b>Email</b>
                            </th>
                            <th>
                              <b>Mobile</b>
                            </th>
                            <th>
                              <b>FPO name</b>
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
                          {admins.map((el, index) => (
                            <tr
                              className={el.isBlocked ? "table-danger" : ""}
                              key={index}
                            >
                              <td>
                                {currentPage === 1 ? (
                                  <>{index + 1}</>
                                ) : (
                                  <>{index + 1 + (currentPage - 1) * 10}</>
                                )}
                              </td>
                              <td>
                                {/* <i className="fab fa-angular fa-lg text-danger me-3" /> */}
                                <span className="fw-medium">{el.username}</span>
                              </td>
                              <td>{el.email}</td>
                              <td>
                                {/* <ul className="list-unstyled users-list m-0 avatar-group d-flex align-items-center">
                                <li
                                  data-bs-toggle="tooltip"
                                  data-popup="tooltip-custom"
                                  data-bs-placement="top"
                                  className="avatar avatar-xs pull-up"
                                  title="Lilian Fuller"
                                >
                                  <img
                                    src="../assets/img/avatars/5.png"
                                    alt="Avatar"
                                    className="rounded-circle"
                                  />
                                </li>
                                <li
                                  data-bs-toggle="tooltip"
                                  data-popup="tooltip-custom"
                                  data-bs-placement="top"
                                  className="avatar avatar-xs pull-up"
                                  title="Sophia Wilkerson"
                                >
                                  <img
                                    src="../assets/img/avatars/6.png"
                                    alt="Avatar"
                                    className="rounded-circle"
                                  />
                                </li>
                                <li
                                  data-bs-toggle="tooltip"
                                  data-popup="tooltip-custom"
                                  data-bs-placement="top"
                                  className="avatar avatar-xs pull-up"
                                  title="Christina Parker"
                                >
                                  <img
                                    src="../assets/img/avatars/7.png"
                                    alt="Avatar"
                                    className="rounded-circle"
                                  />
                                </li>
                              </ul> */}
                                {el.mobileno}
                              </td>
                              <td>
                                {el?.fpo?.name ? (
                                  <Link to={`/singlefpo/${el?.fpo?._id}`}>
                                    <span className="fw-medium">
                                      {el?.fpo?.name}
                                    </span>
                                  </Link>
                                ) : (
                                  "N/A"
                                )}{" "}
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
                                    &nbsp;&nbsp;
                                    {el.isBlocked ? "Blocked" : "Active"}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  {el.isBlocked ? (
                                    <button
                                      className="btn btn-sm btn-outline-success "
                                      onClick={() =>
                                        handleBlockUnblock(el._id, false)
                                      }
                                    >
                                      <i className="bx bxs-check-shield" />{" "}
                                      Unblock
                                    </button>
                                  ) : (
                                    <button
                                      className="btn btn-sm btn-outline-danger "
                                      onClick={() =>
                                        handleBlockUnblock(el._id, true)
                                      }
                                    >
                                      <i className="bx bx-block " /> Block
                                    </button>
                                  )}
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
                      {admins.length === 0 && (
                        <>
                          <p className="text-center">No FPO admins found</p>
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
                </div>

                {/* Modal */}
                <div
                  className="modal fade"
                  id="modalCenter"
                  tabindex="-1"
                  aria-hidden="true"
                >
                  <div
                    className="modal-dialog modal-dialog-centered modal-lg"
                    role="document"
                  >
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title" id="largeModal">
                          Edit Admin details
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                          onClick={() => setEditAdmin(null)}
                        ></button>
                      </div>
                      <div className="modal-body">
                        <form>
                          <div className="row">
                            <div className="col mb-3">
                              <label for="nameWithTitle" className="form-label">
                                Name
                              </label>
                              <input
                                type="text"
                                id="nameWithTitle"
                                name="username"
                                className="form-control"
                                placeholder="Enter Name"
                                value={editFormData.username}
                                onChange={handleEditFormChange}
                              />
                            </div>
                            <div className="col mb-0">
                              <label
                                for="emailWithTitle"
                                className="form-label"
                              >
                                Email
                              </label>
                              <input
                                type="email"
                                id="emailWithTitle"
                                name="email"
                                className="form-control"
                                placeholder="xxxx@xxx.xx"
                                value={editFormData.email}
                                onChange={handleEditFormChange}
                              />
                            </div>
                            <div className="col mb-0 form-password-toggle">
                              <label className="form-label" htmlFor="password">
                                Password <span className="text-danger">*</span>
                              </label>
                              <div className="input-group input-group-merge">
                                <input
                                  type={showPassword ? "text" : "password"}
                                  id="password"
                                  className="form-control"
                                  name="password"
                                  value={editFormData.password}
                                  onChange={handleEditFormChange}
                                  placeholder="Enter password"
                                  aria-describedby="password"
                                  required
                                  autocomplete="off"
                                />
                                <span
                                  className="input-group-text cursor-pointer"
                                  onClick={handleTogglePassword}
                                >
                                  <i
                                    className={`bx ${
                                      showPassword ? "bx-show" : "bx-hide"
                                    }`}
                                  />
                                </span>
                              </div>
                            </div>
                            <div className="mb-3 col-12">
                              <hr />
                              <h5>Permissions</h5>
                              <div className="row justify-content-center">
                                {/* survey */}
                                <div className="col-md-4 col-12">
                                  <div className="mb-2 border shadow rounded p-3">
                                    <div className="privilege-name">
                                      <div className="form-check form-switch">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          role="switch"
                                          checked={surveyp}
                                          id="flexSwitchCheckDefault"
                                          onChange={() => setsurveyp(!surveyp)}
                                        />
                                        <label
                                          className="form-check-label"
                                          htmlFor="flexSwitchCheckDefault"
                                        >
                                          <b>
                                            {" "}
                                            <i className="fa-solid fa-square-poll-vertical"></i>{" "}
                                            Survey{" "}
                                          </b>
                                        </label>
                                      </div>
                                      <hr />
                                    </div>
                                    <div className="row">
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              disabled={surveyp ? false : true}
                                              id="flexCheckDefault1"
                                              name="addnewsurvey"
                                              checked={editFormData.permissions.includes(
                                                "addnewsurvey"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />

                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefault1"
                                            >
                                              Add new survey
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              disabled={surveyp ? false : true}
                                              id="flexCheckDefault2"
                                              name="editsurvey"
                                              checked={editFormData.permissions.includes(
                                                "editsurvey"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />

                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefault2"
                                            >
                                              Edit survey
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              name="deactivatesurvey"
                                              disabled={surveyp ? false : true}
                                              id="flexCheckDefault3"
                                              checked={editFormData.permissions.includes(
                                                "deactivatesurvey"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />

                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefault3"
                                            >
                                              Deactivate Survey
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {/* fig */}
                                <div className="col-md-4 col-12">
                                  <div className="mb-2 border shadow rounded p-3">
                                    <div className="privilege-name">
                                      <div className="form-check form-switch">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          role="switch"
                                          checked={FIGp}
                                          id="flexSwitchCheckDefault2"
                                          onChange={() => setFIGp(!FIGp)}
                                        />
                                        <label
                                          className="form-check-label"
                                          htmlFor="flexSwitchCheckDefault2"
                                        >
                                          <b>
                                            {" "}
                                            <i className="fa-solid fa-code-branch"></i>{" "}
                                            Users{" "}
                                          </b>
                                        </label>
                                      </div>
                                      <hr />
                                    </div>
                                    <div className="row">
                                      {/* <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              disabled={FIGp ? false : true}
                                              name="editfigstatus"
                                              id="flexCheckDefault4"
                                              checked={editFormData.permissions.includes(
                                                "editfigstatus"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />

                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefault4"
                                            >
                                              Edit FIG status
                                            </label>
                                          </div>
                                        </div>
                                      </div> */}
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              disabled={FIGp ? false : true}
                                              id="flexCheckDefault5"
                                              name="editfigleaderstatus"
                                              checked={editFormData.permissions.includes(
                                                "editfigleaderstatus"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />

                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefault5"
                                            >
                                              Edit FPO leader status
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              disabled={FIGp ? false : true}
                                              id="flexCheckDefault6"
                                              name="figleaderreqs"
                                              checked={editFormData.permissions.includes(
                                                "figleaderreqs"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />

                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefault6"
                                            >
                                              FPO leader requests
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      {/*  members: false,
    contentcreators: false,
    leadercumcreator: false, */}
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              disabled={FIGp ? false : true}
                                              id="flexCheckDefault613"
                                              name="members"
                                              checked={editFormData.permissions.includes(
                                                "members"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />

                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefault6"
                                            >
                                              Members
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      {/*  members: false,
    contentcreators: false,
    leadercumcreator: false, */}
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              disabled={FIGp ? false : true}
                                              id="flexCheckDefault613"
                                              name="contentcreators"
                                              checked={editFormData.permissions.includes(
                                                "contentcreators"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />

                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefault6"
                                            >
                                              Content Creators
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      {/*  members: false,
    contentcreators: false,
    leadercumcreator: false, */}
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              disabled={FIGp ? false : true}
                                              id="flexCheckDefault613"
                                              name="leadercumcreator"
                                              checked={editFormData.permissions.includes(
                                                "leadercumcreator"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />

                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefault6"
                                            >
                                              Leader cum Creator
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {/* News */}
                                <div className="col-md-4 col-12">
                                  <div className="mb-2 border shadow rounded p-3">
                                    <div className="privilege-name">
                                      <div className="form-check form-switch">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          role="switch"
                                          checked={newsp}
                                          id="flexSwitchCheckDefault3"
                                          onChange={() => setnewsp(!newsp)}
                                        />
                                        <label
                                          className="form-check-label"
                                          htmlFor="flexSwitchCheckDefault3"
                                        >
                                          <b>
                                            <i className="fa-solid fa-newspaper"></i>{" "}
                                            News{" "}
                                          </b>
                                        </label>
                                      </div>
                                      <hr />
                                    </div>
                                    <div className="row">
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              name="editnewsgrpstatus"
                                              disabled={newsp ? false : true}
                                              id="flexCheckDefault"
                                              checked={editFormData.permissions.includes(
                                                "editnewsgrpstatus"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />

                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefault"
                                            >
                                              Edit news group status
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              disabled={newsp ? false : true}
                                              id="flexCheckDefault7"
                                              name="editnewsstatus"
                                              checked={editFormData.permissions.includes(
                                                "editnewsstatus"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />

                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefault7"
                                            >
                                              Edit News status
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              name="editnewsgrpreqs"
                                              disabled={newsp ? false : true}
                                              id="flexCheckDefault8"
                                              checked={editFormData.permissions.includes(
                                                "editnewsgrpreqs"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />
                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefault8"
                                            >
                                              Edit news group requests
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {/* radio */}
                                <div className="col-md-4 col-12">
                                  <div className="mb-2 border shadow rounded p-3">
                                    <div className="privilege-name">
                                      <div className="form-check form-switch">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          role="switch"
                                          id="flexSwitchCheckDefault4"
                                          checked={radiop}
                                          onChange={() => {
                                            setradiop(!radiop);
                                          }}
                                        />
                                        <label
                                          className="form-check-label"
                                          htmlFor="flexSwitchCheckDefault4"
                                        >
                                          <b>
                                            <i className="fa-solid fa-radio"></i>{" "}
                                            Radio
                                          </b>
                                        </label>
                                      </div>
                                      <hr />
                                    </div>
                                    <div className="row">
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              disabled={radiop ? false : true}
                                              id="flexCheckDefault9"
                                              name="addradio"
                                              checked={editFormData.permissions.includes(
                                                "addradio"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />

                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefault9"
                                            >
                                              Add new radio
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              name="addradiocategory"
                                              disabled={radiop ? false : true}
                                              id="flexCheckDefault10"
                                              checked={editFormData.permissions.includes(
                                                "addradiocategory"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />

                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefault10"
                                            >
                                              Add new radio category
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              disabled={radiop ? false : true}
                                              id="flexCheckDefault11"
                                              name="editradiocategory"
                                              checked={editFormData.permissions.includes(
                                                "editradiocategory"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />

                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefault11"
                                            >
                                              Edit radio category
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              disabled={radiop ? false : true}
                                              id="flexCheckDefault12"
                                              name="editradiodetails"
                                              checked={editFormData.permissions.includes(
                                                "editradiodetails"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />

                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefault12"
                                            >
                                              Edit radio status & details
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              disabled={radiop ? false : true}
                                              id="flexCheckDefault9"
                                              name="seasonlist"
                                              checked={editFormData.permissions.includes(
                                                "seasonlist"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />

                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefault9"
                                            >
                                              Season list
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              disabled={radiop ? false : true}
                                              id="flexCheckDefault9"
                                              name="editseasonstatus"
                                              checked={editFormData.permissions.includes(
                                                "editseasonstatus"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />

                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefault9"
                                            >
                                              Edit season status
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              disabled={radiop ? false : true}
                                              id="flexCheckDefault9"
                                              name="editseasondetails"
                                              checked={editFormData.permissions.includes(
                                                "editseasondetails"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />

                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefault9"
                                            >
                                              Edit season details
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              disabled={radiop ? false : true}
                                              id="flexCheckDefault9"
                                              name="addseason"
                                              checked={editFormData.permissions.includes(
                                                "addseason"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />

                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefault9"
                                            >
                                              Add season
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {/* themes */}
                                <div className="col-md-4 col-12">
                                  <div className="mb-2 border h-100 shadow rounded p-3">
                                    <div className="privilege-name">
                                      <div className="form-check form-switch">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          role="switch"
                                          disabled
                                          id="flexSwitchCheckDefault55"
                                          checked={themep}
                                          onChange={() => {
                                            setthemep(!themep);
                                          }}
                                        />
                                        <label
                                          className="form-check-label"
                                          htmlFor="flexSwitchCheckDefault55"
                                        >
                                          <b>
                                            <i className="fa-solid fa-palette"></i>{" "}
                                            Theme Settings
                                          </b>
                                        </label>
                                      </div>
                                      <hr />
                                    </div>
                                    <div className="row">
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              // disabled={themep ? false : true}
                                              disabled
                                              id="flexCheckDefault13"
                                              name="logo"
                                              checked={editFormData.permissions.includes(
                                                "logo"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />
                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefaul13"
                                            >
                                              Logo
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              // disabled={themep ? false : true}
                                              disabled
                                              id="flexCheckDefault13"
                                              name="iconscolor"
                                              checked={editFormData.permissions.includes(
                                                "iconscolor"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />
                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefaul13"
                                            >
                                              Icons color
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              // disabled={themep ? false : true}
                                              disabled
                                              id="flexCheckDefault44"
                                              name="backgroundcolor"
                                              checked={editFormData.permissions.includes(
                                                "backgroundcolor"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />
                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefaul44"
                                            >
                                              Background Colors
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              // disabled={themep ? false : true}
                                              disabled
                                              id="flexCheckDefault13"
                                              name="themecolor"
                                              checked={editFormData.permissions.includes(
                                                "themecolor"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />
                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefaul13"
                                            >
                                              Theme colors
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              // disabled={themep ? false : true}
                                              disabled
                                              id="flexCheckDefault45"
                                              name="sectioncolor"
                                              checked={editFormData.permissions.includes(
                                                "sectioncolor"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />
                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefaul45"
                                            >
                                              Section color
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              // disabled={themep ? false : true}
                                              disabled
                                              id="flexCheckDefault13"
                                              name="language"
                                              checked={editFormData.permissions.includes(
                                                "language"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />
                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefaul13"
                                            >
                                              Language
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              // disabled={themep ? false : true}
                                              disabled
                                              id="flexCheckDefault13"
                                              name="banners"
                                              checked={editFormData.permissions.includes(
                                                "banners"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />
                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefaul13"
                                            >
                                              Banners
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-12">
                                        <div className="privileges-opts">
                                          <div className="form-check">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              // disabled={themep ? false : true}
                                              disabled
                                              id="flexCheckDefault13"
                                              name="support"
                                              checked={editFormData.permissions.includes(
                                                "support"
                                              )}
                                              onChange={(e) => {
                                                handleoptionsp(e);
                                              }}
                                            />

                                            <label
                                              className="form-check-label"
                                              for="flexCheckDefaul13"
                                            >
                                              Support
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          data-bs-dismiss="modal"
                          onClick={() => setEditAdmin(null)}
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          data-bs-dismiss="modal"
                          className="btn btn-primary"
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
          </div>
        </div>
      </div>
    </div>
  );
};
export default Fpoadmins;
