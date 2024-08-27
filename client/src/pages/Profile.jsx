import React, { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import Topbar from "../components/Topbar";
import jwtDecode from "jwt-decode";
import { axiosInstance, renderUrl2 } from "../config";
import Swal from "sweetalert2";
import { closemodalimg } from "../js/intjava";
import { renderUrl } from "../config";
import PermissionHandler from "../components/PermissionHandler";

const Profile = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const fileInputRef = React.useRef(null);
  const id = decoded.id;
  const [admin, setadmin] = useState({});
  const [formData, setFormData] = useState({});
  const [oldpass, setoldpass] = useState("");
  const [email, setemail] = useState("");
  const [loading, setLoading] = useState(false);
  const [newpass, setnewpass] = useState("");
  const [confirmpass, setconfirmpass] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [oldpassmatch, setoldpassmatch] = useState(true);
  const [emailsent, setEmailsent] = useState(false);
  const [message, setMessage] = useState("");
  const [showtab, setshowtab] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Set the image file in state
      setImageFile(file);

      // Create a preview URL for the selected image
      const previewURL = URL.createObjectURL(file);
      setImagePreview(previewURL);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setImageUploaded(false);

    try {
      const formData = new FormData();
      formData.append("profile", imageFile);

      // Make a POST request to your backend API with the image data
      const response = await axiosInstance.post(
        `admin-log/upload-image/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if the request was successful
      if (response.status === 200) {
        closemodalimg();
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Profile image saved successfully",
        });
        fetchAdminById();
        setImageFile("");
        setImagePreview("");
        setImageUploaded(true);
        fileInputRef.current.value = "";
        console.log("Profile image updated successfully");
      }
    } catch (error) {
      closemodalimg();
      setImageFile("");
      setImagePreview("");
      fileInputRef.current.value = "";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error saving Profile image",
      });
      console.error("Error updating profile image:", error.message);
    }
  };
  //

  const fetchAdminById = async (adminId) => {
    try {
      const response = await axiosInstance.get(`admin-log/adminbyid/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        console.log(response.data.admin, response);
        setadmin(response.data.admin);
        setFormData(response.data.admin);
      }
    } catch (error) {
      console.error("Error fetching admin:", error.message);
    }
  };

  useEffect(() => {
    fetchAdminById();
  }, []);

  const [isValidEmail, setIsValidEmail] = useState(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "email") {
      const atIndex = value.indexOf("@");
      const dotIndex = value.lastIndexOf(".");

      const isEmailValid =
        atIndex !== -1 &&
        dotIndex !== -1 &&
        dotIndex > atIndex + 1 &&
        /[a-zA-Z]{2,}$/.test(value.substring(dotIndex + 1));

      setIsValidEmail(isEmailValid);

      if (value === "") {
        setIsValidEmail(true);
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const [isvalidmobile, setisvalidmobile] = useState(true);

  const handleChangemob = (e) => {
    let inputMobileNo = e.target.value;
    setisvalidmobile(true);
    if (inputMobileNo.length > 10) {
      inputMobileNo = inputMobileNo.slice(0, 10);
      // setisvalidmobile(false);
    }

    setFormData({
      ...formData,
      [e.target.name]: inputMobileNo,
    });
  };
  const [imageUploaded, setImageUploaded] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setImageUploaded(false);
    try {
      if (!isValidEmail) {
        Swal.fire({
          icon: "error",
          title: "Enter a valid email address.",
        });
        return setIsValidEmail(false);
      }
      if (formData.mobileno.length !== 10) {
        Swal.fire({
          icon: "error",
          title: "Enter a 10 digit mobile number.",
        });
        return setisvalidmobile(false);
      }
      const response = await axiosInstance.put(
        `admin-log/edit-profile/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if the request was successful
      if (response.status === 200) {
        console.log("Profile updated successfully");
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Profile details saved successfully",
        });
        fetchAdminById();
        setImageUploaded(true);
      }
    } catch (error) {
      console.error("Error updating profile:", error.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error saving Profile details",
      });
    }
  };

  const handlepassmatch = (e) => {
    if (e.target.name === "newpass") {
      if (e.target.value === confirmpass) {
        setPasswordsMatch(true);
      } else {
        setPasswordsMatch(false);
      }
    }
    if (e.target.name === "confirmpass") {
      if (e.target.value === newpass) {
        setPasswordsMatch(true);
      } else {
        setPasswordsMatch(false);
      }
    }
  };

  const handleSubmitresetpass = async (e) => {
    e.preventDefault();

    // Check if the old password matches the admin password
    if (oldpass !== admin.password) {
      return setoldpassmatch(false);
    }

    try {
      // Make a PUT request to your backend API with the new password
      const response = await axiosInstance.put(
        `admin-log/resetpassword/${id}/${token}`,
        {
          password: newpass,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if the request was successful
      if (response.status === 200) {
        console.log("Password changed successfully");
        Swal.fire({
          icon: "success",
          title: "Password reset successfully.",
        });
        setnewpass("");
        setconfirmpass("");
        setoldpass("");
        fetchAdminById();
      }
    } catch (error) {
      console.error("Error changing password:", error.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error saving Profile details",
      });
    }
  };

  const forgotpass = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (email !== admin.email) {
        setLoading(false);
        return Swal.fire({
          icon: "error",
          title: "Error",
          text: "Email is incorrect",
        });
      }
      const res = await axiosInstance.post(
        "admin-log/resetpassword",
        {
          email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res, "res");
      if (res.status === 200) {
        setMessage(
          `Reset your password using the link shared on your mail i.e., ${email}`
        );
        setEmailsent(true);
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 404) {
        // setMessage(error.response.data.msg);
        setMessage(`Error sending email to ${email}`);
      } else {
        // setMessage(error.response.data.msg);
        setMessage(`Error sending email to ${email}`);
      }
    }
    setLoading(false);
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
            <Topbar imageUploaded={imageUploaded} />

            {/* <!-- / Layout page --> */}
            <div className="content-wrapper">
              {/* Content */}
              {/* {!showfpodetails && ( */}
              <div className="container-xxl flex-grow-1 container-p-y">
                <div className="my_profile_main">
                  <div className="profile_top card mb-3">
                    <div className="profile_cover">
                      <div className="cover_img_profile">
                        <img
                          src="/assets/img/backgrounds/profile-banner.png"
                          alt="img"
                        />
                      </div>
                      <div className="profile_basic_d">
                        <div className="row mx-0">
                          <div className="col-md-2 col-12 profile_pic_main ">
                            <div className="profile_pic w-100 d-flex  justify-content-center align-items-center">
                              <div className="d-flex profile_pic_inner w-100 justify-content-center align-items-center">
                                <img
                                  src={
                                    admin?.image &&
                                    decoded.role === "superadmin"
                                      ? `${renderUrl2}${admin?.image}`
                                      : admin?.image &&
                                        decoded.role === "fpoadmin"
                                      ? `${renderUrl2}${admin?.image}`
                                      : "/assets/img/avatars/1.png"
                                  }
                                  className="p-1 rounded"
                                  alt="profile"
                                  onError={(e) => {
                                    e.target.src = "/assets/img/avatars/1.png"; // Set a default image if the specified image fails to load
                                  }}
                                />
                                {decoded.role === "fpoadmin" ? (
                                  <></>
                                ) : (
                                  <>
                                    <div
                                      data-bs-toggle="modal"
                                      data-bs-target="#basicModal123"
                                      className="text-center profile_pic_inner_icon btn btn-outline-primary btn-sm  p-1"
                                    >
                                      <i className="bx bxs-pencil "></i>
                                    </div>
                                  </>
                                )}

                                <div
                                  className="modal fade"
                                  id="basicModal123"
                                  tabindex="-1"
                                  aria-hidden="true"
                                >
                                  <div className="modal-dialog" role="document">
                                    <div className="modal-content">
                                      <div className="modal-header">
                                        <h5
                                          className="modal-title"
                                          id="exampleModalLabel1"
                                        >
                                          Change profile pic
                                        </h5>
                                        <button
                                          type="button"
                                          className="btn-close"
                                          data-bs-dismiss="modal"
                                          aria-label="Close"
                                          id="closebtn_profile_img"
                                        ></button>
                                      </div>
                                      <div className="modal-body">
                                        <form onSubmit={handleSaveChanges}>
                                          <div className="row">
                                            <div className="col-12 mb-3">
                                              <label
                                                for="nameBasic"
                                                className="form-label"
                                              >
                                                Choose image{" "}
                                                <span className="text-danger">
                                                  *
                                                </span>
                                              </label>
                                              <input
                                                type="file"
                                                id="nameBasic"
                                                className="form-control"
                                                onChange={handleFileChange}
                                                placeholder="Enter Name"
                                                required
                                                ref={fileInputRef}
                                              />
                                            </div>
                                            {imagePreview && (
                                              <div className="col-12 border rounded text-center mb-3">
                                                <p>
                                                  <b>Selected Image</b>
                                                </p>
                                                <img
                                                  src={imagePreview}
                                                  alt="Selected Preview"
                                                  style={{
                                                    maxWidth: "100%",
                                                  }}
                                                />
                                              </div>
                                            )}
                                            <div className="col-12 text-center">
                                              <button
                                                type="submit"
                                                className="btn btn-primary"
                                              >
                                                Upload
                                              </button>
                                            </div>
                                          </div>
                                        </form>
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
                          <div className="col-md-10 col-12 mt-md-0 profile_short_d">
                            <h4 className="text-md-start text-center">
                              {admin.username}
                            </h4>

                            <div className="d-flex justify-content-md-start align-items-center justify-content-center">
                              <p>
                                <i className="bx bx-pen"></i>
                                &nbsp;
                                {admin?.role === "superadmin"
                                  ? "Super Admin"
                                  : admin.role === "fpoadmin"
                                  ? "FPO admin"
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {showtab === "editprofile" ? (
                    <>
                      {" "}
                      {/* edit profile */}
                      <div className="card mb-3">
                        <div className="card-body">
                          <h4>Edit Profile Details</h4>
                          <hr />
                          <form
                            onSubmit={handleSubmit}
                            id="formAccountSettings"
                          >
                            <div className="row">
                              <div className="mb-3 col-md-6">
                                <label htmlFor="name" className="form-label">
                                  FPO Name{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <input
                                  className="form-control"
                                  type="text"
                                  name="username"
                                  value={formData.username}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="mb-3 col-md-6">
                                <label
                                  htmlFor="promoter"
                                  className="form-label"
                                >
                                  Email <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="email"
                                  className={`form-control ${
                                    isValidEmail ? "" : "is-invalid"
                                  }`}
                                  name="email"
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  required
                                />
                                <div className="invalid-feedback">
                                  Please enter a valid email address.
                                </div>
                              </div>
                              <div className="mb-3 col-md-6">
                                <label
                                  htmlFor="sharePerMember"
                                  className="form-label"
                                >
                                  Mobile <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="number"
                                  className={`form-control ${
                                    isvalidmobile ? "" : "is-invalid"
                                  }`}
                                  name="mobileno"
                                  value={formData.mobileno}
                                  onChange={handleChangemob}
                                  required
                                />
                                <div className="invalid-feedback">
                                  Please enter a 10 digit mobile number.
                                </div>
                              </div>
                            </div>
                            <div className="mt-2">
                              <button
                                type="submit"
                                className="btn btn-primary me-2"
                              >
                                Save changes
                              </button>
                              <button
                                type="submit"
                                onClick={() => setshowtab("")}
                                className="btn btn-outline-secondary me-2"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </>
                  ) : showtab === "changepassword" ? (
                    <>
                      {/* reset pass */}
                      <div className="card mb-3">
                        <div className="card-body">
                          <h4>Change Password</h4>
                          <div className="text-end">
                            <button
                              type="submit"
                              onClick={() => {
                                setemail(admin.email);
                                setshowtab("forgotpass");
                              }}
                              className="btn btn-outline-primary mt-2"
                            >
                              Forgot password ?
                            </button>
                          </div>
                          <hr />
                          <form
                            onSubmit={handleSubmitresetpass}
                            id="formAccountSettings"
                          >
                            <div className="row">
                              <div className={`mb-3 col-12`}>
                                <label htmlFor="name" className="form-label">
                                  Old Password
                                </label>
                                <input
                                  className={`form-control ${
                                    oldpassmatch ? "" : "is-invalid"
                                  }`}
                                  type="password"
                                  name="oldpass"
                                  value={oldpass}
                                  onChange={(e) => {
                                    setoldpass(e.target.value);
                                    setoldpassmatch(true);
                                  }}
                                />
                                {!oldpassmatch && (
                                  <div
                                    id="validationServerUsernameFeedback"
                                    className="invalid-feedback"
                                  >
                                    Password incorrect
                                  </div>
                                )}
                              </div>
                              <div className={`mb-3 col-12 `}>
                                <label
                                  htmlFor="promoter"
                                  className="form-label"
                                >
                                  New Password
                                </label>
                                <input
                                  type="password"
                                  className={`form-control ${
                                    confirmpass !== "" &&
                                    newpass !== "" &&
                                    passwordsMatch
                                      ? "is-valid"
                                      : confirmpass === "" && newpass === ""
                                      ? ""
                                      : "is-invalid"
                                  }`}
                                  name="newpass"
                                  value={newpass}
                                  onChange={(e) => {
                                    setnewpass(e.target.value);
                                    handlepassmatch(e);
                                  }}
                                />
                              </div>
                              <div className={`mb-3 col-12`}>
                                <label
                                  htmlFor="sharePerMember"
                                  className="form-label"
                                >
                                  Confirm New Password
                                </label>
                                <input
                                  type="password"
                                  className={`form-control ${
                                    confirmpass !== "" &&
                                    newpass !== "" &&
                                    passwordsMatch
                                      ? "is-valid"
                                      : confirmpass === "" && newpass === ""
                                      ? ""
                                      : "is-invalid"
                                  }`}
                                  name="confirmpass"
                                  value={confirmpass}
                                  onChange={(e) => {
                                    setconfirmpass(e.target.value);
                                    handlepassmatch(e);
                                  }}
                                />
                              </div>
                            </div>
                            <div className="mt-2">
                              <button
                                type="submit"
                                disabled={
                                  passwordsMatch &&
                                  newpass !== "" &&
                                  oldpass !== "" &&
                                  confirmpass !== ""
                                    ? false
                                    : true
                                }
                                className="btn btn-primary me-2"
                              >
                                Save changes
                              </button>
                              <button
                                type="submit"
                                onClick={() => setshowtab("")}
                                className="btn btn-outline-secondary me-2"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </>
                  ) : showtab === "forgotpass" ? (
                    <>
                      {" "}
                      {/* forgot password */}
                      <div className="card mb-3">
                        <div className="card-body">
                          <h4>Forgot password</h4>
                          <hr />
                          <form onSubmit={forgotpass} id="formAccountSettings">
                            {loading ? (
                              <div>
                                <div className="d-flex justify-content-center">
                                  <div
                                    className="spinner-border text-success"
                                    role="status"
                                  >
                                    <span className="visually-hidden">
                                      Loading...
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <p>Sending Reset Link</p>
                                </div>
                              </div>
                            ) : (
                              <div className="row">
                                <div className={`mb-3 col-12`}>
                                  <label htmlFor="name" className="form-label">
                                    Email
                                  </label>
                                  <input
                                    className="form-control"
                                    type="email"
                                    name="email"
                                    value={email}
                                    disabled
                                    onChange={(e) => {
                                      setemail(e.target.value);
                                    }}
                                  />
                                </div>
                                <p>
                                  We"ll send you a link to reset your password
                                  on your email.
                                </p>
                              </div>
                            )}
                            <div className="mt-2">
                              {message && (
                                <div className="text-center">{message}</div>
                              )}
                              {emailsent ? (
                                <div className=" d-flex flex-column align-items-center mt-3">
                                  <p>
                                    If you did'nt get an Email, resend Link{" "}
                                  </p>
                                  <div className="d-flex justify-content-center gap-2 align-items-center">
                                    {" "}
                                    <button
                                      className="btn btn-danger "
                                      type="submit"
                                    >
                                      Resend
                                    </button>
                                    <button
                                      type="submit"
                                      onClick={() => setshowtab("")}
                                      className="btn btn-outline-secondary me-2"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className=" text-center">
                                  <button
                                    className="btn btn-danger me-2"
                                    type="submit"
                                  >
                                    Send Email
                                  </button>
                                  <button
                                    type="submit"
                                    onClick={() => setshowtab("")}
                                    className="btn btn-outline-secondary me-2"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          </form>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="card settings_card p-2 mb-3">
                      <div className="card-body">
                        .
                        <div className="row">
                          <div className="col-md-4 col-12">
                            <small className="text-muted text-uppercase">
                              About
                            </small>
                            <ul className="list-unstyled mb-4 mt-3">
                              <li className="d-flex align-items-center mb-3">
                                <i className="bx bx-check"></i>
                                <span className="fw-medium mx-2">
                                  Status:
                                </span>{" "}
                                <span>
                                  <div className="d-flex align-items-center ">
                                    {" "}
                                    <span
                                      className={`badge  me-1 ${
                                        admin.isBlocked
                                          ? "bg-label-danger"
                                          : "bg-label-primary"
                                      }`}
                                    >
                                      <i
                                        className={`fa-solid  fa-circle fa-beat-fade ${
                                          admin.isBlocked
                                            ? "text-danger"
                                            : "text-success"
                                        }`}
                                      ></i>
                                      &nbsp;
                                      {admin.isBlocked ? "Blocked" : "Active"}
                                    </span>
                                  </div>
                                </span>
                              </li>
                              <li className="d-flex align-items-center mb-3">
                                <i className="bx bx-star"></i>
                                <span className="fw-medium mx-2">
                                  Role:
                                </span>{" "}
                                <span>
                                  {admin?.role === "superadmin"
                                    ? "Super Admin"
                                    : admin.role === "fpoadmin"
                                    ? "FPO admin"
                                    : "N/A"}
                                </span>
                              </li>
                              {/* <li className="d-flex align-items-center mb-3">
                              <i className="bx bx-flag"></i>
                              <span className="fw-medium mx-2">Country:</span>{" "}
                              <span>USA</span>
                            </li> */}
                              {/* <li className="d-flex align-items-center mb-3">
                              <i className="bx bx-detail"></i>
                              <span className="fw-medium mx-2">
                                Languages:
                              </span>{" "}
                              <span>English</span>
                            </li> */}
                            </ul>
                          </div>
                          <div className="col-md-4 col-12">
                            {" "}
                            <small className="text-muted text-uppercase">
                              Contacts
                            </small>
                            <ul className="list-unstyled mb-4 mt-3">
                              <li className="d-flex align-items-center mb-3">
                                <i className="bx bx-phone"></i>
                                <span className="fw-medium mx-2">
                                  Contact:
                                </span>{" "}
                                <span>{admin.mobileno}</span>
                              </li>
                              {/* <li className="d-flex align-items-center mb-3">
                              <i className="bx bx-chat"></i>
                              <span className="fw-medium mx-2">Skype:</span>{" "}
                              <span>john.doe</span>
                            </li> */}
                              <li className="d-flex align-items-center mb-3">
                                <i className="bx bx-envelope"></i>
                                <span className="fw-medium mx-2">
                                  Email:
                                </span>{" "}
                                <span>{admin.email}</span>
                              </li>
                            </ul>
                          </div>
                          <div className="col-md-4 col-12">
                            {" "}
                            <small className="text-muted text-uppercase">
                              Settings
                            </small>
                            <ul className="list-unstyled mt-3 mb-0">
                              <li className="d-flex align-items-center mb-3">
                                <i className="bx bxs-pencil text-primary me-2"></i>
                                <div
                                  onClick={() => setshowtab("editprofile")}
                                  className="d-flex flex-wrap settings_link"
                                >
                                  <span className="fw-medium me-2">
                                    Edit Profile
                                  </span>
                                  {/* <span>(126 Members)</span> */}
                                </div>
                              </li>
                              <li className="d-flex align-items-center">
                                <i className="bx bx-key text-info me-2"></i>
                                <div
                                  onClick={() => setshowtab("changepassword")}
                                  className="d-flex flex-wrap settings_link"
                                >
                                  <span className="fw-medium me-2">
                                    Change password
                                  </span>
                                  {/* <span>(98 Members)</span> */}
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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

export default Profile;
