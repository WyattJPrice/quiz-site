import Link from 'next/link';
import { quizzes } from '@/data';

export default function HomePage() {
  const sections = new Map<string, typeof quizzes>();
  for (const quiz of quizzes) {
    const key = quiz.section ?? 'Other';
    if (!sections.has(key)) sections.set(key, []);
    sections.get(key)!.push(quiz);
  }

  return (
    <main className="container">
      <header className="home-header">
        <h1 className="home-title">Study Site</h1>
        <p className="home-tagline">
          Created by <a href="https://wyattprice.dev" target="_blank">Wyatt Price</a>
        </p>
      </header>

      {[...sections.entries()].map(([section, items]) => (
        <div key={section}>
          <div className="section-row">
            <span className="section-label">{section}</span>
          </div>

          <div className="index-grid">
            {items.map((quiz) => (
              <div key={quiz.slug} className="quiz-card-wrap">
                <Link href={`/learn/${quiz.slug}`} className="quiz-card">
                  <div className="quiz-card-inner">
                    <div className="quiz-card-emoji-wrap">{quiz.icon}</div>
                    <div className="quiz-card-title">{quiz.title}</div>
                    <div className="quiz-card-desc">{quiz.description}</div>
                    <div className="quiz-card-footer">
                      <span className="quiz-card-meta">{quiz.questions.length} questions</span>
                      <span className="quiz-card-arrow">&rarr;</span>
                    </div>
                  </div>
                </Link>
                <Link href={`/quiz/${quiz.slug}`} className="learn-link">
                  Test
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
