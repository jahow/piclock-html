// node script
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { REGIONS } from './iso_3166_2.js';

const url =
  'https://de1.api.radio-browser.info/json/stations/search?limit=5000&hidebroken=true&order=votes&reverse=true';

async function writeGeoJSON() {
  const json = await fetch(url).then((resp) => resp.json());
  let skipped = 0;

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
        url_resolved: radio.url_resolved,
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
  for (const key in countByRegion) {
    const value = countByRegion[key];
    if (value <= 1) continue;
    const region = REGIONS[key];
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [region.lng, region.lat],
      },
      id: `region-${key}`,
      properties: {
        radioCount: value,
      },
    });
    console.log(`registered cluster for region ${key} with ${value} stations`);
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
    `Scraped ${features.length} radios, skipped ${skipped} that could not be located`,
  );
}

writeGeoJSON();
