const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * @return {string} access token
 */
function getAccessToken() {
  const accessToken = localStorage.getItem('google_access_token');
  if (accessToken) {
    return accessToken;
  }
  if (window.location.hash.includes('access_token=')) {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const newToken = hashParams.get('access_token');
    localStorage.setItem('google_access_token', newToken);
    return newToken;
  }

  window.location = `https://accounts.google.com/o/oauth2/v2/auth?
scope=https%3A//www.googleapis.com/auth/calendar.readonly&
include_granted_scopes=true&
response_type=token&
state=state_parameter_passthrough_value&
redirect_uri=${window.location.toString()}&
client_id=521298106728-pe2ffr13271rqdkru2gu7u78cf5valda.apps.googleusercontent.com`;
}

let events = [];

async function refreshEvents() {
  const accessToken = getAccessToken();
  console.log('google access token', accessToken);

  const todayStart = Math.floor(new Date().getTime() / DAY_IN_MS) * DAY_IN_MS;
  const inAWeekEnd = todayStart + 7 * DAY_IN_MS;

  const data = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/MY_CALENDAR_ID/events?
timeMin=${new Date(todayStart).toISOString()}&timeMax=${new Date(inAWeekEnd).toISOString()}&singleEvents=true&orderBy=startTime`,
    {
      // mode: 'cors',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  ).then((resp) => resp.json());

  events = data.items.map((item) => ({
    title: item.summary,
    start: new Date(item.start.dateTime),
    end: new Date(item.end.dateTime),
  }));
}

refreshEvents();

/**
 * @param {Date} date
 * return {any[]} events
 */
export function getEventsOnDate(date) {
  return events.filter((e) => {
    return (
      e.start.getFullYear() === date.getFullYear() &&
      e.start.getMonth() === date.getMonth() &&
      e.start.getDate() === date.getDate()
    );
  });
}
