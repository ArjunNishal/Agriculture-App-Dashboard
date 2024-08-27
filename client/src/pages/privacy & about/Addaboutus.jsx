import React, { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { axiosInstance } from "../../config";
import jwtDecode from "jwt-decode";
import moment from "moment";
import { Link } from "react-router-dom";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Swal from "sweetalert2";
import PermissionHandler from "../../components/PermissionHandler";

const Addaboutus = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  const [aboutus, setaboutus] = useState("");

  const handleaboutusChange = (event, editor) => {
    const data = editor.getData();
    setaboutus(data);
  };
  const [fpos, setfpos] = useState([]);
  const [selectedfpo, setselectedfpo] = useState("");
  const fetchAdminList = async () => {
    try {
      // Update the URL to include a query parameter to filter by role
      const response = await axiosInstance.get(
        "fpo/allfpo?page=1&limit=1000000000000000000000000000000000000000000000000",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setfpos(response.data.fpos.results);
    } catch (err) {
      console.log(err);
      //   setError("Error while fetching admin list");
    }
  };

  useEffect(() => {
    if (decoded.role === "superadmin") {
      fetchAdminList();
    }
    if (decoded.role === "fpoadmin") {
      getaboutus(decoded.fpo);
      setselectedfpo(decoded.fpo);
    }
  }, []);

  const getaboutus = async (fpoId) => {
    try {
      const response = await axiosInstance.get(`query/aboutus/${fpoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setaboutus(response.data.aboutus);
      }
    } catch (error) {
      console.error("Error fetching privacy policy:", error);
      //   throw new Error("Error fetching privacy policy");
    }
  };
  const editaboutus = async (e) => {
    e.preventDefault();
    try {
      let url = `query/aboutus/${selectedfpo}`;
      if (decoded.role === "fpoadmin") {
        url = `query/aboutus/${decoded.fpo}`;
      }
      const response = await axiosInstance.put(
        url,
        {
          aboutus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Show success alert using SweetAlert
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Aboutus updated successfully",
      });
      if (decoded.role === "superadmin") {
        setaboutus("");
        setselectedfpo("");
      }
    } catch (error) {
      console.error("Error updating Aboutus:", error.message);
      // Show error alert using SweetAlert
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error updating Aboutus",
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
              <div className="container-xxl flex-grow-1 container-p-y">
                <div className="card">
                  <div className="card-body">
                    <h4 className="text-center"> Add About us Details</h4>
                    <hr />
                    <div className="add_privacy_form_main">
                      <form onSubmit={editaboutus}>
                        <div className="row mx-0">
                          <div
                            className={
                              decoded.role === "superadmin"
                                ? "col-12 mb-3"
                                : "col-12 mb-3 d-none"
                            }
                          >
                            <label className="form-label">
                              <b>Select FPO </b>
                            </label>
                            <select
                              className="form-select"
                              id="inputGroupSelect01"
                              value={selectedfpo}
                              onChange={(e) => {
                                setselectedfpo(e.target.value);
                                getaboutus(e.target.value);
                              }}
                              required={
                                decoded.role === "superadmin" ? true : false
                              }
                            >
                              <option selected>Choose...</option>
                              {fpos.map((el, index) => (
                                <option key={index} value={el._id}>
                                  {el.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <hr
                            className={
                              decoded.role === "superadmin" ? "" : "d-none"
                            }
                          />
                          <div className="col-12 mb-5">
                            <h2>About us</h2>
                            <CKEditor
                              editor={ClassicEditor}
                              data={aboutus}
                              onChange={handleaboutusChange}
                              style={{ width: "100%" }}
                              disabled={
                                decoded.role === "superadmin" &&
                                selectedfpo !== "Choose..." &&
                                selectedfpo !== ""
                                  ? false
                                  : decoded.role === "fpoadmin"
                                  ? false
                                  : true
                              }
                            />
                          </div>
                          <div className="col-12 text-center">
                            <button
                              type="submit"
                              disabled={aboutus !== "" ? false : true}
                              className="btn-primary btn"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Addaboutus;
