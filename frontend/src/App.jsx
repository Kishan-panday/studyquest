import { useEffect, useReducer } from "react";
import Header from "./components/Header";
import QuizCard from "./components/QuizCard";
import Leaderboard from "./components/Leaderboard";
import BadgeList from "./components/BadgeList";
import LoginCard from "./components/LoginCard";
import ProfilePage from "./components/ProfilePage";
import { CONFIG } from "./utils/config";
import { validateEmail, validatePassword, validateName, validateCollege, sanitizeInput } from "./utils/validation";

/**
 * Initial state for app reducer
 */
const initialState = {
  // Auth state
  currentUserId: null,
  authLoading: true,
  
  // Dashboard data
  dashboardData: {
    student: null,
    leaderboard: [],
    quizzes: [],
  },
  selectedQuizId: "",
  selectedAnswer: "",
  
  // UI state
  viewProfile: false,
  isRegistering: false,
  loading: false,
  message: "",
  
  // Login form state
  loginForm: {
    email: "",
    password: "",
  },
  
  // Register form state
  registerForm: {
    name: "",
    email: "",
    college: "",
    password: "",
  },
};

/**
 * Action types
 */
const ACTION_TYPES = {
  // Auth actions
  SET_USER_ID: "SET_USER_ID",
  SET_AUTH_LOADING: "SET_AUTH_LOADING",
  LOGOUT: "LOGOUT",
  
  // Dashboard actions
  SET_DASHBOARD_DATA: "SET_DASHBOARD_DATA",
  UPDATE_STUDENT: "UPDATE_STUDENT",
  SET_SELECTED_QUIZ: "SET_SELECTED_QUIZ",
  SET_SELECTED_ANSWER: "SET_SELECTED_ANSWER",
  
  // UI actions
  TOGGLE_VIEW_PROFILE: "TOGGLE_VIEW_PROFILE",
  TOGGLE_REGISTER: "TOGGLE_REGISTER",
  SET_LOADING: "SET_LOADING",
  SET_MESSAGE: "SET_MESSAGE",
  CLEAR_MESSAGE: "CLEAR_MESSAGE",
  
  // Form actions
  UPDATE_LOGIN_FORM: "UPDATE_LOGIN_FORM",
  CLEAR_LOGIN_FORM: "CLEAR_LOGIN_FORM",
  UPDATE_REGISTER_FORM: "UPDATE_REGISTER_FORM",
  CLEAR_REGISTER_FORM: "CLEAR_REGISTER_FORM",
};

/**
 * App reducer function
 */
function appReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_USER_ID:
      return { ...state, currentUserId: action.payload };
    
    case ACTION_TYPES.SET_AUTH_LOADING:
      return { ...state, authLoading: action.payload };
    
    case ACTION_TYPES.LOGOUT:
      return {
        ...state,
        currentUserId: null,
        dashboardData: initialState.dashboardData,
        selectedQuizId: "",
        selectedAnswer: "",
        viewProfile: false,
        isRegistering: false,
        loginForm: initialState.loginForm,
        registerForm: initialState.registerForm,
      };
    
    case ACTION_TYPES.SET_DASHBOARD_DATA:
      return { ...state, dashboardData: action.payload };
    
    case ACTION_TYPES.UPDATE_STUDENT:
      return {
        ...state,
        dashboardData: {
          ...state.dashboardData,
          student: action.payload.student,
          leaderboard: action.payload.leaderboard,
        },
      };
    
    case ACTION_TYPES.SET_SELECTED_QUIZ:
      return { ...state, selectedQuizId: action.payload };
    
    case ACTION_TYPES.SET_SELECTED_ANSWER:
      return { ...state, selectedAnswer: action.payload };
    
    case ACTION_TYPES.TOGGLE_VIEW_PROFILE:
      return { ...state, viewProfile: !state.viewProfile };
    
    case ACTION_TYPES.TOGGLE_REGISTER:
      return { 
        ...state, 
        isRegistering: !state.isRegistering,
        message: "",
      };
    
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTION_TYPES.SET_MESSAGE:
      return { ...state, message: action.payload };
    
    case ACTION_TYPES.CLEAR_MESSAGE:
      return { ...state, message: "" };
    
    case ACTION_TYPES.UPDATE_LOGIN_FORM:
      return {
        ...state,
        loginForm: {
          ...state.loginForm,
          ...action.payload,
        },
        message: "",
      };
    
    case ACTION_TYPES.CLEAR_LOGIN_FORM:
      return { ...state, loginForm: initialState.loginForm };
    
    case ACTION_TYPES.UPDATE_REGISTER_FORM:
      return {
        ...state,
        registerForm: {
          ...state.registerForm,
          ...action.payload,
        },
        message: "",
      };
    
    case ACTION_TYPES.CLEAR_REGISTER_FORM:
      return { ...state, registerForm: initialState.registerForm };
    
    default:
      return state;
  }
}

/**
 * Main App component
 */
