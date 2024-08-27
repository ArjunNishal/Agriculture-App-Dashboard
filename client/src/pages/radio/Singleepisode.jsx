import jwtDecode from "jwt-decode";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { axiosInstance, renderUrl, renderUrl2 } from "../../config";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import moment from "moment";
import Swal from "sweetalert2";
import { closeeditseasonmodal, closeradio } from "./closeradioedit";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import PermissionHandler from "../../components/PermissionHandler";

const Singleepisode = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  //   console.log(decoded);
  const { epid } = useParams("");
  const [figs, setfigs] = useState(null);
  const [error, setError] = useState(null);
  //   setshowfigdetails
  const [showfigdetails, setshowfigdetails] = useState(null);

  const [title, settitle] = useState("");
  const [host, sethost] = useState("");
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
      // closemodalepisode();
      closeradio();
      setseason("");
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

  const fetchFIGs = async () => {
    try {
      let url = `radio/admin/episode/${epid}`;

      //   if (decoded.role === "fpoadmin") {
      //     url = `survey/fposurvey/${id}`;
      //   }

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setfigs(response.data.episodes);

      // setallvalues();
    } catch (err) {
      console.log(err);
      setError("Error while fetching admin list");
    }
  };

  useEffect(() => {
    fetchFIGs();
  }, [epid]);

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

  const setallvalues = () => {
    console.log(figs);
    settitle(figs?.title);
    setrecording(figs?.recording);
    setseasonEpisode(figs?.seasonEpisode);
    fetchradios(figs?.radioCategory._id, figs);
    fetchSeasons(figs?.radio._id, figs);
    setradioCategory(figs?.radioCategory._id);
    setprevimage(figs?.image);
    seteid(figs._id);
    // setseason(el?.season._id);
  };
  console.log(selectedImage, "selectedImage");
  console.log(seasonEpisode, "seasonEpisode");
  console.log(radio, "radio");
  console.log(recording, "recording");
  console.log(radioCategory, "radioCategory");
  console.log(season, "season");
  console.log(title, "title");

  // fetch all categories
  const fetchcats = async () => {
    try {
      let url = `radio/admin/all-radioCats?fpoid=${figs?.fpo?._id}`;

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
    fetchcats();
  }, [figs]);

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
              {" "}
              {figs && (
                <div className="container-xxl flex-grow-1 container-p-y">
                  <h4 className="py-3 mb-4">
                    <span className="text-muted fw-light">All Episodes/</span>{" "}
                    Episode
                  </h4>
                  <div className="text-end mb-2">
                    {(decoded.permissions?.includes("editradiodetails") ||
                      decoded.role === "superadmin") && (
                      <button
                        className="btn btn-primary"
                        type="button"
                        id="editradioaccordion"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseOne"
                        aria-expanded="true"
                        aria-controls="collapseOne"
                        onClick={() => setallvalues()}
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                        &nbsp;Edit
                      </button>
                    )}
                  </div>
                  {/* edit radio */}
                  {(decoded.permissions?.includes("editradiodetails") ||
                    decoded.role === "superadmin") && (
                    <div className="accordion mb-3" id="accordionExample">
                      <div className="accordion-item">
                        <div
                          id="collapseOne"
                          className="accordion-collapse collapse "
                          data-bs-parent="#accordionExample"
                        >
                          <div className="accordion-body">
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
                                <div className="mb-3  col-md-6 col-12">
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
                                <div className="mb-3  col-md-6 col-12">
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
                                <div className="mb-3  col-md-6 col-12">
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
                                <div className="mb-3 col-md-6 col-12">
                                  <label className="form-label">
                                    Recording*
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
                  )}
                  {/* radio details */}
                  <div className="fig-details">
                    <div className="card">
                      <div className="row align-items-center">
                        <div className="col-md-6 col-12">
                          {figs.image ? (
                            <div className="mx-3 text-center">
                              <label className="form-label">
                                <b>Image</b>
                              </label>
                              <div className="radioimg-preview text-center ">
                                <img
                                  src={`${renderUrl2}${figs.image}`}
                                  alt="image"
                                  onError={(e) => {
                                    e.target.src =
                                      "/assets/img/elements/radio.png";
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              <img
                                src="/assets/img/elements/radio.png"
                                alt="catimg"
                              />
                            </>
                          )}
                        </div>
                        <div className="col-md-6 col-12">
                          <div className="row m-0 ">
                            <div className="col-md-4 p-3">
                              <b>Title</b>
                            </div>
                            <div className="col-md-8 p-3">
                              : &nbsp;&nbsp; {figs?.title}
                            </div>
                            <div className="col-md-4 p-3">
                              <b>Training category</b>
                            </div>
                            <div className="col-md-8 p-3">
                              : &nbsp;&nbsp; {figs?.radioCategory.category}
                            </div>
                            <div className="col-md-4 p-3">
                              <b>Training</b>
                            </div>
                            <div className="col-md-8 p-3">
                              : &nbsp;&nbsp;{figs?.radio.heading}
                              {/* <Link to={`/member/${figs?.host}`}>
          {figs?.postedBy}
        </Link> */}
                            </div>
                            <div className="col-md-4 p-3">
                              <b>Season</b>
                            </div>
                            <div className="col-md-8 p-3">
                              : &nbsp;&nbsp; {figs?.season?.season}
                            </div>
                            <div className="col-md-4 p-3">
                              <b>Episode</b>
                            </div>
                            <div className="col-md-8 p-3">
                              : &nbsp;&nbsp; {figs?.seasonEpisode}
                            </div>
                            <div className="col-md-4 p-3">
                              <b>Recording</b>
                            </div>
                            <div className="col-md-8 p-3">
                              : &nbsp;&nbsp;
                              {figs?.recording.includes("http") ? (
                                <Link to={`${figs?.recording}`}>
                                  {figs?.recording}
                                </Link>
                              ) : (
                                <> {figs?.recording}</>
                              )}
                            </div>
                            <div className="col-md-4 p-3">
                              <b>Date</b>
                            </div>
                            <div className="col-md-8 p-3">
                              : &nbsp;&nbsp;{" "}
                              {moment(figs?.createdAt).format(
                                "D0 MMMM YYYY , hh:mm a"
                              )}
                            </div>
                            <div className="col-md-4 p-3">
                              <b>Status</b>
                            </div>
                            <div className="col-md-8 p-3">
                              <div className="d-flex align-items-center">
                                : &nbsp;&nbsp;{" "}
                                <span
                                  className={`badge  me-3 ${
                                    figs.status === 1
                                      ? "bg-label-success"
                                      : figs.status === 2
                                      ? "bg-label-danger"
                                      : "bg-label-warning"
                                  }`}
                                >
                                  <i className="fa-solid fa-circle fa-beat-fade"></i>
                                  &nbsp;
                                  {figs.status === 1
                                    ? "active"
                                    : figs.status === 2
                                    ? "blocked"
                                    : "inactive"}
                                </span>
                                {(decoded.permissions?.includes(
                                  "editradiodetails"
                                ) ||
                                  decoded.role === "superadmin") && (
                                  <div className="dropdown d-flex">
                                    <button
                                      type="button"
                                      className="btn btn-primary btn-sm dropdown-toggle hide-arrow"
                                      data-bs-toggle="dropdown"
                                    >
                                      <i className="fa-solid fa-pen-to-square"></i>
                                    </button>
                                    <div className="dropdown-menu">
                                      {figs.status === 1 ? (
                                        <>
                                          <a
                                            className="dropdown-item"
                                            href="javascript:void(0);"
                                            onClick={() =>
                                              toggleSurveyStatus(figs._id, 0)
                                            }
                                          >
                                            <i className="fa-solid fa-circle text-warning"></i>{" "}
                                            Deactivate
                                          </a>
                                          <a
                                            className="dropdown-item"
                                            href="javascript:void(0);"
                                            onClick={() =>
                                              toggleSurveyStatus(figs._id, 2)
                                            }
                                          >
                                            <i className="fa-solid fa-circle text-danger"></i>{" "}
                                            Block
                                          </a>
                                        </>
                                      ) : figs.status === 0 ? (
                                        <>
                                          <a
                                            className="dropdown-item"
                                            href="javascript:void(0);"
                                            onClick={() =>
                                              toggleSurveyStatus(figs._id, 1)
                                            }
                                          >
                                            <i className="fa-solid fa-circle text-success"></i>{" "}
                                            Activate
                                          </a>
                                          <a
                                            className="dropdown-item"
                                            href="javascript:void(0);"
                                            onClick={() =>
                                              toggleSurveyStatus(figs._id, 2)
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
                                            toggleSurveyStatus(figs._id, 0)
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
      </div>
    </div>
  );
};

export default Singleepisode;
