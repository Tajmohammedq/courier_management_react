type PlaceholderPanelProps = {
  title: string;
  description: string;
  image: string;
};

export function PlaceholderPanel({ title, description, image }: PlaceholderPanelProps) {
  return (
    <section className="service-card placeholder-panel">
      <img src={image} alt="" className="placeholder-panel__image" />
      <div>
        <span className="section-label">Coming next</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </section>
  );
}
