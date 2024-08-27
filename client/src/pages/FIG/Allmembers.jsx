import React, { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { axiosInstance } from "../../config";
import jwtDecode from "jwt-decode";
import moment from "moment";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import Pagination from "../../components/Pagination";
import PermissionHandler from "../../components/PermissionHandler";

const Allmembers = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  console.log(decoded);
  const [searchvalue, setsearchvalue] = useState("");
  const [figs, setfigs] = useState([]);
  const [error, setError] = useState(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const fpo = searchParams.get("fpo");
  //   setshowfigdetails
  const [showfigdetails, setshowfigdetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setitemsPerPage] = useState(10);
  const [totalpages, settotalpages] = useState(0);
  const [roleid, setroleid] = useState({});

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const fetchrole = async () => {
    try {
      let url = "user/getrolebyname/member";

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

  const fetchFIGs = async () => {
    try {
      let url = "admin-auth/admin-all-fig";

      if (decoded.role === "fpoadmin") {
        url = `fpo/fpomembers/${decoded.fpo}?page=${currentPage}&limit=${itemsPerPage}`;
      }
      if (decoded.role === "superadmin" && fpo !== null) {
        url = `fpo/fpomembers/${fpo}?page=${currentPage}&limit=${itemsPerPage}`;
      }

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      setfigs(response.data.results);
      settotalpages(response.data.totalRecord);
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

  const toggleuserStatus = async (id, activate) => {
    try {
      const response = await axiosInstance.patch(
        `admin-auth/update-user/${id}/${activate}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedSurvey = response.data;

      // const index = figs.findIndex((fig) => fig._id === id);
      // if (index !== -1) {
      //   figs[index] = updatedSurvey;
      fetchFIGs();
      // }
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
              decoded.permissions?.includes("members") ? (
                <>
                  {!showfigdetails && (
                    <div className="container-xxl flex-grow-1 container-p-y">
                      <div className="d-flex  justify-content-between align-items-center">
                        <h4 className="py-3 m-0">All Members</h4>
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
                          {" "}
                          <h5 className="card-header">Members</h5>
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
                                <th>
                                  <b>Mobile</b>
                                </th>
                                {/* <th>
                                  <b>Email</b>
                                </th> */}
                                {/* <th>
                                  <b>FPO</b>
                                </th> */}
                                {/* <th>
                                  <b>Role</b>
                                </th> */}
                                {/* <th>
                                  <b>JOined FIG's</b>
                                </th> */}
                                <th>
                                  <b>Status</b>
                                </th>
                                {/* {(decoded.permissions?.includes(
                                        "editfigstatus"
                                      ) ||
                                        decoded.role === "superadmin") && ( */}
                                <th>
                                  <b>Action</b>
                                </th>
                                {/* )} */}
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
                                    {/* <Link to={`/singlefig/${el._id}`}> */}
                                    <span className="fw-medium">
                                      {el?.firstname}&nbsp;
                                      {el?.lastname}
                                    </span>
                                    {/* </Link> */}
                                  </td>
                                  <td>{el?.phone}</td>
                                  {/* <td>{el?.email}</td> */}
                                  {/* <td>{el?.role?.role}</td> */}
                                  {/* <td>{el?.joinedFIG?.length}</td> */}
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
                                  {/* {(decoded.permissions?.includes(
                                          "editfigstatus"
                                        ) ||
                                          decoded.role === "superadmin") && ( */}
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
                                                toggleuserStatus(
                                                  el._id,
                                                  0,
                                                  el.fpo
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
                                                toggleuserStatus(
                                                  el._id,
                                                  2,
                                                  el.fpo
                                                )
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
                                                toggleuserStatus(
                                                  el._id,
                                                  1,
                                                  el.fpo
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
                                                toggleuserStatus(
                                                  el._id,
                                                  2,
                                                  el.fpo
                                                )
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
                                              toggleuserStatus(
                                                el._id,
                                                0,
                                                el.fpo
                                              )
                                            }
                                          >
                                            <i className="fa-solid fa-circle text-success"></i>{" "}
                                            Unblock
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  {/* )} */}
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
                                No members found
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
                  )}
                  {showfigdetails && (
                    <div className="container-xxl flex-grow-1 container-p-y">
                      <h4 className="py-3 mb-4">
                        <button
                          className="btn btn-primary rounded-pill me-2"
                          onClick={() => {
                            setshowfigdetails(null);
                          }}
                        >
                          {" "}
                          <i className="fa-solid fa-angle-left"></i> &nbsp;
                        </button>
                        <span className="text-muted fw-light">All FIG's /</span>{" "}
                        {showfigdetails.name}
                      </h4>
                      <div className="fig-details">
                        <div className="card">
                          <div className="row m-0 ">
                            <div className="col-md-4 p-3">
                              <b>FIG Name</b>
                            </div>
                            <div className="col-md-8 p-3">
                              : &nbsp;&nbsp; {showfigdetails.name}
                            </div>
                            <div className="col-md-4 p-3">
                              <b>Location</b>
                            </div>
                            <div className="col-md-8 p-3">
                              : &nbsp;&nbsp; {showfigdetails.location}
                            </div>
                            <div className="col-md-4 p-3">
                              <b>Leader</b>
                            </div>
                            <div className="col-md-8 p-3">
                              : &nbsp;&nbsp;{" "}
                              {showfigdetails?.leaderId?.firstname}
                            </div>
                            <div className="col-md-4 p-3">
                              <b>Members</b>
                            </div>
                            <div className="col-md-8 p-3">
                              : &nbsp;&nbsp;{" "}
                              {showfigdetails.Joinedmembers.length}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* <div className="fig-details">
                      <table className="table fig-details-table">
                        <tbody>
                          <tr>
                            <th colSpan={1}>Name</th>
                            <td>{showfigdetails.name}</td>
                          </tr>
                          <tr>
                            <th colSpan={1}>Location</th>
                            <td>{showfigdetails.location}</td>
                          </tr>
                          <tr>
                            <th colSpan={1}>Leader</th>
                            <td>{showfigdetails?.leaderId?.name}</td>
                          </tr>
                          <tr>
                            <th colSpan={1}>Members</th>
                            <td>{showfigdetails.Joinedmembers.length}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div> */}
                      {/* <div className="fig-details">
                      <table className="table fig-details-table">
                        <tbody>
                          <tr>
                            <th colSpan={1}>Name</th>
                            <td>{showfigdetails.name}</td>
                          </tr>
                          <tr>
                            <th colSpan={1}>Location</th>
                            <td>{showfigdetails.location}</td>
                          </tr>
                          <tr>
                            <th colSpan={1}>Leader</th>
                            <td>{showfigdetails?.leaderId?.name}</td>
                          </tr>
                          <tr>
                            <th colSpan={1}>Members</th>
                            <td>{showfigdetails.Joinedmembers.length}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="fig-details">
                      <table className="table fig-details-table">
                        <tbody>
                          <tr>
                            <th colSpan={1}>Name</th>
                            <td>{showfigdetails.name}</td>
                          </tr>
                          <tr>
                            <th colSpan={1}>Location</th>
                            <td>{showfigdetails.location}</td>
                          </tr>
                          <tr>
                            <th colSpan={1}>Leader</th>
                            <td>{showfigdetails?.leaderId?.name}</td>
                          </tr>
                          <tr>
                            <th colSpan={1}>Members</th>
                            <td>{showfigdetails.Joinedmembers.length}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div> */}
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
export default Allmembers;
