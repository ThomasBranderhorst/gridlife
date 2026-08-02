/* Chaos-test: iemand die willekeurig in de app zit te rommelen. Toevoegen, weer weggooien, een module
   uitzetten en weer aan, een bedrag leegmaken, een werkgever verwijderen waar nog loon aan hangt.
   Na ELKE handeling herstart de app (migrate) en tekenen we alle schermen, en daarna controleren we of
   het overzicht nog klopt. Er is geen enkele volgorde die de app onbruikbaar mag maken.

   De willekeur zit aan een vaste startwaarde, dus een fout is altijd exact te herhalen: de meldregel
   noemt de stap en de handeling die hem veroorzaakte. */
import { run } from './harness.mjs';

const check=[];
const meld=(n,ok,det)=>{check.push((ok?'ok   ':'FOUT ')+n+(det?'  '+det:''));};

/* Eigen toevalsgenerator: Math.random zou elke run een ander verhaal geven en dan is een fout die
   één op de twintig keer opduikt niet meer na te spelen. */
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}

const START={
  setup:true,naam:'T',modules:{uren:true,potjes:true,loon:true,recept:true},feat:{},lock:{on:false,pin:''},
  werkgevers:['Sincere','Albert Heijn'],
  werkCfg:{
    Sincere:{ritmeN:1,ritmeU:'dienst',klaarDag:1,correctie:'later',nabetaalMode:'loondag',actief:true,
      loon:{mode:'month',dag:25,intervalWeeks:4,start:''}},
    'Albert Heijn':{ritmeN:1,ritmeU:'dienst',klaarDag:1,correctie:'later',nabetaalMode:'loondag',actief:false,
      loon:{mode:'month',dag:4,intervalWeeks:4,start:''}}
  },
  contract:{},shifts:[{id:'s1',werk:'Sincere',date:'2026-07-01',start:'09:00',end:'17:00',pauze:30}],
  rekeningen:[],boodschappen:[],receptCategorieen:['Snel'],recepten:[{n:'Pasta',ing:[{n:'Pasta'}]}],
  documenten:[{id:'d1',n:'Paspoort',type:'ID',verloopt:'2027-03-01'}],docTypes:['ID'],
  overboek:{},backup:{on:true},meldingen:true,meldTijd:'08:00',
  loon:{mode:'month',dag:25,intervalWeeks:4,start:''},
  loonLog:[{id:'p1',date:'2026-06-27',amount:1800,payIso:'2026-06-25'},
           {id:'p2',date:'2026-07-25',amount:1810,payIso:'2026-07-25'}],
  potjes:[
    {n:'Vaste lasten',saldo:1200,maand:0,items:[
      {id:'i1',n:'Huur',v:820,fn:1,fu:'m',due:'2026-08-01'},
      {id:'i2',n:'Zorgverzekering',v:148.5,fn:1,fu:'m',due:'2026-08-27',
       toeslagen:[{id:'t1',naam:'Zorgtoeslag',v:127,fn:1,fu:'m',date:'2026-08-20'}]},
      {id:'i3',n:'Kleding',v:40,fn:1,fu:'m',buffer:true}],log:[]},
    {id:'p2',n:'Vakantie',saldo:300,maand:50,items:[],log:[]}
  ]
};

const MODULES=['uren','potjes','loon','recept'];
const FEATS=['comp','hints','loonlog','ontvangst','toeslag','buffers','stats','documenten','contract','once','opzijtel'];
const FU=['d','w','m','j'];
const MODES=['month','weeks','twice','manual'];
const ROMMEL=['',null,undefined,'niet-een-datum','2026-02-31','0000-00-00'];

