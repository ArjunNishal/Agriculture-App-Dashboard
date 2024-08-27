import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorisedpage = () => {
  const token = localStorage.getItem("admin");
  const navigate = useNavigate();
  return (
    <div>
      <div>
        <div className="container-xxl  container-p-y">
          <div className="d-flex flex-column text-center justify-content-center">
            <h2 className="mb-2 mx-2">You are not authorized!</h2>
            <p className="mb-4 mx-2">
              You do not have permission to view this page. <br /> Please
              contact your site administrator.
            </p>
            <div className="text-center">
              <button
                onClick={() => {
                  token ? navigate("/admin") : navigate(-1);
                }}
                className="btn btn-primary"
              >
                Back to home
              </button>
            </div>
            <div className="mt-5">
              <img
                src="../assets/img/illustrations/girl-doing-yoga-light.png"
                alt="page-misc-not-authorized-light"
                width={450}
                className="img-fluid"
                data-app-light-img="illustrations/girl-with-laptop-light.png"
                data-app-dark-img="illustrations/girl-with-laptop-dark.png"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorisedpage;
