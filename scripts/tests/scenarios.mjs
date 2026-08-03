/* Scenario-tests: hele levensverhalen door de app halen in plaats van losse sommen.
   Elk scenario is een gebruiker met een eigen situatie. Per scenario draaien we alle schermen die
   die persoon zou openen — een uitzondering daar is in de app een half-dood scherm — en controleren
   we daarna of het overzicht ook echt klopt (geen dubbele regels, geen verzonnen loondagen, geen
   geld dat je hebt ingevuld maar nergens meer terugziet). */
import { run } from './harness.mjs';

const check=[];
const meld=(n,ok,det)=>{check.push((ok?'ok   ':'FOUT ')+n+(det?'  '+det:''));};

const basis=(o={})=>Object.assign({
  setup:true,naam:'T',modules:{uren:true,potjes:true,loon:true,recept:true},feat:{},lock:{on:false,pin:''},
  werkgevers:[],werkCfg:{},contract:{},shifts:[],potjes:[],rekeningen:[],boodschappen:[],
  loon:{mode:'month',dag:25,intervalWeeks:4,start:''},loonLog:[],meldingen:true,meldTijd:'08:00',
  overboek:{},backup:{on:true},receptCategorieen:[],recepten:[],documenten:[],docTypes:[]
},o);

const werk=(naam,loon,actief=true)=>({[naam]:{ritmeN:1,ritmeU:'dienst',klaarDag:1,correctie:'later',
  nabetaalMode:'loondag',nabetaalN:1,nabetaalU:'w',nabetaalDatum:'',actief,loon}});

/* Elk scherm dat deze gebruiker zou openen daadwerkelijk renderen. Gooit er één een fout, dan zou je
   in de app een leeg of half getekend scherm zien — dat moet hier keihard opvallen. */
function schermen(data,naam){
  const r=run(data,a=>{
    const uit=[];
    ['start','uren','potjes','betalingen','loon','recept','meer','instellingen','documenten'].forEach(t=>{
      try{a.go(t);}catch(e){uit.push(t+': '+e.message);}
    });
    return uit;
  });
  meld(naam+': alle schermen tekenen zonder fout',
    !r.fout&&Array.isArray(r.extra)&&r.extra.length===0, r.fout||JSON.stringify(r.extra));
  return r;
}

