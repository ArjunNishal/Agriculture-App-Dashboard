import React, { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { axiosInstance, renderUrl, renderUrl2 } from "../../config";
import jwtDecode from "jwt-decode";
import moment from "moment";
import { Link } from "react-router-dom";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import Swal from "sweetalert2";
import Pagination from "../../components/Pagination";
import PermissionHandler from "../../components/PermissionHandler";
import { closeeditseasonmodal } from "./closeradioedit";

const RadiocatList = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  //   console.log(decoded);

  const [figs, setfigs] = useState([]);
  const [error, setError] = useState(null);
  const [searchvalue, setsearchvalue] = useState("");
  //   setshowfigdetails
  const [showfigdetails, setshowfigdetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setitemsPerPage] = useState(10);
  const [totalpages, settotalpages] = useState(0);

  const [categoryName, setCategoryName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentimage, setcurrentimage] = useState(null);
  const fileInputRef = React.useRef(null);
  const [rcid, setrcid] = useState(null);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const fetchFIGs = async () => {
    try {
      let url = `radio/admin/all-radioCat?page=${currentPage}&limit=${itemsPerPage}`;

      if (decoded.role === "fpoadmin") {
        url = `radio/admin/all-radioCat/${decoded.fpo}?page=${currentPage}&limit=${itemsPerPage}`;
      }

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      settotalpages(response.data.radioCat.totalRecord);
      setfigs(response.data.radioCat.results);
    } catch (err) {
      console.log(err);
      setError("Error while fetching admin list");
    }
  };

  useEffect(() => {
    fetchFIGs();
  }, []);
  useEffect(() => {
    fetchFIGs();
  }, [currentPage]);

  const toggleSurveyStatus = async (id, activate) => {
    try {
      const response = await axiosInstance.patch(
        `radio/admin/update-radioCat-status/${id}/${activate}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedSurvey = response.data.updateCat;
      fetchFIGs();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this radio category and its associated records!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await axiosInstance.delete(
          `radio/admin/delete-radioCat/${categoryId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          Swal.fire(
            "Deleted!",
            "Radio category and associated records deleted successfully.",
            "success"
          );
          fetchFIGs();
        }
      } else {
        Swal.fire(
          "Cancelled",
          "Your radio category and records are safe :)",
          "info"
        );
      }
    } catch (error) {
      console.error("Error:", error.message);
      Swal.fire("Error", error.response.data.Error, "error");
    }
  };
  const handleSearch = async (val) => {
    try {
      const apiUrl = "admin-auth/search";
      const modelName = "RadioCat";

      // const mongodbQuery = {
      //   $or: [
      //     { category: { $regex: val, $options: "i" } },
      //     // { phone: { $regex: val, $options: "i" } },
      //     // { mobileno: { $regex: val, $options: "i" } },
      //   ],
      // };

      let mongodbQuery;

      if (decoded.role === "superadmin") {
        mongodbQuery = {
          $or: [
            { category: { $regex: val, $options: "i" } },
            // { phone: { $regex: val, $options: "i" } },
            // { mobileno: { $regex: val, $options: "i" } },
          ],
        };
      } else if (decoded.role === "fpoadmin") {
        mongodbQuery = {
          $and: [
            { category: { $regex: val, $options: "i" } },
            { fpo: decoded.fpo },
          ],
        };
      }

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
        setfigs(response.data.data);
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
      fetchFIGs();
    } else if (value !== "" && value) {
      handleSearch(value);
    }
    setsearchvalue(value);
  };

  const setallvalues = (el) => {
    console.log(el, "el ==========");
    setCategoryName(el.category);
    setcurrentimage(el.image);
    setrcid(el._id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("category", categoryName);
      formData.append("file", selectedImage);
      formData.append("fpoid", decoded.fpo);

      const response = await axiosInstance.patch(
        `radio/admin/update-radioCat/${rcid}`,
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
        text: "Training Category updated successfully.",
      });
      fileInputRef.current.value = "";
      // settitle("");
      // setradioCategory("");
      setSelectedImage(null);
      closeeditseasonmodal();
      fetchFIGs();
    } catch (error) {
      console.error(error);
      closeeditseasonmodal();
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "An error occurred while updating the Training Category.",
      });
    }
  };

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
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
              {decoded.role === "superadmin" ||
              decoded.permissions?.includes("radiop") ? (
                <div className="container-xxl flex-grow-1 container-p-y">
                  <h4 className="py-3 mb-4">
                    <span className="text-muted fw-light">Training /</span>{" "}
                    Training Categories
                  </h4>
                  {/* Basic Bootstrap Table */}
                  <div className="card">
                    <div className="d-flex justify-content-between align-items-center">
                      {" "}
                      <h5 className="card-header">Training Categories</h5>
                      <div className="d-flex align-items-center gap-3">
                        <div className="nav-item d-flex align-items-center  me-2 border px-2 rounded">
                          <i className="bx bx-search fs-4 lh-0"></i>
                          <input
                            type="text"
                            className="form-control border-0 shadow-none ps-1 ps-sm-2"
                            placeholder="Search..."
                            aria-label="Search..."
                            onChange={(e) => handlesearchevent(e)}
                          />
                        </div>
                        {decoded.role === "fpoadmin" &&
                          decoded.permissions?.includes("addradiocategory") && (
                            <Link
                              to="/addradiocat"
                              className="btn btn-primary me-2"
                            >
                              <i className="fa-solid fa-plus"></i>&nbsp;Add
                              Training category
                            </Link>
                          )}
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
                    <div className="table-responsive text-nowrap">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>
                              <b>S. No.</b>
                            </th>
                            <th>
                              <b>Category</b>
                            </th>
                            <th>
                              <b>Image</b>
                            </th>
                            {/* <th>
                            <b>Location</b>
                          </th>
                          <th>
                            <b>Owner</b>
                          </th> */}
                            <th>
                              <b>Status</b>
                            </th>
                            {/* <th>
                                <b>Status</b>
                              </th> */}
                            {(decoded.permissions?.includes(
                              "editradiocategory"
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
                          {figs.map((el, index) => (
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
                                  to={`/radio-cat/${el.category}/${el._id}`}
                                  //   onClick={() => setshowfigdetails(el)}
                                >
                                  <span className="fw-medium">
                                    {el.category}
                                  </span>
                                </Link>
                              </td>
                              <td>
                                <img
                                  src={`${renderUrl2}${el.image}`}
                                  // width={100}
                                  //  
                                  onError={(e) => {
                                    e.target.src =
                                      "/assets/img/elements/radiocat.png";
                                  }}
                                  className="intoggle-table-image"
                                  alt="cat-img"
                                />
                              </td>
                              {/* <td>{el.location}</td> */}
                              {/* <td>
                              <span className="badge bg-label-primary me-1">
                                  Active
                                </span>

                              {el?.memberId?.name}
                            </td> */}

                              {/* <td>{el.meetings.length}</td> */}
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
                                  <div className="dropdown">
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
                                              toggleSurveyStatus(el._id, 0)
                                            }
                                          >
                                            <i className="fa-solid fa-circle text-warning"></i>{" "}
                                            Deactivate
                                          </a>
                                          <a
                                            className="dropdown-item"
                                            href="javascript:void(0);"
                                            onClick={() =>
                                              toggleSurveyStatus(el._id, 2)
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
                                              toggleSurveyStatus(el._id, 1)
                                            }
                                          >
                                            <i className="fa-solid fa-circle text-success"></i>{" "}
                                            Activate
                                          </a>
                                          <a
                                            className="dropdown-item"
                                            href="javascript:void(0);"
                                            onClick={() =>
                                              toggleSurveyStatus(el._id, 2)
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
                                            toggleSurveyStatus(el._id, 0)
                                          }
                                        >
                                          <i className="fa-solid fa-circle text-success"></i>{" "}
                                          Unblock
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <div className="d-flex gap-2">
                                  {" "}
                                  {(decoded.permissions?.includes(
                                    "editradiocategory"
                                  ) ||
                                    decoded.role === "fpoadmin") && (
                                    <button
                                      className="btn btn-primary"
                                      type="button"
                                      data-bs-toggle="modal"
                                      data-bs-target="#modalCenter"
                                      onClick={() => setallvalues(el)}
                                    >
                                      <i className="fa-solid fa-pen-to-square"></i>
                                      &nbsp;Edit
                                    </button>
                                  )}
                                  {(decoded.permissions?.includes(
                                    "editradiocategory"
                                  ) ||
                                    decoded.role === "superadmin") && (
                                    <>
                                      {el.radioRecordCount === 0 && (
                                        <button
                                          className="btn btn-outline-danger"
                                          onClick={() => handleDelete(el._id)}
                                        >
                                          <i className="fa-solid fa-trash"></i>
                                        </button>
                                      )}{" "}
                                    </>
                                  )}
                                </div>
                              </td>

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
                      {figs.length === 0 && (
                        <div>
                          <p className="text-center my-3">
                            No Training category found
                          </p>
                        </div>
                      )}
                    </div>{" "}
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
                      className="modal-dialog modal-dialog-centered modal-lg"
                      role="document"
                    >
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title" id="largeModal">
                            Edit Training category
                          </h5>
                          <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            id="editseasonmodalbtnclose"
                            aria-label="Close"
                          ></button>
                        </div>
                        <div className="modal-body">
                          <div>
                            <form
                              className="addradio-form  p-3 rounded row"
                              onSubmit={handleSubmit}
                            >
                              <h3>Edit Training category</h3>
                              <div className="mb-3 col-md-6 col-12">
                                <label className="form-label">
                                  Category Name
                                </label>
                                <div className="input-group mb-3">
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Category name"
                                    value={categoryName}
                                    onChange={(e) =>
                                      setCategoryName(e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                              <div className="mb-3 col-md-6 col-12">
                                <label className="form-label">
                                  Select Image
                                </label>
                                <div className="input-group mb-3">
                                  <input
                                    type="file"
                                    className="form-control"
                                    onChange={handleImageChange}
                                    ref={fileInputRef}
                                  />
                                </div>
                              </div>
                              <div className="col-md-6 col-12">
                                {" "}
                                {currentimage && (
                                  <div className="mb-3">
                                    <p>
                                      <b>Current Image</b>
                                    </p>
                                    {/* Display the selected image preview */}
                                    <div className="add-cat-img-preview border rounded">
                                      <img
                                        src={`${renderUrl2}${currentimage}`}
                                        alt="prev"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="col-md-6 col-12">
                                {selectedImage && (
                                  <div className="mb-3">
                                    <p>
                                      <b>Selected Image</b>
                                    </p>
                                    {/* Display the selected image preview */}
                                    <div className="add-cat-img-preview border rounded">
                                      <img
                                        src={URL.createObjectURL(selectedImage)}
                                        alt="prev"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="mb-3 text-center">
                                <button
                                  className="btn btn-primary"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadiocatList;
