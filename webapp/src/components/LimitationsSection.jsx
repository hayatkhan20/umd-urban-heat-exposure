import { AlertTriangle } from 'lucide-react';

const limitations = [
  'The analysis represents one hot summer day: 29 August 2026.',
  'FortyGuard values represent 60 m ambient-temperature estimates, not roof or wall surface temperature.',
  'Statistical relationships are descriptive and do not prove causation.',
  'Candidate planting zones do not yet exclude roads, parking, utilities, land ownership or other engineering constraints.',
  'Additional days and field observations would strengthen validation.'
];

function LimitationsSection() {
  return (
    <section className="section limitations-section" id="limitations">
      <div className="section-inner">
        <div className="limitations-panel">
          <div>
            <p className="eyebrow">Limitations</p>
            <h2>Clear boundaries for using the results.</h2>
          </div>
          <ul>
            {limitations.map((limitation) => (
              <li key={limitation}>
                <AlertTriangle size={18} aria-hidden="true" />
                <span>{limitation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default LimitationsSection;
