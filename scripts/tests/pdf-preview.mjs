/* Maakt een echte PDF met de code uit index.html, zodat je hem kunt openen en bekijken.
   Node heeft geen DOM, dus dezelfde stubs als de testharnas — plus de echte jspdf erbij,
   want die is het enige dat hier niet gestubt mag worden. Gebruik: node scripts/tests/pdf-preview.mjs */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
applyPlugin(jsPDF);

const here = path.dirname(fileURLToPath(import.meta.url));
const INDEX = path.join(here, '..', '..', 'index.html');
const UIT = process.argv[3] || path.join(here, '..', '..', '_backups', 'pdf-preview.pdf');

const Lc = o => Object.assign({mode:'month',dagType:'nr',dag:25,dag2:31,wd:5,wdN:5,intervalWeeks:4,start:'',vanaf:'',tot:'',weekend:'',feest:true,dates:[]}, o);
const W = loon => ({ritmeN:1,ritmeU:'dienst',klaarDag:1,correctie:'later',nabetaalMode:'loondag',nabetaalN:1,nabetaalU:'w',nabetaalDatum:'',actief:true,loon});

const PERSONA = {
  naam:'Anita', modules:{uren:true,potjes:true,loon:true,recept:true},
  werkgevers:['Zorggroep West','Uitzendbureau Flex'],
  werkCfg:{'Zorggroep West':W(Lc({dagType:'werkdag',weekend:'voor'})),
           'Uitzendbureau Flex':W(Lc({mode:'weeks',intervalWeeks:1,start:'2026-07-31',vanaf:'2026-07-31'}))},
  contract:{'Zorggroep West':28},
  shifts:[{id:'s1',werk:'Zorggroep West',date:'2026-07-28',start:'07:00',end:'15:30',pauze:30},
          {id:'s2',werk:'Zorggroep West',date:'2026-07-30',start:'14:00',end:'22:00',pauze:30},
          {id:'s3',werk:'Uitzendbureau Flex',date:'2026-08-02',start:'20:00',end:'04:00',pauze:0}],
  potjes:[{n:'Vaste lasten',maand:0,saldo:812.4,items:[
      {id:'i1',n:'Huur',v:945,fn:1,fu:'m',due:'2026-08-01',paidDates:{},skipDates:{},
       toeslagen:[{id:'t1',naam:'Huurtoeslag',v:312,fn:1,fu:'m',date:'2026-08-20',receivedDates:{},recSkipDates:{}}]},
      {id:'i2',n:'Zorgverzekering',v:148.2,fn:1,fu:'m',due:'2026-08-05',paidDates:{},skipDates:{},
       toeslagen:[{id:'t2',naam:'Zorgtoeslag',v:127,fn:1,fu:'m',date:'2026-08-20',receivedDates:{},recSkipDates:{}}]},
      {id:'i3',n:'Autoverzekering',v:540,fn:1,fu:'j',due:'2026-11-14',paidDates:{},skipDates:{},toeslagen:[]},
      {id:'i4',n:'Auto-onderhoud',buffer:true,v:33,fn:1,fu:'m',paidDates:{},skipDates:{},toeslagen:[]}],
    log:[{id:'g1',kind:'uitgave',amount:945,date:'2026-07-01',note:'Huur juli',itemId:'i1'},
         {id:'g2',kind:'uitgave',amount:210,date:'2026-06-12',note:'Remmen vervangen',itemId:'i4'},
         {id:'g3',kind:'uitgave',amount:148.2,date:'2026-07-05',note:'',itemId:'i2'}]},
    {n:'Vakantie',maand:150,saldo:1240,spaar:true,items:[],log:[]}],
  loon:Lc({dagType:'werkdag',weekend:'voor'}),
  loonLog:[{id:'l1',date:'2026-05-29',amount:1910,payIso:'2026-05-29',werk:'Zorggroep West'},
           {id:'l2',date:'2026-06-30',amount:2680,payIso:'2026-06-30',werk:'Zorggroep West',note:'incl. vakantiegeld'},
           {id:'l3',date:'2026-07-31',amount:1905,payIso:'2026-07-31',werk:'Zorggroep West'},
           {id:'l4',date:'2026-07-31',amount:420,payIso:'2026-07-31',werk:'Uitzendbureau Flex'}],
  documenten:[{id:'d1',n:'ID-kaart Anita',type:'ID-kaart',verloopt:'2026-11-12',warnN:3,warnU:'m'}],
  docTypes:['ID-kaart','Paspoort','Rijbewijs','Bankpas'],
  receptCategorieen:['Avondeten'], recepten:[], rekeningen:[], boodschappen:[],
  setup:true, feat:{}, lock:{on:false,pin:''}, meldingen:true, meldTijd:'08:00', overboek:{}, backup:{on:true},
};
if (process.argv[2] === 'geen-uren') { PERSONA.modules = {uren:false,potjes:true,loon:true,recept:false}; PERSONA.naam='Wim'; }

