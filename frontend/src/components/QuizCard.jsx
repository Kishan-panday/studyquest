import { useState, useEffect } from "react";

export default function QuizCard({ quiz, selectedAnswer, onAnswerChange, onSubmit, loading }) {
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Daily Challenge</p>
          <h2>{quiz.subject}</h2>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span className="pill">{quiz.level}</span>
          <span className="pill" style={{ background: "var(--info-gradient)" }}>
            ⏱️ {formatTime(timeSpent)}
          </span>
        </div>
      </div>

      <p className="question">{quiz.question}</p>

      <div className="options">
        {quiz.options.map((option, index) => {
          const id = `option-${index}`;
          return (
            <label key={id} className={`option ${selectedAnswer === option ? "selected" : ""}`}>
              <input
                type="radio"
                name="quizOption"
                value={option}
                checked={selectedAnswer === option}
                onChange={() => onAnswerChange(option)}
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>

      <button
        className="primary-btn"
        disabled={!selectedAnswer || loading}
        onClick={() => onSubmit(timeSpent)}
      >
        {loading ? "Submitting..." : "Submit Quiz"}
      </button>
    </section>
  );
}
