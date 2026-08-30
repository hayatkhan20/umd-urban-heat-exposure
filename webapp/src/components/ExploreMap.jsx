import { useEffect, useMemo, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';
import { Layers, Loader2, MapPin, ThermometerSun } from 'lucide-react';

const BUILDINGS_URL = '/data/umd_buildings_web.geojson';
const CANDIDATE_ZONES_URL = '/data/umd_candidate_zones_web.geojson';

const timeOptions = [
  { code: '0900', label: '09:00', field: 'temperature_c_0900' },
  { code: '1200', label: '12:00', field: 'temperature_c_1200' },
  { code: '1500', label: '15:00', field: 'temperature_c_1500' },
  { code: '1800', label: '18:00', field: 'temperature_c_1800' }
];

const modeOptions = [
  { id: 'temperature', label: 'Temperature' },
  { id: 'exposure', label: 'Solar exposure' },
  { id: 'priority', label: 'Heat priority' },
  { id: 'planting', label: 'Tree-planting screening' }
];

const priorityColors = {
  'Very Low': '#006837',
  Low: '#8bd17c',
  Moderate: '#ffd166',
  High: '#f28e2b',
  'Very High': '#d73027'
};

const temperaturePalette = ['#fff7bc', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#8c2d04'];
const exposurePalette = ['#fff7bc', '#fed976', '#feb24c', '#fd8d3c', '#e31a1c', '#7f0000'];
const missingColor = '#b8c0c8';

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function numericValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatValue(value, formatter) {
  const number = numericValue(value);
  return number === null ? 'Not available' : formatter(number);
}

function formatTemp(value) {
  return formatValue(value, (number) => `${number.toFixed(1)} °C`);
}

function formatMeters(value) {
  return formatValue(value, (number) => `${number.toFixed(1)} m`);
}

function formatArea(value) {
  return formatValue(value, (number) => `${number.toLocaleString(undefined, { maximumFractionDigits: 0 })} m²`);
}

function formatPercentFraction(value) {
  return formatValue(value, (number) => `${(number * 100).toFixed(1)}%`);
}

function formatScore(value) {
  return formatValue(value, (number) => number.toFixed(1));
}

function textValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'Not available';
  }

  return String(value);
}

