import jwtDecode from "jwt-decode";
import React, { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { axiosInstance } from "../../config";
import Swal from "sweetalert2";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import PermissionHandler from "../../components/PermissionHandler";
import { useNavigate } from "react-router-dom";

const Addseason = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  const [title, settitle] = useState("");
  //   const [host, sethost] = useState("");
  //   const [seasonEpisode, setseasonEpisode] = useState("");
  //   const [recording, setrecording] = useState("");
  const [radioCategory, setradioCategory] = useState("");
  const [selectedradio, setselectedradio] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [categories, setcategories] = useState([]);
  const [radios, setradios] = useState([]);
  const fileInputRef = React.useRef(null);
  const [saving, setsaving] = useState(false);

  // Function to handle file input change
  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };
  console.log(radioCategory, "radioCategory===========");
  const navigate = useNavigate("");
  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setsaving(true);

      console.log(title, selectedradio, radioCategory);

      // const formData = new FormData();
      // formData.append("heading", title);
      // formData.append("seasonimg", selectedImage);
      // formData.append("radio", selectedradio);
      //   formData.append("seasonEpisode", seasonEpisode);
      //   formData.append("recording", recording);
      // formData.append("radioCategory", radioCategory);

      const response = await axiosInstance.post(
        `radio/season/add`,
        {
          heading: title,
          radio: selectedradio,
          radioCategory: radioCategory,
        },
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
        text: "New season added successfully.",
      });
      // fileInputRef.current.value = "";
      settitle("");
      //   sethost("");
      //   setseasonEpisode("");
      //   setrecording("");
      setselectedradio("");
      setradioCategory("");
      setSelectedImage(null);

      navigate("/radiooptions");
      setsaving(false);
    } catch (error) {
      console.error(error);
      setsaving(false);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "An error occurred while adding the season.",
      });
    }
  };

  const fetchFIGs = async () => {
    try {
      let url = "radio/admin/all-radioCats";

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
  }, []);

  const fetchradios = async (rcid) => {
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
              {/* {figs && ( */}
              {decoded.role === "superadmin" ||
              decoded.permissions?.includes("addradio") ? (
                <div className="container-xxl flex-grow-1 container-p-y">
                  <h4 className="py-3 mb-4">
                    <span className="text-muted fw-light">Training/</span> Add
                    Season
                  </h4>
                  <div className="radio-main">
                    <div className="card p-3">
                      <div className="row align-items-center">
                        <div className="col-md-6 col-12">
                          <div className="add-cat-img-left">
                            <img
                              src="assets/img/elements/radio.png"
                              alt="catimg"
                            />
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className=" p-3 addradio-form-main">
                            <form
                              className="addradio-form  p-3 rounded row"
                              onSubmit={handleSubmit}
                            >
                              <h3>Add Season</h3>
                              <div className="mb-3  col-12">
                                <label className="form-label">
                                  Season Title{" "}
                                  <span className="text-danger">*</span>
                                </label>
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
                                    required
                                  />
                                </div>
                              </div>
                              <div className="mb-3  col-12">
                                <label className="form-label">
                                  Select Category{" "}
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
                                    onChange={(e) => {
                                      setradioCategory(e.target.value);
                                      fetchradios(e.target.value);
                                      if (e.target.value === "Choose...") {
                                        setselectedradio("");
                                      }
                                    }}
                                    required
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
                                    value={selectedradio}
                                    onChange={(e) =>
                                      setselectedradio(e.target.value)
                                    }
                                    disabled={
                                      radioCategory &&
                                      radioCategory !== "Choose..." &&
                                      radios.length > 0
                                        ? false
                                        : true
                                    }
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
                                <label className="form-label">Host</label>
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
                                    onChange={(e) => sethost(e.target.value)}
                                    placeholder="Enter host"
                                    aria-label="Username"
                                    aria-describedby="basic-addon1"
                                    required
                                  />
                                </div>
                              </div> */}
                              {/* <div className="mb-3  col-12">
                                <label className="form-label">
                                  Season and Episode
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
                              </div> */}
                              {/* <div className="mb-3  col-12">
                                <label className="form-label">Recording*</label>
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
                              </div> */}
                              {/* <div className="mb-3  col-12">
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
                              </div> */}
                              {/* {selectedImage && (
                                <div className="mb-3  col-12">
                                  Display the selected image preview
                                  <div className="add-cat-img-preview border rounded">
                                    <img
                                      src={URL.createObjectURL(selectedImage)}
                                      alt="prev"
                                    />
                                  </div>
                                </div>
                              )} */}
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

export default Addseason;
