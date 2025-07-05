import { WebSocket } from 'ws';

let ws; // cached connection

async function ensureConnection() {
  if (ws && ws.readyState === WebSocket.OPEN) return;
  const url = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${process.env.AGENT_ID}`;
  ws = new WebSocket(url, {
    headers: { 'xi-api-key': process.env.API_KEY }
  });
  await new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Only POST allowed');
  }
  await ensureConnection().catch(err => {
    console.error('WS connect error', err);
    return res.status(502).json({ error: 'WebSocket connection failed' });
  });

  const { text } = req.body;
  ws.send(JSON.stringify({ type: 'user_message', text }));

  ws.once('message', data => {
    res.status(200).json(JSON.parse(data.toString()));
  });
}
