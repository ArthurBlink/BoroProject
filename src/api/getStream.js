import fetch from 'node-fetch';

const API_URL = process.env.MEDIASTREAM_API_URL || 'https://platform.mediastre.am/api/live-stream';
const STREAM_ID = process.argv[2] || '69d58e4bca61dce28b729040';
const COOKIE = process.env.MEDIASTREAM_COOKIE || '';

async function getStreamUrl(streamId) {
  const timestamp = Date.now();
  const url = `${API_URL}/${streamId}?_=${timestamp}`;

  const headers = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    'Connection': 'keep-alive',
    'Referer': `https://platform.mediastre.am/live-stream/${streamId}`,
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest'
  };

  if (COOKIE) {
    headers['Cookie'] = COOKIE;
  }

  try {
    const response = await fetch(url, { headers });
    const data = await response.json();

    const streamInfo = {
      stream_url: data.stream_url || null,
      publish_point: data.publish_point || null,
      cloud_transcoding: data.cloud_transcoding || false,
      name: data.name || streamId,
      id: streamId
    };

    if (streamInfo.stream_url) {
      const tokenParams = buildTokenParams();
      streamInfo.full_url = `${streamInfo.stream_url}?${tokenParams}`;
      console.log('Stream Info:');
      console.log(JSON.stringify(streamInfo, null, 2));
      return streamInfo;
    } else {
      console.error('No stream_url found in response');
      console.log('Response:', JSON.stringify(data, null, 2));
      return null;
    }
  } catch (error) {
    console.error('Error fetching stream:', error.message);
    return null;
  }
}

function buildTokenParams() {
  const accessToken = process.env.STREAM_ACCESS_TOKEN || 'RjRe88VxHoVizcElPfzieQJiAInoJFD5GEQoNGspwsuaW2HNjfTvA66zjIs5KOkZT1zjR1wWIZa';
  const adminToken = process.env.STREAM_ADMIN_TOKEN || 'true';
  return `dnt=true&access_token=${accessToken}&admin_token=${adminToken}`;
}

const streamId = process.argv[2] || STREAM_ID;
getStreamUrl(streamId);