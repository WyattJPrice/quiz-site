import Link from 'next/link';
import type { LeaderboardData } from '@/db/stats';

/**
 * Ranks accounts by questions answered correctly. No invented players: with no
 * finished sets the panel says so.
 */
export default function Leaderboard({ data }: { data: LeaderboardData }) {
  const meInList = data.me ? data.entries.some((entry) => entry.isMe) : false;

  return (
    <aside className="leaderboard" aria-labelledby="leaderboard-heading">
      <h2 id="leaderboard-heading" className="leaderboard-head">
        Leaderboard
      </h2>

      {data.entries.length === 0 ? (
        <p className="leaderboard-empty">
          Nobody has finished a set yet. Sign in, study a set, and take the first place.
        </p>
      ) : (
        <ol className="leaderboard-list">
          {data.entries.map((entry) => (
            <li key={entry.userId} className={`leaderboard-row${entry.isMe ? ' is-me' : ''}`}>
              <span className="leaderboard-rank">{entry.rank}</span>
              <span className="leaderboard-name">
                {entry.isMe ? 'You' : entry.name}
                {entry.isMe && data.me ? <span className="leaderboard-you-note"> · {data.me.name}</span> : null}
              </span>
              <span className="leaderboard-score">{entry.correct}</span>
            </li>
          ))}
        </ol>
      )}

      {data.me && !meInList ? (
        <div className="leaderboard-row leaderboard-me-row is-me">
          <span className="leaderboard-rank">{data.me.rank}</span>
          <span className="leaderboard-name">You</span>
          <span className="leaderboard-score">{data.me.correct}</span>
        </div>
      ) : null}

      {!data.me ? (
        <p className="leaderboard-foot">
          <Link href="/signin">Sign in to join the board.</Link>
        </p>
      ) : null}

      <p className="leaderboard-note">Questions answered correctly</p>
    </aside>
  );
}
