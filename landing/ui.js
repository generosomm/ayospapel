// Page UI: no imports, so the demo and copy button work even if the 3D scene can't load.

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Toast ---------- */
const toastEl = document.getElementById('toast');
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

/* ---------- Section entrances (staggered per section) ---------- */
const revealables = [...document.querySelectorAll('[data-reveal]')];
document.querySelectorAll('section').forEach(sec => {
  sec.querySelectorAll('[data-reveal]').forEach((el, i) => el.style.setProperty('--i', Math.min(i, 4)));
});
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }
  }, { rootMargin: '0px 0px -12% 0px' });
  revealables.forEach(el => io.observe(el));
} else {
  revealables.forEach(el => el.classList.add('in'));
}

/* ---------- Receipt demo ---------- */
const peso = n => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const RECEIPTS = {
  r1: {
    type: 'Purchase', store: 'Sunrise Mini Mart', owner: 'Sunrise Mini Mart Corp.', tin: '008-271-456-000',
    address: '12 Rizal Ave., Cavite City', date: 'Oct 14, 2026', no: 'SI No. 004512',
    items: [['Bond paper A4, 2 rm', 520], ['Ballpen, blue, 1 box', 180], ['Folder, long, 25s', 300]],
    gross: 1000, vatable: 892.86, vat: 107.14
  },
  r2: {
    type: 'Purchase', store: 'Bayanihan Hardware', owner: 'Bayanihan Hardware Trading', tin: '214-880-102-000',
    address: '45 Mabini St., Dasmariñas, Cavite', date: 'Oct 17, 2026', no: 'SI No. 018833',
    items: [['Steel cabinet, 4-drawer', 1960], ['Padlock, brass', 224], ['Shelf brackets, 4s', 280]],
    gross: 2464, vatable: 2200, vat: 264
  },
  r3: {
    type: 'Sale', store: 'Your store', owner: 'Luntian Café', tin: '301-552-778-000',
    address: '8 Aguinaldo Hwy., Imus, Cavite', date: 'Oct 18, 2026', no: 'SI No. 000127',
    items: [['Catering, 40 pax', 4800], ['Coffee service', 800]],
    gross: 5600, vatable: 5000, vat: 600
  }
};

const receiptEl = document.getElementById('receipt');
const fieldsEls = Object.fromEntries([...document.querySelectorAll('#fields dd')].map(d => [d.dataset.f, d]));
const statusEl = document.getElementById('read-status');
const saveBtn = document.getElementById('save');
const dlBtn = document.getElementById('download');
const rowsEl = document.getElementById('slsp-rows');
const picks = [...document.querySelectorAll('.pick')];
const saved = new Map();
let current = null;
let runId = 0;

function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function receiptHTML(r) {
  const isSale = r.type === 'Sale';
  const seller = isSale ? 'AYOS SAMPLE STORE' : r.store.toUpperCase();
  const sellerTin = isSale ? '123-456-789-000' : r.tin;
  const sellerAddr = isSale ? 'Your registered address' : r.address;
  return `
    <div class="c"><span class="hl" data-k="store">${esc(seller)}</span></div>
    <div class="c">VAT REG TIN <span class="hl" data-k="tin">${esc(sellerTin)}</span></div>
    <div class="c"><span class="hl" data-k="address">${esc(sellerAddr)}</span></div>
    <div class="gap"></div>
    <div class="rowx"><span>${esc(r.no)}</span><span class="hl" data-k="date">${esc(r.date)}</span></div>
    ${isSale ? `<div>SOLD TO: ${esc(r.owner)}</div><div>TIN: ${esc(r.tin)}</div>` : ''}
    <div class="gap"></div>
    ${r.items.map(([n, a]) => `<div class="rowx"><span>${esc(n)}</span><span>${a.toFixed(2)}</span></div>`).join('')}
    <div class="gap"></div>
    <div class="rowx"><span>VATable sales</span><span class="hl" data-k="vatable">${r.vatable.toFixed(2)}</span></div>
    <div class="rowx"><span>VAT 12%</span><span class="hl" data-k="vat">${r.vat.toFixed(2)}</span></div>
    <div class="rowx"><b>TOTAL</b><b class="hl" data-k="gross">${r.gross.toFixed(2)}</b></div>
    <div class="gap"></div>
    <div class="c">THIS SERVES AS A SALES INVOICE</div>
    <div class="bar-scan"></div>`;
}

function fieldValues(r) {
  const isSale = r.type === 'Sale';
  return {
    store: isSale ? `${r.owner} (customer)` : r.store,
    tin: r.tin,
    address: r.address,
    date: r.date,
    vatable: peso(r.vatable),
    vat: peso(r.vat),
    gross: peso(r.gross)
  };
}

const wait = ms => new Promise(res => setTimeout(res, reduceMotion ? 0 : ms));

