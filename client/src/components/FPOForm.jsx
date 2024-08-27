import React, { useState, useEffect } from "react";
import { axiosInstance, renderUrl, renderUrl2 } from "../config";
import Swal from "sweetalert2";
import jwtDecode from "jwt-decode";

function FPOForm({ fpo, onSave, isEdit, oncancel }) {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const [formData, setFormData] = useState({ ...fpo });
  const [image, setImage] = useState(null);

  useEffect(() => {
    setFormData({ ...fpo });
  }, [fpo]);
  // console.log(formData, fpo, "form data");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleInputChangedate = (e) => {
    const { name, value } = e.target;

    // Format the date if the input is "registeredOn"
    const formattedValue =
      name === "registeredOn" ? formatDateForInput(value) : value;

    setFormData({
      ...formData,
      [name]: formattedValue,
    });
  };

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const formatteddate = `${year}-${month < 10 ? "0" : ""}${month}-${
      day < 10 ? "0" : ""
    }${day}`;
    return formatteddate;
  };
  console.log(formData.registeredOn, "final");
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleResetImage = () => {
    setImage(null);
  };
  // console.log(formData);
  const handleSave = async (e) => {
    e.preventDefault();
    console.log(image, "image");
    const form = new FormData();
    form.append("image", image);
    form.append("id", formData._id ? formData._id : "");
    form.append("name", formData.name);
    // form.append("registeredOn", formData.registeredOn);
    form.append("promoter", formData.promoter);
    form.append("sharePerMember", formData.sharePerMember);
    form.append("numberOfDirectors", formData.numberOfDirectors);
    form.append("totalFpoCapital", formData.totalFpoCapital);
    form.append("admin", decoded.id);
    form.append("villagesServed", formData.villagesServed);
    form.append("productsarray", formData.productsarray);

    let response;
    try {
      if (isEdit) {
        // You can make an edit API call here
        response = await axiosInstance.put(
          `fpo/updatefpo/${formData._id}`,
          form,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        response = await axiosInstance.post("fpo/addfpo", form, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (response.status === 200) {
        // Show a success message
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "FPO details saved successfully",
        });
        onSave(response.data.image);
      }
    } catch (error) {
      console.log(error);
      // Show an error message
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error saving FPO details",
      });
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSave} id="formAccountSettings">
            <div className="d-flex align-items-start align-items-sm-center mb-3 gap-4">
              <img
                src={
                  image
                    ? URL.createObjectURL(image)
                    : fpo?.fpopic
                    ? `${renderUrl2}${fpo?.fpopic}`
                    : "../assets/img/avatars/1.png"
                }
                alt="user-avatar"
                className="d-block rounded"
                height={100}
                width={100}
                id="uploadedAvatar"
              />
              <div className="button-wrapper">
                <label
                  htmlFor="upload"
                  className="btn btn-primary me-2 mb-4"
                  tabIndex={0}
                >
                  <span className="d-none d-sm-block">Upload FPO Logo</span>
                  <i className="bx bx-upload d-block d-sm-none" />
                  <input
                    type="file"
                    id="upload"
                    className="account-file-input"
                    hidden
                    accept="image/png, image/jpeg"
                    onChange={handleImageChange}
                  />
                </label>
                <button
                  type="button"
                  className="btn btn-outline-secondary account-image-reset mb-4"
                  onClick={handleResetImage} // Add this onClick handler
                >
                  <i className="bx bx-reset d-block d-sm-none" />
                  <span className="d-none d-sm-block">Reset</span>
                </button>
                <p className="text-muted mb-0">Allowed JPG or PNG</p>
              </div>
            </div>
            <div className="row">
              <div className="mb-3 col-md-6">
                <label htmlFor="name" className="form-label">
                  FPO Name <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {/* <div className="mb-3 col-md-6">
                <label htmlFor="registeredOn" className="form-label">
                  Registered on <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  id="registeredOn"
                  className="form-control"
                  name="registeredOn"
                  // value={formData.registeredOn}
                  value={formatDateForInput(formData.registeredOn)}
                  onChange={handleInputChangedate}
                  required
                />
              </div> */}
              <div className="mb-3 col-md-6">
                <label htmlFor="promoter" className="form-label">
                  Promotor <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="promoter"
                  className="form-control"
                  name="promoter"
                  value={formData.promoter}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3 col-md-6">
                <label htmlFor="sharePerMember" className="form-label">
                  Share Per Member: <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  onFocus={(e) =>
                    e.target.addEventListener(
                      "wheel",
                      function (e) {
                        e.preventDefault();
                      },
                      { passive: false }
                    )
                  }
                  id="sharePerMember"
                  className="form-control"
                  name="sharePerMember"
                  value={formData.sharePerMember}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-3 col-md-6">
                <label htmlFor="numberOfDirectors" className="form-label">
                  No. of Directors: <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  onFocus={(e) =>
                    e.target.addEventListener(
                      "wheel",
                      function (e) {
                        e.preventDefault();
                      },
                      { passive: false }
                    )
                  }
                  id="numberOfDirectors"
                  className="form-control"
                  name="numberOfDirectors"
                  value={formData.numberOfDirectors}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3 col-md-6">
                <label htmlFor="numberOfDirectors" className="form-label">
                  FPO capital <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  onFocus={(e) =>
                    e.target.addEventListener(
                      "wheel",
                      function (e) {
                        e.preventDefault();
                      },
                      { passive: false }
                    )
                  }
                  id="totalFpoCapital"
                  className="form-control"
                  name="totalFpoCapital"
                  value={formData.totalFpoCapital}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3 col-md-6">
                <label htmlFor="numberOfDirectors" className="form-label">
                  Villages Served <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  onFocus={(e) =>
                    e.target.addEventListener(
                      "wheel",
                      function (e) {
                        e.preventDefault();
                      },
                      { passive: false }
                    )
                  }
                  id="villagesServed"
                  className="form-control"
                  name="villagesServed"
                  value={formData.villagesServed}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3 col-md-6">
                <label htmlFor="numberOfDirectors" className="form-label">
                  Products <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  id="products"
                  className="form-control"
                  name="productsarray"
                  value={formData.productsarray}
                  onChange={handleInputChange}
                  required
                />
                <span className="text-danger">
                  Enter product names with comma (",") after each
                </span>
              </div>
            </div>
            <div className="mt-2">
              <button
                type="submit"
                className="btn btn-primary me-2"
                // onClick={handleSave}
              >
                Save changes
              </button>
              <button
                type="reset"
                onClick={oncancel}
                className="btn btn-outline-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FPOForm;