/* Elke handeling is iets wat een gebruiker echt kan doen, inclusief het weer ongedaan maken. */
const ACTIES=[
 ['potje erbij', (a,r)=>{a.db.potjes.push({n:'Potje '+Math.floor(r()*99),saldo:Math.floor(r()*500),maand:0,items:[],log:[]});}],
 ['potje weg', (a,r)=>{if(a.db.potjes.length)a.db.potjes.splice(Math.floor(r()*a.db.potjes.length),1);}],
 ['kostenpost erbij', (a,r)=>{const p=a.db.potjes[Math.floor(r()*a.db.potjes.length)];if(!p)return;
   p.items=p.items||[];p.items.push({id:'x'+Math.floor(r()*1e6),n:'Post '+Math.floor(r()*99),
     v:Math.floor(r()*400),fn:1+Math.floor(r()*4),fu:FU[Math.floor(r()*FU.length)],due:'2026-0'+(1+Math.floor(r()*9))+'-1'+Math.floor(r()*9)});}],
 ['kostenpost weg', (a,r)=>{const p=a.db.potjes[Math.floor(r()*a.db.potjes.length)];
   if(p&&p.items&&p.items.length)p.items.splice(Math.floor(r()*p.items.length),1);}],
 ['toeslag erbij', (a,r)=>{const p=a.db.potjes[Math.floor(r()*a.db.potjes.length)];const it=p&&p.items&&p.items[Math.floor(r()*p.items.length)];
   if(!it)return;it.toeslagen=it.toeslagen||[];it.toeslagen.push({id:'t'+Math.floor(r()*1e6),naam:'Toeslag',v:Math.floor(r()*200),fn:1,fu:'m',date:'2026-08-20'});}],
 ['toeslag weg', (a,r)=>{const p=a.db.potjes[Math.floor(r()*a.db.potjes.length)];const it=p&&p.items&&p.items[Math.floor(r()*p.items.length)];
   if(it&&it.toeslagen&&it.toeslagen.length)it.toeslagen.splice(Math.floor(r()*it.toeslagen.length),1);}],
 ['module omzetten', (a,r)=>{const k=MODULES[Math.floor(r()*MODULES.length)];a.db.modules[k]=!(a.db.modules[k]!==false);}],
 ['functie omzetten', (a,r)=>{const k=FEATS[Math.floor(r()*FEATS.length)];a.db.feat[k]=!(a.db.feat[k]!==false);}],
 ['werkgever erbij', (a,r)=>{const n='Baan '+Math.floor(r()*99);if(a.db.werkgevers.includes(n))return;
   a.db.werkgevers.push(n);a.db.werkCfg[n]={ritmeN:1,ritmeU:'dienst',klaarDag:1,correctie:'later',nabetaalMode:'loondag',
     actief:r()<0.5,loon:{mode:'month',dag:1+Math.floor(r()*28),intervalWeeks:4,start:''}};}],
 ['werkgever weg', (a,r)=>{if(!a.db.werkgevers.length)return;const i=Math.floor(r()*a.db.werkgevers.length);
   const w=a.db.werkgevers[i];a.db.werkgevers.splice(i,1);delete a.db.werkCfg[w];}],
 ['in of uit dienst', (a,r)=>{const w=a.db.werkgevers[Math.floor(r()*a.db.werkgevers.length)];
   const c=w&&a.db.werkCfg[w];if(c)c.actief=!(c.actief!==false);}],
 ['loonritme wijzigen', (a,r)=>{a.db.loon.mode=MODES[Math.floor(r()*MODES.length)];a.db.loon.dag=1+Math.floor(r()*31);
   a.db.loon.intervalWeeks=1+Math.floor(r()*5);if(r()<0.3)a.db.loon.dates=[];}],
 ['eerste loondag wijzigen', (a,r)=>{a.db.loon.vanaf=r()<0.5?'':'2026-0'+(1+Math.floor(r()*9))+'-15';}],
 ['loon erbij', (a,r)=>{a.db.loonLog.push({id:'L'+Math.floor(r()*1e6),date:'2026-0'+(1+Math.floor(r()*9))+'-2'+Math.floor(r()*9),
   amount:Math.floor(r()*2500)});}],
 ['loon weg', (a,r)=>{if(a.db.loonLog.length)a.db.loonLog.splice(Math.floor(r()*a.db.loonLog.length),1);}],
 ['betaling afvinken', (a,r)=>{const rows=a.paymentRows(new Date(2026,0,1),new Date(2027,0,1));
   const x=rows[Math.floor(r()*rows.length)];if(x&&!x.paid)a.markOccurrence(x.pi,x.it.id,x.iso,'uitgave',x.net,x.iso);}],
 ['betaling uitvinken', (a,r)=>{const rows=a.paymentRows(new Date(2026,0,1),new Date(2027,0,1)).filter(x=>x.paid);
   const x=rows[Math.floor(r()*rows.length)];if(x)a.unmarkOccurrence(x.pi,x.it.id,x.iso,'uitgave');}],
 ['betaling overslaan', (a,r)=>{const rows=a.paymentRows(new Date(2026,0,1),new Date(2027,0,1)).filter(x=>!x.paid&&!x.skipped);
   const x=rows[Math.floor(r()*rows.length)];if(x)a.skipOccurrence(x.pi,x.it.id,x.iso,'uitgave');}],
 ['overslaan terugdraaien', (a,r)=>{const rows=a.paymentRows(new Date(2026,0,1),new Date(2027,0,1)).filter(x=>x.skipped);
   const x=rows[Math.floor(r()*rows.length)];if(x)a.unskipOccurrence(x.pi,x.it.id,x.iso,'uitgave');}],
 ['ontvangst afvinken', (a,r)=>{const rows=a.receiptRows(new Date(2026,0,1),new Date(2027,0,1)).filter(x=>!x.received);
   const x=rows[Math.floor(r()*rows.length)];if(x)a.markOccurrence(x.pi,x.it.id,x.iso,'ontvangst',x.amount,x.iso,'','',true,x.toeId);}],
 ['saldo veranderen', (a,r)=>{const p=a.db.potjes[Math.floor(r()*a.db.potjes.length)];
   if(p)p.saldo=r()<0.15?-Math.floor(r()*300):Math.floor(r()*3000);}],
 ['bedrag slopen', (a,r)=>{const p=a.db.potjes[Math.floor(r()*a.db.potjes.length)];const it=p&&p.items&&p.items[Math.floor(r()*p.items.length)];
   if(it)it.v=ROMMEL[Math.floor(r()*ROMMEL.length)];}],
 ['datum slopen', (a,r)=>{const p=a.db.potjes[Math.floor(r()*a.db.potjes.length)];const it=p&&p.items&&p.items[Math.floor(r()*p.items.length)];
   if(it)it.due=ROMMEL[Math.floor(r()*ROMMEL.length)];}],
 ['naam leegmaken', (a,r)=>{const p=a.db.potjes[Math.floor(r()*a.db.potjes.length)];
   if(!p)return;if(r()<0.5)p.n='';else if(p.items&&p.items.length)p.items[Math.floor(r()*p.items.length)].n='';}],
 ['boeking weg', (a,r)=>{const p=a.db.potjes[Math.floor(r()*a.db.potjes.length)];
   if(p&&p.log&&p.log.length)p.log.splice(Math.floor(r()*p.log.length),1);}],
 ['buffer omzetten', (a,r)=>{const p=a.db.potjes[Math.floor(r()*a.db.potjes.length)];const it=p&&p.items&&p.items[Math.floor(r()*p.items.length)];
   if(it)it.buffer=!it.buffer;}]
];

