import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

await page.goto('http://localhost:3000/login');
await page.fill('input[name="email"]', 'latam@userdesigners.com');
await page.fill('input[name="password"]', 'CuencaHouse2026!');
await Promise.all([page.waitForURL(u => u.href.includes('/leads'), { timeout: 15000 }), page.click('button[type="submit"]')]);

async function chat(message, convId) {
  return page.evaluate(async ({ msg, cid }) => {
    const r = await fetch('/api/agents/qualify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, conversationId: cid, channel: 'web' })
    });
    return r.json();
  }, { msg: message, cid: convId });
}

const results = [];

function test(name, reply, action, checks) {
  const passed = checks.every(c => c.fn(reply, action));
  results.push({ name, passed });
  console.log(passed ? '✅' : '❌', name);
  if (!passed) checks.forEach(c => { if (!c.fn(reply, action)) console.log('   FAIL:', c.label); });
  console.log('  ', reply.substring(0, 110));
  console.log('   Action:', action, '\n');
}

// 1. Info completa primer mensaje
let r = await chat('Hola soy María, busco casa para comprar en El Batán, hasta $200k, para 2 meses');
test('Info completa — no repite preguntas', r.reply, r.action, [
  { label: 'No pide presupuesto (ya lo dio)', fn: rep => !rep.toLowerCase().includes('presupuesto') },
  { label: 'Menciona el nombre María', fn: rep => rep.toLowerCase().includes('mar') },
]);

// 2. Solo hola
r = await chat('hola');
test('Solo hola — saluda y abre', r.reply, r.action, [
  { label: 'Responde cálidamente', fn: rep => rep.toLowerCase().includes('hola') || rep.toLowerCase().includes('bienvenid') },
  { label: 'Máximo 2 preguntas', fn: rep => (rep.match(/\?/g) || []).length <= 2 },
]);

// 3. Presupuesto bajo
r = await chat('Tengo $35,000 para invertir en algo en Cuenca');
test('Presupuesto bajo $35k — tono positivo', r.reply, r.action, [
  { label: 'No dice que no hay nada', fn: rep => !rep.toLowerCase().includes('lo siento') },
  { label: 'Tono positivo / terreno', fn: rep => rep.toLowerCase().includes('opci') || rep.toLowerCase().includes('interesant') || rep.toLowerCase().includes('terren') },
]);

// 4. Lead que quiere vender
r = await chat('Quiero vender mi casa en Totoracocha, tiene 3 pisos y 250m2');
test('Lead vendedor — recopila datos propiedad', r.reply, r.action, [
  { label: 'No lo trata como comprador', fn: rep => !rep.toLowerCase().includes('presupuesto para comprar') },
  { label: 'Pide info de su propiedad', fn: rep => rep.includes('precio') || rep.includes('valor') || rep.includes('foto') || rep.includes('ubic') },
]);

// 5. Inglés
r = await chat('Hi! I am looking for a property to buy in Cuenca, I have $180k budget');
test('Inglés — responde en inglés', r.reply, r.action, [
  { label: 'Sin caracteres de español', fn: rep => !rep.includes('¡') && !rep.includes('ó') && !rep.includes('ú') },
  { label: 'Respuesta en inglés', fn: rep => rep.includes('Hi') || rep.includes('Great') || rep.includes('have') || rep.includes('looking') || rep.includes('budget') },
]);

// 6. Solo explorando
r = await chat('Solo estoy explorando, no tengo prisa ninguna');
test('Solo explorando — no presiona', r.reply, r.action, [
  { label: 'No genera urgencia falsa', fn: rep => !rep.toLowerCase().includes('última') && !rep.toLowerCase().includes('oferta') },
  { label: 'Abre la conversación', fn: rep => rep.includes('?') || rep.toLowerCase().includes('perfecto') || rep.toLowerCase().includes('claro') },
]);

// 7. Es un bot?
r = await chat('Eres un bot o una persona?');
test('Pregunta si es bot — honesto sin mentir', r.reply, r.action, [
  { label: 'Menciona asistente/digital/equipo', fn: rep => rep.toLowerCase().includes('asistente') || rep.toLowerCase().includes('digital') || rep.toLowerCase().includes('equipo') },
  { label: 'No dice que es humano', fn: rep => !rep.toLowerCase().includes('soy una persona') && !rep.toLowerCase().includes('soy humano') },
]);

// 8. Quiere asesor humano
r = await chat('Prefiero hablar con una persona, con Verónica si es posible');
test('Quiere humano — escala apropiadamente', r.reply, r.action, [
  { label: 'Menciona que el equipo contactará', fn: rep => rep.toLowerCase().includes('equipo') || rep.toLowerCase().includes('asesora') || rep.toLowerCase().includes('pronto') || rep.toLowerCase().includes('contactar') },
]);

// 9. Mensaje larguísimo con toda la info
r = await chat('Hola soy Juan, vivo en Quito y quiero mudarme a Cuenca con mi familia de 4, busco casa 3 habitaciones con jardín, presupuesto entre $130k y $160k, zona tranquila preferiblemente Lomas de Turi, para los próximos 6 meses');
test('Mensaje completo — avanza sin repregunta', r.reply, r.action, [
  { label: 'No pide habitaciones (ya dio)', fn: rep => !rep.toLowerCase().includes('cuántas habitaciones') },
  { label: 'No pide presupuesto (ya dio)', fn: rep => !rep.toLowerCase().includes('presupuesto') },
  { label: 'Avanza hacia propiedades', fn: (rep, action) => action === 'show_properties' || action === 'qualified' || rep.toLowerCase().includes('lomas') || rep.toLowerCase().includes('zona') },
]);

// 10. Matcher completo Misicata
r = await chat('quiero departamento VIP en Misicata, hasta $115k');
const r10b = await chat('sí, para comprar y lo necesito pronto', r.conversationId);
test('Matcher completo — muestra propiedades reales', r10b.reply, r10b.action, [
  { label: 'Muestra propiedades (emojis de propiedad)', fn: rep => rep.includes('🏠') || rep.includes('📍') || rep.includes('💰') },
  { label: 'Incluye precio real', fn: rep => rep.includes('107') || rep.includes('112') || rep.includes('115') },
  { label: 'Incluye link de fotos', fn: rep => rep.includes('photos.app') || rep.includes('fotos') },
]);

console.log('\n━━━ RESUMEN FINAL ━━━');
const passed = results.filter(r => r.passed).length;
const total = results.length;
console.log(`${passed}/${total} pruebas pasadas ${passed === total ? '🎉' : ''}`);
if (passed < total) {
  console.log('\nFallidas:');
  results.filter(r => !r.passed).forEach(r => console.log('  ❌', r.name));
}

await browser.close();
