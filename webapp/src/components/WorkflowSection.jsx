import {
  Building2,
  ChevronRight,
  Leaf,
  LocateFixed,
  SunMedium,
  Target,
  ThermometerSun
} from 'lucide-react';

const steps = [
  {
    title: 'Define the campus',
    icon: LocateFixed,
    text: 'Use the UMD analysis boundary to define where calculations are performed.'
  },
  {
    title: 'Measure buildings',
    icon: Building2,
    text: 'Use building footprints and heights to represent roofs and exterior walls.'
  },
  {
    title: 'Measure vegetation',
    icon: Leaf,
    text: 'Use canopy height, tree-to-building distance and summer LAI to describe surrounding vegetation.'
  },
  {
    title: 'Follow the sun',
    icon: SunMedium,
    text: 'Calculate sun position at 09:00, 12:00, 15:00 and 18:00, then test whether nearby canopy blocks sunlight.'
  },
  {
    title: 'Add FortyGuard temperature',
    icon: ThermometerSun,
    text: 'Attach FortyGuard 60 m ambient-temperature estimates to every building for the same four times.'
  },
  {
    title: 'Prioritize action',
    icon: Target,
    text: 'Combine temperature, solar exposure and vegetation deficit to identify buildings and nearby areas needing attention.'
  }
];

function WorkflowSection() {
  return (
    <section className="section" id="workflow">
      <div className="section-inner">
        <div className="section-heading">
          <p className="eyebrow">Workflow</p>
          <h2>From raw layers to an action map.</h2>
          <p>
            The workflow keeps the focus on decisions: where heat is highest,
            where direct sun reaches buildings, and where shade may help.
          </p>
        </div>

        <div className="workflow-grid">
          {steps.map(({ title, icon: Icon, text }, index) => (
            <div className="workflow-item" key={title}>
              <article className="workflow-card">
                <span className="workflow-number">Step {index + 1}</span>
                <Icon size={28} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
              {index < steps.length - 1 && (
                <ChevronRight className="workflow-arrow" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>

        <div className="diagram-panel">
          <div className="diagram-copy">
            <p className="eyebrow">Shade logic</p>
            <h3>A tree can block direct sun before it reaches a surface.</h3>
            <p>
              A surface is shaded when the tree is tall enough to block the sun
              at that distance and angle.
            </p>
          </div>
          <div className="shade-diagram" aria-label="Shade calculation diagram">
            <svg viewBox="0 0 760 360" role="img">
              <title>Tree shade calculation</title>
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#e9552d" />
                </marker>
              </defs>
              <rect x="0" y="0" width="760" height="360" rx="18" fill="#fffaf0" />
              <circle cx="90" cy="70" r="34" fill="#f7bd41" />
              <line x1="130" y1="96" x2="480" y2="250" stroke="#e9552d" strokeWidth="4" markerEnd="url(#arrow)" />
              <line x1="112" y1="124" x2="410" y2="260" stroke="#f28e2b" strokeWidth="3" strokeDasharray="10 9" />
              <line x1="155" y1="64" x2="585" y2="210" stroke="#f28e2b" strokeWidth="3" strokeDasharray="10 9" />

              <rect x="520" y="180" width="120" height="120" fill="#243b5a" />
              <rect x="538" y="202" width="22" height="26" fill="#f7f1e5" />
              <rect x="575" y="202" width="22" height="26" fill="#f7f1e5" />
              <rect x="538" y="244" width="22" height="26" fill="#f7f1e5" />
              <rect x="575" y="244" width="22" height="26" fill="#f7f1e5" />
              <text x="580" y="326" textAnchor="middle" fill="#10233f" fontSize="18" fontWeight="700">Building</text>

              <rect x="334" y="168" width="22" height="132" fill="#8b5a2b" />
              <circle cx="345" cy="132" r="58" fill="#2f8f58" />
              <circle cx="304" cy="154" r="40" fill="#3fa96d" />
              <circle cx="386" cy="154" r="40" fill="#3fa96d" />
              <text x="346" y="326" textAnchor="middle" fill="#10233f" fontSize="18" fontWeight="700">Tree canopy</text>

              <line x1="356" y1="300" x2="520" y2="300" stroke="#10233f" strokeWidth="2" markerEnd="url(#arrow)" />
              <text x="438" y="288" textAnchor="middle" fill="#10233f" fontSize="16">distance</text>

              <line x1="312" y1="300" x2="312" y2="80" stroke="#2f8f58" strokeWidth="2" />
              <text x="296" y="196" textAnchor="middle" fill="#2f8f58" fontSize="16" transform="rotate(-90 296 196)">tree height</text>

              <line x1="660" y1="300" x2="660" y2="180" stroke="#243b5a" strokeWidth="2" />
              <text x="682" y="246" fill="#243b5a" fontSize="16" transform="rotate(-90 682 246)">building height</text>

              <path d="M 174 248 A 58 58 0 0 1 226 222" fill="none" stroke="#e9552d" strokeWidth="3" />
              <line x1="174" y1="248" x2="250" y2="248" stroke="#10233f" strokeWidth="2" />
              <line x1="174" y1="248" x2="240" y2="218" stroke="#e9552d" strokeWidth="2" />
              <text x="232" y="246" fill="#10233f" fontSize="16">solar elevation</text>

              <g transform="translate(522 148)">
                <rect x="0" y="0" width="18" height="18" rx="3" fill="#e9552d" />
                <path d="M4 12 L8 7 L12 10 L15 4" fill="none" stroke="#fffaf0" strokeWidth="2" />
                <text x="26" y="15" fill="#10233f" fontSize="16">roof and facade exposure</text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WorkflowSection;
