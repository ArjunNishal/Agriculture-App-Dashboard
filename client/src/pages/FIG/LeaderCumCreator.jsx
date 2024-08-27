import React, { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { axiosInstance } from "../../config";
import jwtDecode from "jwt-decode";
import moment from "moment";
import { Link, useLocation } from "react-router-dom";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import Swal from "sweetalert2";
import Pagination from "../../components/Pagination";
import PermissionHandler from "../../components/PermissionHandler";

const LeaderCumCreator = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  const [searchvalue, setsearchvalue] = useState("");
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const fpo = searchParams.get("fpo");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setitemsPerPage] = useState(10);
  const [totalpages, settotalpages] = useState(0);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const [creators, setcreators] = useState([]);
  const [roleid, setroleid] = useState({});
  const fetchcreators = async () => {
    try {
      let url = "admin-auth/leader-creators/all";

      if (decoded.role === "fpoadmin") {
        url = `admin-auth/leader-creators/fpo/${decoded.fpo}?page=${currentPage}&limit=${itemsPerPage}`;
      }

      if (decoded.role === "superadmin" && fpo !== null) {
        url = `admin-auth/leader-creators/fpo/${fpo}?page=${currentPage}&limit=${itemsPerPage}`;
      }

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      setcreators(response.data.data.results);
      settotalpages(response.data.data.totalRecord);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchrole = async () => {
    try {
      let url = "user/getrole/leadercumcreator";

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      setroleid(response.data.roles);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchcreators();
  }, [currentPage]);

  useEffect(() => {
    fetchcreators();
    // fetchrole();
  }, []);

  const toggleSurveyStatus = async (id, activate) => {
    try {
      const response = await axiosInstance.put(
        `admin-auth/leader-creator/edit/${id}/${activate}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedSurvey = response.data.data;

      const index = creators.findIndex((fig) => fig._id === id);
      if (index !== -1) {
        creators[index] = updatedSurvey;
        fetchcreators();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleDelete = async (contentCreatorId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this content creator!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await axiosInstance.delete(
          `admin-auth/leader-creator/delete/${contentCreatorId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          fetchcreators();
          Swal.fire(
            "Deleted!",
            "Content Creator deleted successfully.",
            "success"
          );
        }
      } else {
        Swal.fire("Cancelled", "Your content creator is safe :)", "info");
      }
    } catch (error) {
      console.error("Error:", error.message);
      Swal.fire("Error", "Failed to delete Content Creator", "error");
    }
  };
  const handleSearch = async (val) => {
    try {
      const apiUrl = "admin-auth/search";
      const modelName = "LeaderandCreator";
      // const role = roleid._id;

      // const mongodbQuery = {
      //   $or: [
      //     { name: { $regex: val, $options: "i" } },
      //     { phone: { $regex: val, $options: "i" } },
      //     // { radio: rid },
      //   ],
      // };
      let mongodbQuery;

      if (decoded.role === "superadmin") {
        mongodbQuery = {
          $and: [
            {
              $or: [{ name: { $regex: val, $options: "i" } }],
            },
          ],
        };
      } else if (decoded.role === "fpoadmin") {
        mongodbQuery = {
          $and: [
            {
              $or: [{ name: { $regex: val, $options: "i" } }],
            },
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
        setcreators(response.data.data);
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
      fetchcreators();
    } else if (value !== "" && value) {
      handleSearch(value);
    }
    setsearchvalue(value);
  };
  return (
    <div>
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
                {/* Content */}
                {/* {!showfpodetails && ( */}
                {decoded.role === "superadmin" ||
                decoded.permissions?.includes("leadercumcreator") ? (
                  <div className="container-xxl flex-grow-1 container-p-y">
                    <h4 className="py-3 mb-4">
                      <span className="text-muted fw-light">FIG /</span>Leader
                      Cum Content Creators
                    </h4>
                    {/* Basic Bootstrap Table */}
                    <div className="card">
                      <div className="d-flex justify-content-between align-items-center">
                        {" "}
                        <h5 className="card-header">
                          Leader Cum Content Creators
                        </h5>
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
                                <b>S.NO.</b>
                              </th>
                              <th>
                                <b>Name</b>
                              </th>
                              {/* <th>
                                <b>FPO name</b>
                              </th> */}
                              <th>
                                <b>Mobile</b>
                              </th>
                              {/* <th>
                                <b>Members</b>
                              </th>
                              <th>
                                <b>Meeting</b>
                              </th> */}
                              <th>
                                <b>Status</b>
                              </th>
                              {(decoded.permissions?.includes(
                                "editfigstatus"
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
                            {creators.map((el, index) => (
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
                                    to=""
                                    //   onClick={() => setshowfigdetails(el)}
                                  >
                                    <span className="fw-medium">
                                      {el?.name}
                                    </span>
                                  </Link>
                                </td>
                                {/* <td>{el?.fpo?.name}</td> */}
                                <td>{el?.creatorId?.phone}</td>
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
                                        : "Pending"}
                                    </span>
                                  </div>
                                </td>
                                {(decoded.permissions?.includes(
                                  "editfigstatus"
                                ) ||
                                  decoded.role === "superadmin") && (
                                  <td>
                                    <div className="dropdown">
                                      <button
                                        type="button"
                                        className="btn btn-primary  dropdown-toggle hide-arrow"
                                        data-bs-toggle="dropdown"
                                      >
                                        <i className="fa-solid fa-pen-to-square"></i>
                                      </button>
                                      <div className="dropdown-menu dropdown-menu-end">
                                        {el.status === 1 ? (
                                          <>
                                            <a
                                              className="dropdown-item"
                                              href="javascript:void(0);"
                                              onClick={() =>
                                                toggleSurveyStatus(el._id, 3)
                                              }
                                            >
                                              <i className="fa-solid fa-circle text-warning"></i>{" "}
                                              Remove from Content creator
                                            </a>
                                            <a
                                              className="dropdown-item"
                                              href="javascript:void(0);"
                                              onClick={() =>
                                                toggleSurveyStatus(el._id, 2)
                                              }
                                            >
                                              <i className="fa-solid fa-circle text-danger"></i>{" "}
                                              Remove from Leader
                                            </a>
                                            <a
                                              className="dropdown-item"
                                              href="javascript:void(0);"
                                              onClick={() =>
                                                toggleSurveyStatus(el._id, 4)
                                              }
                                            >
                                              <i className="fa-solid fa-trash text-danger"></i>{" "}
                                              Remove from Content creator &
                                              Leader
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
                                                handleDelete(el._id)
                                              }
                                            >
                                              <i className="fa-solid fa-trash text-danger"></i>{" "}
                                              Delete Request
                                            </a>
                                          </>
                                        ) : (
                                          <>
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
                                            <a
                                              className="dropdown-item"
                                              href="javascript:void(0);"
                                              onClick={() =>
                                                handleDelete(el._id)
                                              }
                                            >
                                              <i className="fa-solid fa-trash text-danger"></i>{" "}
                                              Delete
                                            </a>
                                          </>
                                        )}
                                      </div>
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
                        {creators?.length === 0 && (
                          <div>
                            <p className="text-center my-3">
                              No Content creators found
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
                  </div>
                ) : (
                  <Unauthorisedpage />
                )}
              </div>
            </div>
          </div>

          {/* //   <!-- Overlay --> */}
          <div className="layout-overlay layout-menu-toggle"></div>
        </div>
        {/* // <!-- / Layout wrapper --> */}
      </div>
    </div>
  );
};

export default LeaderCumCreator;
