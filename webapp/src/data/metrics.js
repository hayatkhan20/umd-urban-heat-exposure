export const SOURCE_REPOSITORY =
  'https://github.com/hayatkhan20/umd-urban-heat-exposure';

export const analysisDate = '29 August 2026';

export const summaryCards = [
  {
    value: '3,694',
    label: 'buildings analyzed'
  },
  {
    value: '30.72°C',
    label: 'average building temperature at 15:00'
  },
  {
    value: '53.39%',
    label: 'average directly exposed building envelope'
  },
  {
    value: '308',
    label: 'preliminary planting zones'
  }
];

export const temperatureByTime = [
  { time: '09:00', temperature: 22.298 },
  { time: '12:00', temperature: 27.109 },
  { time: '15:00', temperature: 30.746 },
  { time: '18:00', temperature: 30.195 }
];

export const exposureByTime = [
  { time: '09:00', exposure: 50.02 },
  { time: '12:00', exposure: 56.76 },
  { time: '15:00', exposure: 57.58 },
  { time: '18:00', exposure: 49.21 }
];

export const relationshipData = [
  {
    factor: 'Direct solar exposure',
    correlation: 0.054
  },
  {
    factor: 'Tree shade',
    correlation: -0.084
  },
  {
    factor: 'Surrounding LAI',
    correlation: -0.116
  },
  {
    factor: 'Canopy distance',
    correlation: 0.115
  }
];

export const priorityResults = [
  { value: '3,694', label: 'buildings analysed' },
  {
    value: '739',
    label: 'Very High priority buildings in the full classification'
  },
  {
    value: '638',
    label: 'eligible Very High buildings used for planting-zone screening'
  },
  { value: '308', label: 'candidate zones' },
  { value: '1.254 km²', label: 'final candidate-zone area' },
  { value: '41.22%', label: 'existing canopy coverage' },
  { value: '13.77 m', label: 'mean canopy height' }
];

export const figures = [
  {
    title: 'Temperature relationships',
    src: '/figures/umd_temperature_relationships.png'
  },
  {
    title: 'Heat-priority hotspots',
    src: '/figures/umd_heat_priority_hotspots.png'
  },
  {
    title: 'Candidate tree-planting zones',
    src: '/figures/umd_candidate_tree_planting_zones.png'
  }
];
