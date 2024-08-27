import React, { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../config";
import Swal from "sweetalert2";
import jwtDecode from "jwt-decode";
import PermissionHandler from "../../components/PermissionHandler";

const Addfpoadmin = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  const [saving, setsaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobileno: "",
    password: "",
    role: "fpoadmin",
    fponame: "",
    permissions: [
      "logo",
      "iconscolor",
      "backgroundcolor",
      "themecolor",
      "sectioncolor",
      "language",
      "banners",
      "support",
    ],
  });

  const navigate = useNavigate("");
  const { username, email, mobileno, password, role, permissions, fponame } =
    formData;
  const [showPassword, setShowPassword] = useState(false);
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const [isValidEmail, setIsValidEmail] = useState(true);

  const [logo, setLogo] = useState(null);
  const [themeColor1, setThemeColor1] = useState("#67D18B");
  const [themeColor2, setThemeColor2] = useState("#5CBDAA");
  const [backgroundColor1, setBackgroundColor1] = useState("#67D18B");
  const [backgroundColor2, setBackgroundColor2] = useState("#5CBDAA");
  const [iconsColor, setIconsColor] = useState("#000000");
  const [Sectionscolor, setSectionscolor] = useState("#ffffff");
  const [selectedLanguage, setSelectedLanguage] = useState({
    id: "",
    language: "",
  });
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [supportEmail, setSupportEmail] = useState("");
  const [supportMobile, setSupportMobile] = useState("");
  const [supportWhatsapp, setSupportWhatsapp] = useState("");

  const [banner1, setbanner1] = useState(null);
  const [banner2, setbanner2] = useState(null);
  const [banner3, setbanner3] = useState(null);

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Check if the email has a dot (.) after @
    if (name === "email") {
      const atIndex = value.indexOf("@");
      const dotIndex = value.lastIndexOf(".");

      const isEmailValid =
        atIndex !== -1 &&
        dotIndex !== -1 &&
        dotIndex > atIndex + 1 &&
        /[a-zA-Z]{2,}$/.test(value.substring(dotIndex + 1));

      setIsValidEmail(isEmailValid);

      if (value === "") {
        setIsValidEmail(true);
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const [isvalidmobile, setisvalidmobile] = useState(true);

  const handleChangemob = (e) => {
    let inputMobileNo = e.target.value;
    setisvalidmobile(true);
    if (inputMobileNo.length > 10) {
      inputMobileNo = inputMobileNo.slice(0, 10);
      // setisvalidmobile(false);
    }

    setFormData({
      ...formData,
      [e.target.name]: inputMobileNo,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!isValidEmail) {
        Swal.fire({
          icon: "error",
          title: "Enter a valid email address.",
        });
        return setIsValidEmail(false);
      }
      if (mobileno.length !== 10) {
        Swal.fire({
          icon: "error",
          title: "Enter a 10 digit mobile number.",
        });
        return setisvalidmobile(false);
      }

      if (formData.permissions.length === 0) {
        return Swal.fire({
          icon: "warning",
          title: "Please select atleast one permission for creating FPO admin.",
        });
      }
      if (selectedLanguage.id === "") {
        return Swal.fire({
          title: "Error!",
          text: `Please select a language`,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
      setsaving(true);

      console.log(selectedLanguages);
      const formDatatheme = new FormData();
      formDatatheme.append("logo", logo);
      formDatatheme.append("themeColor1", themeColor1);
      formDatatheme.append("themeColor2", themeColor2);
      formDatatheme.append("backgroundColor1", backgroundColor1);
      formDatatheme.append("backgroundColor2", backgroundColor2);
      formDatatheme.append("iconsColor", iconsColor);
      formDatatheme.append("sectionscolor", Sectionscolor);
      formDatatheme.append(
        "selectedLanguage",
        JSON.stringify(selectedLanguages)
      );
      formDatatheme.append("supportEmail", supportEmail);
      formDatatheme.append("supportMobile", supportMobile);
      formDatatheme.append("supportWhatsapp", supportWhatsapp);
      // formDatatheme.append("banner1", banner1);
      // formDatatheme.append("banner2", banner2);
      // formDatatheme.append("banner3", banner3);
      formDatatheme.append("username", username);
      formDatatheme.append("email", email);
      formDatatheme.append("mobileno", mobileno);
      formDatatheme.append("password", password);
      formDatatheme.append("fponame", fponame);
      formDatatheme.append("role", "fpoadmin");
      formDatatheme.append("permissions", JSON.stringify(permissions));

      const response = await axiosInstance.post(
        "admin-log/addAdmin",
        formDatatheme,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);

      // Display a success message using SweetAlert2
      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        text: "You have successfully registered as an FPO Admin.",
      });

      setFormData({
        username: "",
        email: "",
        mobileno: "",
        password: "",
        fponame: "",
        permissions: [],
      });
      setSurveySection({
        addNewSurvey: false,
        editSurvey: false,
        deactivateSurvey: false,
      });
      setradioSection({
        addNewradio: false,
        editradiodetails: false,
        addradiocat: false,
        editradiocatstatus: false,
        addseason: false,
        editseasondetails: false,
        editSeasonStatus: false,
        seasonlist: false,
      });
      setnewsSection({
        editnewsstatus: false,
        editNGstatus: false,
        editNGrequests: false,
      });
      setFIGSection({
        editFIGstatus: false,
        leaderreqs: false,
        editrequests: false,
        members: false,
        contentcreators: false,
        leadercumcreator: false,
      });
      setsurveyp(false);
      setFIGp(false);
      setnewsp(false);
      setradiop(false);
      setthemep(false);
      navigate("/fpoadmins");
      setsaving(false);
    } catch (error) {
      console.error("Registration error: ", error);
      setsaving(false);
      // Display an error message using SweetAlert2
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: error.response.data.Error,
      });
    }
  };

  // permissions
  const [surveyp, setsurveyp] = useState(false);
  const [FIGp, setFIGp] = useState(false);
  const [newsp, setnewsp] = useState(false);
  const [radiop, setradiop] = useState(false);
  const [themep, setthemep] = useState(true);
  // console.log(surveyp);

  // survey check change
  useEffect(() => {
    if (!surveyp) {
      setSurveySection({
        addNewSurvey: false,
        editSurvey: false,
        deactivateSurvey: false,
      });
      setFormData((prevData) => ({
        ...prevData,
        permissions: prevData.permissions.filter(
          (permission) =>
            permission !== "surveyp" &&
            permission !== "addnewsurvey" &&
            permission !== "editsurvey" &&
            permission !== "deactivatesurvey"
        ),
      }));
    }
    if (surveyp && !formData.permissions.includes("surveyp")) {
      const surveyPermissions = [
        "surveyp",
        "addnewsurvey",
        "editsurvey",
        "deactivatesurvey",
      ];
      setFormData((prevData) => ({
        ...prevData,
        permissions: [
          ...prevData.permissions,
          ...surveyPermissions.filter(
            (permission) => !prevData.permissions.includes(permission)
          ),
        ],
      }));
      setSurveySection({
        addNewSurvey: true,
        editSurvey: true,
        deactivateSurvey: true,
      });
    }
  }, [surveyp]);

  // radio check change
  useEffect(() => {
    if (!radiop) {
      setradioSection({
        addNewradio: false,
        editradiodetails: false,
        addradiocat: false,
        editradiocatstatus: false,
        addseason: false,
        editseasondetails: false,
        editSeasonStatus: false,
        seasonlist: false,
      });
      setFormData((prevData) => ({
        ...prevData,
        permissions: prevData.permissions.filter(
          (permission) =>
            permission !== "radiop" &&
            permission !== "addradio" &&
            permission !== "addradiocategory" &&
            permission !== "editradiocategory" &&
            permission !== "editradiodetails" &&
            permission !== "seasonlist" &&
            permission !== "editseasonstatus" &&
            permission !== "editseasondetails" &&
            permission !== "addseason"
        ),
      }));
    } else if (!formData.permissions.includes("radiop")) {
      const radioPermissions = [
        "radiop",
        "addradio",
        "addradiocategory",
        "editradiocategory",
        "editradiodetails",
        "seasonlist",
        "editseasonstatus",
        "editseasondetails",
        "addseason",
      ];
      setFormData((prevData) => ({
        ...prevData,
        permissions: [
          ...prevData.permissions,
          ...radioPermissions.filter(
            (permission) => !prevData.permissions.includes(permission)
          ),
        ],
      }));
      setradioSection({
        addNewradio: true,
        editradiodetails: true,
        addradiocat: true,
        editradiocatstatus: true,
        addseason: true,
        editseasondetails: true,
        editSeasonStatus: true,
        seasonlist: true,
      });
    }
  }, [radiop]);

  // news check change
  useEffect(() => {
    if (!newsp) {
      setnewsSection({
        editnewsstatus: false,
        editNGstatus: false,
        editNGrequests: false,
      });
      setFormData((prevData) => ({
        ...prevData,
        permissions: prevData.permissions.filter(
          (permission) =>
            permission !== "newsp" &&
            permission !== "editnewsgrpstatus" &&
            permission !== "editnewsstatus" &&
            permission !== "editnewsgrpreqs"
        ),
      }));
    } else if (!formData.permissions.includes("newsp")) {
      const newsPermissions = [
        "newsp",
        "editnewsgrpstatus",
        "editnewsstatus",
        "editnewsgrpreqs",
      ];
      setFormData((prevData) => ({
        ...prevData,
        permissions: [
          ...prevData.permissions,
          ...newsPermissions.filter(
            (permission) => !prevData.permissions.includes(permission)
          ),
        ],
      }));
      setnewsSection({
        editnewsstatus: true,
        editNGstatus: true,
        editNGrequests: true,
      });
    }
  }, [newsp]);

  // FIG check change
  useEffect(() => {
    if (!FIGp) {
      setFIGSection({
        editFIGstatus: false,
        leaderreqs: false,
        editrequests: false,
        members: false,
        contentcreators: false,
        leadercumcreator: false,
      });
      setFormData((prevData) => ({
        ...prevData,
        permissions: prevData.permissions.filter(
          (permission) =>
            permission !== "figp" &&
            permission !== "editfigstatus" &&
            permission !== "editfigleaderstatus" &&
            permission !== "figleaderreqs" &&
            permission !== "members" &&
            permission !== "contentcreators" &&
            permission !== "leadercumcreator"
        ),
      }));
    } else if (!formData.permissions.includes("figp")) {
      const figPermissions = [
        "figp",
        "editfigstatus",
        "editfigleaderstatus",
        "figleaderreqs",
        "members",
        "contentcreators",
        "leadercumcreator",
      ];
      setFormData((prevData) => ({
        ...prevData,
        permissions: [
          ...prevData.permissions,
          ...figPermissions.filter(
            (permission) => !prevData.permissions.includes(permission)
          ),
        ],
      }));
      setFIGSection({
        editFIGstatus: true,
        leaderreqs: true,
        editrequests: true,
        members: true,
        contentcreators: true,
        leadercumcreator: true,
      });
    }
  }, [FIGp]);

  useEffect(() => {
    if (!themep) {
      setFormData((prevData) => ({
        ...prevData,
        permissions: prevData.permissions.filter(
          (permission) =>
            permission !== "logo" &&
            permission !== "iconscolor" &&
            permission !== "themecolor" &&
            permission !== "language" &&
            permission !== "banners" &&
            permission !== "support" &&
            permission !== "themep" &&
            permission !== "backgroundcolor" &&
            permission !== "sectioncolor"
        ),
      }));
    } else if (!formData.permissions.includes("themep")) {
      const themePermissions = [
        "logo",
        "iconscolor",
        "themecolor",
        "language",
        "banners",
        "support",
        "themep",
        "backgroundcolor",
        "sectioncolor",
      ];
      setFormData((prevData) => ({
        ...prevData,
        permissions: [
          ...prevData.permissions,
          ...themePermissions.filter(
            (permission) => !prevData.permissions.includes(permission)
          ),
        ],
      }));
    }
  }, [themep]);

  const [surveySection, setSurveySection] = useState({
    addNewSurvey: false,
    editSurvey: false,
    deactivateSurvey: false,
  });
  const [radioSection, setradioSection] = useState({
    addNewradio: false,
    editradiodetails: false,
    addradiocat: false,
    editradiocatstatus: false,
    addseason: false,
    editseasondetails: false,
    editSeasonStatus: false,
    seasonlist: false,
  });

  console.log(radioSection, "radioSection");
  const [newsSection, setnewsSection] = useState({
    editnewsstatus: false,
    editNGstatus: false,
    editNGrequests: false,
  });
  const [FIGSection, setFIGSection] = useState({
    editFIGstatus: false,
    leaderreqs: false,
    editrequests: false,
    members: false,
    contentcreators: false,
    leadercumcreator: false,
  });

  const handleoptionsp = (e) => {
    console.log(e.target.name, e.target.checked);
    if (
      e.target.checked === true &&
      !formData.permissions.includes(`${e.target.name}`)
    ) {
      setFormData((prevData) => ({
        ...prevData,
        permissions: [...prevData.permissions, e.target.name],
      }));
    } else if (
      e.target.checked === false &&
      formData.permissions.includes(`${e.target.name}`)
    ) {
      setFormData((prevData) => ({
        ...prevData,
        permissions: prevData.permissions.filter(
          (permission) => permission !== e.target.name
        ),
      }));
    }
  };

  useEffect(() => {
    console.log(formData.permissions);
  }, [formData]);

  const handleLogoChange = (event) => {
    const selectedLogo = event.target.files[0];
    setLogo(selectedLogo);
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
            <div className="container ">
              <div className="authentication-wrapper authentication-basic container-p-y">
                <div className="authentication-inner">
                  {/* Register Card */}
                  <div className="card">
                    <div className="card-body">
                      {/* Logo */}
                      <h3 className="text-center mb-5">Register FPO Admin</h3>
                      {/* /Logo */}
                      {/* <h4 className="mb-2">Adventure starts here 🚀</h4>
                        <p className="mb-4">
                          Make your app management easy and fun!
                        </p> */}
                      <form
                        autocomplete="off"
                        onSubmit={handleSubmit}
                        id="formAuthentication"
                        className="mb-3 row"
                      >
                        <div className="mb-3 col-12 col-md-6">
                          <label htmlFor="username" className="form-label">
                            FPO owner <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="username"
                            name="username"
                            value={username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            autofocus
                            required
                            autocomplete="off"
                          />
                        </div>
                        <div className="mb-3 col-12 col-md-6">
                          <label htmlFor="email" className="form-label">
                            Email <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${
                              isValidEmail ? "" : "is-invalid"
                            }`}
                            id="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                            autocomplete="off"
                          />
                          <div className="invalid-feedback">
                            Please enter a valid email address.
                          </div>
                        </div>
                        <div className="mb-3 col-12 col-md-6">
                          <label htmlFor="email" className="form-label">
                            Mobile No. <span className="text-danger">*</span>
                          </label>
                          <input
                            type="number"
                            className={`form-control ${
                              isvalidmobile ? "" : "is-invalid"
                            }`}
                            id="mobileno"
                            name="mobileno"
                            placeholder="Enter your mobile"
                            value={mobileno}
                            min="0"
                            autocomplete="off"
                            onFocus={(e) =>
                              e.target.addEventListener(
                                "wheel",
                                function (e) {
                                  e.preventDefault();
                                },
                                { passive: false }
                              )
                            }
                            onChange={(e) => handleChangemob(e)}
                            required
                          />
                          {mobileno && mobileno.length < 10 && (
                            <div>
                              <p className="text-danger">
                                * ! Please enter 10 digit mobile number*
                              </p>
                            </div>
                          )}
                          <div className="invalid-feedback">
                            Please enter a 10 digit mobile number.
                          </div>
                        </div>
                        <div className="mb-3 col-12 col-md-6 form-password-toggle">
                          <label className="form-label" htmlFor="password">
                            Password <span className="text-danger">*</span>
                          </label>
                          <div className="input-group input-group-merge">
                            <input
                              type={showPassword ? "text" : "password"}
                              id="password"
                              className="form-control"
                              name="password"
                              value={password}
                              onChange={handleChange}
                              placeholder="Enter password"
                              aria-describedby="password"
                              required
                              autocomplete="off"
                            />
                            <span
                              className="input-group-text cursor-pointer"
                              onClick={handleTogglePassword}
                            >
                              <i
                                className={`bx ${
                                  showPassword ? "bx-show" : "bx-hide"
                                }`}
                              />
                            </span>
                          </div>
                        </div>
                        <div className="mb-3 col-12 col-md-6">
                          <label htmlFor="username" className="form-label">
                            FPO name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="fponame12"
                            name="fponame"
                            minLength={4}
                            value={fponame}
                            onChange={handleChange}
                            placeholder="Enter FPO name ( atleast 4 characters )"
                            autofocus
                            required
                            autocomplete="off"
                          />
                          {fponame && fponame.length < 4 && (
                            <div>
                              <p className="text-danger">
                                * ! Please enter atleast 4 characters*
                              </p>
                            </div>
                          )}
                        </div>

                        {/* permissions */}
                        <div className="mb-3 col-12">
                          <hr />
                          <h5>Permissions</h5>
                          <div className="row justify-content-center">
                            {/* survey */}
                            <div className="col-md-4 col-12">
                              <div className="mb-2 border shadow rounded p-3">
                                <div className="privilege-name">
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                      checked={surveyp}
                                      id="flexSwitchCheckDefault"
                                      onChange={() => setsurveyp(!surveyp)}
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor="flexSwitchCheckDefault"
                                    >
                                      <b>
                                        {" "}
                                        <i className="fa-solid fa-square-poll-vertical"></i>{" "}
                                        Survey{" "}
                                      </b>
                                    </label>
                                  </div>
                                  <hr />
                                </div>
                                <div className="row">
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled={surveyp ? false : true}
                                          id="flexCheckDefault1"
                                          name="addnewsurvey"
                                          checked={surveySection.addNewSurvey}
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                            // console.log(e.target.checked, "event");
                                            setSurveySection((prevState) => ({
                                              ...prevState,
                                              addNewSurvey:
                                                !prevState.addNewSurvey,
                                            }));
                                          }}
                                        />

                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefault1"
                                        >
                                          Add new survey
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled={surveyp ? false : true}
                                          id="flexCheckDefault2"
                                          name="editsurvey"
                                          checked={surveySection.editSurvey}
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                            setSurveySection((prevState) => ({
                                              ...prevState,
                                              editSurvey: !prevState.editSurvey,
                                            }));
                                          }}
                                        />

                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefault2"
                                        >
                                          Edit survey
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          name="deactivatesurvey"
                                          disabled={surveyp ? false : true}
                                          id="flexCheckDefault3"
                                          checked={
                                            surveySection.deactivateSurvey
                                          }
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                            setSurveySection((prevState) => ({
                                              ...prevState,
                                              deactivateSurvey:
                                                !prevState.deactivateSurvey,
                                            }));
                                          }}
                                        />

                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefault3"
                                        >
                                          Deactivate Survey
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* fig */}
                            <div className="col-md-4 col-12">
                              <div className="mb-2 border shadow rounded p-3">
                                <div className="privilege-name">
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                      checked={FIGp}
                                      id="flexSwitchCheckDefault2"
                                      onChange={() => setFIGp(!FIGp)}
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor="flexSwitchCheckDefault2"
                                    >
                                      <b>
                                        {" "}
                                        <i className="fa-solid fa-code-branch"></i>{" "}
                                        Users{" "}
                                      </b>
                                    </label>
                                  </div>
                                  <hr />
                                </div>
                                <div className="row">
                                  {/* <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled={FIGp ? false : true}
                                          name="editfigstatus"
                                          id="flexCheckDefault4"
                                          checked={FIGSection.editFIGstatus}
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                            setFIGSection((prevState) => ({
                                              ...prevState,
                                              editFIGstatus:
                                                !prevState.editFIGstatus,
                                            }));
                                          }}
                                        />

                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefault4"
                                        >
                                          Edit 
                                        </label>
                                      </div>
                                    </div>
                                  </div> */}
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled={FIGp ? false : true}
                                          id="flexCheckDefault5"
                                          name="editfigleaderstatus"
                                          checked={FIGSection.leaderreqs}
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                            setFIGSection((prevState) => ({
                                              ...prevState,
                                              leaderreqs: !prevState.leaderreqs,
                                            }));
                                          }}
                                        />

                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefault5"
                                        >
                                          Edit leader status
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled={FIGp ? false : true}
                                          id="flexCheckDefault6"
                                          name="figleaderreqs"
                                          checked={FIGSection.editrequests}
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                            setFIGSection((prevState) => ({
                                              ...prevState,
                                              editrequests:
                                                !prevState.editrequests,
                                            }));
                                          }}
                                        />

                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefault6"
                                        >
                                          leader requests
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  {/*  members: false,
    contentcreators: false,
    leadercumcreator: false, */}
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled={FIGp ? false : true}
                                          id="flexCheckDefault612"
                                          name="members"
                                          checked={FIGSection.members}
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                            setFIGSection((prevState) => ({
                                              ...prevState,
                                              members: !prevState.members,
                                            }));
                                          }}
                                        />

                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefault6"
                                        >
                                          Members
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  {/*  members: false,
    contentcreators: false,
    leadercumcreator: false, */}
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled={FIGp ? false : true}
                                          id="flexCheckDefault612"
                                          name="contentcreators"
                                          checked={FIGSection.contentcreators}
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                            setFIGSection((prevState) => ({
                                              ...prevState,
                                              contentcreators:
                                                !prevState.contentcreators,
                                            }));
                                          }}
                                        />

                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefault6"
                                        >
                                          Content Creators
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  {/*  members: false,
    contentcreators: false,
    leadercumcreator: false, */}
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled={FIGp ? false : true}
                                          id="flexCheckDefault612"
                                          name="leadercumcreator"
                                          checked={FIGSection.leadercumcreator}
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                            setFIGSection((prevState) => ({
                                              ...prevState,
                                              leadercumcreator:
                                                !prevState.leadercumcreator,
                                            }));
                                          }}
                                        />

                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefault6"
                                        >
                                          Leader cum Creator
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* News */}
                            <div className="col-md-4 col-12">
                              <div className="mb-2 border shadow rounded p-3">
                                <div className="privilege-name">
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                      checked={newsp}
                                      id="flexSwitchCheckDefault3"
                                      onChange={() => setnewsp(!newsp)}
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor="flexSwitchCheckDefault3"
                                    >
                                      <b>
                                        <i className="fa-solid fa-newspaper"></i>{" "}
                                        News{" "}
                                      </b>
                                    </label>
                                  </div>
                                  <hr />
                                </div>
                                <div className="row">
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          name="editnewsgrpstatus"
                                          disabled={newsp ? false : true}
                                          id="flexCheckDefault"
                                          checked={newsSection.editNGstatus}
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                            setnewsSection((prevState) => ({
                                              ...prevState,
                                              editNGstatus:
                                                !prevState.editNGstatus,
                                            }));
                                          }}
                                        />

                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefault"
                                        >
                                          Edit news group status
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled={newsp ? false : true}
                                          id="flexCheckDefault7"
                                          name="editnewsstatus"
                                          checked={newsSection.editnewsstatus}
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                            setnewsSection((prevState) => ({
                                              ...prevState,
                                              editnewsstatus:
                                                !prevState.editnewsstatus,
                                            }));
                                          }}
                                        />

                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefault7"
                                        >
                                          Edit News status
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          name="editnewsgrpreqs"
                                          disabled={newsp ? false : true}
                                          id="flexCheckDefault8"
                                          checked={newsSection.editNGrequests}
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                            setnewsSection((prevState) => ({
                                              ...prevState,
                                              editNGrequests:
                                                !prevState.editNGrequests,
                                            }));
                                          }}
                                        />
                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefault8"
                                        >
                                          Edit news group requests
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* radio */}
                            <div className="col-md-4 col-12">
                              <div className="mb-2 border h-100 shadow rounded p-3">
                                <div className="privilege-name">
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                      id="flexSwitchCheckDefault4"
                                      checked={radiop}
                                      onChange={() => {
                                        setradiop(!radiop);
                                      }}
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor="flexSwitchCheckDefault4"
                                    >
                                      <b>
                                        <i className="fa-solid fa-radio"></i>{" "}
                                        Radio
                                      </b>
                                    </label>
                                  </div>
                                  <hr />
                                </div>
                                <div className="row">
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled={radiop ? false : true}
                                          id="flexCheckDefault9"
                                          name="addradio"
                                          checked={
                                            radiop && radioSection.addNewradio
                                          }
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                            setradioSection((prevState) => ({
                                              ...prevState,
                                              addNewradio:
                                                !prevState.addNewradio,
                                            }));
                                          }}
                                        />

                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefault9"
                                        >
                                          Add new radio
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          name="addradiocategory"
                                          disabled={radiop ? false : true}
                                          id="flexCheckDefault10"
                                          checked={radioSection.addradiocat}
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                            setradioSection((prevState) => ({
                                              ...prevState,
                                              addradiocat:
                                                !prevState.addradiocat,
                                            }));
                                          }}
                                        />

                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefault10"
                                        >
                                          Add new radio category
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled={radiop ? false : true}
                                          id="flexCheckDefault11"
                                          name="editradiocategory"
                                          checked={
                                            radioSection.editradiocatstatus
                                          }
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                            setradioSection((prevState) => ({
                                              ...prevState,
                                              editradiocatstatus:
                                                !prevState.editradiocatstatus,
                                            }));
                                          }}
                                        />

                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefault11"
                                        >
                                          Edit radio category
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled={radiop ? false : true}
                                          id="flexCheckDefault12"
                                          name="editradiodetails"
                                          checked={
                                            radioSection.editradiodetails
                                          }
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                            setradioSection((prevState) => ({
                                              ...prevState,
                                              editradiodetails:
                                                !prevState.editradiodetails,
                                            }));
                                          }}
                                        />

                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefault12"
                                        >
                                          Edit radio status & details
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  {/* season */}
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled={radiop ? false : true}
                                          id="flexCheckDefault9"
                                          name="seasonlist"
                                          checked={radioSection.seasonlist}
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                            setradioSection((prevState) => ({
                                              ...prevState,
                                              seasonlist: !prevState.seasonlist,
                                            }));
                                          }}
                                        />

                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefault9"
                                        >
                                          Season list
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled={radiop ? false : true}
                                          id="flexCheckDefault9"
                                          name="editseasonstatus"
                                          checked={
                                            radioSection.editSeasonStatus
                                          }
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                            setradioSection((prevState) => ({
                                              ...prevState,
                                              editSeasonStatus:
                                                !prevState.editSeasonStatus,
                                            }));
                                          }}
                                        />

                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefault9"
                                        >
                                          Edit season status
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled={radiop ? false : true}
                                          id="flexCheckDefault9"
                                          name="editseasondetails"
                                          checked={
                                            radioSection.editseasondetails
                                          }
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                            setradioSection((prevState) => ({
                                              ...prevState,
                                              editseasondetails:
                                                !prevState.editseasondetails,
                                            }));
                                          }}
                                        />

                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefault9"
                                        >
                                          Edit season details
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled={radiop ? false : true}
                                          id="flexCheckDefault9"
                                          name="addseason"
                                          checked={radioSection.addseason}
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                            setradioSection((prevState) => ({
                                              ...prevState,
                                              addseason: !prevState.addseason,
                                            }));
                                          }}
                                        />

                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefault9"
                                        >
                                          Add season
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* themes */}
                            <div className="col-md-4 col-12">
                              <div className="mb-2 border h-100 shadow rounded p-3">
                                <div className="privilege-name">
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      role="switch"
                                      id="flexSwitchCheckDefault55"
                                      disabled
                                      checked={themep}
                                      onChange={() => {
                                        setthemep(!themep);
                                      }}
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor="flexSwitchCheckDefault55"
                                    >
                                      <b>
                                        <i className="fa-solid fa-palette"></i>{" "}
                                        Theme Settings
                                      </b>
                                    </label>
                                  </div>
                                  <hr />
                                </div>
                                <div className="row">
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled
                                          id="flexCheckDefault13"
                                          name="logo"
                                          checked={formData.permissions.includes(
                                            "logo"
                                          )}
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                          }}
                                        />
                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefaul13"
                                        >
                                          Logo
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled
                                          id="flexCheckDefault13"
                                          name="iconscolor"
                                          checked={formData.permissions.includes(
                                            "iconscolor"
                                          )}
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                          }}
                                        />
                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefaul13"
                                        >
                                          Icons color
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled
                                          id="flexCheckDefault44"
                                          name="backgroundcolor"
                                          checked={formData.permissions.includes(
                                            "backgroundcolor"
                                          )}
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                          }}
                                        />
                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefaul44"
                                        >
                                          Background Colors
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled
                                          id="flexCheckDefault13"
                                          name="themecolor"
                                          checked={formData.permissions.includes(
                                            "themecolor"
                                          )}
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                          }}
                                        />
                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefaul13"
                                        >
                                          Theme colors
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled
                                          id="flexCheckDefault46"
                                          name="sectioncolor"
                                          checked={formData.permissions.includes(
                                            "sectioncolor"
                                          )}
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                          }}
                                        />
                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefaul46"
                                        >
                                          Section color
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled
                                          id="flexCheckDefault13"
                                          name="language"
                                          checked={formData.permissions.includes(
                                            "language"
                                          )}
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                          }}
                                        />
                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefaul13"
                                        >
                                          Language
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled
                                          id="flexCheckDefault13"
                                          name="banners"
                                          checked={formData.permissions.includes(
                                            "banners"
                                          )}
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                          }}
                                        />
                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefaul13"
                                        >
                                          Banners
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-12">
                                    <div className="privileges-opts">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          disabled
                                          id="flexCheckDefault13"
                                          name="support"
                                          checked={formData.permissions.includes(
                                            "support"
                                          )}
                                          onChange={(e) => {
                                            handleoptionsp(e);
                                          }}
                                        />

                                        <label
                                          className="form-check-label"
                                          for="flexCheckDefaul13"
                                        >
                                          Support
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* theme settings */}
                        <div className="">
                          <div className="edit-theme-tab-main">
                            <div className="row m-0">
                              <h4 className="p-3">Settings </h4>
                              <div className="col-md-6">
                                <div className="settings-left card hide-scrollbar border rounded p-3">
                                  {/* <hr /> */}
                                  <div
                                    // onSubmit={handleFormSubmit}
                                    className="row"
                                  >
                                    {decoded.role === "superadmin" && (
                                      <div className="col-12 mb-2 ">
                                        <div className="card m-3 p-3">
                                          <label className="form-label">
                                            <b>
                                              <i className="fa-solid fa-copyright"></i>
                                              &nbsp; Logo{" "}
                                              <span className="text-danger">
                                                *
                                              </span>
                                            </b>
                                          </label>
                                          <input
                                            type="file"
                                            className="form-control"
                                            onChange={handleLogoChange}
                                            required
                                          />
                                        </div>
                                      </div>
                                    )}
                                    {decoded.role === "superadmin" && (
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
                                    {decoded.role === "superadmin" && (
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
                                                    value={backgroundColor1}
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
                                                    value={backgroundColor2}
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
                                    {decoded.role === "superadmin" && (
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
                                                  setIconsColor(e.target.value)
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
                                    {decoded.role === "superadmin" && (
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
                                    {decoded.role === "superadmin" && (
                                      <div className="col-12 mb-2">
                                        <div className="card m-3 p-3">
                                          {selectedLanguages.length > 0 && (
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
                                                    <span>{el.language}</span>
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        setSelectedLanguages(
                                                          (prevLanguages) =>
                                                            prevLanguages.filter(
                                                              (lang) =>
                                                                lang._id !==
                                                                el._id
                                                            )
                                                        );
                                                        setSelectedLanguage({
                                                          id: "Select language",
                                                          language:
                                                            "Select language",
                                                        });
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
                                                    lang._id === e.target.value
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
                                    )}
                                    {decoded.role === "superadmin" && (
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
                                              &nbsp;Support email{" "}
                                              <span className="text-danger">
                                                *
                                              </span>
                                            </label>
                                            <input
                                              type="email"
                                              className="form-control"
                                              value={supportEmail}
                                              required
                                              onChange={(e) =>
                                                setSupportEmail(e.target.value)
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
                                              min="0"
                                              autocomplete="off"
                                              onFocus={(e) =>
                                                e.target.addEventListener(
                                                  "wheel",
                                                  function (e) {
                                                    e.preventDefault();
                                                  },
                                                  { passive: false }
                                                )
                                              }
                                              onChange={(e) => {
                                                let inputMobileNo =
                                                  e.target.value;
                                                // setisvalidmobile(true);
                                                if (inputMobileNo.length > 10) {
                                                  inputMobileNo =
                                                    inputMobileNo.slice(0, 10);
                                                }
                                                setSupportMobile(inputMobileNo);
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
                                              min="0"
                                              autocomplete="off"
                                              onFocus={(e) =>
                                                e.target.addEventListener(
                                                  "wheel",
                                                  function (e) {
                                                    e.preventDefault();
                                                  },
                                                  { passive: false }
                                                )
                                              }
                                              // onChange={(e) =>
                                              //   setSupportWhatsapp(
                                              //     e.target.value
                                              //   )
                                              // }
                                              onChange={(e) => {
                                                let inputMobileNo =
                                                  e.target.value;
                                                // setisvalidmobile(true);
                                                if (inputMobileNo.length > 10) {
                                                  inputMobileNo =
                                                    inputMobileNo.slice(0, 10);
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
                                  </div>
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
                                      <div className="text-wrapper-2">Home</div>
                                      <div className="text-wrapper-3">
                                        My FPO
                                      </div>
                                      <div className="text-wrapper-4">
                                        Trainings
                                      </div>
                                      <div className="text-wrapper-5">News</div>
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
                                        Hello Ravi | {fponame}
                                      </p>
                                      <img
                                        className="ellipse-2"
                                        alt="Ellipse"
                                        src={
                                          logo
                                            ? URL.createObjectURL(logo)
                                            : "assets/img/logo.png"
                                        }
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
                        {/* banners */}
                        <hr className="my-5" />
                        {/* <div className="card shadow-none">
                          <div className="card-header">
                            <h3>Banners</h3>
                          </div>
                          {decoded.role === "superadmin" ? (
                            <div className="row">
                              <div className="col-md-4 col-12">
                                <div
                                >
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

                                      {banner1 && banner1 !== "" ? (
                                        <>
                                          <p>
                                            <b>Preview</b>
                                          </p>
                                          <div className="mb-3">
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
                                        <></>
                                      )}

                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-4 col-12">
                                <div>
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
                                        required
                                      />

                                      {banner2 && banner2 !== "" ? (
                                        <>
                                          <p>
                                            <b>Preview</b>
                                          </p>
                                          <div className="mb-3">
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
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-4 col-12">
                                <div>
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
                                        required
                                      />

                                      {banner3 && banner3 !== "" ? (
                                        <>
                                          <p>
                                            <b>Preview</b>
                                          </p>
                                          <div className="mb-3">
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
                                        <></>
                                      )}
                                    </div>
                                  </div>
                                </div>
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
                        </div> */}

                        <div className="text-center">
                          <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-primary"
                          >
                            Sign up
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                  {/* Register Card */}
                </div>
              </div>
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

export default Addfpoadmin;
