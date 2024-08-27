import React, { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { axiosInstance } from "../../config";
import jwtDecode from "jwt-decode";
import moment from "moment";
import { Link, useParams } from "react-router-dom";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import PermissionHandler from "../../components/PermissionHandler";

// this page shows survey responses list
const SurveySingle = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  const { sid } = useParams("");
  console.log(decoded);
  const [responses, setresponses] = useState([]);
  const [survey, setsurvey] = useState({});
  const [error, setError] = useState(null);

  const [selectedresponse, setselectedresponse] = useState({});

  const getSurveyById = async () => {
    try {
      // Make the GET request using Axios
      console.log("Authorization Header:", `Bearer ${token}`);
      const response = await axiosInstance.get(`survey/getsurvey/${sid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        console.log(response.data);
        setsurvey(response.data.data);
      }
    } catch (error) {
      console.log(error);
      console.error("Error:", error.message);
    }
  };

  console.log(survey, "survey ///////////////////");

  useEffect(() => {
    getSurveyById();
    getResponses();
  }, []);
  const getResponses = async () => {
    try {
      const response = await axiosInstance.get(`survey/responses/${sid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        console.log(response.data);
        setresponses(response.data);
      }
    } catch (error) {
      console.error("Error:", error.message);
      setError("Failed to fetch responses");
    }
  };

  const setvalues = (el) => {
    setselectedresponse({});
    console.log(el, "el of response");
    setselectedresponse(el);
  };

  //   const toggleSurveyStatus = async (id, activate) => {
  //     try {
  //       const response = await axiosInstance.post(
  //         `survey/activate/${id}`,
  //         {
  //           activate,
  //         },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );
  //       const updatedSurvey = response.data;

  //       const index = surveys.findIndex((survey) => survey._id === id);
  //       if (index !== -1) {
  //         surveys[index] = updatedSurvey;
  //         fetchsurveyList();
  //       }
  //     } catch (error) {
  //       console.error("Error:", error);
  //     }
  //   };

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
            <div className="content-wrapper">
              {/* Content */}
              {decoded.role === "superadmin" ||
              decoded.permissions?.includes("surveyp") ? (
                <div className="container-xxl flex-grow-1 container-p-y">
                  <h4 className="py-3 mb-4">
                    <span className="text-muted fw-light">Survey /</span> Survey
                    Responses
                  </h4>
                  {/* Basic Bootstrap Table */}
                  <div className="card">
                    <h5 className="card-header">
                      Responses of {survey?.title}
                    </h5>
                    <div className="table-responsive text-nowrap">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>
                              <b>User</b>
                            </th>
                            <th>
                              <b>Date</b>
                            </th>
                            <th>
                              <b>Filled for</b>
                            </th>
                            {(decoded.role === "superadmin" ||
                              (decoded.role === "fpoadmin" &&
                                decoded.permissions?.includes("surveyp"))) && (
                              <th>
                                <b>Actions</b>
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                          {responses?.map((el, index) => (
                            <tr key={index}>
                              <td>
                                {/* <i className="fab fa-angular fa-lg text-danger me-3" /> */}
                                <span className="fw-medium">
                                  {el?.submittedByUserId?.firstname}&nbsp;
                                  {el?.submittedByUserId?.lastname}
                                </span>
                              </td>
                              <td>
                                {moment(el.createdAt).format(" Do MMMM YYYY")}
                              </td>
                              <td>
                                {el?.filledfor?.firstname ||
                                el?.filledfor?.lastname
                                  ? `${el?.filledfor?.firstname} ${el?.filledfor?.lastname}`
                                  : "N/A"}
                              </td>
                              {(decoded.role === "superadmin" ||
                                (decoded.role === "fpoadmin" &&
                                  decoded.permissions?.includes(
                                    "surveyp"
                                  ))) && (
                                <td>
                                  <div>
                                    <button
                                      className="btn btn-sm btn-outline-primary"
                                      data-bs-toggle="modal"
                                      data-bs-target="#basicModal1234"
                                      onClick={() => setvalues(el)}
                                      // to={`/editsurvey/${el._id}`}
                                    >
                                      <i className="fa-solid fa-eye"></i>
                                      &nbsp;View
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {responses?.length === 0 && (
                        <div>
                          <p className="text-center my-3">No Surveys found</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* {selectedresponse && ( */}
                  <div
                    className="modal fade"
                    id="basicModal1234"
                    tabindex="-1"
                    aria-hidden="true"
                  >
                    <div className="modal-dialog" role="document">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5
                            className="modal-title text-primary"
                            id="exampleModalLabel1"
                          >
                            Response of{" "}
                            {selectedresponse?.submittedByUserId?.firstname}{" "}
                            {selectedresponse?.submittedByUserId?.lastname}
                          </h5>
                          <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            id="closebtn_profile_img"
                          ></button>
                        </div>
                        <div className="modal-body">
                          {/* Filter existing questions */}
                          {selectedresponse?.surveyId?.questions
                            .filter((question) => {
                              const questionId = question._id;
                              return selectedresponse?.response.some(
                                (response) =>
                                  response.question.id === questionId
                              );
                            })
                            .map((question, index) => {
                              // Get the corresponding response for the question
                              const response = selectedresponse?.response.find(
                                (resp) => resp.question.id === question._id
                              );

                              const slno = index + 1;

                              return (
                                <div
                                  key={index}
                                  className="response_div_main mb-2 p-2 border shadow rounded"
                                >
                                  <div className="ques_item">
                                    <p>
                                      <b>
                                        {slno}. {question.question}
                                      </b>
                                    </p>
                                    <hr />
                                    <p className="text-primary">
                                      <b>Selected answers</b>
                                    </p>

                                    {response?.answer?.map((ans, index2) => {
                                      if (ans) {
                                        if (
                                          question.questionType === "emoticon"
                                        ) {
                                          // Map response number to emoji
                                          // const emojiMap = {
                                          //   5: "\uD83D\uDE0D", // Best rating (😍)
                                          //   4: "\uD83D\uDE0A", // Good rating (😊)
                                          //   3: "\uD83D\uDE10", // Neutral rating (😐)
                                          //   2: "\uD83D\uDE15", // Bad rating (😕)
                                          //   1: "\uD83D\uDE21", // Worst rating (😡)
                                          // };
                                          const emojiMap = {
                                            5: "smile.png", // Best rating (😍)
                                            4: "happy.png", // Good rating (😊)
                                            3: "confused.png", // Neutral rating (😐)
                                            2: "sad.png", // Bad rating (😕)
                                            1: "angry.png", // Worst rating (😡)
                                          };
                                          // Get emoji based on response number
                                          const emoji =
                                            emojiMap[parseInt(ans?.answer)];

                                          return (
                                            <p key={index2}>
                                              <i className="bx text-success bxs-right-arrow"></i>
                                              &nbsp;{" "}
                                              <img
                                                src={`/assets/img/emojis/${emoji}`}
                                                className="emojiimg"
                                                alt="emojiimg"
                                              />
                                            </p>
                                          );
                                        } else {
                                          // Render normal text response if question type is not "emoticon"
                                          return (
                                            <p key={index2}>
                                              <i className="bx text-success bxs-right-arrow"></i>
                                              &nbsp; {ans?.answer}
                                            </p>
                                          );
                                        }
                                      }
                                      return null; // Return null for empty elements
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                        </div>

                        <div className="modal-footer">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            data-bs-dismiss="modal"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* )} */}
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

export default SurveySingle;
