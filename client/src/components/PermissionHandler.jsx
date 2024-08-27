import React, { useState, useEffect } from "react";
import { axiosInstance } from "../config";
import jwtDecode from "jwt-decode";

const PermissionHandler = ({ reload }) => {
  const [permissions, setPermissions] = useState([]);
  const token = localStorage.getItem("admin");
  if (!token) {
    return null;
  }
  const decoded = jwtDecode(token);

  const fetchPermissions = async () => {
    try {
      const response = await axiosInstance.post(
        `admin-log/updatepermissions/${decoded.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        const data = response.data;
        // setPermissions(data.permissions);
        console.log(response.data);
        localStorage.setItem("admin", data.token);
        reload();
      } else {
        console.error("Failed to fetch permissions");
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  return (
    <div>
      {token && decoded.role === "fpoadmin" && (
        <>
          <div>
            <button
              onClick={fetchPermissions}
              type="button"
              title="Refresh Permissions"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              data-bs-title="Tooltip on top"
              className="btn p-3 rounded-circle refresh_btn_int btn-primary"
            >
              <i class="fa-solid fa-rotate-right"></i>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PermissionHandler;
