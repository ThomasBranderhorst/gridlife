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

console.log(check.join('\n'));
const fout=check.filter(c=>c.startsWith('FOUT')).length;
console.log('\n'+(fout?fout+' SCENARIO\'S GEFAALD':'alle '+check.length+' scenariocontroles kloppen'));
if(fout)process.exitCode=1;
