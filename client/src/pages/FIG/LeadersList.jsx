import React, { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { axiosInstance } from "../../config";
import jwtDecode from "jwt-decode";
import moment from "moment";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import Pagination from "../../components/Pagination";
import PermissionHandler from "../../components/PermissionHandler";
import Swal from "sweetalert2";

const LeadersList = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  console.log(decoded);

  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const fpo = searchParams.get("fpo");
  // const { fpo } = useParams("");
  // const fpoid = fpo;

  const [figs, setfigs] = useState([]);
  const [error, setError] = useState(null);
  //   setshowfigdetails
  const [showfigdetails, setshowfigdetails] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setitemsPerPage] = useState(10);
  const [totalpages, settotalpages] = useState(0);
  const [searchvalue, setsearchvalue] = useState("");

  const [roleid, setroleid] = useState({});
  const fetchrole = async () => {
    try {
      let url = "user/getrolebyname/leader";

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const fetchFIGs = async () => {
    try {
      let url = "admin-auth/get-FIGLeaders";

      if (decoded.role === "fpoadmin") {
        url = `admin-auth/get-FIGLeaders/${decoded.fpo}?page=${currentPage}&limit=${itemsPerPage}`;
      }
      if (decoded.role === "superadmin" && fpo !== null) {
        url = `admin-auth/get-FIGLeaders/${fpo}?page=${currentPage}&limit=${itemsPerPage}`;
      }

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      settotalpages(response.data.totalRecord);
      setfigs(response.data.results);
      const pendingreq = response.data.results.filter((el) => el.status === 0);
      setshowfigdetails(pendingreq);
    } catch (err) {
      console.log(err);
      setError("Error while fetching admin list");
    }
  };

  useEffect(() => {
    fetchFIGs();
    fetchrole();
  }, []);

  useEffect(() => {
    fetchFIGs();
  }, [currentPage]);

  const toggleSurveyStatus = async (id, activate) => {
    try {
      const response = await axiosInstance.patch(
        `admin-auth/update-FIGLeader/${id}/${activate}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedSurvey = response.data;

      //   const index = figs.findIndex((fig) => fig._id === id);
      //   if (index !== -1) {
      // figs[index] = updatedSurvey;
      fetchFIGs();
      //   }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSearch = async (val) => {
    try {
      const apiUrl = "admin-auth/search";
      const modelName = "User";
      const role = roleid._id;
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
          $or: [
            { firstname: { $regex: val, $options: "i" } },
            { lastname: { $regex: val, $options: "i" } },
            { phone: { $regex: val, $options: "i" } },
            // { radio: rid },
          ],
          role: role,
        };
      } else if (decoded.role === "fpoadmin") {
        mongodbQuery = {
          $or: [
            { firstname: { $regex: val, $options: "i" } },
            { lastname: { $regex: val, $options: "i" } },
            { phone: { $regex: val, $options: "i" } },
          ],
          fpo: decoded.fpo,
          role: role,
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
        console.log(response.data, "members search");
        setfigs(response.data.data);
        // setSearchResults(response.data.data);
      } else {
        console.error("Error:", response.data.msg);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  console.log(figs, "members search");

  const handlesearchevent = (e) => {
    const value = e.target.value;
    if (value === "") {
      fetchFIGs();
    } else if (value !== "" && value) {
      handleSearch(value);
    }
    setsearchvalue(value);
  };

  const navigate = useNavigate("");

  const handleDelete = async (contentCreatorId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this leader!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const response = await axiosInstance.delete(
          `admin-auth/leader/delete/${contentCreatorId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          fetchFIGs();
          Swal.fire("Deleted!", "leader deleted successfully.", "success");
        }
      } else {
        Swal.fire("Cancelled", "Your leader is safe :)", "info");
      }
    } catch (error) {
      console.error("Error:", error.message);
      Swal.fire("Error", "Failed to delete leader", "error");
    }
  };
  return (
    <div>
      {/* <!-- Layout wrapper --> */}
      <div className="layout-wrapper layout-content-navbar">
        <div className="layout-container">
          {/* <!-- Menu --> */}

          <Navigation leaderreq={showfigdetails} />
          {/* <!-- / Menu --> */}

          {/* <!-- Layout container --> */}
          <div className="layout-page">
            <Topbar />

            {/* <!-- / Layout page --> */}
            <div className="content-wrapper">
              {/* {fpo ? fpo : ""} */}
              {decoded.role === "superadmin" ||
              decoded.permissions?.includes("figp") ? (
                <div className="container-xxl flex-grow-1 container-p-y">
                  <div className="d-flex  justify-content-between align-items-center">
                    <h4 className="py-3 mb-0">FPO Leaders list</h4>{" "}
                    <Link
                      to={``}
                      className="btn btn-outline-primary"
                      onClick={() => navigate(-1)}
                    >
                      <i className="fa-solid  fa-angle-left"></i>
                      &nbsp;Go Back
                    </Link>{" "}
                  </div>
                  {/* Basic Bootstrap Table */}
                  <div className="card">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="card-header">FPO leaders</h5>
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
                      </div>{" "}
                    </div>
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
                            <th>
                              <b>Phone</b>
                            </th>
                            {/* <th>
                              <b>Location</b>
                            </th> */}
                            {/* <th>
                              <b>Owned FIG's</b>
                            </th> */}
                            <th>
                              <b>STATUS</b>
                            </th>
                            {(decoded.permissions?.includes(
                              "editfigleaderstatus"
                            ) ||
                              decoded.role === "superadmin") && (
                              <th>
                                <b>ACTION</b>
                              </th>
                            )}
                            {/* <th>
                              <b>Date</b>
                            </th>
                            {decoded.role === "fpoadmin" && (
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
                                  to={`/member/${el?.memberId?._id}`}
                                  // onClick={() => setshowfigdetails(el)}
                                >
                                  <span className="fw-medium">
                                    {el?.memberId?.firstname
                                      ? `${el?.memberId?.firstname} ${el?.memberId?.lastname}`
                                      : el?.firstname || "N/A"}
                                    {/* {el?.memberId?.firstname ||
                                      el?.firstname ||
                                      "N/A"} */}
                                  </span>
                                </Link>
                              </td>
                              <td>
                                {el?.phone || el?.memberId?.phone || "N/A"}
                              </td>
                              {/* <td>{el?.memberId?.location || "N/A"}</td> */}
                              {/* <td>
                                {el?.memberId?.FIGOwned?.length || "N/A"}
                              </td> */}

                              {/* <td>{el.status}</td> */}
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
                                    {el.approved === 1
                                      ? "approved"
                                      : el.approved === 2
                                      ? "blocked"
                                      : "unapproved"}
                                  </span>
                                </div>
                              </td>
                              {(decoded.permissions?.includes(
                                "editfigleaderstatus"
                              ) ||
                                decoded.role === "superadmin") && (
                                <td>
                                  {" "}
                                  {/* {moment(el.createdAt).format(" Do MMMM YYYY ")} */}
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
                                              toggleSurveyStatus(
                                                el?.memberId?._id,
                                                0
                                              )
                                            }
                                          >
                                            <i className="fa-solid fa-circle text-warning"></i>{" "}
                                            Deactivate
                                          </a>
                                          <a
                                            className="dropdown-item"
                                            href="javascript:void(0);"
                                            onClick={() =>
                                              toggleSurveyStatus(
                                                el?.memberId?._id,
                                                2
                                              )
                                            }
                                          >
                                            <i className="fa-solid fa-circle text-danger"></i>{" "}
                                            Block
                                          </a>
                                          <a
                                            className="dropdown-item"
                                            href="javascript:void(0);"
                                            onClick={() => handleDelete(el._id)}
                                          >
                                            <i className="fa-solid fa-trash text-danger"></i>{" "}
                                            Delete
                                          </a>
                                        </>
                                      ) : (
                                        <>
                                          <a
                                            className="dropdown-item"
                                            href="javascript:void(0);"
                                            onClick={() =>
                                              toggleSurveyStatus(
                                                el?.memberId?._id,
                                                1
                                              )
                                            }
                                          >
                                            <i className="fa-solid fa-circle text-success"></i>{" "}
                                            Activate
                                          </a>
                                          <a
                                            className="dropdown-item"
                                            href="javascript:void(0);"
                                            onClick={() =>
                                              toggleSurveyStatus(
                                                el?.memberId?._id,
                                                2
                                              )
                                            }
                                          >
                                            <i className="fa-solid fa-circle text-danger"></i>{" "}
                                            Block
                                          </a>
                                          <a
                                            className="dropdown-item"
                                            href="javascript:void(0);"
                                            onClick={() => handleDelete(el._id)}
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
                          <p className="text-center my-3">No leaders found</p>
                        </div>
                      )}
                    </div>{" "}
                    {/* {!searchvalue && ( */}
                    <div className="py-2 px-3">
                      <Pagination
                        totalItems={totalpages}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                      />
                    </div>
                    {/* )} */}
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

export default LeadersList;