const SCHERMEN=['start','uren','potjes','betalingen','loon','recept','meer','instellingen','documenten'];

/* Alles wat na een handeling waar moet blijven. Faalt er één, dan zag de gebruiker onzin op zijn scherm
   of stond zijn app stil. */
function controleer(a){
  const fout=[];
  SCHERMEN.forEach(t=>{try{a.go(t);}catch(e){fout.push('scherm '+t+': '+e.message);}});

  a.db.potjes.forEach((p,i)=>{if(!isFinite(+p.saldo))fout.push('potje '+i+' heeft een saldo dat geen getal is: '+p.saldo);});

  let bet=[],ont=[],lon=[];
  try{bet=a.paymentRows(new Date(2026,0,1),new Date(2027,6,1));}catch(e){fout.push('betalingen berekenen: '+e.message);}
  try{ont=a.receiptRows(new Date(2026,0,1),new Date(2027,6,1));}catch(e){fout.push('ontvangsten berekenen: '+e.message);}
  try{lon=a.loonRows(new Date(2026,0,1),new Date(2027,6,1));}catch(e){fout.push('loonregels berekenen: '+e.message);}

  bet.concat(ont).forEach(x=>{
    if(!(x.date instanceof Date)||isNaN(x.date))fout.push('regel zonder bruikbare datum: '+(x.it&&x.it.n));
    const bedrag=x.kind==='receipt'?x.amount:x.net;
    if(!isFinite(bedrag))fout.push('regel met een bedrag dat geen getal is: '+(x.it&&x.it.n)+' = '+bedrag);
  });
  lon.forEach(x=>{if(!(x.date instanceof Date)||isNaN(x.date))fout.push('loonregel zonder bruikbare datum');});

  /* Twee kaarten met hetzelfde id betekent dat uitklappen de verkeerde kaart opent. */
  const ids=[];
  try{
    bet.forEach(x=>ids.push(a.betalingCard(x).match(/id="([^"]+)"/)[1]));
    ont.forEach(x=>ids.push(a.receiptCard(x).match(/id="([^"]+)"/)[1]));
    lon.forEach(x=>ids.push(a.loonCard(x).match(/id="([^"]+)"/)[1]));
  }catch(e){fout.push('kaart tekenen: '+e.message);}
  if(ids.length!==new Set(ids).size)fout.push('twee kaarten met hetzelfde id');

  /* Rekenfouten lekken als tekst naar het scherm. "NaN" of "undefined" in een kaart is altijd fout. */
  try{
    const html=bet.map(x=>a.betalingCard(x)).concat(ont.map(x=>a.receiptCard(x)),lon.map(x=>a.loonCard(x))).join('');
    ['NaN','Infinity','undefined'].forEach(w=>{if(html.indexOf(w)>=0)fout.push('"'+w+'" staat leesbaar op een kaart');});
  }catch(e){fout.push('kaart tekenen: '+e.message);}

  try{JSON.stringify(a.db);}catch(e){fout.push('gegevens zijn niet meer op te slaan: '+e.message);}
  return fout;
}

/* Eén doorloop: een reeks handelingen, na elke handeling herstarten en controleren. */
function rommel(seed,stappen){
  const r=rng(seed);
  const volgorde=[];
  const res=run(JSON.parse(JSON.stringify(START)),a=>{
    for(let i=0;i<stappen;i++){
      const [naam,doe]=ACTIES[Math.floor(r()*ACTIES.length)];
      volgorde.push(naam);
      try{doe(a,r);}catch(e){return{stap:i,naam,fout:['handeling zelf klapte eruit: '+e.message]};}
      try{a.migrate();}catch(e){return{stap:i,naam,fout:['opstarten na deze handeling: '+e.message]};}
      const fout=controleer(a);
      if(fout.length)return{stap:i,naam,fout};
    }
    return{stap:-1,gedaan:stappen};
  });
  if(res.fout)return{seed,tech:res.fout};
  const uit=res.extra;
  if(uit&&uit.stap>=0)return{seed,stap:uit.stap,naam:uit.naam,fout:uit.fout,volgorde:volgorde.slice(-6)};
  return null;
}

const RONDES=+process.env.CHAOS_RONDES||25,STAPPEN=+process.env.CHAOS_STAPPEN||40;
let stuk=null;
for(let s=1;s<=RONDES&&!stuk;s++)stuk=rommel(s*7919,STAPPEN);

meld(RONDES+' rondes van '+STAPPEN+' willekeurige handelingen, herstart en gecontroleerd na elke stap',
  !stuk, stuk?('startwaarde '+stuk.seed+', stap '+stuk.stap+' ("'+stuk.naam+'")\n     '+
    (stuk.tech||stuk.fout).join('\n     ')+'\n     laatste handelingen: '+(stuk.volgorde||[]).join(' → ')):
    (RONDES*STAPPEN)+' handelingen zonder één kapot scherm');

/* Los daarvan: alles uitzetten en weer aanzetten mag geen gegevens kosten. */
{
  const res=run(JSON.parse(JSON.stringify(START)),a=>{
    const voor={potjes:a.db.potjes.length,loon:a.db.loonLog.length,werk:a.db.werkgevers.length,
      posten:a.db.potjes.reduce((n,p)=>n+(p.items||[]).length,0)};
    MODULES.forEach(k=>{a.db.modules[k]=false;});FEATS.forEach(k=>{a.db.feat[k]=false;});
    a.migrate();SCHERMEN.forEach(t=>a.go(t));
    MODULES.forEach(k=>{a.db.modules[k]=true;});FEATS.forEach(k=>{delete a.db.feat[k];});
    a.migrate();SCHERMEN.forEach(t=>a.go(t));
    const na={potjes:a.db.potjes.length,loon:a.db.loonLog.length,werk:a.db.werkgevers.length,
      posten:a.db.potjes.reduce((n,p)=>n+(p.items||[]).length,0)};
    return{voor,na,gelijk:JSON.stringify(voor)===JSON.stringify(na)};
  });
  meld('alles uitzetten en weer aanzetten kost geen enkel gegeven',
    !res.fout&&res.extra.gelijk, JSON.stringify(res.extra||res.fout));
}

/* En de vraag uit de gebruikerstest: werkt het ook met vier bijbanen tegelijk? */
{
  const vier=JSON.parse(JSON.stringify(START));
  vier.werkgevers=['Albert Heijn','Jumbo','Bezorgdienst','Kroeg'];
  vier.werkCfg={};
  [[4,'month'],[15,'month'],[1,'weeks'],[28,'month']].forEach(([dag,mode],i)=>{
    vier.werkCfg[vier.werkgevers[i]]={ritmeN:1,ritmeU:'dienst',klaarDag:1,correctie:'later',nabetaalMode:'loondag',
      actief:true,loon:{mode,dag,intervalWeeks:1,start:'2026-01-02'}};
  });
  const res=run(vier,a=>{
    const fout=controleer(a);
    return{fout,actief:a.db.werkgevers.filter(w=>a.werkCfgOf(w).actief!==false).length};
  });
  meld('vier bijbanen tegelijk: geen kapot scherm, geen dubbele kaart',
    !res.fout&&res.extra.fout.length===0, JSON.stringify(res.extra&&res.extra.fout||res.fout));
  meld('vier bijbanen tegelijk: de app dwingt er nog steeds één actieve werkgever af',
    !res.fout&&res.extra.actief===1, 'actief: '+(res.extra&&res.extra.actief));
}

console.log(check.join('\n'));
const fout=check.filter(c=>c.startsWith('FOUT')).length;
console.log('\n'+(fout?fout+' CHAOSCONTROLES GEFAALD':'alle '+check.length+' chaoscontroles kloppen'));
if(fout)process.exitCode=1;
