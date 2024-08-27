import React, { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { axiosInstance, renderUrl, renderUrl2 } from "../../config";
import jwtDecode from "jwt-decode";
import moment from "moment";
import { Link, useParams, useNavigate } from "react-router-dom";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import Swal from "sweetalert2";
import Pagination from "../../components/Pagination";
import PermissionHandler from "../../components/PermissionHandler";
import { closeeditseasonmodal } from "./closeradioedit";

const RadiocatSingle = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  //   console.log(decoded);
  const { rcid, catname } = useParams();
  const [searchvalue, setsearchvalue] = useState("");

  const [figs, setfigs] = useState([]);
  const [error, setError] = useState(null);
  //   setshowfigdetails
  const [showfigdetails, setshowfigdetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setitemsPerPage] = useState(10);
  const [totalpages, settotalpages] = useState(0);
  const [title, settitle] = useState("");
  const [host, sethost] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = React.useRef(null);
  const [radioCategory, setradioCategory] = useState("");
  const [currentimage, setcurrentimage] = useState(null);
  const [rid, setrid] = useState(null);
  const [categories, setcategories] = useState([]);

  const navigate = useNavigate("");

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const fetchFIGs = async () => {
    try {
      let url = `radio/admin/all-radio/${rcid}?page=${currentPage}&limit=${itemsPerPage}`;

      // if (decoded.role === "fpoadmin") {
      //   url = `survey/fposurvey/${id}`;
      // }

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      settotalpages(response.data.radio.totalRecord);
      setfigs(response.data.radio.results);
    } catch (err) {
      console.log(err);
      setError("Error while fetching admin list");
    }
  };
  const fetchcats = async (fpoid) => {
    try {
      let url = `radio/admin/all-radioCats?fpoid=${fpoid}`;

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

  useEffect(() => {
    fetchFIGs();
  }, [rcid, currentPage]);

  // useEffect(() => {
  //   fetchcats();
  // }, []);

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const toggleSurveyStatus = async (id, activate) => {
    try {
      const response = await axiosInstance.patch(
        `radio/admin/update-radio-status/${id}/${activate}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // const updatedSurvey = response.data.updateCat;
      fetchFIGs();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this radio and its associated records!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await axiosInstance.delete(
          `radio/admin/delete-radio/${categoryId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          Swal.fire(
            "Deleted!",
            "Radio and associated records deleted successfully.",
            "success"
          );
          fetchFIGs();
        }
      } else {
        Swal.fire("Cancelled", "Your radio and records are safe :)", "info");
      }
    } catch (error) {
      console.error("Error:", error.message);
      Swal.fire("Error", error.response.data.Error, "error");
    }
  };
  const handleSearch = async (val) => {
    try {
      const apiUrl = "admin-auth/search";
      const modelName = "Radio_Record";

      // const mongodbQuery = {
      //   $and: [
      //     { heading: { $regex: val, $options: "i" } },
      //     { radioCategory: rcid },
      //   ],
      // };

      let mongodbQuery;

      if (decoded.role === "superadmin") {
        mongodbQuery = {
          $and: [
            { heading: { $regex: val, $options: "i" } },
            { radioCategory: rcid },
          ],
        };
      } else if (decoded.role === "fpoadmin") {
        mongodbQuery = {
          $and: [
            { heading: { $regex: val, $options: "i" } },
            { radioCategory: rcid },
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
    // console.log(el, "el ==========");
    fetchcats(el.fpo._id);
    // setCategoryName(el.category);
    settitle(el.heading);
    sethost(el.host);
    setradioCategory(el.radioCategory);
    setcurrentimage(el.image);
    setrid(el._id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("heading", title);
      formData.append("file", selectedImage);
      formData.append("host", host);
      // formData.append("season", season);
      // formData.append("seasonEpisode", seasonEpisode);
      // formData.append("recording", recording);
      formData.append("radioCategory", radioCategory);

      const response = await axiosInstance.patch(
        `radio/admin/update-radio/${rid}`,
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
        text: "New radio added successfully.",
      });
      fileInputRef.current.value = "";
      settitle("");
      sethost("");
      // setseason("");
      // setseasonEpisode("");
      // setrecording("");
      setradioCategory("");
      setSelectedImage(null);
      closeeditseasonmodal();
      fetchFIGs();

      // navigate("/radiooptions");
    } catch (error) {
      console.error(error);
      closeeditseasonmodal();
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "An error occurred while adding the radio.",
      });
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
              {decoded.role === "superadmin" ||
              decoded.permissions?.includes("radiop") ? (
                <>
                  {figs && (
                    <div className="container-xxl flex-grow-1 container-p-y">
                      <h4 className="py-3 mb-4">
                        <span className="text-muted fw-light">
                          Training Categories /
                        </span>
                        {catname || "Category"}
                      </h4>
                      {/* Basic Bootstrap Table */}
                      <div className="card">
                        <div className="d-flex justify-content-between align-items-center">
                          {" "}
                          <h5 className="card-header">
                            Trainings of {catname || "Category"}
                          </h5>{" "}
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
                                  <b>Heading</b>
                                </th>
                                <th>
                                  <b>Image</b>
                                </th>
                                {/* <th>
                                  <b>Recording</b>
                                </th> */}
                                <th>
                                  <b>Host</b>
                                </th>
                                {decoded.role === "superadmin" && (
                                  <th>
                                    <b>FPO name</b>
                                  </th>
                                )}
                                <th>
                                  <b>Status</b>
                                </th>
                                {/* <th>
                                <b>Status</b>
                              </th> */}
                                {(decoded.permissions?.includes(
                                  "editradiodetails"
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
                                      src={`${renderUrl2}${el.image}`}
                                      // width={100}
                                      onError={(e) => {
                                        e.target.src =
                                          "/assets/img/elements/radiocat.png";
                                      }}
                                      className="intoggle-table-image"
                                      alt="cat-img"
                                    />
                                  </td>
                                  {/* <td>{el.recording}</td> */}
                                  {/* <td>
                              <span className="badge bg-label-primary me-1">
                                  Active
                                </span>

                              {el?.memberId?.name}
                            </td> */}

                                  <td>{el.host}</td>
                                  {decoded.role === "superadmin" && (
                                    <td>{el?.fpo?.name}</td>
                                  )}
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
                                          className="btn  dropdown-toggle hide-arrow"
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
                                  {(decoded.permissions?.includes(
                                    "editradiodetails"
                                  ) ||
                                    decoded.role === "superadmin") && (
                                    <td>
                                      <div className="d-flex gap-2">
                                        {" "}
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
                                        {el.seasonRecordCount === 0 && (
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
                                No Trainings found
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
                                Edit Training
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
                                  <h3>Edit Training</h3>
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
                                        onChange={(e) =>
                                          settitle(e.target.value)
                                        }
                                        aria-label="Title"
                                        aria-describedby="basic-addon1"
                                      />
                                    </div>
                                  </div>
                                  <div className="mb-3 col-md-6 col-12">
                                    <label className="form-label">
                                      Category{" "}
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
                                        value={radioCategory}
                                        onChange={(e) =>
                                          setradioCategory(e.target.value)
                                        }
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

                                  <div className="mb-3 col-md-6 col-12">
                                    <label className="form-label">
                                      Host{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group mb-3">
                                      <span
                                        className="input-group-text"
                                        id="basic-addon1"
                                      >
                                        <i className="fa-solid fa-ghost"></i>
                                      </span>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={host}
                                        onChange={(e) =>
                                          sethost(e.target.value)
                                        }
                                        placeholder="Enter host"
                                        aria-label="Username"
                                        aria-describedby="basic-addon1"
                                      />
                                    </div>
                                  </div>
                                  <div className="mb-3 col-md-6 col-12">
                                    <label className="form-label">
                                      Select Image{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="file"
                                      className="form-control"
                                      onChange={handleImageChange}
                                      ref={fileInputRef}
                                    />
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
                                      <div className="mb-3  col-12">
                                        <p>
                                          <b>Selected Image</b>
                                        </p>
                                        {/* Display the selected image preview */}
                                        <div className="add-cat-img-preview border rounded">
                                          <img
                                            src={URL.createObjectURL(
                                              selectedImage
                                            )}
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
                  )}
                </>
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

export default RadiocatSingle;
