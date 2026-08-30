import { Database, ExternalLink } from 'lucide-react';
import { SOURCE_REPOSITORY } from '../data/metrics.js';

const sources = [
  'FortyGuard Temperature API - 60 m ambient-temperature estimates',
  'Overture Maps - building footprints and heights',
  'NAIP imagery and NAIP canopy-height model',
  'Sentinel-2 - summer LAI',
  'Solar-position calculations',
  'University of Maryland analysis boundary'
];

function AboutSection() {
  return (
    <section className="section about-section" id="about">
      <div className="section-inner about-grid">
        <div>
          <p className="eyebrow">About and data sources</p>
          <h2>Built for a public, no-login dashboard.</h2>
          <p>
            UMD HeatShield presents cached analysis results from the analytical
            repository. The public dashboard does not expose an API key and does
            not repeatedly call the FortyGuard API.
          </p>
          <a className="button button-secondary" href={SOURCE_REPOSITORY} target="_blank" rel="noreferrer">
            <ExternalLink size={18} />
            Analytical repository
          </a>
        </div>

        <div className="source-list">
          <div className="source-list-heading">
            <Database size={22} aria-hidden="true" />
            <h3>Inputs combined</h3>
          </div>
          <ul>
            {sources.map((source) => (
              <li key={source}>{source}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
