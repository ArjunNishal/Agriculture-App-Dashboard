import { React, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import Swal from "sweetalert2";
import { axiosInstance } from "../config";

const Resetpassword = () => {
  const [email, setEmail] = useState("");
  const [newpass, setnewpass] = useState("");
  const [confirmpass, setconfirmpass] = useState("");
  const { id, token } = useParams();

  const [error, setError] = useState("");

  useEffect(() => {
    const decodedToken = jwt_decode(token);
    setEmail(decodedToken.email);
  }, [token]);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (newpass !== confirmpass) {
        return Swal.fire({
          icon: "error",
          title: "Error",
          text: "Passwords not match",
        });
      }
      const res = await axiosInstance.put(
        `admin-log/unauth/resetpassword/${id}/${token}`,
        {
          password: newpass,
          confirmPassword: confirmpass,
        }
      );
      Swal.fire({
        icon: "success",
        title: "Password reset successfully.",
      }).then(() => {
        navigate("/"); // Redirect to home page
      });
    } catch (error) {
      console.log(error, "error");
      setError(error.response.data.msg);
    }
  };

  return (
    <div>
      <div className="forgot-pass row mx-0 justify-content-center align-items-center vh-100 container-fluid">
        <div className="loginmain col-md-4 shadow-lg col-12 card rounded m-2">
          <form className="loginform p-4" onSubmit={handleSubmit}>
            <h3 className="text-center">Reset Password</h3>
            <hr />
            <p>Enter a new password for - </p>
            <p>{email}</p>
            <div className="username mb-3">
              <label htmlFor="exampleInputPassword1" className="form-label">
                New Password <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                className="form-control"
                id="exampleInputPassword1"
                name="password"
                value={newpass}
                onChange={(e) => setnewpass(e.target.value)}
                minLength={6}
                maxLength={16}
                required
                placeholder="Enter 6-16 characters"
              />
            </div>
            <div className="username mb-3">
              <label htmlFor="exampleInputPassword1" className="form-label">
                Confirm new Password <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                className="form-control"
                id="exampleInputPassword1"
                name="confirmPassword"
                minLength={6}
                maxLength={16}
                value={confirmpass}
                onChange={(e) => setconfirmpass(e.target.value)}
                required
                placeholder="Confirm Password"
              />
            </div>
            <button className="btn btn-danger col-12" type="submit">
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Resetpassword;
