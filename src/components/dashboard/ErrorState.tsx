import { Link } from 'react-router-dom';
import errorIllustration from '../../assets/dashboard/error-illustration.svg';

type ErrorStateProps = {
  title: string;
  message: string;
};

export function ErrorState({ title, message }: ErrorStateProps) {
  return (
    <section className="service-card error-state">
      <img src={errorIllustration} alt="" className="error-state__image" />
      <div>
        <span className="section-label">Something went wrong</span>
        <h3>{title}</h3>
        <p>{message}</p>
        <Link className="quick-link" to="/error">
          Open error help page
        </Link>
      </div>
    </section>
  );
}