const html = fs.readFileSync(INDEX, 'utf8').replace(/\r\n/g, '\n');
const i = html.indexOf('<script>\n/* ===== CAPACITOR');
/* De app vangt een PDF-fout netjes af met een toast, zodat hij blijft draaien. Voor dit hulpmiddel
   willen we de fout juist zien, anders krijg je alleen "geen bestand" en weet je nog niets. */
const body = html.slice(i + 9, html.lastIndexOf('</script>'))
  .replace("}catch(e){toast('Het maken van de PDF is niet gelukt. Er is niets veranderd aan je gegevens.');}", "}catch(e){throw e;}");
const store = { mijnapp_v1: JSON.stringify(PERSONA) };
const mk = () => ({ style:{}, classList:{add(){},remove(){},toggle(){},contains(){return false;}}, dataset:{}, value:'',
  options:{length:0}, add(){}, addEventListener(){}, querySelector:()=>null, querySelectorAll:()=>[],
  insertAdjacentHTML(){}, focus(){}, select(){}, innerHTML:'', textContent:'', scrollTop:0,
  removeAttribute(){}, setAttribute(){}, closest:()=>null, remove(){} });
const g = {
  localStorage:{ getItem:k=>store[k]||null, setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];},
    key:n=>Object.keys(store)[n], get length(){return Object.keys(store).length;} },
  document:{ getElementById:()=>mk(), querySelector:()=>mk(), querySelectorAll:()=>[], createElement:()=>mk(),
    body:mk(), documentElement:mk(), addEventListener(){} },
  window:{ addEventListener(){}, removeEventListener(){}, matchMedia:()=>({matches:false,addEventListener(){}}),
    scrollTo(){}, location:{reload(){}}, jspdf:{ jsPDF } },
  navigator:{ vibrate(){}, serviceWorker:{ register:()=>Promise.resolve() } },
  fetch:()=>Promise.reject(new Error('geen netwerk')),
  setTimeout:(fn)=>0, clearTimeout(){}, setInterval:()=>0,
};
for (const k of Object.keys(g)) { try { Object.defineProperty(globalThis, k, {value:g[k],writable:true,configurable:true}); } catch(e) {} }

/* De app roept doc.save(naam) aan om te downloaden. In Node bestaat downloaden niet, dus we geven de
   app een jsPDF die per document een eigen save() heeft die het bestand gewoon wegschrijft.
   (save staat níét op het prototype maar op de instantie zelf, vandaar deze omweg.) */
globalThis.window.jspdf = { jsPDF: function(...a){ const d = new jsPDF(...a);
  d.save = () => fs.writeFileSync(UIT, Buffer.from(d.output('arraybuffer'))); return d; } };
const api = new Function(body + '\n;return {exportOverzichtPDF,db};')();
await api.exportOverzichtPDF();
console.log('geschreven: ' + UIT + '  (' + fs.statSync(UIT).size + ' bytes)');
