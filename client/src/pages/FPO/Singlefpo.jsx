import React, { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { Link, useNavigate, useParams } from "react-router-dom";
import { axiosInstance, renderUrl } from "../../config";
import Swal from "sweetalert2";
import moment from "moment";
import jwtDecode from "jwt-decode";
import PermissionHandler from "../../components/PermissionHandler";

const Singlefpo = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  const { fpoid } = useParams();
  const [fpos, setfpos] = useState([]);
  const [error, setError] = useState(null);
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [aboutus, setaboutus] = useState("");
  const [selectedquery, setselectedquery] = useState("");
  const [queries, setqueries] = useState([]);
  const [totalleaders, settotalleaders] = useState(0);

  const [selectedfpo, setselectedfpo] = useState({});
  // /admin-fig/:id

  const [fpoData, setFPOData] = useState(null);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`fpo/fpodata/${fpoid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data.data);
      setselectedfpo(response.data.data.fpo);
      setFPOData(response.data.data);
      setqueries(response.data.data.queries);
      settotalleaders(response.data.data.fig);
      console.log("fpodata", response.data.data);
    } catch (error) {
      console.error("Error fetching FPO data:", error.message);
    }
  };
  useEffect(() => {
    fetchData();
    getPrivacyPolicy();
    getaboutus();
  }, [fpoid]);

  const getPrivacyPolicy = async () => {
    try {
      const response = await axiosInstance.get(`query/privacy-policy/${fpoid}`);
      if (response.status === 200) {
        setPrivacyPolicy(response.data.privacyPolicy);
      }
    } catch (error) {
      console.error("Error fetching privacy policy:", error);
      //   throw new Error("Error fetching privacy policy");
    }
  };
  const getaboutus = async () => {
    try {
      const response = await axiosInstance.get(`query/aboutus/${fpoid}`);
      if (response.status === 200) {
        setaboutus(response.data.aboutus);
      }
    } catch (error) {
      console.error("Error fetching privacy policy:", error);
      //   throw new Error("Error fetching privacy policy");
    }
  };

  const toggleSurveyStatus = async (id, activate) => {
    try {
      const response = await axiosInstance.patch(
        `admin-auth/update-fig-status/${id}/${activate}`,
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
      fetchData();
      // }
    } catch (error) {
      console.error("Error:", error);
    }
  };
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
      fetchData();
      // }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const navigate = useNavigate();
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
              {selectedfpo && (
                <div className="container-xxl flex-grow-1 container-p-y">
                  <h4 className="py-3 mb-4">
                    <Link
                      to={``}
                      className="text-muted all_fpo_backbtn fw-light"
                      onClick={() => navigate(-1)}
                    >
                      <i className="fa-solid  fa-angle-left"></i>
                      &nbsp;FPO List /
                    </Link>{" "}
                    {selectedfpo?.name}
                  </h4>
                  <div className="my-fpo-main">
                    <div className="my-fpodetails row ">
                      <div className="fpo-img mb-2 col-md-4 col-12">
                        <div className="p-3 card d-flex fpo-pic-main justify-content-center align-items-center flex-md-column gap-2 flex-row">
                          <img
                            src={
                              selectedfpo?.fpopic
                                ? `${renderUrl}uploads/fpo/${selectedfpo?.fpopic}`
                                : "/assets/img/avatars/1.png"
                            }
                            alt="fpo"
                            onError={(e) => {
                              e.target.src = "/assets/img/avatars/1.png"; // Set a default image if the specified image fails to load
                            }}
                            className="fpopic shadow"
                          />
                          <h4 className="pt-3 text-capitalize fpo-name-heading">
                            {selectedfpo?.name}
                          </h4>
                        </div>
                      </div>
                      <div className="col-md-8">
                        {" "}
                        <div className="row mx-0 justify-content-center">
                          <div className="col-md-6 ">
                            <div className="row w-100  rounded shadow bg-white p-3 mx-0 mb-2">
                              <div className="col-2 fpo-icons">
                                <i className="fa-solid fa-user"></i>
                              </div>{" "}
                              <div className="col-10  fpo-icons">FPO owner</div>
                              <div className="col-12 fpo-info text-center">
                                {selectedfpo?.admin?.username}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 ">
                            <div className="row w-100  rounded shadow bg-white p-3 mx-0 mb-2">
                              <div className="col-2 fpo-icons1">
                                <i className="fa-solid fa-users"></i>
                              </div>{" "}
                              <div className="col-10  fpo-icons">Members</div>
                              <div className="col-12 fpo-info text-center">
                                {selectedfpo?.members}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 ">
                            <div className="row w-100  rounded shadow bg-white p-3 mx-0 mb-2">
                              <div className="col-2 fpo-icons2 ">
                                <i className="fa-regular fa-calendar-days"></i>
                              </div>{" "}
                              <div className="col-10  fpo-icons">
                                Registered On
                              </div>
                              <div className="col-12 fpo-info text-center">
                                {selectedfpo?.createdAt && (
                                  <>
                                    {" "}
                                    {moment(selectedfpo?.createdAt).format(
                                      "Do MMMM YYYY"
                                    )}{" "}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 ">
                            <div className="row w-100  rounded shadow bg-white p-3 mx-0 mb-2">
                              <div className="col-2 fpo-icons ">
                                <i className="fa-solid fa-arrow-up-right-dots"></i>
                              </div>{" "}
                              <div className="col-10  fpo-icons">Promoter</div>
                              <div className="col-12 fpo-info text-center">
                                {selectedfpo?.promoter || "N/A"}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 ">
                            <div className="row w-100  rounded shadow bg-white p-3 mx-0 mb-2">
                              <div className="col-2 fpo-icons1 ">
                                <i className="fa-solid fa-layer-group"></i>
                              </div>{" "}
                              <div className="col-10  fpo-icons">
                                Share per member
                              </div>
                              <div className="col-12 fpo-info text-center">
                                {selectedfpo?.sharePerMember || "N/A"}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 ">
                            <div className="row w-100  rounded shadow bg-white p-3 mx-0 mb-2">
                              <div className="col-2 fpo-icons2 ">
                                <i className="fa-solid fa-user-tie"></i>
                              </div>{" "}
                              <div className="col-10  fpo-icons ">
                                No. of Directors
                              </div>
                              <div className="col-12 fpo-info text-center">
                                {selectedfpo?.numberOfDirectors || "N/A"}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 ">
                            <div className="row w-100  rounded shadow bg-white p-3 mx-0 mb-2">
                              <div className="col-2 fpo-icons ">
                                <i className="fa-solid fa-user-tie"></i>
                              </div>{" "}
                              <div className="col-10  fpo-icons ">
                              FPO leaders
                              </div>
                              <div className="col-12 fpo-info text-center">
                                {totalleaders}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 ">
                            <div className="row w-100  rounded shadow bg-white p-3 mx-0 mb-2">
                              <div className="col-2 fpo-icons2 ">
                                <i className="fa-solid fa-chart-line"></i>
                              </div>{" "}
                              <div className="col-10  fpo-icons ">
                                FPO capital
                              </div>
                              <div className="col-12 fpo-info text-center">
                                ₹{selectedfpo?.totalFpoCapital}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 ">
                            <div className="row w-100  rounded shadow bg-white p-3 mx-0 mb-2">
                              <div className="col-2 fpo-icons1 ">
                                <i className="fa-solid fa-mountain-city"></i>
                              </div>{" "}
                              <div className="col-10  fpo-icons ">
                                Villages Served
                              </div>
                              <div className="col-12 fpo-info text-center">
                                {selectedfpo?.villagesServed}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 ">
                            <div className="row w-100  rounded shadow bg-white p-3 mx-0 mb-2">
                              <div className="col-2 fpo-icons ">
                                <i className="fa-solid fa-cubes-stacked"></i>
                              </div>{" "}
                              <div className="col-10  fpo-icons ">Products</div>
                              <div className="col-12 fpo-info text-center">
                                {selectedfpo?.products?.length}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="fpo_products">
                          <div className="card">
                            <div className="card-header">
                              <h4>Products</h4>
                            </div>
                            <div className="card-body">
                              <div className="d-flex gap-2 align-items-center ">
                                {selectedfpo?.products?.map((el, index) => (
                                  <span
                                    key={index}
                                    className="rounded border px-3 py-2 border-primary text-primary"
                                  >
                                    {el}
                                  </span>
                                ))}
                                {selectedfpo?.products?.length === 0 &&
                                  "NO products found"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>{" "}
                  <div className="row mx-0">
                    <div className="col-12"></div>
                  </div>
                  <div className="accordion mt-3" id="accordionExample">
                    {/* members */}
                    {/* <div className="card accordion-item active">
                      <h2 className="accordion-header" id="headingOnemember">
                        <button
                          type="button"
                          className="accordion-button"
                          data-bs-toggle="collapse"
                          data-bs-target="#accordionmember"
                          aria-expanded="true"
                          aria-controls="accordionmember"
                        >
                          Members
                        </button>
                      </h2>

                      <div
                        id="accordionmember"
                        className="accordion-collapse collapse show"
                        data-bs-parent="#accordionExample"
                      >
                        <div className="accordion-body">
                          <div className="fpo_data_details_main">
                            <div className="fpo_data_inner">
                              <div className="table-responsive text-nowrap">
                                <table className="table">
                                  <thead>
                                    <tr>
                                      <th>
                                        <b>Name</b>
                                      </th>
                                      <th>
                                        <b>Mobile</b>
                                      </th>
                                      <th>
                                        <b>Email</b>
                                      </th>
                                      <th>
                                        <b>FPO</b>
                                      </th>
                                      <th>
                                        <b>JOined FIG's</b>
                                      </th>
                                      <th>
                                        <b>Status</b>
                                      </th>

                                      <th>
                                        <b>Action</b>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="table-border-bottom-0">
                                    {fpoData?.allusers?.map((el, index) => (
                                      <tr key={index}>
                                        <td>
                                          <Link to={`/singlefig/${el._id}`}>
                                            <span className="fw-medium">
                                              {el?.firstname}
                                              {el?.lastname}
                                            </span>
                                          </Link>
                                        </td>
                                        <td>{el?.phone}</td>
                                        <td>{el?.email}</td>
                                        <td>{el?.fpo?.name}</td>

                                        <td>{el?.joinedFIG?.length}</td>
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
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {fpoData?.members?.length === 0 && (
                                  <div>
                                    <p className="text-center my-3">
                                      No members found
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div> */}
                    {/* fig */}
                    <div className="card accordion-item ">
                      <h2 className="accordion-header" id="headingOnefig">
                        <button
                          type="button"
                          className="accordion-button collapsed"
                          data-bs-toggle="collapse"
                          data-bs-target="#accordionfig"
                          aria-expanded="true"
                          aria-controls="accordionfig"
                        >
                          FPO Users
                        </button>
                      </h2>

                      <div
                        id="accordionfig"
                        className="accordion-collapse collapse"
                        data-bs-parent="#accordionExample"
                      >
                        <div className="accordion-body">
                          <div className="fpo_data_details_main">
                            <div className="fpo_data_inner">
                              <div className="my-2 d-flex gap-2 justify-content-start">
                                <Link
                                  to={`/members?fpo=${selectedfpo._id}`}
                                  className="btn btn-outline-primary"
                                >
                                  Members
                                </Link>
                                <Link
                                  to={`/leaders?fpo=${selectedfpo._id}`}
                                  className="btn btn-outline-primary"
                                >
                                  Leaders
                                </Link>
                                {/* <Link
                                  to={`/leaderreq?fpo=${selectedfpo._id}`}
                                  className="btn btn-outline-primary"
                                >
                                  Leaders Requests
                                </Link> */}
                                <Link
                                  to={`/contentcreators?fpo=${selectedfpo._id}`}
                                  className="btn btn-outline-primary"
                                >
                                  Content creators
                                </Link>
                              </div>
                              <hr />
                              <p className="">
                                <b>All Users of {selectedfpo.name}</b>
                              </p>
                              <div className="table-responsive text-nowrap">
                                <table className="table">
                                  <thead>
                                    <tr>
                                      <th>
                                        <b>Name</b>
                                      </th>
                                      <th>
                                        <b>mobile</b>
                                      </th>
                                      {/* <th>
                                        <b>email</b>
                                      </th> */}
                                      <th>
                                        <b>role</b>
                                      </th>
                                      <th>
                                        <b>status</b>
                                      </th>
                                      {/* <th>
                                        <b>Status</b>
                                      </th> */}
                                      {/* {(decoded.permissions?.includes(
                                        "editfigstatus"
                                      ) ||
                                        decoded.role === "superadmin") && (
                                        <th>
                                          <b>Action</b>
                                        </th>
                                      )} */}
                                      {/* {decoded.role === "fpoadmin" && (
                            <th>
                              <b>Actions</b>
                            </th>
                          )} */}
                                    </tr>
                                  </thead>
                                  <tbody className="table-border-bottom-0">
                                    {fpoData?.allusers?.map((el, index) => (
                                      <tr key={index}>
                                        <td>
                                          {/* <i className="fab fa-angular fa-lg text-danger me-3" /> */}
                                          {/* <Link to={`/singlefig/${el._id}`}> */}
                                          {/* <span className="fw-medium"> */}
                                          {el?.firstname} {el?.lastname}
                                          {/* </span> */}
                                          {/* </Link> */}
                                        </td>
                                        <td>{el?.phone}</td>
                                        <td>{el?.role?.role}</td>

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
                                                        toggleSurveyStatus(
                                                          el._id,
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
                                                          el._id,
                                                          2
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
                                                        toggleSurveyStatus(
                                                          el._id,
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
                                                          el._id,
                                                          2
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
                                                      toggleSurveyStatus(
                                                        el._id,
                                                        0
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
                                        )} */}
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
                                {fpoData?.allusers?.length === 0 && (
                                  <div>
                                    <p className="text-center my-3">
                                      No users found
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* news grps */}
                    <div className="card accordion-item ">
                      <h2 className="accordion-header" id="headingOne">
                        <button
                          type="button"
                          className="accordion-button collapsed"
                          data-bs-toggle="collapse"
                          data-bs-target="#accordionOne"
                          aria-expanded="true"
                          aria-controls="accordionOne"
                        >
                          News Categories
                        </button>
                      </h2>

                      <div
                        id="accordionOne"
                        className="accordion-collapse collapse"
                        data-bs-parent="#accordionExample"
                      >
                        <div className="accordion-body">
                          <div className="fpo_data_details_main">
                            <div className="fpo_data_inner">
                              <div className="table-responsive text-nowrap">
                                <table className="table">
                                  <thead>
                                    <tr>
                                      <th>
                                        <b>Group Name</b>
                                      </th>
                                      <th>
                                        <b>Phone</b>
                                      </th>
                                      <th>
                                        <b>Location</b>
                                      </th>
                                      <th>
                                        <b>Owner</b>
                                      </th>
                                      <th>
                                        <b>Status</b>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="table-border-bottom-0">
                                    {fpoData?.newsGroups?.map((el, index) => (
                                      <tr key={index}>
                                        <td>
                                          {/* <i className="fab fa-angular fa-lg text-danger me-3" /> */}
                                          <Link
                                            to={`/newsgrp/${el._id}`}
                                            //   onClick={() => setshowfigdetails(el)}
                                          >
                                            <span className="fw-medium">
                                              {el.name}
                                            </span>
                                          </Link>
                                        </td>
                                        <td>{el.phone}</td>
                                        <td>{el.location}</td>
                                        <td>{el?.memberId?.name}</td>
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
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {fpoData?.newsGroups?.length === 0 && (
                                  <div>
                                    <p className="text-center my-3">
                                      No News Categories found
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* radios */}
                    <div className="card accordion-item">
                      <h2 className="accordion-header" id="headingTwo">
                        <button
                          type="button"
                          className="accordion-button collapsed"
                          data-bs-toggle="collapse"
                          data-bs-target="#accordionTwo"
                          aria-expanded="false"
                          aria-controls="accordionTwo"
                        >
                          All Radios
                        </button>
                      </h2>
                      <div
                        id="accordionTwo"
                        className="accordion-collapse collapse"
                        aria-labelledby="headingTwo"
                        data-bs-parent="#accordionExample"
                      >
                        <div className="accordion-body">
                          <div className="fpo_data_details_main">
                            <div className="fpo_data_inner">
                              <div className="table-responsive text-nowrap">
                                <table className="table">
                                  <thead>
                                    <tr>
                                      {/* <th>
                                        <b>S. No.</b>
                                      </th> */}
                                      <th>
                                        <b>Heading</b>
                                      </th>
                                      <th>
                                        <b>Image</b>
                                      </th>
                                      {/* <th>
                                        <b>Recording</b>
                                      </th> */}
                                      <th>
                                        <b>Posted by</b>
                                      </th>
                                      <th>
                                        <b>FPO name</b>
                                      </th>
                                      <th>
                                        <b>Status</b>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="table-border-bottom-0">
                                    {fpoData?.radios?.map((el, index) => (
                                      <tr key={index}>
                                        {/* <td>{index + 1}</td> */}
                                        <td>
                                          {/* <i className="fab fa-angular fa-lg text-danger me-3" /> */}
                                          <Link
                                            to={`/radio/${el._id}`}
                                            //   onClick={() => setshowfigdetails(el)}
                                          >
                                            <span className="fw-medium">
                                              {el.heading}
                                            </span>
                                          </Link>
                                        </td>
                                        <td>
                                          <img
                                            src={`${renderUrl}uploads/radio/${el.image}`}
                                            // width={100}
                                            className="intoggle-table-image"
                                            alt="cat-img"
                                          />
                                        </td>
                                        <td>{el.host}</td>
                                        {/* <td>{el.recording}</td> */}
                                        <td>{el?.fpo?.name}</td>
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
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {fpoData?.radios?.length === 0 && (
                                  <div>
                                    <p className="text-center my-3">
                                      No radios found
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* surveys */}
                    <div className="card accordion-item">
                      <h2 className="accordion-header" id="headingThree">
                        <button
                          type="button"
                          className="accordion-button collapsed"
                          data-bs-toggle="collapse"
                          data-bs-target="#accordionThree"
                          aria-expanded="false"
                          aria-controls="accordionThree"
                        >
                          Surveys
                        </button>
                      </h2>
                      <div
                        id="accordionThree"
                        className="accordion-collapse collapse"
                        aria-labelledby="headingThree"
                        data-bs-parent="#accordionExample"
                      >
                        <div className="accordion-body">
                          <div className="fpo_data_details_main">
                            <div className="fpo_data_inner">
                              <div className="table-responsive text-nowrap">
                                <table className="table">
                                  <thead>
                                    <tr>
                                      <th>
                                        <b>Title</b>
                                      </th>
                                      <th>
                                        <b>No. of questions</b>
                                      </th>
                                      <th>
                                        <b>Responses</b>
                                      </th>
                                      <th>
                                        <b>FPO responses</b>
                                      </th>
                                      <th>
                                        <b>Status</b>
                                      </th>
                                      <th>
                                        <b>Created By</b>
                                      </th>
                                      <th>
                                        <b>Date</b>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="table-border-bottom-0">
                                    {fpoData?.surveys?.map((el, index) => (
                                      <tr key={index}>
                                        <td>
                                          {/* <i className="fab fa-angular fa-lg text-danger me-3" /> */}
                                          <Link to={`/singlesurvey/${el._id}`}>
                                            <span className="fw-medium">
                                              {el.title}
                                            </span>
                                          </Link>
                                        </td>
                                        <td>{el.questions?.length}</td>
                                        <td>{el.responses}</td>
                                        <td>
                                          {/* <span className="badge bg-label-primary me-1">
                                Active
                              </span> */}

                                          {el.figRes?.length}
                                        </td>
                                        <td>
                                          <div className="d-flex align-items-center justify-content-between">
                                            {" "}
                                            <span
                                              className={`badge  me-1 ${
                                                el.status
                                                  ? "bg-label-primary"
                                                  : "bg-label-danger"
                                              }`}
                                            >
                                              <i className="fa-solid fa-circle fa-beat-fade"></i>
                                              &nbsp;
                                              {el.status
                                                ? "active"
                                                : "inactive"}
                                            </span>
                                          </div>
                                        </td>
                                        <td>{el.createdBy?.username}</td>
                                        <td>
                                          {" "}
                                          {moment(el.createdAt).format(
                                            " Do MMMM YYYY "
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {fpoData?.surveys?.length === 0 && (
                                  <div>
                                    <p className="text-center my-3">
                                      No Surveys found
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* privacy policy */}
                    <div className="card accordion-item">
                      <h2 className="accordion-header" id="headingThree">
                        <button
                          type="button"
                          className="accordion-button collapsed"
                          data-bs-toggle="collapse"
                          data-bs-target="#accordionfour"
                          aria-expanded="false"
                          aria-controls="accordionfour"
                        >
                          Privacy Policy
                        </button>
                      </h2>
                      <div
                        id="accordionfour"
                        className="accordion-collapse collapse"
                        aria-labelledby="headingThree"
                        data-bs-parent="#accordionExample"
                      >
                        <div className="accordion-body">
                          <div className="fpo_data_details_main">
                            <div className="fpo_data_inner">
                              <div
                                className="privacy_policy_fpo_details"
                                dangerouslySetInnerHTML={{
                                  __html: privacyPolicy,
                                }}
                              ></div>
                              {(!privacyPolicy || privacyPolicy === "") && (
                                <>
                                  <p className="text-danger">
                                    <b>No Privacy policy Added.</b>
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* about us */}
                    <div className="card accordion-item">
                      <h2 className="accordion-header" id="headingThree">
                        <button
                          type="button"
                          className="accordion-button collapsed"
                          data-bs-toggle="collapse"
                          data-bs-target="#accordionfive"
                          aria-expanded="false"
                          aria-controls="accordionfive"
                        >
                          About us
                        </button>
                      </h2>
                      <div
                        id="accordionfive"
                        className="accordion-collapse collapse"
                        aria-labelledby="headingThree"
                        data-bs-parent="#accordionExample"
                      >
                        <div className="accordion-body">
                          <div className="fpo_data_details_main">
                            <div className="fpo_data_inner">
                              <div
                                className="privacy_policy_fpo_details"
                                dangerouslySetInnerHTML={{
                                  __html: aboutus,
                                }}
                              ></div>
                              {(!aboutus || aboutus === "") && (
                                <>
                                  <p className="text-danger">
                                    <b>No About us details Added.</b>
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* queries */}
                    <div className="card accordion-item">
                      <h2 className="accordion-header" id="headingThree">
                        <button
                          type="button"
                          className="accordion-button collapsed"
                          data-bs-toggle="collapse"
                          data-bs-target="#accordionsix"
                          aria-expanded="false"
                          aria-controls="accordionsix"
                        >
                          Queries
                        </button>
                      </h2>
                      <div
                        id="accordionsix"
                        className="accordion-collapse collapse"
                        aria-labelledby="headingThree"
                        data-bs-parent="#accordionExample"
                      >
                        <div className="accordion-body">
                          <div className="fpo_data_details_main">
                            <div className="fpo_data_inner">
                              <div className="table-responsive text-nowrap">
                                <table className="table">
                                  <thead>
                                    <tr>
                                      <th>
                                        <b>Name</b>
                                      </th>
                                      <th>
                                        <b>Mobile</b>
                                      </th>
                                      <th>
                                        <b>Message</b>
                                      </th>
                                      <th>
                                        <b>FPO</b>
                                      </th>
                                      <th>
                                        <b>Date</b>
                                      </th>
                                      {/* {(decoded.role === "superadmin" ||
                              (decoded.role === "fpoadmin" &&
                                decoded.permissions?.includes(
                                  "editsurvey"
                                ))) && ( */}
                                      <th>
                                        <b>Actions</b>
                                      </th>
                                      {/* )} */}
                                    </tr>
                                  </thead>
                                  <tbody className="table-border-bottom-0">
                                    {queries.map((el, index) => (
                                      <tr key={index}>
                                        <td>
                                          {/* <i className="fab fa-angular fa-lg text-danger me-3" /> */}
                                          {/* <Link to={`/singlesurvey/${el._id}`}> */}
                                          <span className="fw-medium">
                                            {el.name}
                                          </span>
                                          {/* </Link> */}
                                        </td>
                                        <td>{el.phone}</td>
                                        <td>
                                          <div className="d-flex">
                                            <div
                                              className="message_div_query"
                                              style={{
                                                maxWidth: "200px",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                              }}
                                            >
                                              {el.message}
                                            </div>
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-outline-primary"
                                              data-bs-toggle="modal"
                                              data-bs-target="#basicModal23456"
                                              onClick={() =>
                                                setselectedquery(el)
                                              }
                                            >
                                              <i className="fa-solid fa-eye"></i>
                                            </button>
                                          </div>
                                        </td>
                                        <td>{el.fpo?.name}</td>
                                        <td>
                                          {" "}
                                          {moment(el.createdAt).format(
                                            " Do MMMM YYYY "
                                          )}
                                        </td>
                                        <td>
                                          <div className="d-flex align-items-center justify-content-start">
                                            {" "}
                                            <span
                                              className={`badge  me-1 ${
                                                el.status === 1
                                                  ? "bg-label-warning"
                                                  : el.status === 0
                                                  ? "bg-label-success"
                                                  : "bg-label-danger"
                                              }`}
                                            >
                                              <i
                                                className={`fa-solid  fa-circle fa-beat-fade ${
                                                  el.status === 1
                                                    ? "text-warning"
                                                    : el.status === 0
                                                    ? "text-success"
                                                    : "text-danger"
                                                }`}
                                              ></i>
                                              &nbsp;
                                              {el.status === 1
                                                ? "Pending"
                                                : el.status === 0
                                                ? "Resolved"
                                                : "Declined"}
                                            </span>
                                            {/* {(decoded.role === "superadmin" ||
                                    decoded.permissions?.includes(
                                      "deactivatesurvey"
                                    )) && ( */}
                                            {/* <div className="dropdown">
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
                                                        toggleSurveyStatus(
                                                          el._id,
                                                          0
                                                        )
                                                      }
                                                    >
                                                      <i className="fa-solid fa-circle text-success"></i>{" "}
                                                      Resolved
                                                    </a>
                                                    <a
                                                      className="dropdown-item"
                                                      href="javascript:void(0);"
                                                      onClick={() =>
                                                        toggleSurveyStatus(
                                                          el._id,
                                                          2
                                                        )
                                                      }
                                                    >
                                                      <i className="fa-solid fa-circle text-danger"></i>{" "}
                                                      Decline
                                                    </a>
                                                  </>
                                                ) : el.status === 0 ? (
                                                  <>
                                                    <a
                                                      className="dropdown-item"
                                                      href="javascript:void(0);"
                                                      onClick={() =>
                                                        toggleSurveyStatus(
                                                          el._id,
                                                          1
                                                        )
                                                      }
                                                    >
                                                      <i className="fa-solid fa-circle text-warning"></i>{" "}
                                                      Pending
                                                    </a>
                                                    <a
                                                      className="dropdown-item"
                                                      href="javascript:void(0);"
                                                      onClick={() =>
                                                        toggleSurveyStatus(
                                                          el._id,
                                                          2
                                                        )
                                                      }
                                                    >
                                                      <i className="fa-solid fa-circle text-danger"></i>{" "}
                                                      Decline
                                                    </a>
                                                  </>
                                                ) : (
                                                  <a
                                                    className="dropdown-item"
                                                    href="javascript:void(0);"
                                                    onClick={() =>
                                                      toggleSurveyStatus(
                                                        el._id,
                                                        0
                                                      )
                                                    }
                                                  >
                                                    <i className="fa-solid fa-circle text-success"></i>{" "}
                                                    Resolved
                                                  </a>
                                                )}
                                              </div>
                                            </div> */}
                                            {/* )} */}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {queries.length === 0 && (
                                  <div>
                                    <p className="text-center my-3">
                                      No Queries found
                                    </p>
                                  </div>
                                )}
                                <div
                                  className="modal fade"
                                  id="basicModal23456"
                                  tabIndex={-1}
                                  aria-hidden="true"
                                >
                                  <div className="modal-dialog" role="document">
                                    <div className="modal-content">
                                      <div className="modal-header">
                                        <h5
                                          className="modal-title"
                                          id="exampleModalLabel1"
                                        >
                                          Message Details
                                        </h5>
                                        <button
                                          type="button"
                                          className="btn-close"
                                          data-bs-dismiss="modal"
                                          aria-label="Close"
                                        />
                                      </div>
                                      <div className="modal-body">
                                        <div className="message_main">
                                          <p>
                                            <b>Name : </b>
                                            {selectedquery?.name}
                                          </p>
                                          <p>
                                            <b>Mobile : </b>
                                            {selectedquery?.phone}
                                          </p>
                                          <p>
                                            <b>Date : </b>
                                            {moment(
                                              selectedquery?.createdAt
                                            ).format(" Do MMMM YYYY ")}
                                          </p>
                                          <hr />
                                          <p>
                                            <b>Message</b>
                                          </p>
                                          <p className="message_div">
                                            {selectedquery?.message}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="modal-footer">
                                        <button
                                          type="button"
                                          className="btn btn-outline-secondary"
                                          data-bs-dismiss="modal"
                                        >
                                          Close
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
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

        {/* //   <!-- Overlay --> */}
        <div className="layout-overlay layout-menu-toggle"></div>
      </div>
      {/* // <!-- / Layout wrapper --> */}
    </div>
  );
};

export default Singlefpo;
