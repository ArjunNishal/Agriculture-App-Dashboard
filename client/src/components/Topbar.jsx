import React, { useEffect, useState } from "react";
import { removeHtmlClass, toggleHtmlClass } from "../js/intjava";
import { Link, useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { axiosInstance, renderUrl, renderUrl2 } from "../config";
const Topbar = ({ imageUploaded }) => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;

  const navigate = useNavigate();

  const logout = () => {
    try {
      localStorage.removeItem("admin");
      console.log("logout");
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const [admin, setadmin] = useState({});

  const fetchAdminById = async (adminId) => {
    try {
      const response = await axiosInstance.get(`admin-log/adminbyid/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        console.log(response.data.admin, response);
        setadmin(response.data.admin);
        // setFormData(response.data.admin);
      }
    } catch (error) {
      console.error("Error fetching admin:", error.message);
    }
  };

  useEffect(() => {
    fetchAdminById();
  }, []);

  useEffect(() => {
    fetchAdminById();
  }, [imageUploaded]);
  return (
    <nav
      className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme"
      id="layout-navbar"
    >
      <div className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
        <Link
          className="nav-item nav-link px-0 me-xl-4"
          to=""
          onClick={() => toggleHtmlClass("layout-menu-expanded")}
        >
          <i className="bx bx-menu bx-sm"></i>
        </Link>
      </div>

      <div
        className="navbar-nav-right d-flex align-items-center"
        id="navbar-collapse"
      >
        {/* <!-- Search --> */}
        {/* <div className="navbar-nav align-items-center">
          <div className="nav-item d-flex align-items-center">
            <i className="bx bx-search fs-4 lh-0"></i>
            <input
              type="text"
              className="form-control border-0 shadow-none ps-1 ps-sm-2"
              placeholder="Search..."
              aria-label="Search..."
            />
          </div>
        </div> */}
        {/* <!-- /Search --> */}

        <ul className="navbar-nav flex-row align-items-center ms-auto">
          {/* <!-- Place this tag where you want the button to render. --> */}
          {/* <li className="nav-item lh-1 me-3">
              <a
                className="github-button"
                href="https://github.com/themeselection/sneat-html-admin-template-free"
                data-icon="octicon-star"
                data-size="large"
                data-show-count="true"
                aria-label="Star themeselection/sneat-html-admin-template-free on GitHub"
              >
                Star
              </a>
            </li> */}

          {/* <!-- User --> */}
          <li className="nav-item navbar-dropdown dropdown-user dropdown">
            <Link
              className="nav-link dropdown-toggle hide-arrow"
              href="javascript:void(0);"
              data-bs-toggle="dropdown"
            >
              <div className="avatar avatar-online">
                <img
                  src={
                    admin?.image && decoded.role === "superadmin"
                      ? `${renderUrl2}${admin?.image}`
                      : admin?.image && decoded.role === "fpoadmin"
                      ? `${renderUrl2}${admin?.image}`
                      : "/assets/img/avatars/1.png"
                  }
                  alt="ava"
                  onError={(e) => {
                    e.target.src = "/assets/img/avatars/1.png"; // Set a default image if the specified image fails to load
                  }}
                  className=" rounded-circle"
                />
              </div>
            </Link>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <Link className="dropdown-item" to={`/myprofile/${id}`}>
                  <div className="d-flex">
                    <div className="flex-shrink-0 me-3">
                      <div className="avatar avatar-online">
                        <img
                          src={
                            admin?.image && decoded.role === "superadmin"
                              ? `${renderUrl2}${admin?.image}`
                              : admin?.image && decoded.role === "fpoadmin"
                              ? `${renderUrl2}${admin?.image}`
                              : "/assets/img/avatars/1.png"
                          }
                          alt="ava"
                          onError={(e) => {
                            e.target.src = "/assets/img/avatars/1.png"; // Set a default image if the specified image fails to load
                          }}
                          className=" rounded-circle"
                        />
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <span className="fw-medium d-block">
                        {admin?.username}
                      </span>
                      <small className="text-muted">{decoded?.role}</small>
                    </div>
                  </div>
                </Link>
              </li>
              <li>
                <div className="dropdown-divider"></div>
              </li>
              {/* <li>
                <a className="dropdown-item" href="#">
                  <i className="bx bx-user me-2"></i>
                  <span className="align-middle">My Profile</span>
                </a>
              </li> */}
              {decoded.role === "fpoadmin" && (
                <li>
                  <Link className="dropdown-item" to="/myfpo">
                    <i className="me-2 bx bx-store"></i>
                    <span className="align-middle">My FPO</span>
                  </Link>
                </li>
              )}
              {/* <li>
                  <a className="dropdown-item" href="#">
                    <i className="bx bx-cog me-2"></i>
                    <span className="align-middle">Settings</span>
                  </a>
                </li> */}
              {/* <li>
                  <a className="dropdown-item" href="#">
                    <span className="d-flex align-items-center align-middle">
                      <i className="flex-shrink-0 bx bx-credit-card me-2"></i>
                      <span className="flex-grow-1 align-middle ms-1">
                        Billing
                      </span>
                      <span className="flex-shrink-0 badge badge-center rounded-pill bg-danger w-px-20 h-px-20">
                        4
                      </span>
                    </span>
                  </a>
                </li> */}
              <li>
                <div className="dropdown-divider"></div>
              </li>
              <li>
                <a
                  onClick={logout}
                  className="dropdown-item"
                  href="javascript:void(0);"
                >
                  <i className="bx bx-power-off me-2"></i>
                  <span className="align-middle">Log Out</span>
                </a>
              </li>
            </ul>
          </li>
          {/* <!--/ User --> */}
        </ul>
      </div>
    </nav>
  );
};

export default Topbar;
