import React, { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { axiosInstance } from "../../config";
import jwtDecode from "jwt-decode";
import moment from "moment";
import { Link } from "react-router-dom";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import Pagination from "../../components/Pagination";
import PermissionHandler from "../../components/PermissionHandler";

const NewsgrpsList = () => {
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const fetchFIGs = async () => {
    try {
      let url = `news/admin/get-all-news-cat?page=${currentPage}&limit=${itemsPerPage}`;

      if (decoded.role === "fpoadmin") {
        url = `news/admin/get-all-news-cat/${decoded.fpo}?page=${currentPage}&limit=${itemsPerPage}`;
      }

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      settotalpages(response.data.data.totalRecord);
      setfigs(response.data.data.results);
    } catch (err) {
      console.log(err);
      setError("Error while fetching admin list");
    }
  };
  useEffect(() => {
    fetchFIGs();
  }, [currentPage]);

  useEffect(() => {
    fetchFIGs();
  }, []);

  const toggleSurveyStatus = async (id, activate) => {
    try {
      const response = await axiosInstance.patch(
        `admin-auth/update-newsGroup-status/${id}/${activate}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedSurvey = response.data;

      const index = figs.findIndex((fig) => fig._id === id);
      if (index !== -1) {
        figs[index] = updatedSurvey;
        fetchFIGs();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleSearch = async (val) => {
    try {
      const apiUrl = "admin-auth/search";
      const modelName = "NewsGroup";

      // const mongodbQuery = {
      //   $or: [
      //     { name: { $regex: val, $options: "i" } },
      //     { phone: { $regex: val, $options: "i" } },
      //     // { mobileno: { $regex: val, $options: "i" } },
      //   ],
      // };

      let mongodbQuery;

      if (decoded.role === "superadmin") {
        mongodbQuery = {
          $or: [
            { name: { $regex: val, $options: "i" } },
            { phone: { $regex: val, $options: "i" } },
          ],
        };
      } else if (decoded.role === "fpoadmin") {
        mongodbQuery = {
          $and: [
            {
              $or: [
                { name: { $regex: val, $options: "i" } },
                { phone: { $regex: val, $options: "i" } },
              ],
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
              decoded.permissions?.includes("newsp") ? (
                <div className="container-xxl flex-grow-1 container-p-y">
                  <h4 className="py-3 mb-4">
                    <span className="text-muted fw-light">News /</span> News
                    Categories
                  </h4>
                  {/* Basic Bootstrap Table */}
                  <div className="card">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="card-header">News Categories</h5>{" "}
                      <div className="nav-item d-flex align-items-center me-2 border px-2 rounded">
                        <i className="bx bx-search fs-4 lh-0"></i>
                        <input
                          type="text"
                          className="form-control border-0  shadow-none ps-1 ps-sm-2"
                          placeholder="Search..."
                          aria-label="Search..."
                          onChange={(e) => handlesearchevent(e)}
                        />
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
                            <th>S.NO.</th>
                            <th>
                              <b>Category Name</b>
                            </th>
                            <th>
                              <b>Description</b>
                            </th>
                            {decoded.role === "superadmin" && (
                              <th>
                                <b>FPO</b>
                              </th>
                            )}
                            <th>
                              <b>Owner</b>
                            </th>
                            <th>
                              <b>Status</b>
                            </th>
                            {/* <th>
                              <b>Status</b>
                            </th> */}
                            {(decoded.permissions?.includes(
                              "editnewsgrpstatus"
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
                              {" "}
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
                                  to={`/newsgrp/${el._id}`}
                                  //   onClick={() => setshowfigdetails(el)}
                                >
                                  <span className="fw-medium">{el.name}</span>
                                </Link>
                              </td>
                              <td>{el.description}</td>
                              {decoded.role === "superadmin" && (
                                <td>
                                  {/* {el?.fpo?.name} */}
                                  <Link
                                    to={`/singlefpo/${el?.fpo?._id}`}
                                    // onClick={() => {
                                    //   setshowfpodetails(true);
                                    //   setselectedfpo(el);
                                    //   fetchData(el._id);
                                    //   fetchQueryList(el._id);
                                    //   getPrivacyPolicy(el._id);
                                    //   getaboutus(el._id);
                                    // }}
                                  >
                                    <span className="fw-medium">
                                      {el?.fpo?.name}
                                    </span>
                                  </Link>
                                </td>
                              )}
                              <td>
                                {/* <span className="badge bg-label-primary me-1">
                                Active
                              </span> */}
                                {el?.memberId?.firstname}{" "}
                                {el?.memberId?.lastname}
                              </td>
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
                                </div>
                              </td>
                              {(decoded.permissions?.includes(
                                "editnewsgrpstatus"
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
                          <p className="text-center my-3">
                            No News Categories found
                          </p>
                        </div>
                      )}
                    </div>
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
      </div>
    </div>
  );
};
export default NewsgrpsList;
