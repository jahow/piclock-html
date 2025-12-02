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
      function (error) {
        console.error('Could not obtain location', error);
        resolve([48.8566, 2.3522]); // Paris
      },
    );
  });
}
