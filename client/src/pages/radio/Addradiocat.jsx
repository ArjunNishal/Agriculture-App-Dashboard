import jwtDecode from "jwt-decode";
import React, { useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { axiosInstance } from "../../config";
import Swal from "sweetalert2";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import PermissionHandler from "../../components/PermissionHandler";
import { useNavigate } from "react-router-dom";

const Addradiocat = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  const [categoryName, setCategoryName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = React.useRef(null);
  const [saving, setsaving] = useState(false);

  // Function to handle file input change
  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };
  const navigate = useNavigate("");
  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setsaving(true);
      const formData = new FormData();
      formData.append("category", categoryName);
      formData.append("file", selectedImage);
      formData.append("fpoid", decoded.fpo);

      // Replace 'YOUR_SERVER_URL' and 'YOUR_API_ENDPOINT' with your actual server URL and API endpoint
      const response = await axiosInstance.post(
        `radio/admin/add-new-radioCat`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);

      // Show success message with swal
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "New category added successfully.",
      });
      setCategoryName("");
      setSelectedImage(null);
      fileInputRef.current.value = "";

      navigate("/radiooptions");
      setsaving(false);
    } catch (error) {
      console.error(error);
      if (error.response.status === 406) {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: `${error.response.data.Error}`,
        });
      } else {
        // Show error message with swal
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "An error occurred while adding the category.",
        });
      }
      setsaving(false);
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
              {/* {figs && ( */}
              {decoded.role === "superadmin" ||
              decoded.permissions?.includes("addradiocategory") ? (
                <div className="container-xxl flex-grow-1 container-p-y">
                  <h4 className="py-3 mb-4">
                    <span className="text-muted fw-light">Training/</span> Add
                    Training category
                  </h4>
                  <div className="radiocat-main">
                    <div className="card p-3">
                      <div className="row align-items-center ">
                        <div className="col-md-6 col-12">
                          <div className="add-cat-img-left">
                            <img
                              src="assets/img/elements/radiocat.png"
                              alt="catimg"
                            />
                          </div>
                        </div>
                        <div className="col-md-6 col-12">
                          <div className=" p-3 addcat-form-main">
                            <form
                              className="addcat-form shadow p-3 rounded row"
                              onSubmit={handleSubmit}
                            >
                              <h3>Add Training category</h3>
                              <div className="mb-3">
                                <label className="form-label">
                                  Category Name{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Category name"
                                  value={categoryName}
                                  onChange={(e) =>
                                    setCategoryName(e.target.value)
                                  }
                                  required
                                />
                              </div>
                              <div className="mb-3">
                                <label className="form-label">
                                  Select Image{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="file"
                                  className="form-control"
                                  onChange={handleImageChange}
                                  ref={fileInputRef}
                                  required
                                />
                              </div>
                              {selectedImage && (
                                <div className="mb-3">
                                  {/* Display the selected image preview */}
                                  <div className="add-cat-img-preview border rounded">
                                    <img
                                      src={URL.createObjectURL(selectedImage)}
                                      alt="prev"
                                    />
                                  </div>
                                </div>
                              )}
                              <div className="mb-3 text-center">
                                <button
                                  className="btn btn-primary"
                                  disabled={saving}
                                  type="submit"
                                >
                                  Submit
                                </button>
                              </div>
                            </form>
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

export default Addradiocat;
