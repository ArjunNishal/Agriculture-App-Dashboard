import jwtDecode from "jwt-decode";
import React, { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { axiosInstance } from "../../config";
import Swal from "sweetalert2";
import moment from "moment";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import Papa from "papaparse";
import PermissionHandler from "../../components/PermissionHandler";

const Alllanguage = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  const [figs, setfigs] = useState([]);
  const [editLanguage, seteditLanguage] = useState(null);
  const [selectedfile, setselectedfile] = useState(null);
  const fileInputRef = React.useRef(null);
  const [shortcode, setshortcode] = useState("");

  // Function to handle file input change
  const handleImageChange = (e) => {
    setselectedfile(e.target.files[0]);
  };

  const getlanguages = async () => {
    try {
      const response = await axiosInstance.get("admin-auth/getlanguages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setfigs(response.data.languages);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getlanguages();
  }, []);

  const updateLanguage = async () => {
    try {
      // const formData = new FormData();
      // formData.append("language", editLanguage.language);
      // formData.append("file", selectedfile);
      // formData.append("shortcode", editLanguage.shortcode);
      const response = await axiosInstance.put(
        `admin-auth/updatelanguage/${editLanguage._id}`,
        {
          language: editLanguage.language,
          shortcode: editLanguage.shortcode,
          data: data,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);

      // Show success alert using SweetAlert
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Language updated successfully",
        timer: 2000, // Auto close after 2 seconds
        showConfirmButton: false,
      });
      seteditLanguage(null);
      fileInputRef.current.value = "";
      setselectedfile(null);
      // Refresh the language list after successful update
      getlanguages();
    } catch (error) {
      console.log(error);

      // Show error alert using SweetAlert
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error updating language",
      });
    }
  };

  const showConfirmationDialog = () => {
    return Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
  };

  const deleteLanguageWithConfirmation = async (id) => {
    try {
      const result = await showConfirmationDialog();

      if (result.isConfirmed) {
        const response = await axiosInstance.delete(
          `admin-auth/deletelanguage/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(response.data);
        getlanguages();
      }
    } catch (error) {
      console.log(error);
    }
  };

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
      const fileExtension = inputFile?.type.split("/")[1];
      if (!allowedExtensions.includes(fileExtension)) {
        setError("Please input a csv file");
        return;
      }
      setFile(inputFile);
      handleParse(inputFile);
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

  console.log(editLanguage);
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
                    <span className="text-muted fw-light">Theme settings/</span>{" "}
                    Languages
                  </h4>
                  <div className="card">
                    <h5 className="card-header">Languages</h5>
                    <div className="table-responsive text-nowrap">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>
                              <b>S. No.</b>
                            </th>
                            <th>
                              <b>Language</b>
                            </th>
                            <th>
                              <b>Short code</b>
                            </th>
                            {/* <th>
                              <b>File Name</b>
                            </th> */}
                            <th>
                              <b>Date</b>
                            </th>
                            <th>
                              <b>Actions</b>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                          {figs.map((el, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{el.language}</td>
                              <td>{el?.shortcode}</td>
                              {/* <td></td> */}
                              <td>
                                {moment(el.createdAt).format("Do MMMM  YYYY")}
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button
                                    type="button"
                                    data-bs-toggle="modal"
                                    data-bs-target="#modalCenter"
                                    className="btn btn-info"
                                    onClick={() => seteditLanguage(el)}
                                  >
                                    <i className="fa-solid fa-pen"></i>
                                  </button>
                                  <button
                                    onClick={() => {
                                      deleteLanguageWithConfirmation(el._id);
                                    }}
                                    className="btn btn-danger"
                                  >
                                    <i className="fa-solid fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {figs.length === 0 && (
                        <div>
                          <p className="text-center my-3">
                            No Radio category found
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
                        className="modal-dialog modal-dialog-centered"
                        role="document"
                      >
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title" id="largeModal">
                              Edit Admin details
                            </h5>
                            <button
                              type="button"
                              className="btn-close"
                              data-bs-dismiss="modal"
                              aria-label="Close"
                              onClick={() => seteditLanguage(null)}
                            ></button>
                          </div>
                          <div className="modal-body">
                            <div className="row">
                              <div className="col mb-3">
                                <label
                                  for="nameWithTitle"
                                  className="form-label"
                                >
                                  Language Name
                                </label>
                                <input
                                  type="text"
                                  id="nameWithTitle"
                                  name="languagename"
                                  className="form-control"
                                  placeholder="Language Name"
                                  value={editLanguage?.language}
                                  onChange={(e) =>
                                    seteditLanguage({
                                      ...editLanguage,
                                      language: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="col mb-3">
                                <label
                                  for="nameWithTitle"
                                  className="form-label"
                                >
                                  Short code
                                </label>
                                <input
                                  type="text"
                                  id="nameWithTitle"
                                  name="shortcode"
                                  className="form-control"
                                  placeholder="short code"
                                  value={editLanguage?.shortcode}
                                  onChange={(e) =>
                                    seteditLanguage({
                                      ...editLanguage,
                                      shortcode: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="mb-3  col-12">
                                <label className="form-label">
                                  Current Language File
                                </label>
                                <p className="text-primary">
                                  <b>
                                    <i className="fa-solid fa-file"></i>&nbsp;
                                    {/* {editLanguage?.file} */}
                                  </b>
                                </p>
                              </div>
                              <div className="mb-3  col-12">
                                <label className="form-label">
                                  Select new Language File
                                </label>
                                <input
                                  type="file"
                                  className="form-control"
                                  onChange={handleFileChange}
                                  ref={fileInputRef}
                                />
                                <p>
                                  select only if you want to change the file
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="modal-footer">
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              data-bs-dismiss="modal"
                              onClick={() => seteditLanguage(null)}
                            >
                              Close
                            </button>
                            <button
                              type="button"
                              data-bs-dismiss="modal"
                              className="btn btn-primary"
                              onClick={updateLanguage}
                            >
                              Save changes
                            </button>
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

export default Alllanguage;
