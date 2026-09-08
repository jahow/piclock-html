// node script
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { REGIONS } from './iso_3166_2.js';

const url =
  'https://de1.api.radio-browser.info/json/stations/search?limit=5000&hidebroken=true&order=votes&reverse=true';

async function writeGeoJSON() {
  const json = await fetch(url).then((resp) => resp.json());
  let skipped = 0;
  const features = json
    .map((radio) => {
      let geometry = null;
      if (radio.geo_lat && radio.geo_long) {
        geometry = {
          type: 'Point',
          coordinates: [radio.geo_long, radio.geo_lat],
        };
      }
      const regionCode = radio.iso_3166_2 || radio.countrycode;
      const region = REGIONS[regionCode] ?? REGIONS[radio.countrycode];
      if (region) {
        geometry = {
          type: 'Point',
          coordinates: [region.lng, region.lat],
        };
      }

      if (!geometry) {
        skipped++;
        return null;
      }

      return {
        type: 'Feature',
        geometry,
        properties: {
          url: radio.url,
          url_resolved: radio.url_resolved,
          name: radio.name,
          tags: radio.tags,
        },
      };
    })
    .filter((feature) => !!feature);
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
