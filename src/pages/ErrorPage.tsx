import { Link } from 'react-router-dom';
import errorIllustration from '../assets/dashboard/error-illustration.svg';

export function ErrorPage() {
  return (
    <main className="placeholder-shell">
      <section className="placeholder-card error-page">
        <img src={errorIllustration} alt="" className="error-page__image" />
        <span className="eyebrow">Something went wrong</span>
        <h1>We are unable to fetch data right now.</h1>
        <p>
          Please retry after a moment. If the problem continues, make sure both backend applications are
          running and reachable from the React app.
        </p>
        <div className="placeholder-actions">
          <Link className="primary-button primary-button--link" to="/">
            Go back to login
          </Link>
        </div>
      </section>
    </main>
  );
}
