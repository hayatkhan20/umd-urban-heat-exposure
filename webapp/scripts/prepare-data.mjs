import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import proj4 from 'proj4';
import * as topojsonClient from 'topojson-client';
import * as topojsonServer from 'topojson-server';
import * as topojsonTools from 'topojson-simplify';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');

const SOURCE_BASE =
  'https://raw.githubusercontent.com/hayatkhan20/umd-urban-heat-exposure/main';

const dataDir = path.join(projectRoot, 'public', 'data');
const figureDir = path.join(projectRoot, 'public', 'figures');

const NAD83_UTM_18N = '+proj=utm +zone=18 +datum=NAD83 +units=m +no_defs';
const WGS84 = 'EPSG:4326';
const topojsonFeature = topojsonClient.feature ?? topojsonClient.default?.feature;
const topology = topojsonServer.topology ?? topojsonServer.default?.topology;
const presimplify = topojsonTools.presimplify ?? topojsonTools.default?.presimplify;
const topojsonSimplify = topojsonTools.simplify ?? topojsonTools.default?.simplify;

proj4.defs('EPSG:26918', NAD83_UTM_18N);

const buildingFields = [
  'building_uid',
  'id',
  'analysis_height_m',
  'temperature_c_0900',
  'temperature_c_1200',
  'temperature_c_1500',
  'temperature_c_1800',
  'mean_temperature_c',
  'maximum_temperature_c',
  'mean_exposure_fraction',
  'mean_solar_exposure_index',
  'mean_tree_shade_fraction',
  'surrounding_lai_mean_30m',
  'nearest_canopy_distance_m',
  'heat_priority_score',
  'priority_class',
  'recommended_action'
];

const zoneFields = ['zone_id', 'area_m2', 'area_class'];

const datasets = [
  {
    label: 'building analysis',
    filename: 'umd_building_heat_priority_2026-08-29.geojson',
    url: `${SOURCE_BASE}/data/processed/umd_building_heat_priority_2026-08-29.geojson`,
    output: path.join(dataDir, 'umd_buildings_web.geojson'),
    fields: buildingFields,
    toleranceMeters: 0.75
  },
  {
    label: 'candidate zones',
    filename: 'umd_candidate_tree_planting_zones.geojson',
    url: `${SOURCE_BASE}/data/processed/umd_candidate_tree_planting_zones.geojson`,
    output: path.join(dataDir, 'umd_candidate_zones_web.geojson'),
    fields: zoneFields,
    toleranceMeters: 2
  }
];

const figures = [
  'umd_temperature_relationships.png',
  'umd_heat_priority_hotspots.png',
  'umd_candidate_tree_planting_zones.png'
].map((filename) => ({
  filename,
  url: `${SOURCE_BASE}/outputs/figures/${filename}`,
  output: path.join(figureDir, filename)
}));

function hasArg(name) {
  return process.argv.includes(name);
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDirectories() {
  if (!topojsonFeature || !topology || !presimplify || !topojsonSimplify) {
    throw new Error('TopoJSON simplification dependencies did not load correctly.');
  }

  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(figureDir, { recursive: true });
}

function collectCoordinatePairs(geometry, pairs = []) {
  if (!geometry || pairs.length >= 100) {
    return pairs;
  }

  if (geometry.type === 'GeometryCollection') {
    for (const child of geometry.geometries ?? []) {
      collectCoordinatePairs(child, pairs);
    }
    return pairs;
  }

  function visit(value) {
    if (pairs.length >= 100 || !Array.isArray(value)) {
      return;
    }

    if (typeof value[0] === 'number' && typeof value[1] === 'number') {
      pairs.push([value[0], value[1]]);
      return;
    }

    for (const child of value) {
      visit(child);
    }
  }

  visit(geometry.coordinates);
  return pairs;
}

function coordinatesLookLonLat(featureCollection) {
  const pairs = [];

  for (const feature of featureCollection.features ?? []) {
    collectCoordinatePairs(feature.geometry, pairs);
    if (pairs.length >= 100) {
      break;
    }
  }

  return (
    pairs.length > 0 &&
    pairs.every(([x, y]) => Math.abs(x) <= 180 && Math.abs(y) <= 90)
  );
}

function mapCoordinates(value, mapper) {
  if (!Array.isArray(value)) {
    return value;
  }

  if (typeof value[0] === 'number' && typeof value[1] === 'number') {
    return mapper(value);
  }

  return value.map((child) => mapCoordinates(child, mapper));
}

function roundCoordinate(value) {
  return Number(value.toFixed(7));
}

function transformGeometryToWgs84(geometry) {
  if (!geometry) {
    return null;
  }

  if (geometry.type === 'GeometryCollection') {
    return {
      type: 'GeometryCollection',
      geometries: (geometry.geometries ?? []).map(transformGeometryToWgs84)
    };
  }

  return {
    type: geometry.type,
    coordinates: mapCoordinates(geometry.coordinates, ([x, y]) => {
      const [lon, lat] = proj4('EPSG:26918', WGS84, [x, y]);
      return [roundCoordinate(lon), roundCoordinate(lat)];
    })
  };
}

function retainFields(featureCollection, fields) {
  return {
    type: 'FeatureCollection',
    features: (featureCollection.features ?? []).map((feature) => {
      const sourceProperties = feature.properties ?? {};
      const properties = {};

      for (const field of fields) {
        properties[field] =
          sourceProperties[field] === undefined ? null : sourceProperties[field];
      }

      return {
        type: 'Feature',
        properties,
        geometry: feature.geometry
      };
    })
  };
}

function simplifyFeatureCollection(featureCollection, toleranceMeters) {
  const toleranceDegrees = toleranceMeters / 111_320;
  const minimumWeight = toleranceDegrees * toleranceDegrees;
  const topo = topology({ collection: featureCollection });
  const simplifiedTopology = topojsonSimplify(presimplify(topo), minimumWeight);
  const simplified = topojsonFeature(
    simplifiedTopology,
    simplifiedTopology.objects.collection
  );

  return {
    type: 'FeatureCollection',
    features: simplified.features ?? []
  };
}

async function readJson(filePath) {
  const text = await fs.readFile(filePath, 'utf8');
  return JSON.parse(text);
}

async function writeJsonAtomic(filePath, data) {
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, `${JSON.stringify(data)}\n`, 'utf8');
  await fs.rename(tempPath, filePath);
}

