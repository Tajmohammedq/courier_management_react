import heroImage from '../assets/courier-login-option-1.png';
import { authContent } from '../content/authContent';

export function AuthShowcase() {
  return (
    <section className="showcase-panel">
      <div className="showcase-orb showcase-orb-one" />
      <div className="showcase-orb showcase-orb-two" />

      <div className="showcase-copy">
        <span className="eyebrow">{authContent.showcase.eyebrow}</span>
        <h1>{authContent.showcase.title}</h1>
        <p>{authContent.showcase.description}</p>
      </div>

      <div className="showcase-visual">
        <img src={heroImage} alt="" className="showcase-visual__image" />
      </div>
    </section>
  );
}
