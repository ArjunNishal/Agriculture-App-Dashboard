import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import Axios
import { axiosInstance } from "../config";

const Loginpage = () => {
  const [formData, setFormData] = useState({
    mobileno: "",
    password: "",
  });
  const navigate = useNavigate();
  const { mobileno, password } = formData;
  const [showPassword, setShowPassword] = useState(false);
  const [error, seterror] = useState("");

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    if (e.target.name === "mobileno") {
      let inputMobileNo = e.target.value;
      // setisvalidmobile(true);
      if (inputMobileNo.length > 10) {
        inputMobileNo = inputMobileNo.slice(0, 10);
      }

      setFormData({
        ...formData,
        [e.target.name]: inputMobileNo,
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    seterror("");

    try {
      const response = await axiosInstance.post("admin-log/login-admin", {
        mobileno,
        password,
      });
      console.log(response.data);
      const { token, admin } = response.data;
      localStorage.setItem("admin", token);
      navigate("/admin");
    } catch (error) {
      // Handle errors, e.g., display an error message
      console.error("Login error: ", error);
      seterror(error.response.data.msg);
    }
  };

  return (
    <div className="container-xxl d-flex justify-content-center align-items-center vh-100">
      <div className="authentication-wrapper authentication-basic container-p-y">
        <div className="authentication-inner">
          {/* Register */}
          <div className="card shadow">
            <div className="card-body">
              {/* Logo */}
              <div className="app-brand mb-3 justify-content-center">
                {/* <Link to="index.html" className="app-brand-link gap-2">
                  <span className="app-brand-logo demo">AP</span>
                  <span className="app-brand-text demo text-body fw-bold">
                    Agripal
                  </span>
                </Link> */}
                <img src="assets/img/logo.png" alt="agripal" width={100} />
              </div>
              {/* /Logo */}
              <h4 className="mb-4 text-center">Welcome to Agripal! 👋</h4>
              <p className="mb-4">
                Please sign-in to your account and start the adventure
              </p>
              <form
                id="formAuthentication"
                className="mb-3"
                onSubmit={handleSubmit}
              >
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Mobile No.
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="email"
                    name="mobileno" // Changed from "email-username"
                    placeholder="Enter your mobile"
                    value={mobileno}
                    onChange={handleChange}
                    autoFocus
                  />
                </div>
                <div className="mb-3 form-password-toggle">
                  {/* <div className="d-flex justify-content-between">
                    <label className="form-label" htmlFor="password">
                      Password
                    </label>
                    <Link to="auth-forgot-password-basic.html">
                      <small>Forgot Password?</small>
                    </Link>
                  </div> */}

                  <div className="input-group input-group-merge">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="form-control"
                      name="password"
                      placeholder="Password"
                      aria-describedby="password"
                      value={password}
                      onChange={handleChange}
                    />
                    <span
                      className="input-group-text cursor-pointer"
                      onClick={handleTogglePassword}
                    >
                      <i
                        className={`bx ${showPassword ? "bx-show" : "bx-hide"}`}
                      />
                    </span>
                  </div>
                </div>
                {error && (
                  <div>
                    <p className="text-danger text-center">! {error}</p>
                  </div>
                )}
                {/* <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="remember-me"
                    />
                    <label className="form-check-label" htmlFor="remember-me">
                      Remember Me
                    </label>
                  </div>
                </div> */}
                <div className="mb-3">
                  <button
                    className="btn btn-primary d-grid w-100"
                    type="submit"
                  >
                    Sign in
                  </button>
                </div>
              </form>
              <p className="text-center">
                <Link to="/forgotpassword">
                  <span>Forgot password ?</span>
                </Link>
              </p>
            </div>
          </div>
          {/* /Register */}
        </div>
      </div>
    </div>
  );
};

export default Loginpage;