export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  const {
    currentUserId,
    authLoading,
    dashboardData,
    selectedQuizId,
    selectedAnswer,
    viewProfile,
    isRegistering,
    loading,
    message,
    loginForm,
    registerForm,
  } = state;

  /**
   * Check for saved user on app load
   */
  useEffect(() => {
    const savedUserId = localStorage.getItem("studyquestUserId");
    if (savedUserId) {
      dispatch({ type: ACTION_TYPES.SET_USER_ID, payload: savedUserId });
      loadDashboard(savedUserId);
    } else {
      dispatch({ type: ACTION_TYPES.SET_AUTH_LOADING, payload: false });
    }
  }, []);

  /**
   * Load user dashboard
   */
  async function loadDashboard(userId) {
    if (!userId) return;

    try {
      dispatch({ type: ACTION_TYPES.SET_MESSAGE, payload: "" });
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/dashboard?userId=${userId}`
      );
      const result = await response.json();

      if (!response.ok) {
        dispatch({
          type: ACTION_TYPES.SET_MESSAGE,
          payload: result.message || "Unable to load dashboard.",
        });
        dispatch({
          type: ACTION_TYPES.SET_DASHBOARD_DATA,
          payload: initialState.dashboardData,
        });
        return;
      }

      dispatch({
        type: ACTION_TYPES.SET_DASHBOARD_DATA,
        payload: result,
      });

      if (!selectedQuizId && result.quizzes?.length) {
        dispatch({
          type: ACTION_TYPES.SET_SELECTED_QUIZ,
          payload: result.quizzes[0].id,
        });
      }
    } catch (error) {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: "Could not connect to backend. Please start the server.",
      });
    } finally {
      dispatch({ type: ACTION_TYPES.SET_AUTH_LOADING, payload: false });
    }
  }

  /**
   * Handle user login
   */
  async function handleLogin() {
    const { email, password } = loginForm;

    // Validation
    if (!email.trim() || !password.trim()) {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: "Please enter email and password to login.",
      });
      return;
    }

    if (!validateEmail(email)) {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: "Please enter a valid email address.",
      });
      return;
    }

    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: sanitizeInput(email.trim()),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        dispatch({
          type: ACTION_TYPES.SET_MESSAGE,
          payload: result.message || "Login failed.",
        });
        // Auto-clear error after timeout
        setTimeout(
          () => dispatch({ type: ACTION_TYPES.CLEAR_MESSAGE }),
          CONFIG.ERROR_TIMEOUT
        );
      } else {
        const userId = result.user.id;
        dispatch({ type: ACTION_TYPES.SET_USER_ID, payload: userId });
        localStorage.setItem("studyquestUserId", userId);
        dispatch({ type: ACTION_TYPES.CLEAR_LOGIN_FORM });
        dispatch({
          type: ACTION_TYPES.SET_MESSAGE,
          payload: "Login successful. Welcome back!",
        });
        await loadDashboard(userId);
      }
    } catch (error) {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: "Login failed. Please try again.",
      });
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
    }
  }

  /**
   * Handle logout
   */
  function handleLogout() {
    dispatch({ type: ACTION_TYPES.LOGOUT });
    localStorage.removeItem("studyquestUserId");
  }

  /**
   * Handle user registration
   */
  async function handleRegister() {
    const { name, email, college, password } = registerForm;

    // Validation
    if (!name.trim() || !email.trim() || !college.trim() || !password.trim()) {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: "Please fill in all registration fields.",
      });
      return;
    }

    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: nameValidation.message,
      });
      return;
    }

    if (!validateEmail(email)) {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: "Please enter a valid email address.",
      });
      return;
    }

    const collegeValidation = validateCollege(college);
    if (!collegeValidation.valid) {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: collegeValidation.message,
      });
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: passwordValidation.message,
      });
      return;
    }

    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sanitizeInput(name.trim()),
          email: sanitizeInput(email.trim()),
          college: sanitizeInput(college.trim()),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        dispatch({
          type: ACTION_TYPES.SET_MESSAGE,
          payload: result.message || "Registration failed.",
        });
        // Auto-clear error after timeout
        setTimeout(
          () => dispatch({ type: ACTION_TYPES.CLEAR_MESSAGE }),
          CONFIG.ERROR_TIMEOUT
        );
      } else {
        const userId = result.user.id;
        dispatch({ type: ACTION_TYPES.SET_USER_ID, payload: userId });
        localStorage.setItem("studyquestUserId", userId);
        dispatch({ type: ACTION_TYPES.CLEAR_REGISTER_FORM });
        dispatch({ type: ACTION_TYPES.TOGGLE_REGISTER });
        dispatch({
          type: ACTION_TYPES.SET_MESSAGE,
          payload: "Registration successful. Welcome to StudyQuest!",
        });
        await loadDashboard(userId);
      }
    } catch (error) {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: "Registration failed. Please try again.",
      });
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
    }
  }

  /**
   * Handle quiz submission
   */
  async function handleSubmitQuiz(timeSpent = 0) {
    if (!selectedAnswer) {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: "Please choose an answer before submitting.",
      });
      return;
    }

    if (!dashboardData.student) {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: "Please login first.",
      });
      return;
    }

    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: dashboardData.student.id,
          quizId: selectedQuizId,
          answer: selectedAnswer,
          timeSpent: timeSpent,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        dispatch({
          type: ACTION_TYPES.SET_MESSAGE,
          payload: result.message || "Something went wrong.",
        });
      } else {
        dispatch({
          type: ACTION_TYPES.SET_MESSAGE,
          payload: result.message,
        });
        dispatch({ type: ACTION_TYPES.SET_SELECTED_ANSWER, payload: "" });
        dispatch({
          type: ACTION_TYPES.UPDATE_STUDENT,
          payload: {
            student: result.student ?? dashboardData.student,
            leaderboard: result.leaderboard ?? dashboardData.leaderboard,
          },
        });
      }
    } catch (error) {
      dispatch({
        type: ACTION_TYPES.SET_MESSAGE,
        payload: "Failed to submit the quiz.",
      });
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
    }
  }

  // Get selected quiz
  const selectedQuiz =
    dashboardData.quizzes.find((quiz) => quiz.id === selectedQuizId) ||
    dashboardData.quizzes[0] ||
    null;

  // Loading screen
  if (authLoading) {
    return <div className="loading-screen">Loading StudyQuest...</div>;
  }

  // Login/Register screen
  if (!currentUserId || !dashboardData.student) {
    return (
      <main className="container">
        <LoginCard
          loginEmail={loginForm.email}
          loginPassword={loginForm.password}
          onLoginEmailChange={(value) =>
            dispatch({
              type: ACTION_TYPES.UPDATE_LOGIN_FORM,
              payload: { email: value },
            })
          }
          onLoginPasswordChange={(value) =>
            dispatch({
              type: ACTION_TYPES.UPDATE_LOGIN_FORM,
              payload: { password: value },
            })
          }
          onLogin={handleLogin}
          isRegistering={isRegistering}
          onToggleRegister={() =>
            dispatch({ type: ACTION_TYPES.TOGGLE_REGISTER })
          }
          registerName={registerForm.name}
          registerEmail={registerForm.email}
          registerCollege={registerForm.college}
          registerPassword={registerForm.password}
          onRegisterNameChange={(value) =>
            dispatch({
              type: ACTION_TYPES.UPDATE_REGISTER_FORM,
              payload: { name: value },
            })
          }
          onRegisterEmailChange={(value) =>
            dispatch({
              type: ACTION_TYPES.UPDATE_REGISTER_FORM,
              payload: { email: value },
            })
          }
          onRegisterCollegeChange={(value) =>
            dispatch({
              type: ACTION_TYPES.UPDATE_REGISTER_FORM,
              payload: { college: value },
            })
          }
          onRegisterPasswordChange={(value) =>
            dispatch({
              type: ACTION_TYPES.UPDATE_REGISTER_FORM,
              payload: { password: value },
            })
          }
          onRegister={handleRegister}
          loading={loading}
          message={message}
        />
      </main>
    );
  }

  // Profile view
  if (viewProfile) {
    return (
      <main className="container">
        <ProfilePage
          student={dashboardData.student}
          onBack={() => dispatch({ type: ACTION_TYPES.TOGGLE_VIEW_PROFILE })}
          onLogout={handleLogout}
        />
      </main>
    );
  }

  // Main dashboard
  return (
    <main className="container">
      <Header
        student={dashboardData.student}
        onViewProfile={() =>
          dispatch({ type: ACTION_TYPES.TOGGLE_VIEW_PROFILE })
        }
        onLogout={handleLogout}
      />

      {message ? <div className="alert">{message}</div> : null}

      <div className="layout">
        <div className="left-column">
          <section className="card quiz-selector">
            <div className="card-header">
              <div>
                <p className="eyebrow">Choose Quiz</p>
                <h2>Quiz list</h2>
              </div>
            </div>
            <div className="quiz-selection">
              {dashboardData.quizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  type="button"
                  className={`quiz-chip ${
                    selectedQuizId === quiz.id ? "active" : ""
                  }`}
                  onClick={() =>
                    dispatch({
                      type: ACTION_TYPES.SET_SELECTED_QUIZ,
                      payload: quiz.id,
                    })
                  }
                >
                  <span>{quiz.subject}</span>
                  <small>{quiz.level}</small>
                </button>
              ))}
            </div>
          </section>

          {selectedQuiz ? (
            <QuizCard
              quiz={selectedQuiz}
              selectedAnswer={selectedAnswer}
              onAnswerChange={(answer) =>
                dispatch({
                  type: ACTION_TYPES.SET_SELECTED_ANSWER,
                  payload: answer,
                })
              }
              onSubmit={handleSubmitQuiz}
              loading={loading}
            />
          ) : (
            <section className="card">
              <p>No quiz selected. Please choose a quiz from the list.</p>
            </section>
          )}

          <BadgeList badges={dashboardData.student.badges} />
        </div>

        <div className="right-column">
          <Leaderboard
            data={dashboardData.leaderboard}
            currentUserId={dashboardData.student.id}
          />
        </div>
      </div>
    </main>
  );
}
