import React, { Suspense, useEffect, useState } from "react";
import { removeHtmlClass, toggleHtmlClass } from "../js/intjava";
import { Link, useLocation } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { axiosInstance } from "../config";
import PermissionHandler from "./PermissionHandler";

const Navigation = ({ leaderreq }) => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const [submenushow, setsubmenushow] = useState(false);
  const [FPOmenushow, setFPOmenushow] = useState(false);
  const [surveymenushow, setsurveymenushow] = useState(false);
  const [figshow, setfigshow] = useState(false);
  const [news, setnews] = useState(false);
  const [radio, setradio] = useState(false);
  const [theme, settheme] = useState(false);
  const [query, setquery] = useState(false);
  const [privacy, setprivacy] = useState(false);
  const [notifications, setnotifications] = useState(false);
  const permissions = decoded.permissions;
  // console.log(permissions, "permissions");

  const location = useLocation();

  const [showfigdetails, setshowfigdetails] = useState(null);
  const fetchFIGs = async () => {
    try {
      let url;
      if (decoded.role === "fpoadmin") {
        url = `admin-auth/getpendingreqs/${decoded.fpo}`;
      }

      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);
      // settotalpages(response.data.totalRecord);
      setshowfigdetails(response.data.data);
    } catch (err) {
      console.log(err);
      // setError("Error while fetching admin list");
    }
  };

  useEffect(() => {
    if (decoded.role === "fpoadmin") {
      fetchFIGs();
    }
  }, []);

  useEffect(() => {
    // Check if the current URL matches the sub-menu item's URL
    // and set the active state accordingly
    if (location.pathname === "/admin") {
      setsubmenushow(true);
    } else if (
      location.pathname === "/fpoadmins" ||
      location.pathname === "/addfpo" ||
      location.pathname === "/allfpo" ||
      location.pathname.includes("/singlefpo/")
    ) {
      setFPOmenushow(true);
    } else if (
      location.pathname === "/surveylist" ||
      location.pathname === "/addsurvey" ||
      location.pathname.includes("/editsurvey") ||
      location.pathname.includes("/singlesurvey")
    ) {
      setsurveymenushow(true);
    } else if (
      location.pathname === "/allfig" ||
      location.pathname === "/leaders" ||
      location.pathname === "/leaderreq" ||
      location.pathname === "/contentcreators" ||
      location.pathname === "/leaderCUMcreator" ||
      location.pathname.includes("/members")
    ) {
      setfigshow(true);
    } else if (
      location.pathname === "/newsgroups" ||
      location.pathname === "/newsreqs" ||
      location.pathname.includes("/newsgrp") ||
      location.pathname.includes("/singlenews")
    ) {
      setnews(true);
    } else if (
      location.pathname === "/allradio-cat" ||
      location.pathname === "/addradio" ||
      location.pathname.includes("/addradiocat") ||
      location.pathname.includes("/radio-cat") ||
      location.pathname.includes("/radio") ||
      location.pathname.includes("/seasonlist") ||
      location.pathname === "/addseason" ||
      location.pathname.includes("/season/") ||
      location.pathname.includes("/addepisode") ||
      location.pathname === "/radiooptions"
    ) {
      setradio(true);
    } else if (
      location.pathname === "/addlanguage" ||
      location.pathname === "/alllanguages" ||
      location.pathname === "/themesettings"
    ) {
      settheme(true);
    } else if (location.pathname.includes("/queries")) {
      setquery(true);
    } else if (
      location.pathname.includes("/addaboutus") ||
      location.pathname.includes("/addprivacy")
    ) {
      setprivacy(true);
    } else if (
      location.pathname.includes("/allnotifications") ||
      location.pathname.includes("/addnotification")
    ) {
      setnotifications(true);
    } else {
      setsubmenushow(false);
      setFPOmenushow(false);
    }
  }, [location]);
  return (
    <>
      <aside
        id="layout-menu"
        className="layout-menu menu-vertical overflow-auto hide-scrollbar menu bg-menu-theme"
      >
        <div className="app-brand demo">
          <Link to="/admin" className="app-brand-link">
            <span className="app-brand-logo demo">
              <img width={30} src="/assets/img/logo.png" alt="agripal" />
            </span>
            <span className="app-brand-text demo menu-text fw-bold ms-2">
              AGRIPAL
            </span>
          </Link>

          <Link
            to=""
            onClick={() => removeHtmlClass("layout-menu-expanded")}
            className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none"
          >
            <i className="bx bx-chevron-left bx-sm align-middle"></i>
          </Link>
        </div>

        <div className="menu-inner-shadow"></div>

        <ul className="menu-inner py-1">
          {/* <!-- Dashboard --> */}
          <li className={`menu-item ${submenushow ? "active " : ""}`}>
            <Link
              to="/admin"
              className="menu-link menu-toggle"
              // onClick={() => setsubmenushow(!submenushow)}
            >
              <i className="menu-icon tf-icons bx bx-home-circle"></i>
              <div data-i18n="Dashboards">Dashboards</div>
              {/* <div className="badge bg-danger rounded-pill ms-auto">5</div> */}
            </Link>
          </li>

          {/* <!-- FPO --> */}
          {decoded.role === "superadmin" && (
            <li
              className={`menu-item ${FPOmenushow ? " open" : ""} ${
                location.pathname === "/fpoadmins" ||
                location.pathname === "/addfpo" ||
                location.pathname === "/allfpo" ||
                location.pathname.includes("/singlefpo/")
                  ? "active"
                  : ""
              }`}
            >
              <Link
                to=""
                className="menu-link menu-toggle"
                onClick={() => setFPOmenushow(!FPOmenushow)}
              >
                <i className="menu-icon tf-icons bx bx-layout"></i>
                <div data-i18n="fpo admins">FPO's</div>
              </Link>

              <ul className="menu-sub">
                <li
                  className={`menu-item ${
                    FPOmenushow && location.pathname === "/fpoadmins"
                      ? "active open"
                      : ""
                  }`}
                >
                  <Link to="/fpoadmins" className="menu-link">
                    <div data-i18n="admins list">FPO Admins</div>
                  </Link>
                </li>
                <li
                  className={`menu-item ${
                    FPOmenushow && location.pathname === "/addfpo"
                      ? "active open"
                      : ""
                  }`}
                >
                  <Link to="/addfpo" className="menu-link">
                    <div data-i18n="add new admin">Add FPO admin</div>
                  </Link>
                </li>
                <li
                  className={`menu-item ${
                    FPOmenushow &&
                    (location.pathname === "/allfpo" ||
                      location.pathname.includes("/singlefpo/"))
                      ? "active open"
                      : ""
                  }`}
                >
                  <Link to="/allfpo" className="menu-link">
                    <div data-i18n="add new admin">All FPO's</div>
                  </Link>
                </li>
              </ul>
            </li>
          )}
          {/* <!-- Survey --> */}
          {(decoded.role === "superadmin" ||
            permissions?.includes("surveyp")) && (
            <li
              className={`menu-item ${surveymenushow ? "open" : ""} ${
                location.pathname === "/surveylist" ||
                location.pathname === "/addsurvey" ||
                location.pathname.includes("/singlesurvey")
                  ? "active"
                  : ""
              }`}
            >
              <Link
                to=""
                className="menu-link menu-toggle"
                onClick={() => setsurveymenushow(!surveymenushow)}
              >
                <i className="menu-icon tf-icons bx bx-store"></i>
                <div data-i18n="survey">Survey</div>
                {/* <div className="badge bg-label-primary fs-tiny rounded-pill ms-auto">
              Pro
            </div> */}
              </Link>
              <ul className="menu-sub">
                <li
                  className={`menu-item ${
                    surveymenushow &&
                    (location.pathname === "/surveylist" ||
                      location.pathname.includes("/singlesurvey"))
                      ? "active open"
                      : ""
                  }`}
                >
                  <Link to="/surveylist" className="menu-link">
                    <div data-i18n="surveys">Surveys</div>
                  </Link>
                </li>
                {((decoded.role === "fpoadmin" &&
                  permissions?.includes("addnewsurvey")) ||
                  decoded.role === "superadmin") && (
                  <li
                    className={`menu-item ${
                      surveymenushow && location.pathname === "/addsurvey"
                        ? "active open"
                        : ""
                    }`}
                  >
                    <Link to="/addsurvey" className="menu-link">
                      <div data-i18n="create survey">Create survey</div>
                    </Link>
                  </li>
                )}
              </ul>
            </li>
          )}
          {/* FIG */}
          {(decoded.role === "fpoadmin" || permissions?.includes("figp")) && (
            <li
              className={`menu-item ${figshow ? "open" : ""} ${
                location.pathname === "/allfig" ||
                location.pathname === "/leaders" ||
                location.pathname === "/leaderreq" ||
                location.pathname === "/contentcreators" ||
                location.pathname === "/leaderCUMcreator" ||
                location.pathname.includes("/members")
                  ? "active"
                  : ""
              }`}
            >
              <Link
                to=""
                onClick={() => setfigshow(!figshow)}
                className="menu-link menu-toggle"
              >
                <i className="menu-icon tf-icons bx bx-dock-top"></i>
                <div data-i18n="Account Settings">FPO Users</div>
              </Link>
              <ul className="menu-sub">
                {/* <li
                className={`menu-item ${
                  figshow && location.pathname === "/allfig"
                    ? "active open"
                    : ""
                }`}
              >
                <Link to="/allfig" className="menu-link">
                  <div data-i18n="Account">FPO users</div>
                </Link>
              </li> */}
                <li
                  className={`menu-item ${
                    figshow && location.pathname === "/leaders"
                      ? "active open"
                      : ""
                  }`}
                >
                  <Link to="/leaders" className="menu-link">
                    <div
                      data-i18n="Notifications"
                      className="d-flex justify-content-between w-100"
                    >
                      <span>Leaders</span>
                      {showfigdetails?.leaderreq?.length > 0 && (
                        <span className="align-items-center pending-note d-flex justify-content-center">
                          {showfigdetails?.leaderreq?.length}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
                <li
                  className={`menu-item ${
                    figshow && location.pathname.includes("/members")
                      ? "active open"
                      : ""
                  }`}
                >
                  <Link to={`/members`} className="menu-link">
                    <div data-i18n="Notifications">Members</div>
                  </Link>
                </li>
                {/* {(decoded.role === "superadmin" ||
                permissions?.includes("figleaderreqs")) && (
                <li
                  className={`menu-item ${
                    figshow && location.pathname === "/leaderreq"
                      ? "active open"
                      : ""
                  }`}
                >
                  <Link to="/leaderreq" className="menu-link">
                    <div data-i18n="Connections">FIG Leader Requests</div>
                  </Link>
                </li>
              )} */}
                <li
                  className={`menu-item ${
                    figshow && location.pathname === "/contentcreators"
                      ? "active open"
                      : ""
                  }`}
                >
                  <Link to="/contentcreators" className="menu-link ">
                    <div
                      data-i18n="Account"
                      className="d-flex justify-content-between w-100"
                    >
                      <span>Content Creators</span>
                      {showfigdetails?.creatorreq?.length > 0 && (
                        <span className="align-items-center pending-note d-flex justify-content-center">
                          {showfigdetails?.creatorreq?.length}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
                <li
                  className={`menu-item ${
                    figshow && location.pathname === "/leaderCUMcreator"
                      ? "active open"
                      : ""
                  }`}
                >
                  <Link to="/leaderCUMcreator" className="menu-link">
                    <div
                      data-i18n="Account"
                      className="d-flex justify-content-between w-100"
                    >
                      <span>Leader Cum Creators</span>
                      {showfigdetails?.leadcumcreator?.length > 0 && (
                        <span className="align-items-center pending-note d-flex justify-content-center">
                          {showfigdetails?.leadcumcreator?.length}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
                {/* location.pathname === "/leaderCUMcreator" || */}
              </ul>
            </li>
          )}
          {/* news */}
          {(decoded.role === "superadmin" ||
            permissions?.includes("newsp")) && (
            <li
              className={`menu-item ${news ? "open" : ""} ${
                location.pathname === "/newsgroups" ||
                location.pathname === "/newsreqs" ||
                location.pathname.includes("/newsgrp") ||
                location.pathname.includes("/singlenews")
                  ? "active"
                  : ""
              }`}
            >
              <Link
                to=""
                onClick={() => setnews(!news)}
                className="menu-link menu-toggle"
              >
                <i className="menu-icon tf-icons bx bx-news"></i>
                <div data-i18n="Authentications">News</div>
              </Link>
              <ul className="menu-sub">
                <li
                  className={`menu-item ${
                    news &&
                    (location.pathname === "/newsgroups" ||
                      location.pathname.includes("/newsgrp") ||
                      location.pathname.includes("singlenews"))
                      ? "active open"
                      : ""
                  }`}
                >
                  <Link to="/newsgroups" className="menu-link">
                    <div data-i18n="Basic">News Categories</div>
                  </Link>
                </li>
                {/* {(decoded.role === "superadmin" ||
                permissions?.includes("editnewsgrpreqs")) && (
                <li
                  className={`menu-item ${
                    news && location.pathname === "/newsreqs"
                      ? "active open"
                      : ""
                  }`}
                >
                  <Link to="/newsreqs" className="menu-link">
                    <div data-i18n="Basic">News Group Requests</div>
                  </Link>
                </li>
              )} */}
              </ul>
            </li>
          )}
          {/* radio */}
          {(decoded.role === "superadmin" ||
            permissions?.includes("radiop")) && (
            <li
              className={`menu-item ${radio ? "open" : ""} ${
                location.pathname === "/allradio-cat" ||
                location.pathname === "/addradio" ||
                location.pathname.includes("/addradiocat") ||
                location.pathname.includes("/radio-cat") ||
                location.pathname.includes("/addseason") ||
                location.pathname.includes("/radio") ||
                location.pathname.includes("/seasonlist") ||
                location.pathname.includes("/season/") ||
                location.pathname.includes("/addepisode") ||
                location.pathname === "/radiooptions"
                  ? "active"
                  : ""
              }`}
            >
              <Link
                to=""
                onClick={() => setradio(!radio)}
                className="menu-link menu-toggle"
              >
                <i className="menu-icon tf-icons bx bx-radio"></i>
                <div data-i18n="Authentications">Training</div>
              </Link>
              <ul className="menu-sub">
                <li
                  className={`menu-item ${
                    radio &&
                    (location.pathname === "/allradio-cat" ||
                      location.pathname.includes("/radio-cat") ||
                      location.pathname.includes("/radio/"))
                      ? "active open"
                      : ""
                  }`}
                >
                  <Link to="/allradio-cat" className="menu-link">
                    <div data-i18n="Basic">Training Categories</div>
                  </Link>
                </li>
                {decoded.role === "fpoadmin" &&
                  (permissions?.includes("addradiocategory") ||
                    permissions?.includes("addradio") ||
                    permissions?.includes("addseason")) && (
                    <li
                      className={`menu-item ${
                        radio &&
                        (location.pathname === "/radiooptions" ||
                          location.pathname.includes("/addepisode") ||
                          location.pathname === "/addradio" ||
                          location.pathname.includes("/addradiocat") ||
                          location.pathname.includes("/addseason"))
                          ? "active open"
                          : ""
                      }`}
                    >
                      <Link to="/radiooptions" className="menu-link">
                        <div data-i18n="Basic">Add New</div>
                      </Link>
                    </li>
                  )}
                {(decoded.role === "superadmin" ||
                  permissions?.includes("seasonlist")) && (
                  <li
                    className={`menu-item ${
                      (radio && location.pathname === "/seasonlist") ||
                      location.pathname.includes("/season/")
                        ? "active open"
                        : ""
                    }`}
                  >
                    <Link to="/seasonlist" className="menu-link">
                      <div data-i18n="Basic">Seasons</div>
                    </Link>
                  </li>
                )}

                {decoded.role === "fpoadmin" &&
                  permissions?.includes("addradiocategory") &&
                  location.pathname === "/addradiocat" && (
                    <li
                      className={`menu-item ${
                        radio && location.pathname === "/addradiocat"
                          ? "active open"
                          : ""
                      }`}
                    >
                      <Link to="/addradiocat" className="menu-link">
                        <div data-i18n="Basic">Add Training category</div>
                      </Link>
                    </li>
                  )}
                {decoded.role === "fpoadmin" &&
                  permissions?.includes("addradio") &&
                  location.pathname === "/addradio" && (
                    <li
                      className={`menu-item ${
                        radio && location.pathname === "/addradio"
                          ? "active open"
                          : ""
                      }`}
                    >
                      <Link to="/addradio" className="menu-link">
                        <div data-i18n="Basic">Add Training</div>
                      </Link>
                    </li>
                  )}
                {decoded.role === "fpoadmin" &&
                  permissions?.includes("addseason") &&
                  location.pathname === "/addseason" && (
                    <li
                      className={`menu-item ${
                        radio && location.pathname === "/addseason"
                          ? "active open"
                          : ""
                      }`}
                    >
                      <Link to="/addseason" className="menu-link">
                        <div data-i18n="Basic">Add Season</div>
                      </Link>
                    </li>
                  )}
                {decoded.role === "fpoadmin" &&
                  permissions?.includes("addseason") &&
                  location.pathname === "/addepisode" && (
                    <li
                      className={`menu-item ${
                        radio && location.pathname === "/addepisode"
                          ? "active open"
                          : ""
                      }`}
                    >
                      <Link to="/addepisode" className="menu-link">
                        <div data-i18n="Basic">Add Episode</div>
                      </Link>
                    </li>
                  )}
              </ul>
            </li>
          )}
          {/* theme */}
          {(decoded.role === "superadmin" ||
            permissions?.includes("themep")) && (
            <li
              className={`menu-item ${theme ? "open" : ""} ${
                location.pathname === "/addlanguage" ||
                location.pathname === "/alllanguages" ||
                location.pathname === "/themesettings"
                  ? "active"
                  : ""
              }`}
            >
              <Link
                to=""
                onClick={() => settheme(!theme)}
                className="menu-link menu-toggle"
              >
                <i className="menu-icon tf-icons bx bxs-palette"></i>
                <div data-i18n="Authentications">
                  {decoded.role === "fpoadmin"
                    ? "Themes and settings"
                    : "Language"}
                </div>
              </Link>
              <ul className="menu-sub">
                {decoded.role === "superadmin" && (
                  <li
                    className={`menu-item ${
                      theme && location.pathname === "/addlanguage"
                        ? "active open"
                        : ""
                    }`}
                  >
                    <Link to="/addlanguage" className="menu-link">
                      <div data-i18n="Basic">Add Language</div>
                    </Link>
                  </li>
                )}{" "}
                {decoded.role === "superadmin" && (
                  <li
                    className={`menu-item ${
                      theme && location.pathname === "/alllanguages"
                        ? "active open"
                        : ""
                    }`}
                  >
                    <Link to="/alllanguages" className="menu-link">
                      <div data-i18n="Basic">Languages</div>
                    </Link>
                  </li>
                )}
                {decoded.role === "fpoadmin" && (
                  <li
                    className={`menu-item ${
                      theme && location.pathname === "/themesettings"
                        ? "active open"
                        : ""
                    }`}
                  >
                    <Link to="/themesettings" className="menu-link">
                      <div data-i18n="Basic">Settings</div>
                    </Link>
                  </li>
                )}
                {/* {(decoded.role === "fpoadmin" ||
                permissions?.includes("addradio")) && (
                <li
                  className={`menu-item ${
                    theme && location.pathname === "/addradio"
                      ? "active open"
                      : ""
                  }`}
                >
                  <Link to="/addradio" className="menu-link">
                    <div data-i18n="Basic">Add radio</div>
                  </Link>
                </li>
              )} */}
              </ul>
            </li>
          )}

          {/* query */}
          {/* {(decoded.role === "superadmin" || permissions?.includes("themep")) && ( */}
          <li
            className={`menu-item ${query ? "open" : ""} ${
              location.pathname === "/queries"
                ? // location.pathname === "/alllanguages" ||
                  // location.pathname === "/themesettings"
                  "active"
                : ""
            }`}
          >
            <Link
              to=""
              onClick={() => setquery(!query)}
              className="menu-link menu-toggle"
            >
              <i className="menu-icon tf-icons bx bx-help-circle"></i>
              <div data-i18n="Authentications">Query</div>
            </Link>
            <ul className="menu-sub">
              {/* {decoded.role === "superadmin" && ( */}
              <li
                className={`menu-item ${
                  query && location.pathname === "/queries" ? "active open" : ""
                }`}
              >
                <Link to="/queries" className="menu-link">
                  <div data-i18n="Basic">Queries</div>
                </Link>
              </li>
              {/* )} */}
            </ul>
          </li>
          {/* privacy and about us */}
          <li
            className={`menu-item ${privacy ? "open" : ""} ${
              location.pathname === "/addaboutus" ||
              location.pathname === "/addprivacy"
                ? // location.pathname === "/themesettings"
                  "active"
                : ""
            }`}
          >
            <Link
              to=""
              onClick={() => setprivacy(!privacy)}
              className="menu-link menu-toggle"
            >
              <i className="menu-icon tf-icons bx bxs-shield"></i>
              <div data-i18n="Authentications">Privacy & About us</div>
            </Link>
            <ul className="menu-sub">
              {/* {decoded.role === "superadmin" && ( */}
              <li
                className={`menu-item ${
                  privacy && location.pathname === "/addprivacy"
                    ? "active open"
                    : ""
                }`}
              >
                <Link to="/addprivacy" className="menu-link">
                  <div data-i18n="Basic">Add Privacy Details</div>
                </Link>
              </li>
              <li
                className={`menu-item ${
                  privacy && location.pathname === "/addaboutus"
                    ? "active open"
                    : ""
                }`}
              >
                <Link to="/addaboutus" className="menu-link">
                  <div data-i18n="Basic">Add About us Details</div>
                </Link>
              </li>
              {/* )} */}
            </ul>
          </li>
          {/* )} */}

          {/* notifications */}
          <li
            className={`menu-item ${notifications ? "open" : ""} ${
              location.pathname === "/allnotifications" ||
              location.pathname === "/addnotification"
                ? "active"
                : ""
            }`}
          >
            <Link
              to=""
              onClick={() => setnotifications(!notifications)}
              className="menu-link menu-toggle"
            >
              <i className="menu-icon tf-icons bx bxs-bell-ring"></i>
              <div data-i18n="Authentications">Notifications</div>
            </Link>
            <ul className="menu-sub">
              {/* {decoded.role === "superadmin" && ( */}
              <li
                className={`menu-item ${
                  notifications && location.pathname === "/addnotification"
                    ? "active open"
                    : ""
                }`}
              >
                <Link to="/addnotification" className="menu-link">
                  <div data-i18n="Basic">Add Notification</div>
                </Link>
              </li>
              <li
                className={`menu-item ${
                  notifications && location.pathname === "/allnotifications"
                    ? "active open"
                    : ""
                }`}
              >
                <Link to="/allnotifications" className="menu-link">
                  <div data-i18n="Basic">Notifications</div>
                </Link>
              </li>
              {/* )} */}
              {/* {decoded.role === "superadmin" && ( */}

              {/* )} */}
            </ul>
          </li>

          {/* <li className="menu-header small text-uppercase">
          <span className="menu-header-text">Apps &amp; Pages</span>
        </li> */}
          {/* <!-- Apps --> */}
          {/* <li className="menu-item">
          <Link
            href="https://demos.themeselection.com/sneat-bootstrap-html-admin-template/html/vertical-menu-template/app-email.html"
            target="_blank"
            className="menu-link"
          >
            <i className="menu-icon tf-icons bx bx-envelope"></i>
            <div data-i18n="Email">Email</div>
            <div className="badge bg-label-primary fs-tiny rounded-pill ms-auto">
              Pro
            </div>
          </Link>
        </li> */}
          {/* <li className="menu-item">
          <Link
            href="https://demos.themeselection.com/sneat-bootstrap-html-admin-template/html/vertical-menu-template/app-chat.html"
            target="_blank"
            className="menu-link"
          >
            <i className="menu-icon tf-icons bx bx-chat"></i>
            <div data-i18n="Chat">Chat</div>
            <div className="badge bg-label-primary fs-tiny rounded-pill ms-auto">
              Pro
            </div>
          </Link>
        </li> */}
          {/* <li className="menu-item">
          <Link
            href="https://demos.themeselection.com/sneat-bootstrap-html-admin-template/html/vertical-menu-template/app-calendar.html"
            target="_blank"
            className="menu-link"
          >
            <i className="menu-icon tf-icons bx bx-calendar"></i>
            <div data-i18n="Calendar">Calendar</div>
            <div className="badge bg-label-primary fs-tiny rounded-pill ms-auto">
              Pro
            </div>
          </Link>
        </li> */}
          {/* <li className="menu-item">
          <Link
            href="https://demos.themeselection.com/sneat-bootstrap-html-admin-template/html/vertical-menu-template/app-kanban.html"
            target="_blank"
            className="menu-link"
          >
            <i className="menu-icon tf-icons bx bx-grid"></i>
            <div data-i18n="Kanban">Kanban</div>
            <div className="badge bg-label-primary fs-tiny rounded-pill ms-auto">
              Pro
            </div>
          </Link>
        </li> */}
          {/* <!-- Pages --> */}

          {/* <li className="menu-item">
          <Link to="" className="menu-link menu-toggle">
            <i className="menu-icon tf-icons bx bx-lock-open-alt"></i>
            <div data-i18n="Authentications">Authentications</div>
          </Link>
          <ul className="menu-sub">
            <li className="menu-item">
              <Link
                href="auth-login-basic.html"
                className="menu-link"
                target="_blank"
              >
                <div data-i18n="Basic">Login</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link
                href="auth-register-basic.html"
                className="menu-link"
                target="_blank"
              >
                <div data-i18n="Basic">Register</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link
                href="auth-forgot-password-basic.html"
                className="menu-link"
                target="_blank"
              >
                <div data-i18n="Basic">Forgot Password</div>
              </Link>
            </li>
          </ul>
        </li> */}
          {/* <li className="menu-item">
          <Link to="" className="menu-link menu-toggle">
            <i className="menu-icon tf-icons bx bx-cube-alt"></i>
            <div data-i18n="Misc">Misc</div>
          </Link>
          <ul className="menu-sub">
            <li className="menu-item">
              <Link href="pages-misc-error.html" className="menu-link">
                <div data-i18n="Error">Error</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link href="pages-misc-under-maintenance.html" className="menu-link">
                <div data-i18n="Under Maintenance">Under Maintenance</div>
              </Link>
            </li>
          </ul>
        </li> */}
          {/* <!-- Components --> */}
          {/* <li className="menu-header small text-uppercase">
          <span className="menu-header-text">Components</span>
        </li> */}
          {/* <!-- Cards --> */}
          {/* <li className="menu-item">
          <Link href="cards-basic.html" className="menu-link">
            <i className="menu-icon tf-icons bx bx-collection"></i>
            <div data-i18n="Basic">Cards</div>
          </Link>
        </li> */}
          {/* <!-- User interface --> */}
          {/* <li className="menu-item">
          <Link href="javascript:void(0)" className="menu-link menu-toggle">
            <i className="menu-icon tf-icons bx bx-box"></i>
            <div data-i18n="User interface">User interface</div>
          </Link>
          <ul className="menu-sub">
            <li className="menu-item">
              <Link href="ui-accordion.html" className="menu-link">
                <div data-i18n="Accordion">Accordion</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link href="ui-alerts.html" className="menu-link">
                <div data-i18n="Alerts">Alerts</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link href="ui-badges.html" className="menu-link">
                <div data-i18n="Badges">Badges</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link href="ui-buttons.html" className="menu-link">
                <div data-i18n="Buttons">Buttons</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link href="ui-carousel.html" className="menu-link">
                <div data-i18n="Carousel">Carousel</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link href="ui-collapse.html" className="menu-link">
                <div data-i18n="Collapse">Collapse</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link href="ui-dropdowns.html" className="menu-link">
                <div data-i18n="Dropdowns">Dropdowns</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link href="ui-footer.html" className="menu-link">
                <div data-i18n="Footer">Footer</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link href="ui-list-groups.html" className="menu-link">
                <div data-i18n="List Groups">List groups</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link href="ui-modals.html" className="menu-link">
                <div data-i18n="Modals">Modals</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link href="ui-navbar.html" className="menu-link">
                <div data-i18n="Navbar">Navbar</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link href="ui-offcanvas.html" className="menu-link">
                <div data-i18n="Offcanvas">Offcanvas</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link href="ui-pagination-breadcrumbs.html" className="menu-link">
                <div data-i18n="Pagination &amp; Breadcrumbs">
                  Pagination &amp; Breadcrumbs
                </div>
              </Link>
            </li>
            <li className="menu-item">
              <Link href="ui-progress.html" className="menu-link">
                <div data-i18n="Progress">Progress</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link href="ui-spinners.html" className="menu-link">
                <div data-i18n="Spinners">Spinners</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link href="ui-tabs-pills.html" className="menu-link">
                <div data-i18n="Tabs &amp; Pills">Tabs &amp; Pills</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link href="ui-toasts.html" className="menu-link">
                <div data-i18n="Toasts">Toasts</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link href="ui-tooltips-popovers.html" className="menu-link">
                <div data-i18n="Tooltips & Popovers">
                  Tooltips &amp; popovers
                </div>
              </Link>
            </li>
            <li className="menu-item">
              <Link href="ui-typography.html" className="menu-link">
                <div data-i18n="Typography">Typography</div>
              </Link>
            </li>
          </ul>
        </li> */}

          {/* <!-- Extended components --> */}
          {/* <li className="menu-item">
          <Link href="javascript:void(0)" className="menu-link menu-toggle">
            <i className="menu-icon tf-icons bx bx-copy"></i>
            <div data-i18n="Extended UI">Extended UI</div>
          </Link>
          <ul className="menu-sub">
            <li className="menu-item">
              <Link
                href="extended-ui-perfect-scrollbar.html"
                className="menu-link"
              >
                <div data-i18n="Perfect Scrollbar">Perfect scrollbar</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link href="extended-ui-text-divider.html" className="menu-link">
                <div data-i18n="Text Divider">Text Divider</div>
              </Link>
            </li>
          </ul>
        </li> */}

          {/* <li className="menu-item">
          <Link href="icons-boxicons.html" className="menu-link">
            <i className="menu-icon tf-icons bx bx-crown"></i>
            <div data-i18n="Boxicons">Boxicons</div>
          </Link>
        </li> */}

          {/* <!-- Forms & Tables --> */}
          {/* <li className="menu-header small text-uppercase">
          <span className="menu-header-text">Forms &amp; Tables</span>
        </li> */}
          {/* <!-- Forms --> */}
          {/* <li className="menu-item">
          <Link to="" className="menu-link menu-toggle">
            <i className="menu-icon tf-icons bx bx-detail"></i>
            <div data-i18n="Form Elements">Form Elements</div>
          </Link>
          <ul className="menu-sub">
            <li className="menu-item">
              <Link href="forms-basic-inputs.html" className="menu-link">
                <div data-i18n="Basic Inputs">Basic Inputs</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link href="forms-input-groups.html" className="menu-link">
                <div data-i18n="Input groups">Input groups</div>
              </Link>
            </li>
          </ul>
        </li> */}
          {/* <li className="menu-item">
          <Link to="" className="menu-link menu-toggle">
            <i className="menu-icon tf-icons bx bx-detail"></i>
            <div data-i18n="Form Layouts">Form Layouts</div>
          </Link>
          <ul className="menu-sub">
            <li className="menu-item">
              <Link href="form-layouts-vertical.html" className="menu-link">
                <div data-i18n="Vertical Form">Vertical Form</div>
              </Link>
            </li>
            <li className="menu-item">
              <Link href="form-layouts-horizontal.html" className="menu-link">
                <div data-i18n="Horizontal Form">Horizontal Form</div>
              </Link>
            </li>
          </ul>
        </li> */}
          {/* <!-- Form Validation --> */}
          {/* <li className="menu-item">
          <Link
            href="https://demos.themeselection.com/sneat-bootstrap-html-admin-template/html/vertical-menu-template/form-validation.html"
            target="_blank"
            className="menu-link"
          >
            <i className="menu-icon tf-icons bx bx-list-check"></i>
            <div data-i18n="Form Validation">Form Validation</div>
            <div className="badge bg-label-primary fs-tiny rounded-pill ms-auto">
              Pro
            </div>
          </Link>
        </li> */}
          {/* <!-- Tables --> */}
          {/* <li className="menu-item">
          <Link href="tables-basic.html" className="menu-link">
            <i className="menu-icon tf-icons bx bx-table"></i>
            <div data-i18n="Tables">Tables</div>
          </Link>
        </li> */}
          {/* <!-- Data Tables --> */}
          {/* <li className="menu-item">
          <Link
            href="https://demos.themeselection.com/sneat-bootstrap-html-admin-template/html/vertical-menu-template/tables-datatables-basic.html"
            target="_blank"
            className="menu-link"
          >
            <i className="menu-icon tf-icons bx bx-grid"></i>
            <div data-i18n="Datatables">Datatables</div>
            <div className="badge bg-label-primary fs-tiny rounded-pill ms-auto">
              Pro
            </div>
          </Link>
        </li> */}
          {/* <!-- Misc --> */}
          {/* <li className="menu-header small text-uppercase">
          <span className="menu-header-text">Misc</span>
        </li> */}
          {/* <li className="menu-item">
          <Link
            href="https://github.com/themeselection/sneat-html-admin-template-free/issues"
            target="_blank"
            className="menu-link"
          >
            <i className="menu-icon tf-icons bx bx-support"></i>
            <div data-i18n="Support">Support</div>
          </Link>
        </li> */}
          {/* <li className="menu-item">
          <Link
            href="https://demos.themeselection.com/sneat-bootstrap-html-admin-template/documentation/"
            target="_blank"
            className="menu-link"
          >
            <i className="menu-icon tf-icons bx bx-file"></i>
            <div data-i18n="Documentation">Documentation</div>
          </Link>
        </li> */}
        </ul>
      </aside>
      <PermissionHandler reload={fetchFIGs} />
    </>
  );
};

export default Navigation;