async function read(id) {
  const my = ++runId;
  current = id;
  const r = RECEIPTS[id];
  picks.forEach(p => p.setAttribute('aria-pressed', String(p.dataset.id === id)));
  saveBtn.disabled = true;
  statusEl.className = 'read-status';
  statusEl.textContent = 'Reading the receipt…';
  Object.values(fieldsEls).forEach(d => { d.textContent = '-'; d.classList.remove('fill'); });

  receiptEl.classList.add('swap');
  await wait(220);
  if (my !== runId) return;
  receiptEl.innerHTML = receiptHTML(r);
  receiptEl.classList.remove('swap');

  const bar = receiptEl.querySelector('.bar-scan');
  bar.style.setProperty('--h', receiptEl.offsetHeight + 'px');
  if (!reduceMotion) bar.classList.add('go');

  // Fields light up as the scan passes them
  const vals = fieldValues(r);
  const order = ['store', 'tin', 'address', 'date', 'vatable', 'vat', 'gross'];
  const t0 = performance.now();
  for (const k of order) {
    const span = receiptEl.querySelector(`.hl[data-k="${k}"]`);
    const at = span ? (span.offsetTop / receiptEl.offsetHeight) * 1300 : 0;
    await wait(Math.max(0, at - (performance.now() - t0)));
    if (my !== runId) return;
    span?.classList.add('on');
    const dd = fieldsEls[k];
    dd.textContent = vals[k];
    dd.classList.remove('fill'); void dd.offsetWidth; dd.classList.add('fill');
  }
  await wait(250);
  if (my !== runId) return;
  statusEl.className = 'read-status ok';
  statusEl.textContent = saved.has(id)
    ? 'Already saved to the quarter.'
    : 'Done reading. Check it, then save.';
  saveBtn.disabled = saved.has(id);
  saveBtn.textContent = r.type === 'Sale' ? 'Save to Q4 sales' : 'Save to Q4 purchases';
}

picks.forEach(p => p.addEventListener('click', () => read(p.dataset.id)));

function renderSLSP(newId) {
  if (!saved.size) return;
  rowsEl.innerHTML = [...saved.keys()].map(id => {
    const r = RECEIPTS[id];
    const name = r.type === 'Sale' ? r.owner : r.owner;
    return `<tr class="${id === newId ? 'new' : ''}"><td>${r.type}</td><td>${r.tin}</td><td>${esc(name)}</td><td class="num">${peso(r.vatable)}</td><td class="num">${peso(r.vat)}</td><td class="num">${peso(r.gross)}</td></tr>`;
  }).join('');
  const sum = (type, key) => [...saved.keys()].map(k => RECEIPTS[k]).filter(r => r.type === type).reduce((a, r) => a + r[key], 0);
  const set = (id, v) => { const el = document.getElementById(id); const txt = peso(v); if (el.textContent !== txt) { el.textContent = txt; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); } };
  set('t-pur', sum('Purchase', 'gross'));
  set('t-in', sum('Purchase', 'vat'));
  set('t-sal', sum('Sale', 'gross'));
  set('t-out', sum('Sale', 'vat'));
  dlBtn.disabled = false;
}

saveBtn.addEventListener('click', () => {
  if (!current || saved.has(current)) return;
  saved.set(current, true);
  saveBtn.disabled = true;
  statusEl.textContent = 'Saved. It is now in the SLSP below.';
  renderSLSP(current);
  toast(RECEIPTS[current].type === 'Sale' ? 'Saved to Q4 sales' : 'Saved to Q4 purchases');
});

dlBtn.addEventListener('click', () => {
  const head = ['Type', 'TIN', 'Registered name', 'Address', 'Date', 'Taxable', 'VAT', 'Gross'];
  const lines = [head, ...[...saved.keys()].map(id => {
    const r = RECEIPTS[id];
    return [r.type, r.tin, r.owner, r.address, r.date, r.vatable.toFixed(2), r.vat.toFixed(2), r.gross.toFixed(2)];
  })].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'SLSP-Q4-2026-sample.csv' });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Sample SLSP downloaded');
});

/* ---------- Proposal summary ---------- */
const SUMMARY = `AyosPapel: resibo in, SLSP out

What it does
- Picture a receipt and it reads the TIN, store name, address, date, and VAT. Just check and save.
- Sales and purchases organized by month and quarter, searchable by store, TIN, or date.
- A digital copy of every receipt, saved before the ink fades.
- One click turns the quarter's receipts into the Summary List of Sales and Purchases (SLSP). The exact BIR file format will be confirmed before building.
- Totals for sales, purchases, and VAT per month and quarter.
- Reminders before BIR deadlines.
- Records where the original papers are kept and when they were returned.
- Secure login on phone and laptop. Each business keeps its own books.

No tokens, no per-scan fees.

Not in the first version: filing directly with the BIR, tax computation, payroll.

Pilot: one business, one quarter.`;

document.getElementById('copy-summary').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(SUMMARY);
    toast('Proposal summary copied');
  } catch {
    toast("Couldn't copy. Select the text on this page instead.");
  }
});
