import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Protect = (props) => {
  const navigate = useNavigate();
  const { Component } = props;
  useEffect(() => {
    const login = localStorage.getItem("admin");
    if (!login) {
      alert("Login first");
      navigate("/");
    }
  }, []);
  if (!localStorage.getItem("admin")) {
    return null;
  }

  return (
    <div>
      <Component />
    </div>
  );
};

export default Protect;
