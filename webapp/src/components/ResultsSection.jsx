import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { figures, exposureByTime, priorityResults, relationshipData, temperatureByTime } from '../data/metrics.js';
import FigureModal from './FigureModal.jsx';

function ResultsSection() {
  const [activeFigure, setActiveFigure] = useState(null);

  return (
    <section className="section" id="results">
      <div className="section-inner">
        <div className="section-heading">
          <p className="eyebrow">Results</p>
          <h2>Heat, shade and vegetation in one decision view.</h2>
          <p>
            The results show where building heat exposure is highest and where
            added shade may be worth field-checking first.
          </p>
        </div>

        <div className="chart-grid">
          <article className="chart-card">
            <h3>Temperature by time</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={temperatureByTime} margin={{ top: 10, right: 18, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#d8ded6" strokeDasharray="4 4" />
                <XAxis dataKey="time" />
                <YAxis domain={[21, 32]} tickFormatter={(value) => `${value}°`} />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(3)} °C`, 'Average temperature']} />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#d94b28"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#d94b28' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p>
              Temperatures remain high at 18:00 because the urban environment
              releases stored heat gradually.
            </p>
          </article>

          <article className="chart-card">
            <h3>Direct building-envelope exposure</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={exposureByTime} margin={{ top: 10, right: 18, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#d8ded6" strokeDasharray="4 4" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 70]} tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Direct exposure']} />
                <Bar dataKey="exposure" radius={[6, 6, 0, 0]} fill="#f28e2b" />
              </BarChart>
            </ResponsiveContainer>
            <p>
              The four-time area-weighted mean is 53.39%. The building envelope
              includes both roofs and exterior facades.
            </p>
          </article>

          <article className="chart-card chart-card-wide">
            <h3>Vegetation and shade relationships at 15:00</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={relationshipData}
                layout="vertical"
                margin={{ top: 10, right: 24, bottom: 0, left: 124 }}
              >
                <CartesianGrid stroke="#d8ded6" strokeDasharray="4 4" />
                <XAxis type="number" domain={[-0.14, 0.14]} tickFormatter={(value) => value.toFixed(2)} />
                <YAxis type="category" dataKey="factor" width={120} />
                <Tooltip formatter={(value) => [Number(value).toFixed(3), 'Spearman correlation']} />
                <ReferenceLine x={0} stroke="#10233f" strokeWidth={1.5} />
                <Bar dataKey="correlation" radius={[4, 4, 4, 4]}>
                  {relationshipData.map((entry) => (
                    <Cell key={entry.factor} fill={entry.correlation < 0 ? '#2f8f58' : '#e9552d'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p>
              The relationships are weak but consistent: buildings with more
              vegetation and tree shade tend to be slightly cooler, while
              buildings farther from canopy tend to be slightly warmer.
            </p>
            <p>
              FortyGuard temperature has 60 m spatial resolution, while
              individual buildings and shadows are analysed at a finer scale.
              Results are descriptive rather than proof of causation.
            </p>
          </article>
        </div>

        <div className="priority-results">
          {priorityResults.map((item) => (
            <article className="metric-tile" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>

        <p className="clarity-note">
          The 739 Very High priority buildings describe the full priority
          classification. The 638 eligible source buildings are the filtered
          subset used for planting-zone screening.
        </p>

        <div className="figure-grid">
          {figures.map((figure) => (
            <button
              className="figure-panel"
              type="button"
              key={figure.src}
              onClick={() => setActiveFigure(figure)}
            >
              <img src={figure.src} alt={figure.title} />
              <span>{figure.title}</span>
            </button>
          ))}
        </div>
      </div>

      <FigureModal figure={activeFigure} onClose={() => setActiveFigure(null)} />
    </section>
  );
}

export default ResultsSection;
