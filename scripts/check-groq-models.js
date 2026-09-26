const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');

// Check all 3 keys
const keys = {};
for (const line of env.split('\n')) {
  if (line.startsWith('GROQ_API_KEY_1=')) keys.KEY1 = line.split('=').slice(1).join('=').trim().replace(/"/g, '');
  if (line.startsWith('GROQ_API_KEY_2=')) keys.KEY2 = line.split('=').slice(1).join('=').trim().replace(/"/g, '');
  if (line.startsWith('GROQ_API_KEY=')) keys.KEY3 = line.split('=').slice(1).join('=').trim().replace(/"/g, '');
}

async function checkKey(name, key) {
  const r = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { Authorization: 'Bearer ' + key }
  });
  const d = await r.json();
  const models = (d.data || []).map(m => m.id);
  const hasVision = models.some(id => id.includes('llama-4') || id.includes('vision') || id.includes('scout') || id.includes('maverick'));
  console.log('\n' + name + ' (' + key.substring(0,12) + '...): ' + models.length + ' models, vision=' + hasVision);
  models.forEach(m => console.log('  -', m));
}

Promise.all(Object.entries(keys).map(([n, k]) => checkKey(n, k))).catch(console.error);
