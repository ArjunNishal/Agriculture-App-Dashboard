import jwtDecode from "jwt-decode";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { axiosInstance, renderUrl, renderUrl2 } from "../../config";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import moment from "moment";
import Swal from "sweetalert2";
import { closemodalepisode } from "../../js/intjava";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import Pagination from "../../components/Pagination";
import PermissionHandler from "../../components/PermissionHandler";

const SeasonSingle = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  //   console.log(decoded);
  const { seaid } = useParams("");
  const [figs, setfigs] = useState(null);
  const [error, setError] = useState(null);
  //   setshowfigdetails
  const [showfigdetails, setshowfigdetails] = useState(null);

  const [title, settitle] = useState("");
  const [duration, setduration] = useState("");
  const [recording, setrecording] = useState("");
  const [radio, setradio] = useState("");
  const [radios, setradios] = useState([]);
  const [radioCategory, setradioCategory] = useState("");
  const [selectedradio, setselectedradio] = useState("");
  const [seasonEpisode, setseasonEpisode] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [categories, setcategories] = useState([]);
  const [previmage, setprevimage] = useState(null);
  const [season, setseason] = useState("");
  const [seasons, setseasons] = useState([]);
  const [eid, seteid] = useState(null);

  const fileInputRef = React.useRef(null);

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("heading", title);
      formData.append("file", selectedImage);
      formData.append("radio", radio);
      formData.append("seasonEpisode", seasonEpisode);
      formData.append("recording", recording);
      formData.append("radioCategory", radioCategory);
      formData.append("season", season);
      formData.append("duration", duration);

      console.log(
        title,
        selectedImage,
        radio,
        seasonEpisode,
        recording,
        radioCategory,
        season
      );

      const response = await axiosInstance.patch(
        `radio/admin/update-episode/${eid}`,
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
        text: "episode updated successfully.",
      });
      fileInputRef.current.value = "";
      settitle("");
      // sethost("");
      setrecording("");
      setradio("");
      setradioCategory("");
      setSelectedImage(null);
      closemodalepisode();
      setseason("");
      setduration("");
      fetchFIGs();
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "An error occurred while updating the episode.",
      });
    }
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setitemsPerPage] = useState(10);
  const [totalpages, settotalpages] = useState(0);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const fetchFIGs = async () => {
    try {
      let url = `radio/episode/season/${seaid}?page=${currentPage}&limit=${itemsPerPage}`;

      //   if (decoded.role === "fpoadmin") {
      //     url = `survey/fposurvey/${id}`;
      //   }

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      setfigs(response.data.episodes.results);
      settotalpages(response.data.episodes.totalRecord);

      // setallvalues();
    } catch (err) {
      console.log(err);
      setError("Error while fetching admin list");
    }
  };

  useEffect(() => {
    fetchFIGs();
  }, [seaid, currentPage]);

  const toggleSurveyStatus = async (id, activate) => {
    try {
      const response = await axiosInstance.patch(
        `radio/episode/edit/status/${id}/${activate}`,
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

  const setallvalues = (el) => {
    console.log(el);
    settitle(el?.title);
    setrecording(el?.recording);
    setseasonEpisode(el?.seasonEpisode);
    fetchradios(el?.radioCategory._id, el);
    fetchSeasons(el?.radio._id, el);
    setradioCategory(el?.radioCategory._id);
    setprevimage(el?.image);
    seteid(el._id);
    setduration(el?.duration);
    fetchcats(el?.fpo?._id);
    // setseason(el?.season._id);
  };

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

  // useEffect(() => {
  //   fetchcats();
  // }, []);

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
        setradio(el?.radio?._id);
      }
    } catch (err) {
      console.log(err);
      // setError("Error while fetching admin list");
    }
  };

  const fetchSeasons = async (id, el) => {
    try {
      let url = `radio/seasons/radio/${id}`;

      if (decoded.role === "fpoadmin") {
        url = `radio/seasons/radio/${id}`;
      }

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      setseasons(response.data.seasons);
      if (el) {
        console.log(el, "el in fetch func");
        setseason(el?.season?._id);
      }
    } catch (err) {
      console.log(err);
      // setError("Error while fetching admin list");
    }
  };

  // useEffect(() => {
  //   fetchSeasons();
  // }, []);

  const handleDelete = async (categoryId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this episode and its associated records!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await axiosInstance.delete(
          `radio/admin/delete-episode/${categoryId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          Swal.fire(
            "Deleted!",
            "episode and associated records deleted successfully.",
            "success"
          );
          fetchFIGs();
        }
      } else {
        Swal.fire("Cancelled", "Your episode and records are safe :)", "info");
      }
    } catch (error) {
      console.error("Error:", error.message);
      console.log(error);
      Swal.fire("Error", "Failed to delete episode and records", "error");
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
              decoded.permissions?.includes("seasonlist") ? (
                <div className="container-xxl flex-grow-1 container-p-y">
                  <h4 className="py-3 mb-4">
                    <span className="text-muted fw-light">Season /</span>{" "}
                    Episodes
                  </h4>
                  {/* Basic Bootstrap Table */}
                  <div className="card">
                    <h5 className="card-header">Episodes</h5>
                    <div className="table-responsive text-nowrap">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>
                              <b>S. No.</b>
                            </th>
                            <th>
                              <b>Episode name</b>
                            </th>
                            <th>
                              <b>Image</b>
                            </th>
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
                          {figs?.map((el, index) => (
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
                                  to={`/episode/${el.title}/${el._id}`}
                                  // to={""}
                                  //   onClick={() => setshowfigdetails(el)}
                                >
                                  <span className="fw-medium">{el.title}</span>
                                </Link>
                              </td>
                              <td>
                                <img
                                  src={`${renderUrl2}${el.image}`}
                                  // width={100}
                                  onError={(e) => {
                                    e.target.src =
                                      "/assets/img/elements/radio.png";
                                  }}
                                  className="intoggle-table-image"
                                  alt="cat-img"
                                />
                              </td>
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
  
                                {el?.membeseaid?.name}
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
                                    <div className="dropdown ">
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
                                    <button
                                      className="btn btn-outline-danger"
                                      onClick={() => handleDelete(el._id)}
                                    >
                                      <i className="fa-solid fa-trash"></i>
                                    </button>
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
                      {figs?.length === 0 && (
                        <div>
                          <p className="text-center my-3">No Episode found</p>
                        </div>
                      )}
                    </div>
                    {/* {!searchvalue && ( */}
                    <div className="py-2 px-3">
                      <Pagination
                        totalItems={totalpages}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                      />
                    </div>
                    {/* )} */}
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
                              Edit Episode details
                            </h5>
                            <button
                              type="button"
                              className="btn-close"
                              data-bs-dismiss="modal"
                              id="editepisodemodalbtnclose"
                              aria-label="Close"
                            ></button>
                          </div>
                          <div className="modal-body">
                            <div>
                              <form
                                className="addradio-form  p-3 rounded row"
                                onSubmit={handleSubmit}
                              >
                                <h3>Edit Episode</h3>
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
                                      onChange={(e) => {
                                        setradio(e.target.value);
                                        fetchSeasons(e.target.value);
                                      }}
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
                                <div className="mb-3  col-12">
                                  <label className="form-label">
                                    Season{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <div className="input-group mb-3">
                                    <span
                                      className="input-group-text"
                                      id="basic-addon1"
                                    >
                                      <i className="fa-solid fa-circle-play"></i>
                                    </span>
                                    <select
                                      className="form-select"
                                      id="inputGroupSelect01"
                                      value={season}
                                      onChange={(e) =>
                                        setseason(e.target.value)
                                      }
                                      required
                                      disabled={
                                        radio &&
                                        radio !== "Choose..." &&
                                        seasons.length > 0
                                          ? false
                                          : true
                                      }
                                    >
                                      <option selected>Choose...</option>
                                      {seasons.map((el, index) => (
                                        <option key={index} value={el._id}>
                                          {el.season}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div className="mb-3  col-12">
                                  <label className="form-label">
                                    Episode{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <div className="input-group mb-3">
                                    <span
                                      className="input-group-text"
                                      id="basic-addon1"
                                    >
                                      <i className="fa-solid fa-circle-play"></i>
                                    </span>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={seasonEpisode}
                                      onChange={(e) =>
                                        setseasonEpisode(e.target.value)
                                      }
                                      placeholder="Enter details"
                                      aria-label="season"
                                      aria-describedby="basic-addon1"
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="mb-3  col-12">
                                  <label className="form-label">
                                    Recording{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <div className="input-group mb-3">
                                    <span
                                      className="input-group-text"
                                      id="basic-addon1"
                                    >
                                      <i className="fa-solid fa-podcast"></i>
                                    </span>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={recording}
                                      onChange={(e) =>
                                        setrecording(e.target.value)
                                      }
                                      placeholder="recording"
                                      aria-label="recording"
                                      aria-describedby="basic-addon1"
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="mb-3  col-12">
                                  <label className="form-label">
                                    Duration{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <div className="input-group mb-3">
                                    <span
                                      className="input-group-text"
                                      id="basic-addon1"
                                    >
                                      <i className="fa-solid fa-clock"></i>
                                    </span>
                                    <input
                                      type="number"
                                      className="form-control"
                                      placeholder="duration"
                                      value={duration}
                                      onChange={(e) =>
                                        setduration(e.target.value)
                                      }
                                      aria-label="Title"
                                      aria-describedby="basic-addon1"
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="mb-3  col-12">
                                  <label className="form-label">
                                    Select Image
                                  </label>
                                  <input
                                    type="file"
                                    className="form-control"
                                    onChange={handleImageChange}
                                    ref={fileInputRef}
                                  />
                                </div>
                                {selectedImage && (
                                  <div className="mb-3 col-md-6 col-12">
                                    {/* Display the selected image preview */}
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
                                )}
                                {previmage && (
                                  <>
                                    <div className="mb-3 col-md-6 col-12">
                                      {/* Display the selected image preview */}
                                      <label>
                                        <b>Previous image</b>
                                      </label>
                                      <div className="add-cat-img-preview border rounded">
                                        <img
                                          src={`${renderUrl2}${previmage}`}
                                          alt="prev"
                                        />
                                      </div>
                                    </div>
                                  </>
                                )}

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

export default SeasonSingle;
