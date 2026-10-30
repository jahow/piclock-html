// node script
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { REGIONS } from './iso_3166_2.js';

const url =
  'https://de1.api.radio-browser.info/json/stations/search?limit=5000&hidebroken=true&order=votes&reverse=true';

async function writeGeoJSON() {
  const json = await fetch(url).then((resp) => resp.json());
  let skipped = 0;
  let inClusters = 0;

  const countByRegion = {};
  function getOffsetCoords(lon, lat, existingCount) {
    return [
      lon + Math.cos(existingCount) * (0.2 + 0.02 * existingCount),
      lat + Math.sin(existingCount) * (0.2 + 0.02 * existingCount),
    ];
  }

  const features = json
    .map((radio) => {
      const properties = {
        url: radio.url,
        url_resolved: radio.url_resolved ?? radio.url,
        name: radio.name,
        tags: radio.tags,
      };

      let geometry = null;
      if (radio.geo_lat && radio.geo_long) {
        geometry = {
          type: 'Point',
          coordinates: [radio.geo_long, radio.geo_lat],
        };
      } else {
        let regionCode = radio.iso_3166_2;
        if (!REGIONS[regionCode]) {
          regionCode = radio.countrycode;
        }
        if (!REGIONS[regionCode]) {
          // could not find the region: skip
          return null;
        }

        const existingCount = countByRegion[regionCode] || 0;
        countByRegion[regionCode] = existingCount + 1;
        const region = REGIONS[regionCode];

        properties.regionCode = regionCode;
        properties.indexInRegion = existingCount;
        inClusters++;

        if (region) {
          geometry = {
            type: 'Point',
            coordinates: [region.lng, region.lat],
          };
        }
      }

      if (!geometry) {
        skipped++;
        return null;
      }

      return {
        type: 'Feature',
        geometry,
        id: radio.stationuuid,
        properties,
      };
    })
    .filter((feature) => !!feature);

  // add a cluster for each region
  for (const regionCode in countByRegion) {
    const value = countByRegion[regionCode];

    if (value === 1) {
      // we need to make sure this single station is not in a cluster
      for (const feature of features) {
        if (feature.properties.regionCode === regionCode) {
          delete feature.properties.regionCode;
          delete feature.properties.indexInRegion;
          inClusters--;
          console.log(
            `found cluster with a single station (region ${regionCode}), removed it`,
          );
          break;
        }
      }
      continue;
    }

    const region = REGIONS[regionCode];
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [region.lng, region.lat],
      },
      id: `region-${regionCode}`,
      properties: {
        regionCode: regionCode,
        isCluster: true,
        radioCount: value,
      },
    });

    // sort stations in the cluster by alphabetical order, reassign their indices
    const featuresInCluster = features.filter(
      (feature) =>
        feature.properties.regionCode === regionCode &&
        !feature.properties.isCluster,
    );
    featuresInCluster.sort((a, b) =>
      a.properties.name.localeCompare(b.properties.name),
    );
    featuresInCluster.forEach((feature, index) => {
      feature.properties.indexInRegion = index;
    });

    console.log(
      `registered cluster for region ${regionCode} with ${value} stations`,
    );
  }

  const geojson = {
    type: 'FeatureCollection',
    features,
  };
  await fs.writeFile(
    path.join(import.meta.dirname, 'webradios.json'),
    JSON.stringify(geojson),
  );
  console.log(
    `Scraped ${features.length} radios, ${inClusters} of which in regional clusters, skipped ${skipped} that could not be located`,
  );
}

writeGeoJSON();
