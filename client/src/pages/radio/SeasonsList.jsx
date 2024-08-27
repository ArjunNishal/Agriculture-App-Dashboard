import React, { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { axiosInstance, renderUrl } from "../../config";
import jwtDecode from "jwt-decode";
import moment from "moment";
import { Link } from "react-router-dom";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import Swal from "sweetalert2";
import { closeeditseasonmodal } from "./closeradioedit";
import PermissionHandler from "../../components/PermissionHandler";

const SeasonsList = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  //   console.log(decoded);
  const [radio, setradio] = useState("");
  const [figs, setfigs] = useState([]);
  const [error, setError] = useState(null);
  const [title, settitle] = useState("");
  const [radioCategory, setradioCategory] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previmage, setprevimage] = useState(null);
  const [rid, setrid] = useState(null);
  const fileInputRef = React.useRef(null);
  const [categories, setcategories] = useState([]);
  const [radios, setradios] = useState([]);
  const [searchvalue, setsearchvalue] = useState("");
  //   setshowfigdetails
  const [showfigdetails, setshowfigdetails] = useState(null);

  // fetch all categories
  const fetchcats = async (id) => {
    try {
      let url = `radio/admin/all-radioCats?fpoid=${id}`;

      if (decoded.role === "fpoadmin") {
        url = `radio/admin/all-radioCats?fpoid=${decoded.fpo}`;
      }

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      setcategories(response.data.radioCat);
    } catch (err) {
      console.log(err);
      //   setError("Error while fetching admin list");
    }
  };

  const setallvalues = (el) => {
    settitle(el?.season);
    setradioCategory(el?.radioCategory._id);
    setprevimage(el?.image);
    setrid(el._id);
    fetchcats(el?.fpo?._id);
    fetchradios(el?.radioCategory._id, el);
    setradio(el?.radio);
    console.log(el);
    // alert(el?.radio?._id)
  };

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const fetchFIGs = async () => {
    try {
      let url = "radio/season/admin/all";

      if (decoded.role === "fpoadmin") {
        url = `radio/season/fpo/${decoded.fpo}`;
      }

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      setfigs(response.data.seasons);
    } catch (err) {
      console.log(err);
      setError("Error while fetching admin list");
    }
  };

  useEffect(() => {
    fetchFIGs();
  }, []);

  const toggleSurveyStatus = async (id, activate) => {
    try {
      const response = await axiosInstance.patch(
        `radio/season/edit/status/${id}/${activate}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedSurvey = response.data.updateSeason;
      fetchFIGs();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("heading", title);
      // formData.append("file", selectedImage);
      formData.append("radioCategory", radioCategory);

      const response = await axiosInstance.patch(
        `radio/season/edit/${rid}`,
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
        text: "season updated successfully.",
      });
      // fileInputRef.current.value = "";
      settitle("");
      setradioCategory("");
      setSelectedImage(null);
      closeeditseasonmodal();
      fetchFIGs();
    } catch (error) {
      console.error(error);
      closeeditseasonmodal();
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "An error occurred while updating the season.",
      });
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this season and its associated records!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await axiosInstance.delete(
          `radio/admin/delete-season/${categoryId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          Swal.fire(
            "Deleted!",
            "season and associated records deleted successfully.",
            "success"
          );
          fetchFIGs();
        }
      } else {
        Swal.fire("Cancelled", "Your season and records are safe :)", "info");
      }
    } catch (error) {
      console.error("Error:", error.message);
      Swal.fire("Error", error.response.data.Error, "error");
    }
  };

  const fetchradios = async (rcid, el) => {
    try {
      let url = `radio/admin/all-radios/${rcid}`;

      //   if (decoded.role === "fpoadmin") {
      //     url = `survey/fposurvey/${id}`;
      //   }

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      setradios(response.data.radio);
      if (el) {
        console.log(el, "el in fetch func");
        // setradio(el?.radio?._id);
        setradio(el?.radio);
      }
    } catch (err) {
      console.log(err);
      // setError("Error while fetching admin list");
    }
  };

  const handleSearch = async (val) => {
    try {
      const apiUrl = "admin-auth/search";
      const modelName = "Season";

      // const mongodbQuery = {
      //   $and: [{ season: { $regex: val, $options: "i" } }, { radio: rid }],
      // };

      let mongodbQuery;

      if (decoded.role === "superadmin") {
        mongodbQuery = {
          $and: [{ season: { $regex: val, $options: "i" } }],
        };
      } else if (decoded.role === "fpoadmin") {
        mongodbQuery = {
          $and: [
            { season: { $regex: val, $options: "i" } },

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
              decoded.permissions?.includes("seasonlist") ? (
                <div className="container-xxl flex-grow-1 container-p-y">
                  <h4 className="py-3 mb-4">
                    <span className="text-muted fw-light">Training /</span>{" "}
                    Seasons
                  </h4>
                  {/* Basic Bootstrap Table */}
                  <div className="card">
                    <div className="d-flex justify-content-between align-items-center">
                      {" "}
                      <h5 className="card-header">Seasons</h5>{" "}
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
                      </div>
                    </div>{" "}
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
                              <b>Seasons name</b>
                            </th>
                            {/* <th>
                              <b>Image</b>
                            </th> */}
                            <th>
                              <b>Category</b>
                            </th>
                            <th>
                              <b>Date</b>
                            </th>
                            {decoded.role === "superadmin" && (
                              <th>
                                <b>FPO</b>
                              </th>
                            )}
                            <th>
                              <b>Status</b>
                            </th>
                            {(decoded.permissions?.includes(
                              "editseasondetails"
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
                              <td>{index + 1}</td>
                              <td>
                                {/* <i className="fab fa-angular fa-lg text-danger me-3" /> */}
                                <Link
                                  to={`/season/${el.season}/${el._id}`}
                                  //   onClick={() => setshowfigdetails(el)}
                                >
                                  <span className="fw-medium">{el.season}</span>
                                </Link>
                              </td>
                              {/* <td>
                                <img
                                  src={`${renderUrl}uploads/radio/${el.image}`}
                                  // width={100}
                                  className="intoggle-table-image"
                                  alt="cat-img"
                                />
                              </td> */}
                              <td>{el.radioCategory.category}</td>
                              <td>
                                {moment(el.createdAt).format("Do MMMM  YYYY")}
                              </td>
                              {decoded.role === "superadmin" && (
                                <td>{el?.fpo?.name}</td>
                              )}
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
                                  {(decoded.permissions?.includes(
                                    "editseasonstatus"
                                  ) ||
                                    decoded.role === "superadmin") && (
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
                                  )}
                                </div>
                              </td>
                              {(decoded.permissions?.includes(
                                "editseasondetails"
                              ) ||
                                decoded.role === "superadmin") && (
                                <td>
                                  <div className="d-flex gap-2">
                                    <button
                                      className="btn btn-primary"
                                      type="button"
                                      data-bs-toggle="modal"
                                      data-bs-target="#modalCenter"
                                      onClick={() => setallvalues(el)}
                                    >
                                      <i className="fa-solid fa-pen-to-square"></i>
                                      &nbsp;Edit
                                    </button>{" "}
                                    {el.episodeRecordCount === 0 && (
                                      <button
                                        className="btn btn-outline-danger"
                                        onClick={() => handleDelete(el._id)}
                                      >
                                        <i className="fa-solid fa-trash"></i>
                                      </button>
                                    )}
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
                      {figs.length === 0 && (
                        <div>
                          <p className="text-center my-3">
                            No Training category found
                          </p>
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
                              Edit Season details
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
                                <h3>Edit Season</h3>
                                <div className="mb-3 col-md-6 col-12">
                                  <label className="form-label">Title</label>
                                  <div className="input-group mb-3">
                                    <span
                                      className="input-group-text"
                                      id="basic-addon1"
                                    >
                                      <i className="fa-solid fa-pen-nib"></i>
                                    </span>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Title"
                                      value={title}
                                      onChange={(e) => settitle(e.target.value)}
                                      aria-label="Title"
                                      aria-describedby="basic-addon1"
                                    />
                                  </div>
                                </div>
                                <div className="mb-3 col-md-6 col-12">
                                  <label className="form-label">Category</label>
                                  <div className="input-group mb-3">
                                    <label
                                      className="input-group-text"
                                      htmlFor="inputGroupSelect01"
                                    >
                                      <i className="fa-solid fa-cubes-stacked"></i>
                                    </label>
                                    <select
                                      className="form-select"
                                      id="inputGroupSelect01"
                                      value={radioCategory}
                                      onChange={(e) => {
                                        setradioCategory(e.target.value);
                                        fetchradios(e.target.value);
                                      }}
                                    >
                                      <option selected>Choose...</option>
                                      {categories.map((el, index) => (
                                        <option key={index} value={el._id}>
                                          {el.category}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div className="mb-3  col-12">
                                  <label className="form-label">
                                    Select Training{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <div className="input-group mb-3">
                                    <label
                                      className="input-group-text"
                                      htmlFor="inputGroupSelect01"
                                    >
                                      <i className="fa-solid fa-cubes-stacked"></i>
                                    </label>
                                    <select
                                      className="form-select"
                                      id="inputGroupSelect01"
                                      value={radio}
                                      onChange={(e) => setradio(e.target.value)}
                                      required
                                    >
                                      <option selected>Choose...</option>
                                      {radios?.map((el, index) => (
                                        <option key={index} value={el._id}>
                                          {el.heading}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                {/* <div className="mb-3  col-12">
                                  <label className="form-label">
                                    Select Image
                                  </label>
                                  <input
                                    type="file"
                                    className="form-control"
                                    onChange={handleImageChange}
                                    ref={fileInputRef}
                                  />
                                </div> */}
                                {/* {selectedImage && (
                                  <div className="mb-3 col-md-6 col-12">
                                    Display the selected image preview
                                    <label>
                                      <b>New image</b>
                                    </label>
                                    <div className="add-cat-img-preview border rounded">
                                      <img
                                        src={URL.createObjectURL(selectedImage)}
                                        alt="prev"
                                      />
                                    </div>
                                  </div>
                                )} */}
                                {/* {previmage && (
                                  <>
                                    <div className="mb-3 col-md-6 col-12">
                                      Display the selected image preview
                                      <label>
                                        <b>Previous image</b>
                                      </label>
                                      <div className="add-cat-img-preview border rounded">
                                        <img
                                          src={`${renderUrl}uploads/radio/${previmage}`}
                                          alt="prev"
                                        />
                                      </div>
                                    </div>
                                  </>
                                )} */}

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

export default SeasonsList;
