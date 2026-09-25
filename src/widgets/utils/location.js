/**
 * @return {Promise<Array<number>>} Lat lon
 */
export async function getLatitudeLongitude() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        resolve([latitude, longitude]);
      },
      async function (error) {
        console.warn('Could not obtain location', error);
        const config = await fetch('./config.json').then((resp) => resp.json());
        resolve(config.defaultLocation);
      },
    );
  });
}
