import React, { useEffect, useState } from "react";
import Navigation from "../../components/Navigation";
import Topbar from "../../components/Topbar";
import { axiosInstance } from "../../config";
import Swal from "sweetalert2";
import jwtDecode from "jwt-decode";
import { Link, useNavigate, useParams } from "react-router-dom";
import Unauthorisedpage from "../../components/Unauthorisedpage";
import PermissionHandler from "../../components/PermissionHandler";

const Editsurvey = () => {
  const token = localStorage.getItem("admin");
  const decoded = jwtDecode(token);
  const id = decoded.id;
  const { surveyId } = useParams();
  console.log(id);
  const [title, setTitle] = useState("");
  const [saving, setsaving] = useState(false);
  const [questions, setQuestions] = useState([
    { question: "", questionType: "", options: [""] },
  ]);
  const navigate = useNavigate("");

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        // Replace with the actual survey ID
        const response = await axiosInstance.get(
          `survey/getsurvey/${surveyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          const survey = response.data.data;
          setTitle(survey.title);
          console.log(response, "response");
          setQuestions(survey.questions);
        }
      } catch (error) {
        // Handle any errors, e.g., show an error message
        console.error("Failed to fetch survey:", error);
      }
    };

    fetchSurvey();
  }, []);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", questionType: "singlechoice", options: [""] },
    ]);
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push("");
    setQuestions(updatedQuestions);
  };

  const handleQuestionTypeChange = (questionIndex, newType) => {
    const updatedQuestions = [...questions];
    const currentQuestion = updatedQuestions[questionIndex];

    // If the new type is not 'single' or 'multipleChoice', remove all options
    if (newType !== "singlechoice" && newType !== "multiplechoice") {
      currentQuestion.options = [""];
    }

    currentQuestion.questionType = newType;
    setQuestions(updatedQuestions);
  };

  const handleQuestionChange = (questionIndex, newText) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].question = newText;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, newText) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = newText;
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (questionIndex) => {
    // if (questions.length === 1) {
    //   return;
    // }

    const updatedQuestions = [...questions];
    updatedQuestions.splice(questionIndex, 1);
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    if (questions[questionIndex].options.length === 1) {
      return;
    }

    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(updatedQuestions);
  };

  //   edit survey func
  const editSurvey = async (e) => {
    e.preventDefault();
    setsaving(true);
    try {
      const response = await axiosInstance.post(
        `survey/edit/${surveyId}`,
        {
          title,
          questions,
          adminid: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        Swal.fire("Success", "Survey updated successfully", "success");
        navigate("/surveylist");
        setsaving(false);
      }
    } catch (error) {
      setsaving(false);
      // Display an error message
      Swal.fire("Error", "Failed to update the survey", "error");
    }
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
            <div className="content-wrapper">
              {/* <button onClick={editSurvey}>Create Survey</button> */}
              {decoded.role === "superadmin" ||
              (decoded.role === "fpoadmin" &&
                decoded.permissions?.includes("editsurvey")) ? (
                <div className="container-xxl flex-grow-1 container-p-y">
                  <div className="row">
                    <form onSubmit={editSurvey} className="col-xl">
                      <h3>Edit Survey</h3>

                      <div className="card  my-2">
                        <div className="card-header">
                          <div>
                            <label className="form-label" htmlFor={title}>
                              Survey Title{" "}
                              <span className="text-danger">*</span>
                            </label>
                          </div>
                          <div>
                            <input
                              type="text"
                              className="form-control"
                              id="surveytitle"
                              placeholder="Enter Title"
                              value={title}
                              required
                              onChange={(e) => setTitle(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      {questions?.length === 0 && (
                        <div>
                          <button
                            type="button"
                            className="btn btn-success my-2"
                            onClick={addQuestion}
                          >
                            <i className="fa-solid fa-plus"></i>&nbsp; Add
                            Question
                          </button>
                        </div>
                      )}
                      {questions?.map((question, questionIndex) => (
                        <div className="card my-4">
                          <div className="card-body">
                            <div key={questionIndex} className="mb-3">
                              <div className="d-flex justify-content-between align-items-center">
                                <label
                                  className="form-label"
                                  htmlFor={`question-${questionIndex}`}
                                >
                                  Question {questionIndex + 1}
                                </label>
                                {/* {questions?.length > 1 && ( */}
                                <button
                                  type="button"
                                  className="btn btn-danger m-2"
                                  onClick={() => removeQuestion(questionIndex)}
                                >
                                  <i className="fa-solid fa-trash"></i>&nbsp;
                                  Remove
                                </button>
                                {/* )} */}
                              </div>
                              <div>
                                <label className="form-label">
                                  Select Question type
                                </label>
                                <select
                                  className="form-select mb-3"
                                  value={question.questionType}
                                  onChange={(e) =>
                                    handleQuestionTypeChange(
                                      questionIndex,
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="singlechoice">
                                    Single Choice
                                  </option>
                                  <option value="multiplechoice">
                                    Multiple Choice
                                  </option>
                                  <option value="textandname">
                                    Enter text / Name
                                  </option>
                                  <option value="numberchar">
                                    Enter number / special characters
                                  </option>
                                  <option value="emoticon">
                                    Select emoticon
                                  </option>
                                  <option value="percentage">
                                    Select percentage
                                  </option>
                                </select>
                              </div>
                              {/* <input
                                type="text"
                                className="form-control"
                                id={`question-${questionIndex}`}
                                placeholder="Enter your question"
                                value={question.question}
                                onChange={(e) =>
                                  handleQuestionChange(
                                    questionIndex,
                                    e.target.value
                                  )
                                }
                              /> */}
                              <div>
                                <label className="form-label">
                                  Question{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id={`question-${questionIndex}`}
                                  placeholder="Enter your question"
                                  value={question.question}
                                  required
                                  onChange={(e) =>
                                    handleQuestionChange(
                                      questionIndex,
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              {question.questionType === "singlechoice" ||
                              question.questionType === "multiplechoice" ? (
                                <div className="row">
                                  {question.options.map(
                                    (option, optionIndex) => (
                                      <div
                                        key={optionIndex}
                                        className="my-2 col-md-6  col-12"
                                      >
                                        <div className="p-3 shadow rounded">
                                          <label
                                            className="form-label"
                                            htmlFor={`option-${questionIndex}-${optionIndex}`}
                                          >
                                            Option {optionIndex + 1}{" "}
                                            <span className="text-danger">
                                              *
                                            </span>
                                          </label>
                                          <div className="input-group">
                                            <input
                                              type="text"
                                              className="form-control"
                                              id={`option-${questionIndex}-${optionIndex}`}
                                              aria-label="Recipient's username"
                                              aria-describedby="button-addon2"
                                              placeholder="Enter option"
                                              value={option}
                                              required
                                              onChange={(e) =>
                                                handleOptionChange(
                                                  questionIndex,
                                                  optionIndex,
                                                  e.target.value
                                                )
                                              }
                                            />{" "}
                                            {question?.options?.length > 1 && (
                                              <button
                                                type="button"
                                                className="btn btn-danger"
                                                id="button-addon2"
                                                onClick={() =>
                                                  removeOption(
                                                    questionIndex,
                                                    optionIndex
                                                  )
                                                }
                                              >
                                                <i className="fa-solid fa-trash"></i>
                                              </button>
                                            )}
                                          </div>

                                          {optionIndex ===
                                            question?.options?.length - 1 &&
                                            question?.options?.length <= 5 && (
                                              <button
                                                type="button"
                                                className="btn btn-primary my-2"
                                                onClick={() =>
                                                  addOption(questionIndex)
                                                }
                                              >
                                                <i className="fa-solid fa-plus"></i>
                                                &nbsp; Add Option
                                              </button>
                                            )}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <>
                                  <div>
                                    <p>
                                      <b>
                                        Input field be displayed under this
                                        question for the response .
                                      </b>
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                            {questions.length === 30 &&
                              questionIndex === questions.length - 1 && (
                                <>
                                  <p className="text-danger">
                                    *You can make Maximum 30 Questions per
                                    Survey*
                                  </p>
                                </>
                              )}

                            {questionIndex === questions?.length - 1 &&
                              questions.length < 30 && (
                                <div>
                                  <button
                                    type="button"
                                    className="btn btn-success my-2"
                                    onClick={addQuestion}
                                  >
                                    <i className="fa-solid fa-plus"></i>&nbsp;
                                    Add Question
                                  </button>
                                </div>
                              )}
                          </div>
                        </div>
                      ))}
                      <div className="d-flex justify-content-around">
                        <Link
                          className="btn btn-xl btn-outline-secondary my-2"
                          to="/surveylist"
                        >
                          Cancel
                        </Link>
                        <button
                          className="btn btn-xl btn-primary my-2"
                          // onClick={editSurvey}
                          disabled={saving}
                          type="submit"
                        >
                          <i className="fa-solid fa-floppy-disk"></i>&nbsp; Save
                        </button>
                      </div>
                      <div className="text-center"></div>
                    </form>
                  </div>
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

export default Editsurvey;
