import axios from "axios";
import Swal from "sweetalert2";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api/",
  // baseURL: "https://agripal-wl.onrender.com/api/",
});

//

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log(
      error,
      "error from interceptors //////////////////////////////////////////////"
    );
    if (error.response && error.response.status === 403) {
      localStorage.removeItem("admin");

      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export const renderUrl = "http://localhost:8000/";
export const renderUrl2 = "https://agripalstorage.s3.us-east-1.amazonaws.com/";
