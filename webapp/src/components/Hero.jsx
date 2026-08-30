import { ArrowRight, Github, MapPin } from 'lucide-react';
import { SOURCE_REPOSITORY, analysisDate, summaryCards } from '../data/metrics.js';

function Hero() {
  return (
    <section className="hero section" id="home">
      <div className="section-inner hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">UMD HeatShield</p>
          <h1>Where should UMD act first against extreme heat?</h1>
          <p className="hero-subtitle">
            Building-scale heat exposure and tree-shade decision support
          </p>
          <p className="powered-line">Powered by FortyGuard temperature intelligence</p>
          <p className="hero-text">
            UMD HeatShield combines FortyGuard temperature data with building
            geometry, solar exposure, tree canopy and LAI to identify
            heat-exposed buildings and screen locations where additional shade
            may provide the greatest benefit.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#explore">
              <MapPin size={18} />
              Explore the Map
            </a>
            <a className="button button-secondary" href="#workflow">
              <ArrowRight size={18} />
              See How It Works
            </a>
            <a
              className="button button-ghost"
              href={SOURCE_REPOSITORY}
              target="_blank"
              rel="noreferrer"
            >
              <Github size={18} />
              View Source Code
            </a>
          </div>
          <p className="analysis-note">Analysis date: {analysisDate}</p>
        </div>

        <div className="summary-panel" aria-label="Project summary">
          {summaryCards.map((card) => (
            <article className="summary-card" key={card.label}>
              <strong>{card.value}</strong>
              <span>{card.label}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
