import { ClipboardCheck, Home, TreePine } from 'lucide-react';

const recommendations = [
  {
    title: 'Priority tree planting',
    icon: TreePine,
    text: 'Focus field verification around Very High priority buildings with limited LAI and tree shade.'
  },
  {
    title: 'Building cooling measures',
    icon: Home,
    text: 'Where planting is not feasible, consider cool roofs, facade shading and reflective materials.'
  },
  {
    title: 'Field validation',
    icon: ClipboardCheck,
    text: 'Before planting, verify roads, pavement, underground utilities, ownership, pedestrian access and landscape feasibility.'
  }
];

function RecommendationsSection() {
  return (
    <section className="section section-muted" id="recommendations">
      <div className="section-inner">
        <div className="section-heading">
          <p className="eyebrow">Recommendations</p>
          <h2>Turn the screen into field decisions.</h2>
          <p>
            The dashboard is a first pass for prioritizing where to inspect,
            compare options and plan cooling actions.
          </p>
        </div>

        <div className="recommendation-banner">
          Preliminary screening zones - not confirmed planting sites.
        </div>

        <div className="decision-grid">
          {recommendations.map(({ title, icon: Icon, text }) => (
            <article className="decision-card" key={title}>
              <Icon className="card-icon" size={28} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RecommendationsSection;
