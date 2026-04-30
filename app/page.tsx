import Link from 'next/link';
import { quizzes } from '@/data';

export default function HomePage() {
  const totalQuestions = quizzes.reduce((sum, q) => sum + q.questions.length, 0);

  return (
    <main className="container">
      <header className="home-header">
        <span className="home-badge">Biology · Fill in the Blank</span>
        <h1 className="home-title">Study Hub</h1>
        <p className="home-tagline">
          Created by <a href="https://wyattprice.dev" target="_blank">Wyatt Price</a>
        </p>
      </header>

      <div className="section-row">
        <span className="section-label">Quizzes</span>
      </div>

      <div className="index-grid">
        {quizzes.map((quiz) => (
          <Link key={quiz.slug} href={`/quiz/${quiz.slug}`} className="quiz-card">
            <div className="quiz-card-inner">
              <div className="quiz-card-emoji-wrap">{quiz.icon}</div>
              <div className="quiz-card-title">{quiz.title}</div>
              <div className="quiz-card-desc">{quiz.description}</div>
              <div className="quiz-card-footer">
                <span className="quiz-card-meta">{quiz.questions.length} questions</span>
                <span className="quiz-card-arrow">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
