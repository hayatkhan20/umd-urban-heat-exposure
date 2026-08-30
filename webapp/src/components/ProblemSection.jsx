import { Building2, GraduationCap, Leaf, UsersRound } from 'lucide-react';

const audiences = [
  {
    title: 'Campus facilities teams',
    icon: Building2,
    text: 'Identify buildings that may need cool roofs, facade shading or operational attention.'
  },
  {
    title: 'Sustainability and landscape teams',
    icon: Leaf,
    text: 'Screen locations where additional trees could improve shade.'
  },
  {
    title: 'Urban and resilience planners',
    icon: UsersRound,
    text: 'Compare heat, vegetation and building exposure in one decision layer.'
  },
  {
    title: 'Researchers and students',
    icon: GraduationCap,
    text: 'Explore relationships between temperature, solar exposure, canopy and LAI.'
  }
];

function ProblemSection() {
  return (
    <section className="section section-muted" id="problem">
      <div className="section-inner">
        <div className="section-heading">
          <p className="eyebrow">Problem and audience</p>
          <h2>Buildings experience heat differently.</h2>
          <p>
            A building with little nearby vegetation and high solar exposure may
            need intervention more urgently than a shaded building nearby.
            General campus-wide temperature maps do not explain which buildings
            receive direct sunlight, which benefit from trees, or where new
            shade could be most useful.
          </p>
        </div>

        <div className="audience-grid">
          {audiences.map(({ title, icon: Icon, text }) => (
            <article className="info-card" key={title}>
              <Icon className="card-icon" size={26} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProblemSection;
