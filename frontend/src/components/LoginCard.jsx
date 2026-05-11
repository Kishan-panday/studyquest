export default function LoginCard({
  loginEmail,
  loginPassword,
  onLoginEmailChange,
  onLoginPasswordChange,
  onLogin,
  isRegistering,
  onToggleRegister,
  registerName,
  registerEmail,
  registerCollege,
  registerPassword,
  onRegisterNameChange,
  onRegisterEmailChange,
  onRegisterCollegeChange,
  onRegisterPasswordChange,
  onRegister,
  loading,
  message,
}) {
  return (
    <section className="card login-card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Welcome Back</p>
          <h2>{isRegistering ? "Create Account" : "Student Login"}</h2>
        </div>
      </div>

      {message && <div className="alert">{message}</div>}

      {isRegistering ? (
        <>
          <p>Create your student profile to start earning XP and badges.</p>
          <div className="login-controls">
            <input
              type="text"
              placeholder="Full name"
              value={registerName}
              onChange={(event) => onRegisterNameChange(event.target.value)}
            />
            <input
              type="email"
              placeholder="Email address"
              value={registerEmail}
              onChange={(event) => onRegisterEmailChange(event.target.value)}
            />
            <input
              type="text"
              placeholder="College"
              value={registerCollege}
              onChange={(event) => onRegisterCollegeChange(event.target.value)}
            />
            <input
              type="password"
              placeholder="Password (min. 6 characters)"
              value={registerPassword}
              onChange={(event) => onRegisterPasswordChange(event.target.value)}
            />
            <button className="primary-btn" type="button" onClick={onRegister} disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
            <button className="secondary-btn" type="button" onClick={onToggleRegister}>
              Back to login
            </button>
          </div>
        </>
      ) : (
        <>
          <p>Enter your credentials to continue your StudyQuest journey.</p>

          <div className="login-controls">
            <input
              type="email"
              placeholder="Email address"
              value={loginEmail}
              onChange={(event) => onLoginEmailChange(event.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(event) => onLoginPasswordChange(event.target.value)}
            />

            <button className="primary-btn" type="button" onClick={onLogin} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            <button className="secondary-btn" type="button" onClick={onToggleRegister}>
              Register new student
            </button>
          </div>
        </>
      )}
    </section>
  );
}
