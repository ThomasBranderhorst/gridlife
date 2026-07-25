import { run } from './harness.mjs';
const basis = () => ({
  setup:true,naam:'T',modules:{uren:true,potjes:true,loon:true,recept:true},feat:{},lock:{on:false,pin:''},
  werkgevers:['W'],werkCfg:{},contract:{},shifts:[],potjes:[],rekeningen:[],boodschappen:[],
  loon:{mode:'month',dag:25,intervalWeeks:4,start:''},loonLog:[],meldingen:true,meldTijd:'08:00',
  overboek:{},backup:{on:true},receptCategorieen:[],recepten:[],documenten:[],docTypes:['X']
});
const cases = {
  'lege app (nieuwe gebruiker)': null,
  'standaard data': basis(),
  'kapotte dienstdatum': (d=>{d.shifts=[{id:'a',werk:'W',date:'niet-een-datum',start:'',end:'',pauze:0}];return d;})(basis()),
  'dienst zonder datum': (d=>{d.shifts=[{id:'a',werk:'W',start:'09:00',end:'17:00',pauze:0}];return d;})(basis()),
  'negatief loon-interval': (d=>{d.loon={mode:'weeks',dag:25,intervalWeeks:-3,start:'2026-01-01'};return d;})(basis()),
  'loondag NaN': (d=>{d.loon={mode:'month',dag:'x',intervalWeeks:4,start:''};return d;})(basis()),
  'potje zonder items-array': (d=>{d.potjes=[{n:'P',saldo:5}];return d;})(basis()),
  'kostenpost zonder frequentie': (d=>{d.potjes=[{n:'P',saldo:5,log:[],items:[{id:'i',n:'x',v:10,due:'2026-07-01'}]}];return d;})(basis()),
  'negatieve frequentie': (d=>{d.potjes=[{n:'P',saldo:5,log:[],items:[{id:'i',n:'x',v:10,fn:-4,fu:'m',due:'2026-07-01'}]}];return d;})(basis()),
  'frequentie 0': (d=>{d.potjes=[{n:'P',saldo:5,log:[],items:[{id:'i',n:'x',v:10,fn:0,fu:'m',due:'2026-07-01'}]}];return d;})(basis()),
  'kapotte due-datum': (d=>{d.potjes=[{n:'P',saldo:5,log:[],items:[{id:'i',n:'x',v:10,fn:1,fu:'m',due:'zomaar'}]}];return d;})(basis()),
  'werkgevers null': (d=>{d.werkgevers=null;return d;})(basis()),
  'werkCfg null': (d=>{d.werkCfg=null;return d;})(basis()),
  'loon ontbreekt': (d=>{delete d.loon;return d;})(basis()),
  'alles null': {setup:true,modules:null,potjes:null,shifts:null,werkgevers:null,loon:null,recepten:null,documenten:null},
  'oude versie (geen ctrl/werkCfg)': (d=>{d.shifts=[{id:'a',werk:'W',date:'2026-07-01',start:'09:00',end:'17:00',pauze:30,status:'bad',mist:'30 min'}];return d;})(basis()),
  'heel veel diensten (5 jaar)': (d=>{d.shifts=Array.from({length:1800},(_,i)=>{const dt=new Date(2021,0,1+i);return{id:'s'+i,werk:'W',date:dt.toISOString().slice(0,10),start:'09:00',end:'17:00',pauze:30};});return d;})(basis()),
  // nieuwe loonmodi, ook in kapotte vorm
  '2x per maand': (d=>{d.loon={mode:'twice',dag:15,dag2:31};return d;})(basis()),
  '2x per maand, dag2 ontbreekt': (d=>{d.loon={mode:'twice',dag:15};return d;})(basis()),
  'laatste vrijdag van de maand': (d=>{d.loon={mode:'month',dagType:'weekdag',wd:5,wdN:5};return d;})(basis()),
  'laatste werkdag van de maand': (d=>{d.loon={mode:'month',dagType:'werkdag'};return d;})(basis()),
  'wisselende loondag': (d=>{d.loon={mode:'manual',dates:['2026-08-03','2026-09-11']};return d;})(basis()),
  'wisselend zonder datums': (d=>{d.loon={mode:'manual'};return d;})(basis()),
  'wisselend met rommel in de lijst': (d=>{d.loon={mode:'manual',dates:['x',null,42,{},'2026-08-03']};return d;})(basis()),
  'dates is een string i.p.v. lijst': (d=>{d.loon={mode:'manual',dates:'2026-08-03'};return d;})(basis()),
  'onbekende loonmodus': (d=>{d.loon={mode:'ietsnieuws',dag:25};return d;})(basis()),
  'loon is een lijst': (d=>{d.loon=[1,2,3];return d;})(basis()),
  'werkgever met kapotte loon-instelling': (d=>{d.werkCfg={W:{actief:true,loon:{mode:'twice',dag:'x',dag2:null,dates:'nee'}}};return d;})(basis()),
  'werkgever-config is null': (d=>{d.werkCfg={W:null};return d;})(basis()),
  'feestdagen-veld is rommel': (d=>{d.loon={mode:'month',dag:25,weekend:'voor',feest:'misschien'};return d;})(basis()),
};
let stuk = 0;
for (const [naam, data] of Object.entries(cases)) {
  const r = run(data, api => ({
    periode: api.currentPeriodKey(),
    volgend: (()=>{const p=api.nextPayday(api.db.loon);return p&&!isNaN(p)?api.isoDate(p):String(p);})(),
    perJaar: api.loonDatesInRange(new Date(2026,0,1), new Date(2026,11,31)).length,
    potTot: (api.db.potjes||[]).map(p=>api.potTot(p)),
    diensten: (api.db.shifts||[]).length,
  }));
  if (r.fout) { stuk++; console.log('STUK  ' + naam + '\n      ' + r.fout); }
  else console.log('ok    ' + naam + '  ' + JSON.stringify(r.extra));
}
console.log('\n' + (stuk ? stuk + ' GEVALLEN STUK' : 'alle ' + Object.keys(cases).length + ' gevallen starten op'));
