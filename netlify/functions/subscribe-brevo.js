// netlify/functions/subscribe-brevo.js
// Añade/actualiza un contacto en Brevo en la lista indicada (LIST_ID)
const handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { email, name } = JSON.parse(event.body || '{}');
    if (!email) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing email' }) };

    const API_KEY = process.env.BREVO_API_KEY;
    const LIST_ID = Number(process.env.BREVO_LIST_ID); // <-- en Netlify pondrás 3
    if (!API_KEY || !LIST_ID) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Missing env vars' }) };
    }

    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { accept: 'application/json', 'api-key': API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        email,
        listIds: [LIST_ID],
        updateEnabled: true,
        attributes: { NOMBRE: name || '' }
      })
    });

    if (!res.ok) {
      const txt = await res.text();
      return { statusCode: res.status, headers, body: JSON.stringify({ error: 'Brevo error', details: txt }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

exports.handler = handler;