async function fetchBuffer(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Download failed (${response.status}) for ${url}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function readSourceDataset(dataset) {
  const localCandidates = [
    path.join(projectRoot, 'data', 'processed', dataset.filename),
    path.join(projectRoot, 'source-data', dataset.filename),
    path.join(projectRoot, 'public', 'source', dataset.filename)
  ];

  for (const candidate of localCandidates) {
    if (await exists(candidate)) {
      console.log(`Using local ${dataset.label}: ${path.relative(projectRoot, candidate)}`);
      return readJson(candidate);
    }
  }

  console.log(`Downloading ${dataset.label} from analytical repository...`);
  const buffer = await fetchBuffer(dataset.url);
  return JSON.parse(buffer.toString('utf8'));
}

async function outputGeojsonIsValid(filePath, fields) {
  if (!(await exists(filePath))) {
    return false;
  }

  try {
    const data = await readJson(filePath);
    const firstFeature = data.features?.[0];

    return (
      data.type === 'FeatureCollection' &&
      data.metadata?.prepared_by === 'scripts/prepare-data.mjs' &&
      Array.isArray(data.features) &&
      data.features.length > 0 &&
      coordinatesLookLonLat(data) &&
      fields.every((field) => Object.hasOwn(firstFeature?.properties ?? {}, field))
    );
  } catch {
    return false;
  }
}

async function prepareDataset(dataset, force) {
  if (!force && (await outputGeojsonIsValid(dataset.output, dataset.fields))) {
    console.log(`Prepared ${dataset.label} already exists; skipping.`);
    return;
  }

  const source = await readSourceDataset(dataset);

  if (source.type !== 'FeatureCollection' || !Array.isArray(source.features)) {
    throw new Error(`${dataset.label} is not a GeoJSON FeatureCollection.`);
  }

  const needsTransform = !coordinatesLookLonLat(source);
  console.log(
    `${dataset.label}: ${source.features.length.toLocaleString()} features; ` +
      (needsTransform ? 'transforming EPSG:26918 to EPSG:4326.' : 'coordinates already lon/lat.')
  );

  const transformed = {
    type: 'FeatureCollection',
    features: source.features.map((feature) => ({
      type: 'Feature',
      properties: feature.properties ?? {},
      geometry: needsTransform ? transformGeometryToWgs84(feature.geometry) : feature.geometry
    }))
  };

  const reduced = retainFields(transformed, dataset.fields);
  const simplified = simplifyFeatureCollection(reduced, dataset.toleranceMeters);
  const output = {
    ...simplified,
    metadata: {
      prepared_by: 'scripts/prepare-data.mjs',
      source: dataset.url,
      source_crs_detected: needsTransform ? 'EPSG:26918' : 'EPSG:4326',
      output_crs: 'EPSG:4326',
      simplification_tolerance_m: dataset.toleranceMeters
    }
  };

  if (!coordinatesLookLonLat(output)) {
    throw new Error(`${dataset.label} output is not valid longitude/latitude GeoJSON.`);
  }

  await writeJsonAtomic(dataset.output, output);
  console.log(`Wrote ${path.relative(projectRoot, dataset.output)}`);
}

async function figureIsValid(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.isFile() && stats.size > 10_000;
  } catch {
    return false;
  }
}

async function prepareFigure(figure, force) {
  if (!force && (await figureIsValid(figure.output))) {
    console.log(`Figure ${figure.filename} already exists; skipping.`);
    return;
  }

  console.log(`Downloading figure ${figure.filename}...`);
  const buffer = await fetchBuffer(figure.url);
  const tempPath = `${figure.output}.tmp`;
  await fs.writeFile(tempPath, buffer);
  await fs.rename(tempPath, figure.output);
  console.log(`Wrote ${path.relative(projectRoot, figure.output)}`);
}

async function main() {
  const force = hasArg('--force') || process.env.FORCE_PREPARE_DATA === '1';

  await ensureDirectories();

  for (const dataset of datasets) {
    await prepareDataset(dataset, force);
  }

  for (const figure of figures) {
    await prepareFigure(figure, force);
  }

  console.log('Data preparation complete.');
}

main().catch((error) => {
  console.error('\nData preparation failed.');
  console.error(error.message);
  process.exitCode = 1;
});
