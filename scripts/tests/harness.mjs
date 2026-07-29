// Draait het app-script in node met gestubte DOM/localStorage, tegen een meegegeven dataset.
// Vangt opstartfouten die in de browser pas zichtbaar worden als een half-dood scherm.
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
/* De index.html naast deze tests (repo-root), niet een vast pad — anders test een worktree
   stiekem de hoofdmap. Regeleindes eerst normaliseren: met CRLF vond de zoekactie hieronder
   het script-blok niet en werd er rauwe HTML uitgevoerd. */
const INDEX = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'index.html');
export function run(data, extra) {
  const html = fs.readFileSync(INDEX, 'utf8').replace(/\r\n/g, '\n');
  const i = html.indexOf('<script>\n/* ===== CAPACITOR');
  if (i < 0) throw new Error('script-blok niet gevonden in ' + INDEX);
  const j = html.lastIndexOf('</script>');
  const body = html.slice(i + 9, j);
  const store = data ? { mijnapp_v1: JSON.stringify(data) } : {};
  const mk = () => ({
    style: {}, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    dataset: {}, value: '', options: { length: 0 }, add() {}, addEventListener() {},
    querySelector: () => null, querySelectorAll: () => [], insertAdjacentHTML() {},
    focus() {}, select() {}, innerHTML: '', textContent: '', scrollTop: 0,
    removeAttribute() {}, setAttribute() {}, closest: () => null, remove() {},
  });
  const g = {
    localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; }, key: n => Object.keys(store)[n], get length() { return Object.keys(store).length; } },
    document: { getElementById: () => mk(), querySelector: () => mk(), querySelectorAll: () => [], createElement: () => mk(), body: mk(), documentElement: mk(), addEventListener() {} },
    window: { addEventListener() {}, removeEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {} }), scrollTo() {}, location: { reload() {} }, jspdf: null },
    navigator: { vibrate() {}, serviceWorker: { register: () => Promise.resolve() } },
    fetch: () => Promise.reject(new Error('geen netwerk in test')),
    setTimeout: (fn, ms) => 0, clearTimeout() {}, setInterval: () => 0,
  };
  for(const k of Object.keys(g)){try{Object.defineProperty(globalThis,k,{value:g[k],writable:true,configurable:true});}catch(e){}}
  const out = { fout: null, api: null };
  try {
    const fn = new Function(body + '\n;return {db,_loadFout,_techFout,currentPeriodKey,nextPayday,nextPaydayEff,upcomingPaydays,loonDatesInRange,loonShift,rawNextPayday,rawPaydayAfter,rawPaydayBefore,monthPaydays,manualDates,schoonLoonCfg,feestdagen,feestNaam,pasen,laatsteWerkdag,weekdagInMaand,loonKort,loonDagTekst,loonFreqTekst,loonShiftTekst,loonEntryFor,avgIncome,featOn,potTot,potMonthStatus,potProjectie,toeslagenOf,toeVan,toeVanLog,toeLabel,toeReceived,toeMnd,itToeslagMnd,itMnd,receiptRows,paymentRows,markOccurrence,unmarkOccurrence,skipOccurrence,unskipOccurrence,openTermijnen,vasteTermijnen,zelfdeTermijn,inSchema,raakteSaldo,itemPaid,itemSkipped,dateHint,amountHint,hintLogs,removeLogEntry,hoursOf,occInRange,migrate,geldigeDatum,parseISO,MND,DAG,fmtDur,eur,isoDate};');
    out.api = fn();
    /* Een fout in migrate() wordt in de app netjes opgevangen zodat hij blijft draaien — maar dan zijn
       je gegevens dus NIET bijgewerkt. In de test moet dat gewoon hard opvallen. */
    if (out.api._loadFout) out.fout = 'opgevangen fout bij opstarten: ' + (out.api._techFout || out.api._loadFout);
    if (extra) out.extra = extra(out.api);
  } catch (e) {
    out.fout = e.message + ' | ' + (e.stack || '').split('\n')[1];
  }
  return out;
}
