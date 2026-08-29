# umd-urban-heat-exposure
A GeoAI workflow integrating FortyGuard temperature intelligence, vegetation, building geometry and solar exposure for urban-heat analysis at UMD College Park.
## Sentinel-2 Leaf Area Index

This notebook estimates summer Leaf Area Index for the UMD College Park
analysis area using Sentinel-2 Level-2A surface reflectance imagery.

### Method

- Dataset: COPERNICUS/S2_SR_HARMONIZED
- Period: July 1 to August 29, 2026
- Input scenes: 13
- Cloud masking: Sentinel-2 Scene Classification Layer
- Composite: Median of valid observations
- LAI algorithm: ESA/SNAP Sentinel-2 biophysical neural network
- Native analysis resolution: 20 metres
- Output CRS: EPSG:26918
- Output unit: m² leaf area per m² ground area

Clear non-vegetated pixels are assigned LAI = 0. Invalid, cloudy, shadow,
cirrus and snow pixels are excluded before temporal compositing.