function escapeHtml(value) {
  return textValue(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getRange(features, field, fallback) {
  const values = features
    .map((feature) => numericValue(feature?.properties?.[field]))
    .filter((value) => value !== null);

  if (!values.length) {
    return fallback;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return [min - 0.5, max + 0.5];
  }

  return [min, max];
}

function steppedColor(value, range, palette) {
  const number = numericValue(value);

  if (number === null) {
    return missingColor;
  }

  const [min, max] = range;
  const t = Math.max(0, Math.min(1, (number - min) / (max - min)));
  const index = Math.min(palette.length - 1, Math.floor(t * palette.length));
  return palette[index];
}

function popupRows(rows) {
  return rows
    .map(
      ([label, value]) =>
        `<div class="popup-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`
    )
    .join('');
}

function buildingPopup(properties, selectedTime) {
  const time = timeOptions.find((option) => option.code === selectedTime) ?? timeOptions[2];

  const rows = [
    ['Building ID', properties.building_uid ?? properties.id],
    ['Building height', formatMeters(properties.analysis_height_m)],
    [`Temperature at ${time.label}`, formatTemp(properties[time.field])],
    ['Maximum temperature', formatTemp(properties.maximum_temperature_c)],
    ['Mean solar exposure', formatPercentFraction(properties.mean_exposure_fraction)],
    ['Mean tree-shade fraction', formatPercentFraction(properties.mean_tree_shade_fraction)],
    ['Surrounding LAI', formatValue(properties.surrounding_lai_mean_30m, (number) => number.toFixed(2))],
    ['Nearest canopy distance', formatMeters(properties.nearest_canopy_distance_m)],
    ['Heat-priority score', formatScore(properties.heat_priority_score)],
    ['Priority class', textValue(properties.priority_class)],
    ['Recommended action', textValue(properties.recommended_action)]
  ];

  return `<div class="map-popup"><h3>Building details</h3>${popupRows(rows)}</div>`;
}

function zonePopup(properties) {
  const rows = [
    ['Zone ID', properties.zone_id],
    ['Area', formatArea(properties.area_m2)],
    ['Area class', textValue(properties.area_class)],
    ['Disclaimer', 'Preliminary screening zone - not a confirmed planting site.']
  ];

  return `<div class="map-popup"><h3>Candidate zone</h3>${popupRows(rows)}</div>`;
}

function Legend({ mode, selectedTime, temperatureRange }) {
  if (mode === 'temperature') {
    const time = timeOptions.find((option) => option.code === selectedTime) ?? timeOptions[2];
    const [min, max] = temperatureRange;
    const mid = (min + max) / 2;

    return (
      <div className="map-legend" aria-label="Temperature legend">
        <strong>Temperature at {time.label}</strong>
        <div className="legend-gradient temperature-gradient" />
        <div className="legend-labels">
          <span>{min.toFixed(1)} °C</span>
          <span>{mid.toFixed(1)} °C</span>
          <span>{max.toFixed(1)} °C</span>
        </div>
      </div>
    );
  }

  if (mode === 'exposure') {
    return (
      <div className="map-legend" aria-label="Solar exposure legend">
        <strong>Mean direct building-envelope exposure</strong>
        <div className="legend-gradient exposure-gradient" />
        <div className="legend-labels">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    );
  }

  if (mode === 'planting') {
    return (
      <div className="map-legend" aria-label="Planting screening legend">
        <strong>Tree-planting screening</strong>
        <div className="legend-item">
          <span style={{ background: priorityColors['Very High'] }} />
          Very High priority building
        </div>
        <div className="legend-item">
          <span style={{ background: '#00bcd4' }} />
          Preliminary candidate zone
        </div>
      </div>
    );
  }

  return (
    <div className="map-legend" aria-label="Priority legend">
      <strong>Heat priority class</strong>
      {Object.entries(priorityColors).map(([label, color]) => (
        <div className="legend-item" key={label}>
          <span style={{ background: color }} />
          {label}
        </div>
      ))}
    </div>
  );
}

function ExploreMap() {
  const [buildings, setBuildings] = useState(null);
  const [candidateZones, setCandidateZones] = useState(null);
  const [loadState, setLoadState] = useState('loading');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('temperature');
  const [selectedTime, setSelectedTime] = useState('1500');
  const [showBuildings, setShowBuildings] = useState(true);
  const [showCandidates, setShowCandidates] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoadState('loading');
        const [buildingResponse, zoneResponse] = await Promise.all([
          fetch(BUILDINGS_URL),
          fetch(CANDIDATE_ZONES_URL)
        ]);

        if (!buildingResponse.ok || !zoneResponse.ok) {
          throw new Error('Prepared map files were not found.');
        }

        const [buildingData, zoneData] = await Promise.all([
          buildingResponse.json(),
          zoneResponse.json()
        ]);

        if (!isMounted) {
          return;
        }

        setBuildings(buildingData);
        setCandidateZones(zoneData);
        setLoadState('ready');
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(
          `${loadError.message} Run npm install, then npm run dev so scripts/prepare-data.mjs can prepare the real source data.`
        );
        setLoadState('error');
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const features = buildings?.features ?? [];
  const selectedTimeOption =
    timeOptions.find((option) => option.code === selectedTime) ?? timeOptions[2];

  const temperatureRange = useMemo(
    () => getRange(features, selectedTimeOption.field, [22, 31.1]),
    [features, selectedTimeOption.field]
  );

  const buildingStyle = (feature) => {
    const properties = feature.properties ?? {};

    if (mode === 'temperature') {
      return {
        color: '#5f1f16',
        weight: 0.25,
        fillColor: steppedColor(properties[selectedTimeOption.field], temperatureRange, temperaturePalette),
        fillOpacity: 0.78
      };
    }

    if (mode === 'exposure') {
      return {
        color: '#6f2418',
        weight: 0.25,
        fillColor: steppedColor(properties.mean_exposure_fraction, [0, 1], exposurePalette),
        fillOpacity: 0.76
      };
    }

    if (mode === 'planting') {
      const isVeryHigh = properties.priority_class === 'Very High';
      return {
        color: isVeryHigh ? '#7f0000' : '#6f7b86',
        weight: isVeryHigh ? 0.65 : 0.2,
        fillColor: isVeryHigh ? priorityColors['Very High'] : '#d8dee5',
        fillOpacity: isVeryHigh ? 0.85 : 0.16
      };
    }

    const priorityClass = textValue(properties.priority_class);

    return {
      color: '#26384f',
      weight: 0.25,
      fillColor: priorityColors[priorityClass] ?? missingColor,
      fillOpacity: 0.78
    };
  };

  const candidateStyle = {
    color: '#007d8f',
    weight: 1.2,
    fillColor: '#00bcd4',
    fillOpacity: 0.38
  };

  const onEachBuilding = (feature, layer) => {
    layer.bindPopup(buildingPopup(feature.properties ?? {}, selectedTime));
  };

  const onEachZone = (feature, layer) => {
    layer.bindPopup(zonePopup(feature.properties ?? {}));
  };

  const buildingCount = isFiniteNumber(features.length) ? features.length.toLocaleString() : '0';
  const zoneCount = candidateZones?.features?.length?.toLocaleString() ?? '0';

  return (
    <section className="section section-map" id="explore">
      <div className="section-inner">
        <div className="section-heading wide-heading">
          <p className="eyebrow">Explore map</p>
          <h2>Inspect buildings and preliminary planting zones.</h2>
          <p>
            Switch between temperature, solar exposure, heat priority and
            planting-screening views. Click a building or zone for the values
            used in the decision layer.
          </p>
        </div>

        <div className="map-shell">
          <div className="map-sidebar">
            <div className="sidebar-header">
              <ThermometerSun size={24} aria-hidden="true" />
              <div>
                <h3>Map controls</h3>
                <p>{buildingCount} buildings and {zoneCount} candidate zones</p>
              </div>
            </div>

            <div className="control-group">
              <span className="control-label">Mode</span>
              <div className="segmented-control">
                {modeOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={mode === option.id ? 'is-active' : ''}
                    onClick={() => setMode(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'temperature' && (
              <div className="control-group">
                <span className="control-label">Time</span>
                <div className="time-buttons" role="group" aria-label="Temperature time">
                  {timeOptions.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      className={selectedTime === option.code ? 'is-active' : ''}
                      onClick={() => setSelectedTime(option.code)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="control-group">
              <span className="control-label">Layers</span>
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={showBuildings}
                  onChange={(event) => setShowBuildings(event.target.checked)}
                />
                Building layer
              </label>
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={showCandidates}
                  onChange={(event) => setShowCandidates(event.target.checked)}
                  disabled={mode !== 'planting'}
                />
                Candidate zones
              </label>
            </div>

            <Legend mode={mode} selectedTime={selectedTime} temperatureRange={temperatureRange} />

            <div className="map-note">
              <Layers size={18} aria-hidden="true" />
              <p>Planting zones are preliminary screening zones, not approved planting sites.</p>
            </div>
          </div>

          <div className="map-panel">
            <MapContainer
              center={[38.989599, -76.941666]}
              zoom={14}
              scrollWheelZoom={false}
              className="leaflet-map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />

              {showBuildings && buildings && (
                <GeoJSON
                  key={`buildings-${mode}-${selectedTime}`}
                  data={buildings}
                  style={buildingStyle}
                  onEachFeature={onEachBuilding}
                />
              )}

              {mode === 'planting' && showCandidates && candidateZones && (
                <GeoJSON
                  key="candidate-zones"
                  data={candidateZones}
                  style={candidateStyle}
                  onEachFeature={onEachZone}
                />
              )}
            </MapContainer>

            {loadState === 'loading' && (
              <div className="map-status">
                <Loader2 className="spin" size={22} />
                Loading real map data...
              </div>
            )}

            {loadState === 'error' && (
              <div className="map-status map-error">
                <MapPin size={22} />
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ExploreMap;
