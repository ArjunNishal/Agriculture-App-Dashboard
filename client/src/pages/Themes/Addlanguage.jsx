import React, { useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import jwtDecode from "jwt-decode";
import { axiosInstance } from "../../config";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Papa from "papaparse";
import PermissionHandler from "../../components/PermissionHandler";

const Addlanguage = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  // console.log(decoded);
  const navigate = useNavigate("");
  // /admin/addlanguage
  const [language, setlanguage] = useState("");
  const [shortcode, setshortcode] = useState("");
  const [selectedfile, setselectedfile] = useState(null);
  const fileInputRef = React.useRef(null);

  const allowedExtensions = ["csv"];

  const [data, setData] = useState([]);

  // It state will contain the error when
  // correct file extension is not used
  const [error, setError] = useState("");

  // It will store the file uploaded by the user
  const [file, setFile] = useState("");

  const handleFileChange = (e) => {
    setError("");

    // Check if user has entered the file
    if (e.target.files.length) {
      const inputFile = e.target.files[0];
      console.log(inputFile, "inputFile");
      const fileExtension = inputFile?.type.split("/")[1];
      console.log(fileExtension, "fileExtension");
      if (allowedExtensions.includes(fileExtension)) {
        setFile(inputFile);
        handleParse(inputFile);
      } else {
        setFile("");
        console.log("please enter csv file");
        setError("Please input a csv file");
        return;
      }
    }
  };

  const handleParse = (inputFile) => {
    if (!inputFile) return alert("Enter a valid file");
    const reader = new FileReader();
    reader.onload = async ({ target }) => {
      const csv = Papa.parse(target.result, {
        header: true,
      });
      const parsedData = csv?.data;

      const resultObject = parsedData.reduce((acc, item) => {
        if (item.key && item.value) {
          acc[item.key] = item.value;
        }
        return acc;
      }, {});
      console.log(resultObject);
      setData(resultObject);
    };
    reader.readAsText(inputFile);
  };

  // console.log(data, language, shortcode, "data");

  // Function to handle file input change
  const handleImageChange = (e) => {
    setselectedfile(e.target.files[0]);
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!file || data.length === 0) {
        return Swal.fire({
          icon: "error",
          title: "Please select a valid csv file",
          text: "Select a csv file with data in it.",
        });
      }

      const formData = new FormData();
      formData.append("language", language);
      formData.append("file", data);
      formData.append("shortcode", shortcode);

      // Replace 'YOUR_SERVER_URL' and 'YOUR_API_ENDPOINT' with your actual server URL and API endpoint
      const response = await axiosInstance.post(
        `admin-auth/admin/addlanguage`,
        { language, data, shortcode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log(response.data);

      // Show success message with swal
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "New language added successfully.",
      });
      navigate("/alllanguages");
      setlanguage("");
      setselectedfile(null);
      fileInputRef.current.value = "";
    } catch (error) {
      console.error(error);
      if (error.response.status === 500) {
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
          text: "An error occurred while adding the language.",
        });
      }
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
              {decoded.role === "superadmin" ? (
                <div className="container-xxl flex-grow-1 container-p-y">
                  <h4 className="py-3 mb-4">
                    <span className="text-muted fw-light">
                      Theme settings /
                    </span>{" "}
                    Add Language
                  </h4>
                  <div className="addlang-main">
                    <div className="card p-3">
                      <div className="row align-items-center">
                        <div className="col-md-5 col-12">
                          <div className="addlang-img-left">
                            <img
                              src="assets/img/elements/hindi.png"
                              alt="hindi"
                            />
                          </div>
                        </div>
                        <div className="col-md-6 col-12">
                          <div className="addlang-main-form shadow rounded p-3">
                            <form
                              className="addradio-form  p-3 rounded row"
                              onSubmit={handleSubmit}
                            >
                              <h3 className="text-primary">Add Language</h3>
                              <hr />
                              <div className="mb-3  col-12">
                                <label className="form-label">
                                  Language name{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <div className="input-group mb-3">
                                  <span
                                    className="input-group-text"
                                    id="basic-addon1"
                                  >
                                    <i className="fa-solid fa-language"></i>
                                  </span>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Language name"
                                    value={language}
                                    onChange={(e) =>
                                      setlanguage(e.target.value)
                                    }
                                    aria-label="Title"
                                    aria-describedby="basic-addon1"
                                    required
                                  />
                                </div>
                              </div>
                              <div className="mb-3  col-12">
                                <label className="form-label">
                                  Short code for language{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <div className="input-group mb-3">
                                  <span
                                    className="input-group-text"
                                    id="basic-addon1"
                                  >
                                    <i className="fa-solid fa-language"></i>
                                  </span>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Shortcode"
                                    value={shortcode}
                                    onChange={(e) =>
                                      setshortcode(e.target.value)
                                    }
                                    aria-label="Title"
                                    aria-describedby="basic-addon1"
                                    required
                                  />
                                </div>
                              </div>
                              <div className="mb-3  col-12">
                                <label className="form-label">
                                  Select Language File{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="file"
                                  className="form-control"
                                  id="csvInput"
                                  // onChange={handleImageChange}
                                  onChange={handleFileChange}
                                  ref={fileInputRef}
                                  required
                                />
                              </div>
                              {/* <div>
                                <button
                                  className="btn btn-primary"
                                  onClick={handleParse}
                                >
                                  Parse
                                </button>
                              </div> */}
                              {/* <div style={{ marginTop: "3rem" }}>
                                {error
                                  ? error
                                  : data.map((e, i) => (
                                      <div key={i} className="item">
                                        {e[0]}:{e[1]}
                                      </div>
                                    ))}
                              </div> */}
                              <div className="col-12 text-center mb-3">
                                <button
                                  type="submit"
                                  className="btn btn-primary"
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

export default Addlanguage;
