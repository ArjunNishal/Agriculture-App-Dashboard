import React, { useState } from "react";
import { axiosInstance } from "../config";

const Forgotpassword = () => {
  const [email, setemail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailsent, setEmailsent] = useState(false);

  const forgotpass = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post("admin-log/unauth/resetpassword", {
        email,
      });
      console.log(res, "res");
      if (res.status === 200) {
        setMessage(
          `Reset your password using the link shared on your mail i.e., ${email}`
        );
        setEmailsent(true);
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 404) {
        setMessage(error.response.data.msg);
      } else {
        setMessage(error.response.data.msg);
      }
    }
    setLoading(false);
  };
  return (
    <div>
      <div className="container-xxl  d-flex justify-content-center align-items-center vh-100">
        <div className="d-flex justify-content-center align-items-center">
          <div className="card mb-3">
            <div className="card-body">
              <div className="app-brand mb-3 justify-content-center">
                {/* <Link to="index.html" className="app-brand-link gap-2">
                  <span className="app-brand-logo demo">AP</span>
                  <span className="app-brand-text demo text-body fw-bold">
                    Agripal
                  </span>
                </Link> */}
                <img src="assets/img/logo.png" alt="agripal" width={100} />
              </div>
              <h4 className="text-center">Forgot password</h4>
              <hr />
              <form onSubmit={forgotpass} id="formAccountSettings">
                {loading ? (
                  <div>
                    <div className="d-flex justify-content-center">
                      <div
                        className="spinner-border text-success"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                    <div>
                      <p>Sending Reset Link</p>
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    <div className={`mb-3 col-12`}>
                      <label htmlFor="name" className="form-label">
                        Email
                      </label>
                      <input
                        className="form-control"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => {
                          setemail(e.target.value);
                        }}
                      />
                    </div>
                    <p>
                      Enter your email and we"ll send you a link to reset your
                      password.
                    </p>
                  </div>
                )}
                <div className="mt-2">
                  {message && <div className="text-center">{message}</div>}
                  {emailsent ? (
                    <div className=" d-flex flex-column align-items-center mt-3">
                      <p>If you did'nt get an Email, resend Link </p>
                      <button className="btn btn-danger" type="submit">
                        Resend
                      </button>
                    </div>
                  ) : (
                    <div className=" text-center">
                      <button className="btn btn-danger" type="submit">
                        Send Email
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forgotpassword;