/* Het loonoverzicht zoals de Betalingen-pagina het opbouwt, maar dan als platte lijst. */
const loonLijst=a=>{
  const nu=a.vandaag();const van=new Date(nu);van.setFullYear(van.getFullYear()-1);
  const tot=new Date(nu.getFullYear(),nu.getMonth()+3,0);
  return a.loonRows(a.loonHistorieVan(van),tot).map(x=>({
    dag:a.isoDate(x.date),op:x.dispDate?a.isoDate(x.dispDate):null,bedrag:x.amount,binnen:x.received}));
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. De baanwissel uit de gebruikerstest: baan A met loondag 20, stoppen, baan B met loondag 8.
// ─────────────────────────────────────────────────────────────────────────────
{
  const A={mode:'month',dag:20,intervalWeeks:4,start:''};
  const B={mode:'month',dag:8,intervalWeeks:4,start:''};
  const nu=run(basis(),a=>a.isoDate(a.vandaag())).extra;
  const jaar=+nu.slice(0,4),maand=+nu.slice(5,7);
  const vorige=(n)=>{const d=new Date(jaar,maand-1-n,1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');};
  /* Twee maanden geleden bij A gewerkt en één keer loon ontvangen; vorige maand overgestapt naar B. */
  const loonA=vorige(2)+'-20';
  const data=basis({
    werkgevers:['Baan A','Baan B'],
    werkCfg:Object.assign(werk('Baan A',A,false),werk('Baan B',B,true)),
    loon:B,
    loonLog:[{id:'a1',date:loonA,amount:1400,payIso:loonA}]
  });
  schermen(data,'baanwissel');

  const r=run(data,a=>loonLijst(a));
  const lijst=r.extra||[];
  /* Het loon dat je bij je vorige baan hebt ingevuld mag niet uit beeld verdwijnen. */
  meld('baanwissel: het loon van je vorige baan is nog terug te vinden',
    !r.fout&&lijst.some(x=>x.op===loonA&&x.bedrag===1400),
    JSON.stringify(lijst.slice(0,6)));
  /* Zonder "Eerste loondag hier" legt de app het ritme van je nieuwe baan ook over de maanden dáárvoor.
     Bestaande gegevens van vóór deze versie hebben dat veld niet, dus die spoken blijven bestaan tot je
     de datum invult — het werkgeverscherm waarschuwt daar zelf over. */
  const spook=lijst.filter(x=>!x.binnen&&x.dag<nu);
  meld('baanwissel zonder startdatum: de spookloondagen zijn bekend en beperkt tot vóór vandaag',
    !r.fout&&spook.every(x=>x.dag<nu), JSON.stringify(spook));

  /* Zoals het gaat als je de wissel in de app zelf maakt: bij het in dienst zetten stempelt de app
     "Eerste loondag hier" op vandaag, en dan is het verleden schoon. */
  const gestempeld=basis({
    werkgevers:['Baan A','Baan B'],
    werkCfg:Object.assign(werk('Baan A',A,false),werk('Baan B',Object.assign({},B,{vanaf:nu}),true)),
    loon:Object.assign({},B,{vanaf:nu}),
    loonLog:[{id:'a1',date:loonA,amount:1400,payIso:loonA}]
  });
  const g=run(gestempeld,a=>loonLijst(a));
  const gl=g.extra||[];
  meld('baanwissel via de app: geen enkele verzonnen loondag meer',
    !g.fout&&gl.filter(x=>!x.binnen&&x.dag<nu).length===0, JSON.stringify(gl));
  meld('baanwissel via de app: het loon van je vorige baan blijft wél staan',
    !g.fout&&gl.some(x=>x.op===loonA&&x.bedrag===1400), JSON.stringify(gl));
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Nieuwe gebruiker: installeert de app vandaag, vult nog niets in.
// ─────────────────────────────────────────────────────────────────────────────
{
  const data=basis({setup:false});
  schermen(data,'kersverse gebruiker');
  const r=run(data,a=>loonLijst(a).filter(x=>!x.binnen).length);
  meld('kersverse gebruiker: zonder ingevuld loon geen historie uit het niets',
    !r.fout&&r.extra<=4, String(r.extra||r.fout));
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Oproepkracht: wisselende loondagen, zelf ingevoerd, geen vast ritme.
// ─────────────────────────────────────────────────────────────────────────────
{
  const nu=run(basis(),a=>a.isoDate(a.vandaag())).extra;
  const jaar=+nu.slice(0,4),maand=+nu.slice(5,7);
  const dag=n=>{const d=new Date(jaar,maand-1-n,12);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-12';};
  const L={mode:'manual',dag:25,intervalWeeks:4,start:'',dates:[dag(2),dag(1),dag(0)]};
  const data=basis({werkgevers:['Uitzendbureau'],werkCfg:werk('Uitzendbureau',L),loon:L,
    loonLog:[{id:'o1',date:dag(2),amount:640,payIso:dag(2)},{id:'o2',date:dag(1),amount:910,payIso:dag(1)}]});
  schermen(data,'oproepkracht');
  const r=run(data,a=>loonLijst(a));
  meld('oproepkracht: precies de drie zelf ingevoerde loondagen, geen verzonnen extra',
    !r.fout&&(r.extra||[]).length===3, JSON.stringify(r.extra));
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Vierwekenloon met een potje vol vaste lasten en een toeslag.
// ─────────────────────────────────────────────────────────────────────────────
{
  const nu=run(basis(),a=>a.isoDate(a.vandaag())).extra;
  const jaar=+nu.slice(0,4);
  const L={mode:'weeks',intervalWeeks:4,dag:25,start:jaar+'-01-02'};
  const data=basis({werkgevers:['Distributiecentrum'],werkCfg:werk('Distributiecentrum',L),loon:L,
    potjes:[{n:'Vaste lasten',saldo:600,maand:0,items:[
      {id:'i1',n:'Zorgverzekering',v:148.5,fn:1,fu:'m',due:jaar+'-01-27',
       toeslagen:[{id:'t1',naam:'Zorgtoeslag',v:127,fn:1,fu:'m',date:jaar+'-01-20'}]},
      {id:'i2',n:'Wegenbelasting',v:96,fn:3,fu:'m',due:jaar+'-02-14'},
      {id:'i3',n:'Kleding',v:40,fn:1,fu:'m',buffer:true}
    ],log:[]}]});
  schermen(data,'vierwekenloon met toeslag');
  const r=run(data,a=>{
    const nu2=a.vandaag();
    const bet=a.paymentRows(new Date(nu2.getFullYear(),nu2.getMonth(),1),new Date(nu2.getFullYear(),nu2.getMonth()+2,0));
    const ont=a.receiptRows(new Date(nu2.getFullYear(),nu2.getMonth(),1),new Date(nu2.getFullYear(),nu2.getMonth()+2,0));
    return{bet:bet.length,ont:ont.length,buffers:bet.filter(x=>x.it.buffer).length,
      kaarten:bet.map(x=>a.betalingCard(x).length).concat(ont.map(x=>a.receiptCard(x).length))};
  });
  meld('vierwekenloon: betalingen en toeslagen komen allebei in het overzicht',
    !r.fout&&r.extra.bet>0&&r.extra.ont>0, JSON.stringify({bet:r.extra&&r.extra.bet,ont:r.extra&&r.extra.ont}||r.fout));
  meld('vierwekenloon: een buffer is geen betaling met een datum',
    !r.fout&&r.extra.buffers===0, JSON.stringify(r.extra&&r.extra.buffers));
  meld('vierwekenloon: elke kaart levert echte HTML op',
    !r.fout&&r.extra.kaarten.every(n=>n>200), JSON.stringify(r.extra&&r.extra.kaarten));
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Iemand zonder werkgevers: de Uren-module uit, loon zelf ingesteld.
// ─────────────────────────────────────────────────────────────────────────────
{
  const L={mode:'month',dag:1,intervalWeeks:4,start:''};
  const data=basis({modules:{uren:false,potjes:true,loon:true,recept:false},loon:L,
    loonLog:[{id:'u1',date:'2026-06-01',amount:1320}]});
  schermen(data,'uitkering zonder werkgever');
  const r=run(data,a=>({verwacht:a.loonVerwacht(),n:loonLijst(a).length}));
  meld('uitkering zonder werkgever: de app blijft gewoon loondagen verwachten',
    !r.fout&&r.extra.verwacht===true&&r.extra.n>0, JSON.stringify(r.extra||r.fout));
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Tussen twee banen in: iedereen uit dienst.
// ─────────────────────────────────────────────────────────────────────────────
{
  const A={mode:'month',dag:20,intervalWeeks:4,start:''};
  const data=basis({werkgevers:['Baan A'],werkCfg:werk('Baan A',A,false),loon:A,
    loonLog:[{id:'a1',date:'2026-06-20',amount:1400,payIso:'2026-06-20'}]});
  schermen(data,'tussen twee banen');
  const r=run(data,a=>({verwacht:a.loonVerwacht(),open:loonLijst(a).filter(x=>!x.binnen).length,
    binnen:loonLijst(a).filter(x=>x.binnen).length}));
  meld('tussen twee banen: geen loon meer verwachten',
    !r.fout&&r.extra.verwacht===false&&r.extra.open===0, JSON.stringify(r.extra||r.fout));
  meld('tussen twee banen: wat je al ontving blijft staan',
    !r.fout&&r.extra.binnen>0, JSON.stringify(r.extra||r.fout));
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Alles afgevinkt en weer teruggedraaid: blijft de administratie kloppen?
// ─────────────────────────────────────────────────────────────────────────────
{
  const nu=run(basis(),a=>a.isoDate(a.vandaag())).extra;
  const due=nu.slice(0,8)+'05';
  const data=basis({potjes:[{n:'Vaste lasten',saldo:500,maand:0,
    items:[{id:'i1',n:'Huur',v:820,fn:1,fu:'m',due:due}],log:[]}]});
  const r=run(data,a=>{
    const saldoVoor=a.totalSaldo();
    a.markOccurrence(0,'i1',due,'uitgave',820,due);
    const naAf=a.totalSaldo();
    a.unmarkOccurrence(0,'i1',due,'uitgave');
    const naTerug=a.totalSaldo();
    return{saldoVoor,naAf,naTerug,logs:(a.db.potjes[0].log||[]).length};
  });
  meld('afvinken en terugdraaien: het saldo staat precies weer op de oude stand',
    !r.fout&&r.extra.saldoVoor===r.extra.naTerug, JSON.stringify(r.extra||r.fout));
  meld('afvinken en terugdraaien: er blijft geen losse boeking achter',
    !r.fout&&r.extra.logs===0, JSON.stringify(r.extra||r.fout));
  meld('afvinken: het saldo daalt daadwerkelijk met het bedrag',
    !r.fout&&Math.round((r.extra.saldoVoor-r.extra.naAf)*100)===82000, JSON.stringify(r.extra||r.fout));
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Overslaan: "deze betaling komt niet" mag niet als te laat blijven staan.
// ─────────────────────────────────────────────────────────────────────────────
{
  const nu=run(basis(),a=>a.isoDate(a.vandaag())).extra;
  const due=nu.slice(0,8)+'01';
  const data=basis({potjes:[{n:'Auto',saldo:300,maand:0,
    items:[{id:'i1',n:'Benzine',v:120,fn:1,fu:'m',due:due}],log:[]}]});
  const r=run(data,a=>{
    a.skipOccurrence(0,'i1',due,'uitgave');
    const nu2=a.vandaag();
    const rij=a.paymentRows(new Date(nu2.getFullYear(),nu2.getMonth(),1),new Date(nu2.getFullYear(),nu2.getMonth()+1,0))
      .find(x=>x.iso===due);
    return rij?{skipped:rij.skipped,telaat:rij.telaat,kaart:a.betalingCard(rij).indexOf('Overgeslagen')>=0}:null;
  });
  meld('overslaan: een overgeslagen betaling telt niet meer als te laat',
    !r.fout&&r.extra&&r.extra.skipped===true&&r.extra.telaat===false&&r.extra.kaart===true,
    JSON.stringify(r.extra||r.fout));
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Rommelige data: lege namen, nul-bedragen, kapotte datums, dubbele werkgevers.
// ─────────────────────────────────────────────────────────────────────────────
{
  const data=basis({
    werkgevers:['Baan','Baan',''],
    werkCfg:werk('Baan',{mode:'month',dag:31,intervalWeeks:4,start:''}),
    loonLog:[{id:'x',date:'niet-een-datum',amount:900},{id:'y',date:'2026-07-25',amount:0},{id:'z',date:'2026-07-26'}],
    potjes:[{n:'',saldo:-50,maand:0,items:[
      {id:'i1',n:'',v:0,fn:0,fu:'m',due:''},
      {id:'i2',n:'Post zonder datum',v:12,fn:1,fu:'m'},
      {id:'i3',n:'Kapotte datum',v:30,fn:1,fu:'m',due:'2026-02-31'}
    ],log:[{id:'l1',itemId:'i1',date:'',amount:'veel',kind:'uitgave'}]}]});
  schermen(data,'rommelige data');
  const r=run(data,a=>{
    const nu2=a.vandaag();
    const bet=a.paymentRows(new Date(nu2.getFullYear(),nu2.getMonth()-1,1),new Date(nu2.getFullYear(),nu2.getMonth()+2,0));
    return{n:bet.length,geldig:bet.every(x=>x.date instanceof Date&&!isNaN(x.date)&&isFinite(x.net))};
  });
  meld('rommelige data: geen enkele betaling met een onbruikbare datum of bedrag',
    !r.fout&&r.extra.geldig===true, JSON.stringify(r.extra||r.fout));
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Alles uitgezet: modules en functies uit, mag nergens crashen.
// ─────────────────────────────────────────────────────────────────────────────
{
  const data=basis({modules:{uren:false,potjes:false,loon:false,recept:true},
    feat:{comp:false,hints:false,loonlog:false,ontvangst:false,toeslag:false,buffers:false,stats:false,documenten:false}});
  schermen(data,'alles uitgezet');
  const r=run(data,a=>({loon:a.loonRows(new Date(2026,0,1),new Date(2027,0,1)).length,
    hint:a.dateHintRow({pot:{log:[]},it:{id:'x'},date:new Date(),span:0},'uitgave')}));
  meld('alles uitgezet: geen loonregels en geen voorspellingen',
    !r.fout&&r.extra.loon===0&&r.extra.hint==='', JSON.stringify(r.extra||r.fout));
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Jarenlange historie: blijft het overzicht behapbaar en kloppend?
// ─────────────────────────────────────────────────────────────────────────────
{
  const L={mode:'month',dag:25,intervalWeeks:4,start:''};
  const log=[];const paidDates={};
  for(let m=0;m<36;m++){
    const d=new Date(2024,m,25);const iso=d.toISOString().slice(0,10);
    const echt=new Date(2024,m,23).toISOString().slice(0,10);
    log.push({id:'l'+m,itemId:'i1',date:echt,amount:150,kind:'uitgave',payIso:iso});paidDates[iso]='l'+m;
  }
  const loonLog=[];for(let m=0;m<36;m++)loonLog.push({id:'p'+m,date:new Date(2024,m,25).toISOString().slice(0,10),amount:1800});
  const data=basis({werkgevers:['Lang dienstverband'],werkCfg:werk('Lang dienstverband',L),loon:L,loonLog,
    potjes:[{n:'Vaste lasten',saldo:2000,maand:0,items:[{id:'i1',n:'Zorg',v:150,fn:1,fu:'m',due:'2024-01-25',paidDates}],log}]});
  schermen(data,'drie jaar historie');
  const r=run(data,a=>{
    const nu2=a.vandaag();const van=new Date(nu2);van.setFullYear(van.getFullYear()-1);
    const rows=a.loonRows(a.loonHistorieVan(van),new Date(nu2.getFullYear(),nu2.getMonth()+2,0));
    const isos=rows.map(x=>a.isoDate(x.date));
    return{n:rows.length,dubbel:isos.length!==new Set(isos).size};
  });
  meld('drie jaar historie: geen dubbele loondagen in het overzicht',
    !r.fout&&r.extra.dubbel===false, JSON.stringify(r.extra||r.fout));
  meld('drie jaar historie: het overzicht blijft bij een jaar of wat, niet alles',
    !r.fout&&r.extra.n<=20, JSON.stringify(r.extra||r.fout));
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. Twee toeslagen op één kostenpost, elk met een eigen ritme.
// ─────────────────────────────────────────────────────────────────────────────
{
  const data=basis({potjes:[{n:'Zorg',saldo:0,maand:0,items:[
    {id:'i1',n:'Menzis',v:148,fn:1,fu:'m',due:'2026-01-27',toeslagen:[
      {id:'t1',naam:'Zorgtoeslag',v:127,fn:1,fu:'m',date:'2026-01-20'},
      {id:'t2',naam:'Aanvulling gemeente',v:35,fn:3,fu:'m',date:'2026-01-05'}]}],log:[]}]});
  schermen(data,'twee toeslagen');
  const r=run(data,a=>{
    /* Ruim genoeg venster om ook de kwartaaltoeslag (jan/apr/jul/okt) een keer tegen te komen. */
    const ont=a.receiptRows(new Date(2026,7,1),new Date(2026,10,0));
    const labels=[...new Set(ont.map(x=>x.label))].sort();
    return{n:ont.length,labels,eigen:ont.every(x=>x.toeId)};
  });
  meld('twee toeslagen: allebei een eigen regel met een eigen naam',
    !r.fout&&r.extra.labels.length===2&&r.extra.eigen===true, JSON.stringify(r.extra||r.fout));
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. Twee bijbanen tegelijk — ruim één op de acht werkende Nederlanders heeft dit.
// ─────────────────────────────────────────────────────────────────────────────
{
  const nu=run(basis(),a=>a.isoDate(a.vandaag())).extra;
  const AH={mode:'month',dag:4,intervalWeeks:4,start:''};
  const SIN={mode:'month',dag:25,intervalWeeks:4,start:''};
  const data=basis({
    werkgevers:['Albert Heijn','Sincere'],
    werkCfg:Object.assign(werk('Albert Heijn',AH),werk('Sincere',SIN)),
    loon:SIN,
    loonLog:[{id:'a1',date:'2026-06-04',amount:480,payIso:'2026-06-04',werk:'Albert Heijn'},
             {id:'s1',date:'2026-06-25',amount:1810,payIso:'2026-06-25',werk:'Sincere'},
             {id:'a2',date:'2026-07-04',amount:495,payIso:'2026-07-04',werk:'Albert Heijn'},
             {id:'s2',date:'2026-07-25',amount:1805,payIso:'2026-07-25',werk:'Sincere'}],
    potjes:[{n:'Vaste lasten',saldo:0,maand:0,items:[{id:'i1',n:'Huur',v:820,fn:1,fu:'m',due:nu.slice(0,8)+'01'}],log:[]}]
  });
  schermen(data,'twee bijbanen');

  const r=run(data,a=>{
    const nu2=a.vandaag();
    const rijen=a.loonRows(new Date(nu2.getFullYear(),nu2.getMonth()-2,1),new Date(nu2.getFullYear(),nu2.getMonth()+2,0));
    return{
      allebei:[...new Set(rijen.map(x=>x.werk))].filter(Boolean).sort(),
      naamInLabel:rijen.every(x=>!x.werk||x.label.indexOf(x.werk)>=0),
      dubbel:rijen.length!==new Set(rijen.map(x=>x.iso+'|'+x.werk)).size,
      /* Eén ontvangst mag niet bij twee banen tegelijk als "binnen" gelden. */
      entries:rijen.filter(x=>x.entry).map(x=>x.entry.id),
      hoofd:a.hoofdBaan()
    };
  });
  const e=r.extra||{};
  meld('twee bijbanen: allebei de banen leveren loondagen',
    !r.fout&&JSON.stringify(e.allebei)==='["Albert Heijn","Sincere"]', JSON.stringify(e.allebei||r.fout));
  meld('twee bijbanen: elke regel noemt van welke baan hij is',
    !r.fout&&e.naamInLabel===true, JSON.stringify(e.naamInLabel));
  meld('twee bijbanen: geen dubbele regels', !r.fout&&e.dubbel===false, JSON.stringify(e.dubbel));
  meld('twee bijbanen: geen ontvangst die bij twee banen tegelijk hoort',
    !r.fout&&e.entries.length===new Set(e.entries).size, JSON.stringify(e.entries));
  meld('twee bijbanen: de best betaalde baan wordt hoofdbaan',
    !r.fout&&e.hoofd==='Sincere', String(e.hoofd));

  /* De hoofdbaan mag niet spontaan omslaan — dan zou je twee keer per maand moeten overmaken. */
  const plak=run(data,a=>{
    const eerst=a.hoofdBaanVast();
    a.db.loonLog.push({id:'a9',date:a.isoDate(a.vandaag()),amount:9999,werk:'Albert Heijn'});
    return{eerst,daarna:a.hoofdBaan()};
  });
  meld('twee bijbanen: de hoofdbaan blijft plakken, ook als de andere ineens meer betaalt',
    !plak.fout&&plak.extra.eerst===plak.extra.daarna, JSON.stringify(plak.extra||plak.fout));

  /* En het echte probleem: vaste lasten die je pas na je tweede loon rond krijgt. */
  const delen=run(data,a=>{
    const p=a.db.potjes[0];const t=a.potTot(p);
    a.db.overboek[a.currentPeriodKey()]={0:{done:false,amt:480}};
    const na1={gedaan:a.obGedaan(0,p),vol:a.obVol(0,p)};
    a.db.overboek[a.currentPeriodKey()]={0:{done:true,amt:t}};
    const na2={gedaan:a.obGedaan(0,p),vol:a.obVol(0,p)};
    return{t,na1,na2};
  });
  meld('gesplitst inkomen: 480 van 820 overgemaakt telt als deels, niet als klaar',
    !delen.fout&&delen.extra.na1.gedaan===480&&delen.extra.na1.vol===false, JSON.stringify(delen.extra||delen.fout));
  meld('gesplitst inkomen: pas bij het hele bedrag staat het vinkje vol',
    !delen.fout&&delen.extra.na2.vol===true, JSON.stringify(delen.extra||delen.fout));
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. AOW plus pensioen: twee vaste inkomsten, geen werkgever-gevoel, wel hetzelfde probleem.
// ─────────────────────────────────────────────────────────────────────────────
{
  const AOW={mode:'month',dag:23,intervalWeeks:4,start:''};
  const PEN={mode:'month',dag:1,intervalWeeks:4,start:''};
  const data=basis({
    werkgevers:['AOW','Pensioenfonds'],
    werkCfg:Object.assign(werk('AOW',AOW),werk('Pensioenfonds',PEN)),
    loon:AOW,
    loonLog:[{id:'x1',date:'2026-06-23',amount:1400,payIso:'2026-06-23',werk:'AOW'},
             {id:'x2',date:'2026-07-01',amount:620,payIso:'2026-07-01',werk:'Pensioenfonds'}]
  });
  schermen(data,'AOW en pensioen');
  const r=run(data,a=>{
    const nu2=a.vandaag();
    const rijen=a.loonRows(new Date(nu2.getFullYear(),nu2.getMonth()-2,1),new Date(nu2.getFullYear(),nu2.getMonth()+2,0));
    return{bronnen:a.loonBronnen().length,binnen:rijen.filter(x=>x.received).length,hoofd:a.hoofdBaan()};
  });
  meld('AOW en pensioen: allebei worden als eigen inkomstenbron gevolgd',
    !r.fout&&r.extra.bronnen===2&&r.extra.binnen===2, JSON.stringify(r.extra||r.fout));
  meld('AOW en pensioen: de grootste inkomstenbron zet het ritme',
    !r.fout&&r.extra.hoofd==='AOW', String(r.extra&&r.extra.hoofd));
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. Stoppen bij één van je twee banen: de andere loopt gewoon door.
// ─────────────────────────────────────────────────────────────────────────────
{
  const nu=run(basis(),a=>a.isoDate(a.vandaag())).extra;
  const A={mode:'month',dag:4,intervalWeeks:4,start:''};
  const B={mode:'month',dag:25,intervalWeeks:4,start:''};
  const data=basis({
    werkgevers:['Bezorgdienst','Sincere'],
    werkCfg:Object.assign(werk('Bezorgdienst',Object.assign({},A,{tot:nu}),false),werk('Sincere',B,true)),
    loon:B,
    loonLog:[{id:'b1',date:'2026-06-04',amount:300,payIso:'2026-06-04',werk:'Bezorgdienst'}]
  });
  schermen(data,'één van twee banen gestopt');
  const r=run(data,a=>{
    const nu2=a.vandaag();
    const toekomst=a.loonRows(nu2,new Date(nu2.getFullYear(),nu2.getMonth()+3,0));
    const verleden=a.loonRows(new Date(nu2.getFullYear(),nu2.getMonth()-3,1),nu2);
    return{
      toekomstBanen:[...new Set(toekomst.map(x=>x.werk))].filter(Boolean),
      oudLoonNogZichtbaar:verleden.some(x=>x.entry&&x.entry.id==='b1'),
      hoofd:a.hoofdBaan()
    };
  });
  meld('gestopte baan: geen nieuwe loondagen meer van de baan die je kwijt bent',
    !r.fout&&JSON.stringify(r.extra.toekomstBanen)==='["Sincere"]', JSON.stringify(r.extra||r.fout));
  meld('gestopte baan: wat je daar verdiende blijft wel gewoon staan',
    !r.fout&&r.extra.oudLoonNogZichtbaar===true, JSON.stringify(r.extra));
  meld('gestopte baan: de overgebleven baan wordt vanzelf de hoofdbaan',
    !r.fout&&r.extra.hoofd==='Sincere', String(r.extra&&r.extra.hoofd));
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. Terugkomen bij een oude werkgever: eerst gestopt, later weer aangenomen.
// ─────────────────────────────────────────────────────────────────────────────
{
  const nu=run(basis(),a=>a.isoDate(a.vandaag())).extra;
  const L={mode:'month',dag:25,intervalWeeks:4,start:'',vanaf:'2026-01-01',tot:'2026-03-31'};
  const data=basis({
    werkgevers:['Sincere'],
    werkCfg:{Sincere:{ritmeN:1,ritmeU:'dienst',klaarDag:1,correctie:'later',nabetaalMode:'loondag',actief:false,loon:L}},
    loon:L
  });
  const r=run(data,a=>{
    window._wcName='Sincere';window._wc=JSON.parse(JSON.stringify(a.db.werkCfg['Sincere']));
    window._wc.actief=true;window._wcVanaf='beheer';window._wcContract='';
    a.wcSaveDoen();
    const c=a.db.werkCfg['Sincere'];
    const rijen=a.loonRows(new Date(2026,0,1),new Date(2027,0,1));
    /* Het gat tussen de eerste dienstperiode (jan-mrt) en vandaag mag geen loondagen opleveren —
       daar werkte je niet. Zonder fix bleef "vanaf" op de oude startdatum staan terwijl "tot" gewist
       werd, en zag het model dat als één doorlopend dienstverband sinds januari. */
    const gat=rijen.filter(x=>x.iso>'2026-03-31'&&x.iso<nu).map(x=>x.iso);
    return{vanaf:c.loon.vanaf,tot:c.loon.tot,gat};
  });
  meld('terugkomen bij een oude werkgever: vanaf schuift mee naar het nieuwe dienstverband',
    !r.fout&&r.extra.vanaf===nu&&r.extra.tot==='', JSON.stringify(r.extra||r.fout));
  meld('terugkomen bij een oude werkgever: geen loondagen in het gat tussen de twee periodes',
    !r.fout&&r.extra.gat.length===0, JSON.stringify(r.extra||r.fout));
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. Toeslag op een gedateerde kostenpost: "Waar is je saldo voor?" mag geen tekort
//     melden voor het deel dat je nooit zelf hoefde te sparen (dat komt van de toeslag).
// ─────────────────────────────────────────────────────────────────────────────
{
  const data=basis({potjes:[{n:'Kinderopvang',saldo:0,maand:0,items:[
    {id:'i1',n:'Opvang',v:800,fn:1,fu:'m',due:'2026-01-27',
     toeslagen:[{id:'t1',naam:'Kinderopvangtoeslag',v:600,fn:1,fu:'m',date:'2026-01-20'}]}
  ],log:[]}]});
  const r=run(data,a=>{
    const it=a.db.potjes[0].items[0];
    const nuHalverwege=new Date(2026,0,13); // halverwege de cyclus (27 dec -> 27 jan)
    return{
      opzijPerMaand:a.itMnd(it), // wat je écht gevraagd wordt te sparen: netto
      gereserveerdHalverwege:a.itemGereserveerd(it,nuHalverwege)
    };
  });
  meld('toeslag: "opzij zetten" is netto (bruto min toeslag)',
    !r.fout&&r.extra.opzijPerMaand===200, JSON.stringify(r.extra||r.fout));
  meld('toeslag: de reservering bouwt op naar het NETTO bedrag, niet het volle bruto bedrag',
    !r.fout&&r.extra.gereserveerdHalverwege<=200, JSON.stringify(r.extra||r.fout));
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. Grillig loonritme: een gemiddelde van nul is geen garantie dat het loon op tijd komt.
// ─────────────────────────────────────────────────────────────────────────────
{
  const L={mode:'manual',dag:25,intervalWeeks:4,start:'',
    dates:['2026-04-25','2026-05-25','2026-06-25']};
  const data=basis({werkgevers:['Horeca'],werkCfg:werk('Horeca',L),loon:L,
    loonLog:[{id:'a',date:'2026-04-19',amount:400,payIso:'2026-04-25'},  // 6 dagen te vroeg
             {id:'b',date:'2026-05-31',amount:410,payIso:'2026-05-25'}]}); // 6 dagen te laat: gemiddeld exact 0
  const r=run(data,a=>{
    const kaal=s=>String(s).replace(/<[^>]+>/g,'');
    return{
      offs:a.loonOffsets('Horeca'),
      tekst:kaal(a.loonHintRow({date:new Date(2026,5,25),werk:'Horeca'}))
    };
  });
  meld('grillig loon: gemiddelde is (bijna) nul terwijl de spreiding groot is',
    !r.fout&&r.extra.offs.length===2&&Math.abs(r.extra.offs.reduce((a,b)=>a+b,0)/2)<1,
    JSON.stringify(r.extra&&r.extra.offs||r.fout));
  meld('grillig loon: geen valse geruststelling — de tekst noemt dat het wisselt',
    !r.fout&&r.extra.tekst.indexOf('wisselt')>=0&&r.extra.tekst.indexOf('meestal op je loondag')<0,
    r.extra&&r.extra.tekst);
}

// ─────────────────────────────────────────────────────────────────────────────
// 19. Onboarding met twee werkgevers in één keer: allebei moeten in dienst komen.
// ─────────────────────────────────────────────────────────────────────────────
{
  const r=run(basis({setup:false}),a=>{
    a._testSetOb({step:0,naam:'T',werk:'Jumbo, Sincere',loon:a.schoonLoonCfg(a.db.loon),
      mods:{uren:true,potjes:true,loon:true,recept:false},feat:{}});
    a.finishOnboarding();
    return a.db.werkgevers.map(w=>({w,actief:a.werkCfgOf(w).actief!==false}));
  });
  meld('onboarding: "Jumbo, Sincere" in één keer typen zet allebei in dienst',
    !r.fout&&r.extra.length===2&&r.extra.every(x=>x.actief), JSON.stringify(r.extra||r.fout));
}

// ─────────────────────────────────────────────────────────────────────────────
// 20. "Je loopt een maand voor" mag alleen verschijnen als het écht klopt.
// ─────────────────────────────────────────────────────────────────────────────
{
  const nu=run(basis(),a=>a.isoDate(a.vandaag())).extra;
  const due=nu.slice(0,8)+'15';
  const potje=(naam,saldo,items)=>({n:naam,saldo,maand:0,items,log:[]});
  const post={id:'i1',n:'Huur',v:820,fn:1,fu:'m',due};

  const ruim=run(basis({potjes:[potje('Vaste lasten',5000,[post])]}),a=>a.looptEenMaandVoor());
  meld('maand voor: met ruim saldo zegt de app het',!ruim.fout&&ruim.extra===true,String(ruim.extra||ruim.fout));

  const krap=run(basis({potjes:[potje('Vaste lasten',10,[post])]}),a=>a.looptEenMaandVoor());
  meld('maand voor: met krap saldo zwijgt de app',!krap.fout&&krap.extra===false,String(krap.extra||krap.fout));

  /* Eén potje dat tekortkomt maakt de uitspraak onwaar, ook al staan de andere er goed voor. */
  const gemengd=run(basis({potjes:[potje('Vaste lasten',5000,[post]),
    potje('Auto',0,[{id:'i2',n:'Verzekering',v:90,fn:1,fu:'m',due}])]}),a=>a.looptEenMaandVoor());
  meld('maand voor: één potje tekort en de app zwijgt',
    !gemengd.fout&&gemengd.extra===false,String(gemengd.extra||gemengd.fout));

  const leeg=run(basis({potjes:[potje('Sparen',900,[])]}),a=>a.looptEenMaandVoor());
  meld('maand voor: zonder geplande betalingen valt er niets te zeggen',
    !leeg.fout&&leeg.extra===false,String(leeg.extra||leeg.fout));
}

// ─────────────────────────────────────────────────────────────────────────────
// 21. Wim: twee vaste inkomsten zonder werkgever-gevoel (Uren-module uit).
// ─────────────────────────────────────────────────────────────────────────────
{
  const AOW={mode:'month',dag:23,intervalWeeks:4,start:''};
  const PEN={mode:'month',dag:1,intervalWeeks:4,start:''};
  const data=basis({modules:{uren:false,potjes:true,loon:true,recept:false},
    werkgevers:['AOW','Pensioenfonds'],
    werkCfg:Object.assign(werk('AOW',AOW),werk('Pensioenfonds',PEN)),
    loon:AOW,
    loonLog:[{id:'x1',date:'2026-06-23',amount:1400,payIso:'2026-06-23',werk:'AOW'},
             {id:'x2',date:'2026-07-01',amount:620,payIso:'2026-07-01',werk:'Pensioenfonds'}]});
  schermen(data,'AOW en pensioen zonder Uren-module');
  const r=run(data,a=>({
    woord:a.bronWoord(true),enkel:a.bronWoord(false,false),
    actiefWoord:a.bronActiefWoord(true),
    bronnen:a.loonBronnen().length,
    /* De lijst moet bereikbaar zijn, anders kun je je tweede inkomen niet eens invoeren. */
    lijstZichtbaar:a.BEHEER.find(b=>b.k==='werkgevers').toon()
  }));
  meld('zonder Uren-module heet het "Inkomstenbronnen", niet "Werkgevers"',
    !r.fout&&r.extra.woord==='Inkomstenbronnen'&&r.extra.enkel==='inkomstenbron', JSON.stringify(r.extra||r.fout));
  meld('zonder Uren-module heet het "Loopt nu", niet "In dienst"',
    !r.fout&&r.extra.actiefWoord==='Loopt nu', String(r.extra&&r.extra.actiefWoord));
  meld('zonder Uren-module is de lijst bereikbaar en zijn er twee inkomstenbronnen',
    !r.fout&&r.extra.lijstZichtbaar===true&&r.extra.bronnen===2, JSON.stringify(r.extra||r.fout));

  /* En met de Uren-module aan blijft het gewoon "Werkgever" heten. */
  const metUren=run(basis({modules:{uren:true,potjes:true,loon:true,recept:false},
    werkgevers:['Jumbo'],werkCfg:werk('Jumbo',AOW)}),a=>({woord:a.bronWoord(true),actief:a.bronActiefWoord(true)}));
  meld('met Uren-module blijft het gewoon "Werkgevers" en "In dienst"',
    !metUren.fout&&metUren.extra.woord==='Werkgevers'&&metUren.extra.actief==='In dienst',
    JSON.stringify(metUren.extra||metUren.fout));
}

// ─────────────────────────────────────────────────────────────────────────────
// 22. Back-up en herstel: het enige vangnet dat de gebruiker heeft.
// ─────────────────────────────────────────────────────────────────────────────
{
  /* De app belooft letterlijk dat je pincode niet in het bestand staat. Dan moet dat ook zo zijn. */
  const pin=run(basis({lock:{on:true,pin:'1234'}}),a=>{
    const b=a.backupData();
    return{pin:b.lock.pin,slotAan:b.lock.on,inTekst:JSON.stringify(b).indexOf('1234')>=0};
  });
  meld('back-up: de pincode staat NIET in het bestand',
    !pin.fout&&pin.extra.pin===''&&pin.extra.inTekst===false, JSON.stringify(pin.extra||pin.fout));
  meld('back-up: dat het slot aanstond blijft wel bewaard',
    !pin.fout&&pin.extra.slotAan===true, JSON.stringify(pin.extra||pin.fout));

  /* Twee banen, zelfde dag, zelfde bedrag: dat zijn twee betalingen, geen duplicaat. */
  const zelfde=run(basis({loonLog:[]}),a=>{
    a.mergeImport({loonLog:[
      {id:'p1',date:'2026-07-25',amount:480,werk:'Jumbo'},
      {id:'p2',date:'2026-07-25',amount:480,werk:'Sincere'}]});
    return a.db.loonLog.length;
  });
  meld('herstel: zelfde bedrag op zelfde dag van twee banen blijft twee ontvangsten',
    !zelfde.fout&&zelfde.extra===2, String(zelfde.extra||zelfde.fout));

  /* En een écht duplicaat moet nog steeds wél worden herkend. */
  const dubbel=run(basis({loonLog:[{id:'p1',date:'2026-07-25',amount:480,werk:'Jumbo'}]}),a=>{
    a.mergeImport({loonLog:[{id:'p1',date:'2026-07-25',amount:480,werk:'Jumbo'}]});
    return a.db.loonLog.length;
  });
  meld('herstel: een echt duplicaat wordt nog steeds herkend',
    !dubbel.fout&&dubbel.extra===1, String(dubbel.extra||dubbel.fout));

  /* Je gekozen hoofdbaan hoort de overstap naar een nieuwe telefoon te overleven. */
  const hoofd=run(basis({werkgevers:['Jumbo','Sincere'],
    werkCfg:Object.assign(werk('Jumbo',{mode:'month',dag:4,intervalWeeks:4,start:''}),
                          werk('Sincere',{mode:'month',dag:25,intervalWeeks:4,start:''}))}),a=>{
    a.mergeImport({hoofdwerk:'Jumbo'});
    return a.db.hoofdwerk;
  });
  meld('herstel: je gekozen hoofdbaan komt mee uit de back-up',
    !hoofd.fout&&hoofd.extra==='Jumbo', String(hoofd.extra||hoofd.fout));

  /* Een werkgever met andere schrijfwijze mag geen weesdiensten achterlaten. */
  const schrijf=run(basis({werkgevers:['Jumbo'],werkCfg:werk('Jumbo',{mode:'month',dag:4,intervalWeeks:4,start:''}),shifts:[]}),a=>{
    a.mergeImport({werkgevers:['jumbo'],shifts:[{id:'s9',werk:'jumbo',date:'2026-07-02',start:'09:00',end:'17:00',pauze:0}]});
    return{werkgevers:a.db.werkgevers,dienstWerk:(a.db.shifts[0]||{}).werk};
  });
  meld('herstel: een dienst van "jumbo" komt onder het bestaande "Jumbo" te staan',
    !schrijf.fout&&schrijf.extra.werkgevers.length===1&&schrijf.extra.dienstWerk==='Jumbo',
    JSON.stringify(schrijf.extra||schrijf.fout));

  /* Twee keer hetzelfde document met een andere datum mag geen dubbel id opleveren. */
  const doc=run(basis({documenten:[{id:'d1',n:'Paspoort',type:'ID',verloopt:'2031-01-01'}]}),a=>{
    a.mergeImport({documenten:[{id:'d1',n:'Paspoort',type:'ID',verloopt:'2026-01-01'}]});
    const ids=a.db.documenten.map(x=>x.id);
    return{aantal:ids.length,uniek:ids.length===new Set(ids).size};
  });
  meld('herstel: twee versies van hetzelfde document krijgen elk een eigen id',
    !doc.fout&&doc.extra.aantal===2&&doc.extra.uniek===true, JSON.stringify(doc.extra||doc.fout));
}

// ─────────────────────────────────────────────────────────────────────────────
// Hoofdbaan omzetten moet je meteen zien: de lijst staat in een sheet bovenop de pagina, dus
// render() alleen liet je naar de oude badge kijken tot je het scherm sloot en weer opende.
// ─────────────────────────────────────────────────────────────────────────────
{
  const L=d=>({mode:'month',dag:d,intervalWeeks:4,start:''});
  const data=basis({werkgevers:['Baan A','Baan B'],
    werkCfg:Object.assign(werk('Baan A',L(20)),werk('Baan B',L(8))),
    hoofdwerk:'Baan A'});
  const r=run(data,a=>{
    /* Het lijst-element vasthouden, zodat we zien wat de app erin tekent. */
    const cel={innerHTML:'',style:{},classList:{add(){},remove(){},toggle(){},contains(){return false;}},
      querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},setAttribute(){},removeAttribute(){}};
    const oud=globalThis.document.getElementById;
    globalThis.document.getElementById=id=>id==='bhList'?cel:oud(id);
    globalThis.window._bk='werkgevers';
    a.renderBhList();
    const voor=cel.innerHTML;
    a.zetHoofdBaan('Baan B');
    const na=cel.innerHTML;
    globalThis.document.getElementById=oud;
    /* De badge hoort achter de naam te staan waar je net op tikte. */
    const badgeNa=w=>new RegExp(w+'</b>[^]{0,400}?Hoofdbaan').test(na);
    return{hoofdwerk:a.db.hoofdwerk,veranderd:voor!==na,badgeB:badgeNa('Baan B'),badgeA:badgeNa('Baan A')};
  });
  meld('hoofdbaan omzetten: de lijst werkt meteen bij, zonder sluiten en opnieuw openen',
    !r.fout&&r.extra&&r.extra.veranderd&&r.extra.badgeB&&!r.extra.badgeA&&r.extra.hoofdwerk==='Baan B',
    JSON.stringify(r.extra||r.fout));
}

// ─────────────────────────────────────────────────────────────────────────────
// Een huur die nog openstaat gaat er nog steeds af. Viel die datum uit de projectie, dan zei de app
// "je loopt een maand voor" terwijl er een maandhuur klaarstond om afgeschreven te worden.
// ─────────────────────────────────────────────────────────────────────────────
{
  const nu=run(basis(),a=>a.isoDate(a.vandaag())).extra;
  const eerste=nu.slice(0,8)+'01';
  const potje=extraVeld=>basis({potjes:[Object.assign({n:'Vaste lasten',maand:0,saldo:900,items:[
    {id:'i1',n:'Huur',v:900,fn:1,fu:'m',due:eerste,paidDates:{},skipDates:{},toeslagen:[]}],uitgaven:[]},extraVeld||{})]});

  const open=run(potje(),a=>({voor:a.looptEenMaandVoor(),uit:a.potProjectie(0).uit,tekort:a.potMonthStatus(0).tekort}));
  meld('openstaande huur van de 1e telt nog mee: geen valse "je loopt een maand voor"',
    !open.fout&&open.extra.voor===false&&open.extra.uit===900,
    JSON.stringify(open.extra||open.fout));

  /* Zelfde potje, maar de huur is betaald: dan klopt de geruststelling wél. */
  const betaald=run(potje(),a=>{a.db.potjes[0].items[0].paidDates[eerste]=true;a.db.potjes[0].saldo=900;
    return{voor:a.looptEenMaandVoor(),uit:a.potProjectie(0).uit};});
  meld('is de huur afgevinkt, dan zegt de app wel gewoon dat je een maand voorloopt',
    !betaald.fout&&betaald.extra.voor===true&&betaald.extra.uit===0,
    JSON.stringify(betaald.extra||betaald.fout));

  /* "Deze betaling komt niet" haalt geld niet van je rekening, dus hoort er ook niet vanaf. */
  const over=run(potje(),a=>{a.db.potjes[0].items[0].skipDates[eerste]=true;
    return{uit:a.potProjectie(0).uit,voor:a.looptEenMaandVoor()};});
  meld('een betaling op "komt niet" wordt niet meer van je projectie afgetrokken',
    !over.fout&&over.extra.uit===0&&over.extra.voor===true,
    JSON.stringify(over.extra||over.fout));
}

// ─────────────────────────────────────────────────────────────────────────────
// Kapotte diensten uit een oude back-up mogen nooit "NaNu NaNm" op je scherm zetten.
// ─────────────────────────────────────────────────────────────────────────────
{
  const r=run(basis({werkgevers:['Jumbo'],werkCfg:werk('Jumbo',{mode:'month',dag:25,intervalWeeks:4,start:''}),
    shifts:[{id:'a',werk:'Jumbo',date:'2026-08-01',start:'x',end:'y',pauze:0},
            {id:'b',werk:'Jumbo',date:'2026-08-02',start:'09:00',end:'17:00',pauze:-120}]}),
    a=>({kapot:a.fmtDur(a.hoursOf(a.db.shifts[0])),negPauze:a.fmtDur(a.hoursOf(a.db.shifts[1])),nan:a.fmtDur(NaN)}));
  meld('kapotte tijden en een negatieve pauze leveren nooit "NaN" of extra uren op',
    !r.fout&&r.extra.kapot==='0u 00m'&&r.extra.negPauze==='8u 00m'&&r.extra.nan==='0u 00m',
    JSON.stringify(r.extra||r.fout));
}

// ─────────────────────────────────────────────────────────────────────────────
// Een document zonder eigen waarschuwtermijn hoort op de standaard van 3 maanden te staan —
// hetzelfde als wat het invoerscherm voorstelt.
// ─────────────────────────────────────────────────────────────────────────────
{
  const r=run(basis({documenten:[{id:'d1',n:'Paspoort',type:'Paspoort',verloopt:'2030-01-01'}]}),
    a=>({zonder:a.docWarnDays(a.db.documenten[0]),drieMnd:a.docWarnDays({warnN:3,warnU:'m'}),nul:a.docWarnDays({warnN:0,warnU:'m'})}));
  meld('document zonder ingestelde termijn waarschuwt 3 maanden vooraf, net als het invoerscherm belooft',
    !r.fout&&r.extra.zonder===r.extra.drieMnd&&r.extra.nul===0,
    JSON.stringify(r.extra||r.fout));
}

console.log(check.join('\n'));
const fout=check.filter(c=>c.startsWith('FOUT')).length;
console.log('\n'+(fout?fout+' SCENARIO\'S GEFAALD':'alle '+check.length+' scenariocontroles kloppen'));
if(fout)process.exitCode=1;
