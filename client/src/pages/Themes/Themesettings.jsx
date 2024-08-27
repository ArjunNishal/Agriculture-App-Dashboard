import React, { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import jwtDecode from "jwt-decode";
import { axiosInstance, renderUrl, renderUrl2 } from "../../config";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import PermissionHandler from "../../components/PermissionHandler";

const Themesettings = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  console.log(decoded, token);
  const [fpo, setFPO] = useState(null);
  const [firstfpo, setfirstfpo] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [saving, setsaving] = useState(false);

  // State to manage the active tab
  const [activeTab, setActiveTab] = useState("themeSettings");
  // const [selectedColor, setSelectedColor] = useState("");
  const [logo, setLogo] = useState(null);
  const [themeColor1, setThemeColor1] = useState("");
  const [themeColor2, setThemeColor2] = useState("");
  const [backgroundColor1, setBackgroundColor1] = useState("");
  const [backgroundColor2, setBackgroundColor2] = useState("");
  const [iconsColor, setIconsColor] = useState("");
  const [Sectionscolor, setSectionscolor] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState({
    id: "",
    language: "",
  });
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [supportEmail, setSupportEmail] = useState("");
  const [supportMobile, setSupportMobile] = useState("");
  const [supportWhatsapp, setSupportWhatsapp] = useState("");

  const [pageload, setpageload] = useState(false);

  const [banner1, setbanner1] = useState(null);
  const [banner2, setbanner2] = useState(null);
  const [banner3, setbanner3] = useState(null);

  const [existingBannerImages, setExistingBannerImages] = useState({
    banner1: "",
    banner2: "",
    banner3: "",
  });
  console.log(selectedLanguages, "selectedLanguages");

  const handleLogoChange = (event) => {
    const selectedLogo = event.target.files[0];
    setLogo(selectedLogo);
  };

  const fetchFPO = async () => {
    try {
      setpageload(true);
      const response = await axiosInstance.get(`fpo/getmyfpo/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        if (response.data.length === 0) {
          setfirstfpo(true);
        }
        console.log(
          response.data,
          "==========================================================="
        );
        setFPO(response.data.fpo);
        if (response.data.fpo) {
          const myfpo = response.data.fpo;
          const existtheme = myfpo?.theme;
          if (existtheme) {
            setThemeColor1(existtheme?.themecolor1);
            setThemeColor2(existtheme?.themecolor2);
            setBackgroundColor1(existtheme?.backgroundColor1);
            setBackgroundColor2(existtheme?.backgroundColor2);
            setIconsColor(existtheme?.iconsColor);
            setSectionscolor(existtheme?.sectionscolor);
            setSelectedLanguages(
              existtheme.language.map((el) => ({
                _id: el._id,
                language: el.language,
              }))
            );
            setSupportEmail(existtheme?.support?.email);
            setSupportMobile(existtheme?.support?.mobileNo);
            setSupportWhatsapp(existtheme?.support?.whatsappNo);
            const existingBanners = existtheme.banner;
            console.log(existingBanners, "existingBanners");
            setExistingBannerImages({
              banner1: existingBanners?.banner1?.imageName || "",
              banner2: existingBanners?.banner2?.imageName || "",
              banner3: existingBanners?.banner3?.imageName || "",
            });
          }
        }
      }
      console.log(response);
      setpageload(false);
    } catch (error) {
      setpageload(false);
      console.log(error.response?.data.error);
      console.error("Failed to fetch FPO details:", error);
    }
  };

  console.log(existingBannerImages, "existingBannerImages");
  useEffect(() => {
    fetchFPO();
  }, []);

  // const handleColorChange = (event) => {
  //   setSelectedColor(event.target.value);
  // };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setImageUploaded(false);
    setsaving(true);
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(supportEmail)) {
        return Swal.fire({
          title: "Error!",
          text: `Please enter a valid email address`,
          icon: "error",
          confirmButtonText: "OK",
        });
      }

      // console.log(selectedLanguage.id);
      if (selectedLanguages.length === 0) {
        return Swal.fire({
          title: "Error!",
          text: `Please select a language`,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
      // Create form data
      const formData = new FormData();
      formData.append("logo", logo);
      formData.append("themeColor1", themeColor1);
      formData.append("themeColor2", themeColor2);
      formData.append("backgroundColor1", backgroundColor1);
      formData.append("backgroundColor2", backgroundColor2);
      formData.append("iconsColor", iconsColor);
      formData.append("sectionscolor", Sectionscolor);
      // formData.append("selectedLanguage", selectedLanguage.id);
      formData.append("selectedLanguage", JSON.stringify(selectedLanguages));
      formData.append("supportEmail", supportEmail);
      formData.append("supportMobile", supportMobile);
      formData.append("supportWhatsapp", supportWhatsapp);

      // Make Axios post request
      const response = await axiosInstance.post(
        `admin-auth/savethemsettings/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Swal.fire({
        title: "Success!",
        text: "Settings saved successfully",
        icon: "success",
        confirmButtonText: "OK",
      });
      fetchFPO();
      setImageUploaded(true);
      setsaving(false);
      // Handle success response
      console.log("Settings saved successfully:", response.data);
    } catch (error) {
      setImageUploaded(false);
      // Handle error
      setsaving(false);
      console.error("Error saving settings:", error);
      Swal.fire({
        title: "Error!",
        text: "Error saving settings",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const [position, setposition] = useState(null);
  const [savingbanner, setsavingbanner] = useState(null);

  const handleSubmitBanners = async (event) => {
    setsavingbanner(true);
    event.preventDefault();
    const formData = new FormData();

    if (position === 1) {
      formData.append("banner", banner1);
    }
    if (position === 2) {
      formData.append("banner", banner2);
    }
    if (position === 3) {
      formData.append("banner", banner3);
    }
    if (position === null || position === "" || !position) {
      return Swal.fire({
        title: "Warning!",
        text: "Please Select an image first",
        icon: "Warning",
        confirmButtonText: "OK",
      });
    }

    try {
      const response = await axiosInstance.post(
        `admin-auth/uploadBanner/${id}/${position}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Handle success
        Swal.fire({
          title: "Success!",
          text: "Banners saved successfully",
          icon: "success",
          confirmButtonText: "OK",
        });
        if (position === 1) {
          setbanner1(null);
        }
        if (position === 2) {
          setbanner2(null);
        }
        if (position === 3) {
          setbanner3(null);
        }
        setposition(null);
        fetchFPO();
      } else {
        // Handle error
        console.error("Failed to upload images");
      }
      setsavingbanner(false);
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "Error!",
        text: "Error saving settings",
        icon: "error",
        confirmButtonText: "OK",
      });
      setsavingbanner(false);
    }
  };

  const scrollTo208px = () => {
    window.scrollTo({
      top: 245,
      behavior: "smooth",
    });
  };
  useEffect(() => {
    if (activeTab === "themeSettings") {
      scrollTo208px();
    }
  }, [activeTab]);

  useEffect(() => {
    scrollTo208px();
  }, []);

  // fetch languages
  const [languages, setLanguages] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get("admin-auth/getlanguages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLanguages(response.data.languages);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  console.log(fpo, "fpo**************************");

  return (
    <div>
      {/* <!-- Layout wrapper -->  */}
      <div className="layout-wrapper layout-content-navbar">
        <div className="layout-container">
          {/* <!-- Menu -->  */}
          <Navigation />
          {/* <!-- / Menu -->  */}

          {/* <!-- Layout container -->  */}
          <div className="layout-page">
            <Topbar imageUploaded={imageUploaded} />
            {/* <!-- / Layout page -->  */}
            <div className="content-wrapper">
              {decoded.role === "fpoadmin" &&
              decoded.permissions?.includes("themep") ? (
                <div className="container-xxl flex-grow-1 container-p-y">
                  {pageload ? (
                    <div className="d-flex justify-content-center">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {" "}
                      {/*  {fpo &&
                      fpo?.promoter &&
                      fpo?.sharePerMember &&
                      fpo?.numberOfDirectors ? (*/}
                      <>
                        <div className="row ">
                          <div className="col-md-6 col-12">
                            <h4 className="py-3 mb-4">
                              <span className="text-muted fw-light">
                                Theme settings/
                              </span>{" "}
                              Settings
                            </h4>
                          </div>
                          <div className="col-md-6 text-end col-12">
                            {" "}
                            <div className="mb-3">
                              <button
                                className={`btn ${
                                  activeTab === "themeSettings"
                                    ? "btn-primary"
                                    : "btn-outline-primary"
                                } me-2`}
                                onClick={() => {
                                  setActiveTab("themeSettings");
                                  scrollTo208px();
                                }}
                              >
                                Theme Settings
                              </button>
                              <button
                                className={`btn ${
                                  activeTab === "banner"
                                    ? "btn-primary"
                                    : "btn-outline-primary"
                                }`}
                                onClick={() => setActiveTab("banner")}
                              >
                                Banner
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="theme-set-main">
                          {/* <hr /> */}
                          {activeTab === "themeSettings" && (
                            <div className="">
                              <div className="edit-theme-tab-main">
                                <div className="row m-0">
                                  <h4 className="p-3">Settings </h4>
                                  <div className="col-md-6">
                                    <div className="settings-left card hide-scrollbar border rounded p-3">
                                      {/* <hr /> */}
                                      <form
                                        onSubmit={handleFormSubmit}
                                        className="row"
                                      >
                                        {decoded.permissions?.includes(
                                          "logo"
                                        ) &&
                                          decoded.role === "fpoadmin" && (
                                            <div className="col-12 mb-2 ">
                                              <div className="card m-3 p-3">
                                                <label className="form-label">
                                                  <b>
                                                    <i className="fa-solid fa-copyright"></i>
                                                    &nbsp; Logo{" "}
                                                  </b>
                                                </label>
                                                <input
                                                  type="file"
                                                  className="form-control"
                                                  required={
                                                    fpo?.theme?.logo
                                                      ? false
                                                      : true
                                                  }
                                                  onChange={handleLogoChange}
                                                />
                                                <hr />
                                                <p>
                                                  <b>Previous Logo</b>
                                                </p>
                                                <div className="border d-flex justify-content-center  rounded p-2">
                                                  <img
                                                    className="w-25"
                                                    src={`${renderUrl2}${fpo?.theme?.logo}`}
                                                    alt="img"
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        {decoded.permissions?.includes(
                                          "themecolor"
                                        ) &&
                                          decoded.role === "fpoadmin" && (
                                            <div className="col-12 mb-2">
                                              <div className="card m-3 p-3">
                                                <label className="form-label">
                                                  <b>
                                                    <i className="fa-solid fa-palette"></i>
                                                    &nbsp;Theme colors{" "}
                                                    <span className="text-danger">
                                                      *
                                                    </span>
                                                  </b>
                                                </label>
                                                <ol>
                                                  <li className="mb-2">
                                                    <div className="row">
                                                      <div className="col-md-3 col-6">
                                                        <input
                                                          type="color"
                                                          value={themeColor1}
                                                          className="form-control"
                                                          required
                                                          onChange={(e) =>
                                                            setThemeColor1(
                                                              e.target.value
                                                            )
                                                          }
                                                        />
                                                      </div>
                                                      <div className="color-display col-md-9 col-6">
                                                        {themeColor1}
                                                      </div>
                                                    </div>
                                                  </li>
                                                  <li className="mb-2">
                                                    <div className="row">
                                                      <div className="col-md-3 col-6">
                                                        <input
                                                          type="color"
                                                          value={themeColor2}
                                                          required
                                                          className="form-control"
                                                          onChange={(e) =>
                                                            setThemeColor2(
                                                              e.target.value
                                                            )
                                                          }
                                                        />
                                                      </div>
                                                      <div className="color-display col-md-9 col-6">
                                                        {themeColor2}
                                                      </div>
                                                    </div>
                                                  </li>
                                                </ol>
                                              </div>
                                            </div>
                                          )}{" "}
                                        {decoded.permissions?.includes(
                                          "backgroundcolor"
                                        ) &&
                                          decoded.role === "fpoadmin" && (
                                            <div className="col-12 mb-2">
                                              <div className="card m-3 p-3">
                                                <label className="form-label">
                                                  <b>
                                                    <i className="fa-solid fa-palette"></i>
                                                    &nbsp;Background colors{" "}
                                                    <span className="text-danger">
                                                      *
                                                    </span>
                                                  </b>
                                                </label>
                                                <ol>
                                                  <li className="mb-2">
                                                    <div className="row">
                                                      <div className="col-md-3 col-6">
                                                        <input
                                                          type="color"
                                                          value={
                                                            backgroundColor1
                                                          }
                                                          required
                                                          className="form-control"
                                                          onChange={(e) =>
                                                            setBackgroundColor1(
                                                              e.target.value
                                                            )
                                                          }
                                                        />
                                                      </div>
                                                      <div className="color-display col-md-9 col-6">
                                                        {backgroundColor1}
                                                      </div>
                                                    </div>
                                                  </li>
                                                  <li className="mb-2">
                                                    <div className="row">
                                                      <div className="col-md-3 col-6">
                                                        <input
                                                          type="color"
                                                          value={
                                                            backgroundColor2
                                                          }
                                                          required
                                                          className="form-control"
                                                          onChange={(e) =>
                                                            setBackgroundColor2(
                                                              e.target.value
                                                            )
                                                          }
                                                        />
                                                      </div>
                                                      <div className="color-display col-md-9 col-6">
                                                        {backgroundColor2}
                                                      </div>
                                                    </div>
                                                  </li>
                                                </ol>
                                              </div>
                                            </div>
                                          )}{" "}
                                        {decoded.permissions?.includes(
                                          "iconscolor"
                                        ) &&
                                          decoded.role === "fpoadmin" && (
                                            <div className="col-12 mb-2">
                                              <div className="card m-3 p-3">
                                                {" "}
                                                <label className="form-label">
                                                  <b>
                                                    <i className="fa-solid fa-paintbrush"></i>
                                                    &nbsp;Icons Color{" "}
                                                    <span className="text-danger">
                                                      *
                                                    </span>
                                                  </b>
                                                </label>
                                                <div className="row">
                                                  <div className="col-md-3 col-6">
                                                    <input
                                                      type="color"
                                                      value={iconsColor}
                                                      required
                                                      className="form-control"
                                                      onChange={(e) =>
                                                        setIconsColor(
                                                          e.target.value
                                                        )
                                                      }
                                                    />
                                                  </div>
                                                  <div className="col-md-9 col-6">
                                                    {iconsColor}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        {decoded.permissions?.includes(
                                          "sectioncolor"
                                        ) &&
                                          decoded.role === "fpoadmin" && (
                                            <div className="col-12 mb-2">
                                              <div className="card m-3 p-3">
                                                {" "}
                                                <label className="form-label">
                                                  <b>
                                                    <i className="fa-solid fa-paintbrush"></i>
                                                    &nbsp;Sections Color{" "}
                                                    <span className="text-danger">
                                                      *
                                                    </span>
                                                  </b>
                                                </label>
                                                <div className="row">
                                                  <div className="col-md-3 col-6">
                                                    <input
                                                      type="color"
                                                      value={Sectionscolor}
                                                      required
                                                      className="form-control"
                                                      onChange={(e) =>
                                                        setSectionscolor(
                                                          e.target.value
                                                        )
                                                      }
                                                    />
                                                  </div>
                                                  <div className="col-md-9 col-6">
                                                    {Sectionscolor}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        {/* {decoded.permissions?.includes(
                                        "language"
                                      ) &&
                                        decoded.role === "fpoadmin" && (
                                          <div className="col-12 mb-2">
                                            <div className="card m-3 p-3">
                                              <label className="form-label">
                                                <b>
                                                  <i className="fa-solid fa-language"></i>
                                                  &nbsp;Language
                                                </b>
                                              </label>
                                              <select
                                                className="form-select"
                                                aria-label="Default select example"
                                                required
                                                value={selectedLanguage.id}
                                                onChange={(e) => {
                                                  const selectedLang =
                                                    languages.find(
                                                      (lang) =>
                                                        lang._id ===
                                                        e.target.value
                                                    );
                                                  setSelectedLanguage({
                                                    id: selectedLang._id,
                                                    language:
                                                      selectedLang.language,
                                                  });
                                                }}
                                              >
                                                <option value="Select language">
                                                  Select language
                                                </option>
                                                {languages.map((el, index) => {
                                                  return (
                                                    <option
                                                      key={index}
                                                      value={el._id}
                                                    >
                                                      {el.language}
                                                    </option>
                                                  );
                                                })}
                                              </select>
                                            </div>
                                          </div>
                                        )} */}
                                        {decoded.permissions?.includes(
                                          "language"
                                        ) &&
                                          decoded.role === "fpoadmin" && (
                                            <div className="col-12 mb-2">
                                              <div className="card m-3 p-3">
                                                {selectedLanguages.length >
                                                  0 && (
                                                  <label className="form-label">
                                                    <b>
                                                      <i className="fa-solid fa-language"></i>
                                                      &nbsp;Selected Languages
                                                    </b>
                                                  </label>
                                                )}
                                                <div className="selected_languages">
                                                  <div className="d-flex gap-1 flex-wrap">
                                                    {selectedLanguages?.map(
                                                      (el, index) => (
                                                        <div className=" border border-success d-flex gap-1 justify-content-center align-items-center p-2 rounded">
                                                          <span>
                                                            {el.language}
                                                          </span>
                                                          <button
                                                            type="button"
                                                            onClick={() => {
                                                              setSelectedLanguages(
                                                                (
                                                                  prevLanguages
                                                                ) =>
                                                                  prevLanguages.filter(
                                                                    (lang) =>
                                                                      lang._id !==
                                                                      el._id
                                                                  )
                                                              );
                                                              setSelectedLanguage(
                                                                {
                                                                  id: "Select language",
                                                                  language:
                                                                    "Select language",
                                                                }
                                                              );
                                                            }}
                                                            className="btn btn-close"
                                                          ></button>
                                                        </div>
                                                      )
                                                    )}
                                                  </div>
                                                </div>

                                                <label className="form-label">
                                                  <b>
                                                    <i className="fa-solid fa-language"></i>
                                                    &nbsp;Language{" "}
                                                    <span className="text-danger">
                                                      *
                                                    </span>
                                                  </b>
                                                </label>
                                                <select
                                                  className="form-select"
                                                  aria-label="Default select example"
                                                  required
                                                  value={selectedLanguage.id}
                                                  onChange={(e) => {
                                                    setSelectedLanguage({
                                                      id: e.target.value,
                                                      language: e.target.value,
                                                    });
                                                    const selectedLang =
                                                      languages.find(
                                                        (lang) =>
                                                          lang._id ===
                                                          e.target.value
                                                      );

                                                    console.log();

                                                    if (
                                                      !selectedLanguages.some(
                                                        (lang) =>
                                                          lang._id ===
                                                          selectedLang._id
                                                      ) &&
                                                      selectedLang !==
                                                        "Select language"
                                                    ) {
                                                      // Add the selected language if not already in the array
                                                      setSelectedLanguages(
                                                        (prevLanguages) => [
                                                          ...prevLanguages,
                                                          {
                                                            _id: selectedLang._id,
                                                            language:
                                                              selectedLang.language,
                                                          },
                                                        ]
                                                      );
                                                    }
                                                  }}
                                                  // Enable multiple selections
                                                >
                                                  <option value="Select language">
                                                    Select language
                                                  </option>
                                                  {languages.map(
                                                    (el, index) => {
                                                      return (
                                                        <option
                                                          key={index}
                                                          value={el._id}
                                                        >
                                                          {el.language}
                                                        </option>
                                                      );
                                                    }
                                                  )}
                                                </select>
                                              </div>
                                            </div>
                                          )}
                                        {decoded.permissions?.includes(
                                          "support"
                                        ) &&
                                          decoded.role === "fpoadmin" && (
                                            <div className="col-12 mb-2">
                                              <div className="card m-3 p-3">
                                                <label className="form-label">
                                                  <b>
                                                    <i className="fa-solid fa-headset"></i>
                                                    &nbsp;Support Details{" "}
                                                    <span className="text-danger">
                                                      *
                                                    </span>
                                                  </b>
                                                </label>
                                                <hr />

                                                <div>
                                                  <label className="form-label">
                                                    <i className="fa-solid fa-envelope"></i>
                                                    &nbsp;Support email
                                                  </label>
                                                  <input
                                                    type="email"
                                                    className="form-control"
                                                    value={supportEmail}
                                                    required
                                                    onChange={(e) =>
                                                      setSupportEmail(
                                                        e.target.value
                                                      )
                                                    }
                                                  />
                                                </div>
                                                <div>
                                                  <label className="form-label">
                                                    <i className="fa-solid fa-phone"></i>
                                                    &nbsp;Support Mobile no.{" "}
                                                    <span className="text-danger">
                                                      *
                                                    </span>
                                                  </label>
                                                  <input
                                                    type="number"
                                                    className="form-control"
                                                    value={supportMobile}
                                                    required
                                                    // onChange={(e) =>
                                                    //   setSupportMobile(
                                                    //     e.target.value
                                                    //   )
                                                    // }
                                                    onChange={(e) => {
                                                      let inputMobileNo =
                                                        e.target.value;
                                                      // setisvalidmobile(true);
                                                      if (
                                                        inputMobileNo.length >
                                                        10
                                                      ) {
                                                        inputMobileNo =
                                                          inputMobileNo.slice(
                                                            0,
                                                            10
                                                          );
                                                      }
                                                      setSupportMobile(
                                                        inputMobileNo
                                                      );
                                                    }}
                                                  />
                                                </div>
                                                <div>
                                                  <label className="form-label">
                                                    <i className="fa-brands fa-whatsapp"></i>
                                                    &nbsp;Support whatsapp no.{" "}
                                                    <span className="text-danger">
                                                      *
                                                    </span>
                                                  </label>
                                                  <input
                                                    type="number"
                                                    className="form-control"
                                                    value={supportWhatsapp}
                                                    required
                                                    onChange={(e) => {
                                                      let inputMobileNo =
                                                        e.target.value;
                                                      // setisvalidmobile(true);
                                                      if (
                                                        inputMobileNo.length >
                                                        10
                                                      ) {
                                                        inputMobileNo =
                                                          inputMobileNo.slice(
                                                            0,
                                                            10
                                                          );
                                                      }
                                                      setSupportWhatsapp(
                                                        inputMobileNo
                                                      );
                                                    }}
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          )}{" "}
                                        {decoded.permissions?.includes(
                                          "logo"
                                        ) ||
                                        decoded.permissions?.includes(
                                          "iconscolor"
                                        ) ||
                                        decoded.permissions?.includes(
                                          "themecolor"
                                        ) ||
                                        decoded.permissions?.includes(
                                          "language"
                                        ) ||
                                        decoded.permissions?.includes(
                                          "banners"
                                        ) ||
                                        decoded.permissions?.includes(
                                          "support"
                                        ) ||
                                        decoded.permissions?.includes(
                                          "backgroundcolor"
                                        ) ||
                                        (decoded.permissions?.includes(
                                          "sectioncolor"
                                        ) &&
                                          decoded.role === "fpoadmin") ? (
                                          <div className="col-12 text-center mb-3">
                                            <button
                                              type="submit"
                                              className="btn btn-primary"
                                              disabled={saving}
                                            >
                                              <i className="fa-solid fa-wrench"></i>
                                              &nbsp;Save Settings
                                            </button>
                                          </div>
                                        ) : (
                                          <>
                                            <div>
                                              <p className="text-center">
                                                You don't have permission to
                                                edit theme
                                              </p>
                                            </div>
                                          </>
                                        )}
                                      </form>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="d-md-none d-block">
                                      <p className="text-center">
                                        <b>App Preview</b>
                                      </p>
                                    </div>
                                    <div className="home card shadow-none  rounded">
                                      <div className="div">
                                        <div
                                          className="overlap"
                                          style={{
                                            background: `linear-gradient(180deg, ${backgroundColor1} 0%,${backgroundColor2} 51.04%)`,
                                          }}
                                        >
                                          <div className="rectangle" />
                                          <img
                                            className="line"
                                            alt="Line"
                                            src="/assets/img/previewassets/line-58.svg"
                                          />
                                          <div className="rectangle-2" />
                                          <div className="text-wrapper-2">
                                            Home
                                          </div>
                                          <div className="text-wrapper-3">
                                            My FPO
                                          </div>
                                          <div className="text-wrapper-4">
                                            Trainings
                                          </div>
                                          <div className="text-wrapper-5">
                                            News
                                          </div>
                                          <div className="text-wrapper-6">
                                            Marketplace
                                          </div>
                                          {/* <img
                                        className="ellipse"
                                        alt="Ellipse"
                                        src="/assets/img/previewassets/ellipse-130.png"
                                      /> */}
                                          <div
                                            style={{
                                              background: `${themeColor1}`,
                                              borderRadius: "50%",
                                            }}
                                            className="ellipse"
                                          ></div>
                                          {/* <img
                                        className="group"
                                        alt="Group"
                                        src="/assets/img/previewassets/group-618.svg"
                                      /> */}
                                          <i
                                            style={{ color: `${iconsColor}` }}
                                            className="group fa-solid fa-store"
                                          ></i>
                                          {/* <img
                                        className="group-2"
                                        alt="Group"
                                        src="/assets/img/previewassets/group617.png"
                                      /> */}
                                          <i
                                            style={{ color: `${iconsColor}` }}
                                            className="group-2 fa-solid fa-volume-high"
                                          ></i>
                                          {/* <img
                                        className="group-3"
                                        alt="Group"
                                        src="/assets/img/previewassets/group.png"
                                      /> */}
                                          <i
                                            style={{ color: `${iconsColor}` }}
                                            className="group-3 fa-solid fa-users"
                                          ></i>
                                          {/* <img
                                        className="vector"
                                        alt="Vector"
                                        src="/assets/img/previewassets/vector.svg"
                                      /> */}
                                          <i
                                            style={{ color: `${iconsColor}` }}
                                            className="vector fa-solid fa-house-chimney"
                                          ></i>
                                          {/* <img
                                        className="group-4"
                                        alt="Group"
                                        src="/assets/img/previewassets/image.png"
                                      /> */}
                                          <i
                                            style={{ color: `${iconsColor}` }}
                                            className="group-4 fa-solid fa-chalkboard-user"
                                          ></i>
                                          {/* <img
                                        className="frame-2"
                                        alt="Frame"
                                        src="/assets/img/previewassets/frame.png"
                                      />  */}
                                          {/* <img
                                        className="rectangle-3"
                                        alt="Rectangle"
                                        src="/assets/img/previewassets/rectangle-340.png"
                                      /> */}
                                          <div
                                            className="rectangle-4"
                                            style={{
                                              background: `${Sectionscolor}`,
                                            }}
                                          />
                                          <div
                                            className="rectangle-5"
                                            style={{
                                              background: `${Sectionscolor}`,
                                            }}
                                          />
                                          <p className="p">
                                            Continue training where you left off
                                          </p>
                                          <div className="text-wrapper-7">
                                            Session 1
                                          </div>
                                          <div className="text-wrapper-8">
                                            13 mins left
                                          </div>
                                          <img
                                            className="frame-3"
                                            alt="Frame"
                                            src="/assets/img/previewassets/image24.png"
                                          />
                                          <div className="text-wrapper-9">
                                            Structure of FPO
                                          </div>
                                          {/* <div
                                        className="vector-2"
                                        alt="Vector"
                                        src="/assets/img/previewassets/vector2.png"
                                      /> */}
                                          <i
                                            style={{ color: `${iconsColor}` }}
                                            className=" vector-2 fa-solid fa-circle-play"
                                          ></i>
                                          <p className="text-wrapper-10">
                                            Check out this new demand survey
                                          </p>
                                          <p className="tell-us-your-farming">
                                            Tell us your farming <br />
                                            requirements.
                                          </p>
                                          <button
                                            className=" btn btn-sm  rounded-pill button-instance "
                                            style={{
                                              background: `linear-gradient(180deg, ${themeColor1} 0%,${themeColor2} 51.04%)`,
                                            }}
                                          >
                                            <div className="state-layer">
                                              <div className="label-text">
                                                Take Survey
                                              </div>
                                            </div>
                                          </button>
                                          {/* <Button
                                        className="button-instance"
                                        label="Take Survey"
                                        property1="default"
                                        stateLayerClassName="design-component-instance-node"
                                      />  */}
                                          <div className="text-wrapper-11">
                                            Latest FPO News
                                          </div>
                                          <div
                                            className="rectangle-6"
                                            style={{
                                              background: `linear-gradient(180deg, ${themeColor1} 0%,${themeColor2} 51.04%)`,
                                            }}
                                          />
                                          {/* <img
                                        className="ci-hamburger-md"
                                        alt="Ci hamburger md"
                                        src="/assets/img/previewassets/ci_hamburger-md.svg"
                                      /> */}
                                          <i
                                            style={{ color: `${iconsColor}` }}
                                            className="fa-solid fa-bars ci-hamburger-md"
                                          ></i>
                                          <p
                                            className="text-wrapper-12"
                                            style={{ fontSize: "14px" }}
                                          >
                                            Hello Ravi | {fpo?.name}
                                          </p>
                                          <img
                                            className="ellipse-2"
                                            alt="Ellipse"
                                            src={`${renderUrl2}${fpo?.theme?.logo}`}
                                          />
                                          <div className="overlap-group-wrapper">
                                            <div className="overlap-group">
                                              <div
                                                className="rectangle-7"
                                                style={{
                                                  backgroundColor: `${Sectionscolor}`,
                                                }}
                                              />
                                              <div className="ellipse-3" />
                                              <div className="text-wrapper-13">
                                                5 new messages
                                              </div>
                                              <div className="text-wrapper-14">
                                                9:41 am
                                              </div>
                                              <div className="text-wrapper-15">
                                                5
                                              </div>
                                              <div className="text-wrapper-16">
                                                Feeding and Breeding
                                              </div>
                                              <div className="ellipse-4" />
                                            </div>
                                          </div>
                                          <p className="text-wrapper-17">
                                            Your FPO leader has posted a new
                                            discussion
                                          </p>
                                          <img
                                            className="aquarium"
                                            alt="Aquarium"
                                            src="/assets/img/previewassets/aquarium-1050826-1.png"
                                          />
                                          <img
                                            className="rectangle-8"
                                            style={{
                                              border: `3px solid ${themeColor1}`,
                                            }}
                                            alt="Rectangle"
                                            src="/assets/img/previewassets/Rectangle361.png"
                                          />
                                          <img
                                            className="rectangle-9"
                                            style={{
                                              border: `3px solid ${themeColor1}`,
                                            }}
                                            alt="Rectangle"
                                            src="/assets/img/previewassets/rectangle362.png"
                                          />
                                          <img
                                            className="rectangle-10"
                                            style={{
                                              border: `3px solid ${themeColor1}`,
                                            }}
                                            alt="Rectangle"
                                            src="/assets/img/previewassets/rectangle364.png"
                                          />
                                          <img
                                            className="rectangle-11"
                                            style={{
                                              border: `3px solid ${themeColor1}`,
                                            }}
                                            alt="Rectangle"
                                            src="/assets/img/previewassets/rectangle365.png"
                                          />
                                          <img
                                            className="rectangle-12"
                                            style={{
                                              border: `3px solid ${themeColor1}`,
                                            }}
                                            alt="Rectangle"
                                            src="/assets/img/previewassets/rectangle363.png"
                                          />
                                          <img
                                            className="bell-icon"
                                            alt="Bell icon"
                                            src="/assets/img/previewassets/bell-icon-transparent-notification-free-png-1.png"
                                          />
                                          <img
                                            className="group-5"
                                            alt="Group"
                                            src="/assets/img/previewassets/group-2.png"
                                          />
                                          {/* <img
                                        className="frame-4"
                                        alt="Frame"
                                        src="/assets/img/previewassets/frame.jpg"
                                      /> */}
                                          <i
                                            style={{ color: `${iconsColor}` }}
                                            className="frame-4 fa-solid fa-angles-right"
                                          ></i>
                                          <div className="frame-5" />
                                          <img
                                            className="subtract"
                                            alt="Subtract"
                                            src="/assets/img/previewassets/subtract.png"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-6 d-md-block d-none text-center col-12">
                                    <b>Change settings</b>
                                  </div>
                                  <div className="col-md-6  d-md-block d-none text-center col-12">
                                    <b>Your changes will reflect here</b>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {activeTab === "banner" && (
                            <div className="card">
                              <div className="card-header">
                                <h3>Banners</h3>
                              </div>
                              {decoded.permissions?.includes("banners") &&
                              decoded.role === "fpoadmin" ? (
                                <div className="row">
                                  <div className="col-md-4 col-12">
                                    <form onSubmit={handleSubmitBanners}>
                                      <div className="p-3">
                                        <div>
                                          <label className="form-label">
                                            Banner 1
                                          </label>
                                          <input
                                            type="file"
                                            className="form-control mb-2"
                                            onChange={(e) =>
                                              setbanner1(e.target.files[0])
                                            }
                                          />
                                          <div className="text-center">
                                            <button
                                              type="submit"
                                              className="btn btn-primary"
                                              disabled={
                                                (banner1 ? false : true) ||
                                                savingbanner
                                              }
                                              onClick={() => setposition(1)}
                                            >
                                              Upload Banner 1
                                            </button>
                                          </div>

                                          {banner1 && banner1 !== "" ? (
                                            <>
                                              <p>
                                                <b>Preview</b>
                                              </p>
                                              <div className="mb-3">
                                                {/* Display the selected image preview */}
                                                <div className="add-cat-img-preview border rounded">
                                                  <img
                                                    src={URL.createObjectURL(
                                                      banner1
                                                    )}
                                                    alt="prev"
                                                  />
                                                </div>
                                              </div>
                                            </>
                                          ) : (
                                            <>
                                              {/* <div>
                                          <p className="text-danger">
                                            No files selected
                                          </p>
                                        </div> */}
                                            </>
                                          )}
                                          <hr />
                                          <p>Current Image</p>

                                          {existingBannerImages.banner1 !==
                                            "" && (
                                            <div className="previous-image">
                                              <img
                                                id="banner-preview my-3"
                                                src={`${renderUrl2}${existingBannerImages.banner1}`}
                                                alt="img"
                                              />
                                            </div>
                                          )}
                                          {/* <img src="" alt="img" /> */}
                                        </div>
                                      </div>
                                    </form>
                                  </div>
                                  <div className="col-md-4 col-12">
                                    <form onSubmit={handleSubmitBanners}>
                                      <div className="p-3">
                                        <div>
                                          <label className="form-label">
                                            Banner 2
                                          </label>
                                          <input
                                            type="file"
                                            className="form-control mb-2"
                                            onChange={(e) =>
                                              setbanner2(e.target.files[0])
                                            }
                                          />
                                          <div className="text-center">
                                            <button
                                              type="submit"
                                              className="btn btn-primary"
                                              disabled={banner2 ? false : true}
                                              onClick={() => setposition(2)}
                                            >
                                              Upload Banner 2
                                            </button>
                                          </div>

                                          {banner2 && banner2 !== "" ? (
                                            <>
                                              <p>
                                                <b>Preview</b>
                                              </p>
                                              <div className="mb-3">
                                                {/* Display the selected image preview */}
                                                <div className="add-cat-img-preview border rounded">
                                                  <img
                                                    src={URL.createObjectURL(
                                                      banner2
                                                    )}
                                                    alt="prev"
                                                  />
                                                </div>
                                              </div>
                                            </>
                                          ) : (
                                            <>
                                              {/* <div>
                                          <p className="text-danger">
                                            No files selected
                                          </p>
                                        </div> */}
                                            </>
                                          )}
                                          <hr />
                                          <p>Current Image</p>
                                          {existingBannerImages.banner2 !==
                                            "" && (
                                            <div className="previous-image">
                                              <img
                                                id="banner-preview my-3"
                                                src={`${renderUrl}uploads/banner/${existingBannerImages.banner2}`}
                                                alt="img"
                                              />
                                            </div>
                                          )}
                                          {/* <img src="" alt="img" /> */}
                                        </div>
                                      </div>
                                    </form>
                                  </div>
                                  <div className="col-md-4 col-12">
                                    <form onSubmit={handleSubmitBanners}>
                                      <div className="p-3">
                                        <div>
                                          <label className="form-label">
                                            Banner 3
                                          </label>
                                          <input
                                            type="file"
                                            className="form-control mb-2"
                                            onChange={(e) =>
                                              setbanner3(e.target.files[0])
                                            }
                                          />
                                          <div className="text-center">
                                            <button
                                              type="submit"
                                              className="btn btn-primary"
                                              disabled={banner3 ? false : true}
                                              onClick={() => setposition(3)}
                                            >
                                              Upload Banner 3
                                            </button>
                                          </div>
                                          {banner3 && banner3 !== "" ? (
                                            <>
                                              <p>
                                                <b>Preview</b>
                                              </p>
                                              <div className="mb-3">
                                                {/* Display the selected image preview */}
                                                <div className="add-cat-img-preview border rounded">
                                                  <img
                                                    src={URL.createObjectURL(
                                                      banner3
                                                    )}
                                                    alt="prev"
                                                  />
                                                </div>
                                              </div>
                                            </>
                                          ) : (
                                            <>
                                              {/* <div>
                                          <p className="text-danger">
                                            No files selected
                                          </p>
                                        </div> */}
                                            </>
                                          )}
                                          <hr />
                                          <p>Current Image</p>
                                          {existingBannerImages.banner3 !==
                                            "" && (
                                            <div className="previous-image">
                                              <img
                                                id="banner-preview my-3"
                                                src={`${renderUrl}uploads/banner/${existingBannerImages.banner3}`}
                                                alt="img"
                                              />
                                            </div>
                                          )}
                                          {/* <img src="" alt="img" /> */}
                                        </div>
                                      </div>
                                    </form>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div>
                                    <p className="text-center">
                                      You do not have permission for editing
                                      banners.
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                      {/*  ) : (
                        <>
                          <div
                            className="alert alert-danger d-flex justify-content-between align-items-center"
                            role="alert"
                          >
                            <span>Please Complete your FPO profile first</span>
                            <Link className="btn btn-primary" to={"/myfpo"}>
                              Edit FPO
                            </Link>
                          </div>
                        </>
                      )}*/}
                    </>
                  )}
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

export default Themesettings;
