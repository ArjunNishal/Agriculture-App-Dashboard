import React, { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { axiosInstance } from "../../config";
import jwtDecode from "jwt-decode";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import Swal from "sweetalert2";
import PermissionHandler from "../../components/PermissionHandler";

const Addnotification = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  const navigate = useNavigate("");
  console.log(decoded);
  const fileInputRef = React.useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const { title, description } = formData;
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const [imagePreview, setImagePreview] = useState(null);
  const [disabled, setdisabled] = useState(false);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Set the image file in state
      setImageFile(file);

      // Create a preview URL for the selected image
      const previewURL = URL.createObjectURL(file);
      setImagePreview(previewURL);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setdisabled(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("image", imageFile);
      formData.append("type", "Notification");

      const response = await axiosInstance.post(
        `notification/addnew`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "New notification added successfully.",
      });
      navigate("/allnotifications");
      fileInputRef.current.value = "";
      setImageFile(null);
      setdisabled(false);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "An error occurred while adding the notification.",
      });
      setdisabled(false);
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
              <div className="container-xxl flex-grow-1 container-p-y ">
                <div className="card card-body align-items-center">
                  <div className="row mx-0">
                    <div className="col-md-6 col-12">
                      <div className="add_notify_img_main">
                        <div className="add_notify_inner">
                          <img src="assets/img/elements/notify.png" alt="img" />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 col-12">
                      <div className="add_notify_form_main">
                        <div className="add_notify_inner_form">
                          <h4 className="text-center">Create Notification</h4>
                          <hr />
                          <form
                            onSubmit={handleSubmit}
                            className="add_notify_form"
                          >
                            <div className="row mx-0 justify-content-center align-items-center">
                              <div className="mb-3 col-12 ">
                                <label htmlFor="title" className="form-label">
                                  Title <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="title"
                                  value={title}
                                  onChange={handleChange}
                                  placeholder="Title"
                                  autofocus
                                  required
                                  autocomplete="off"
                                />
                              </div>
                              <div className="mb-3 col-12 ">
                                <label
                                  htmlFor="username"
                                  className="form-label"
                                >
                                  Image
                                </label>
                                <input
                                  type="file"
                                  className="form-control"
                                  onChange={handleLogoChange}
                                  ref={fileInputRef}
                                  multiple={false}
                                />
                              </div>
                              {imagePreview && (
                                <div className="col-12">
                                  <div className=" border rounded text-center mb-3">
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
                                </div>
                              )}
                              <div className="mb-3 col-12">
                                <label
                                  htmlFor="username"
                                  className="form-label"
                                >
                                  Description{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <textarea
                                  className="form-control"
                                  name="description"
                                  value={description}
                                  onChange={handleChange}
                                  placeholder="Description"
                                  autofocus
                                  required
                                />
                              </div>
                              <div className="col-12 text-center">
                                <button
                                  type="submit"
                                  disabled={disabled}
                                  className="btn btn-primary"
                                >
                                  Create Notification
                                </button>
                              </div>
                            </div>
                          </form>
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
  );
};

export default Addnotification;
