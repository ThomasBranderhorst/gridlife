import { run } from './harness.mjs';
const basis = (o={}) => Object.assign({
  setup:true,naam:'T',modules:{uren:true,potjes:true,loon:true,recept:true},feat:{},lock:{on:false,pin:''},
  werkgevers:['W'],werkCfg:{},contract:{},shifts:[],potjes:[],rekeningen:[],boodschappen:[],
  loon:{mode:'month',dag:25,intervalWeeks:4,start:''},loonLog:[],meldingen:true,meldTijd:'08:00',
  overboek:{},backup:{on:true},receptCategorieen:[],recepten:[],documenten:[],docTypes:['X']
}, o);
const check=[];const meld=(n,ok,det)=>{check.push((ok?'ok   ':'FOUT ')+n+(det?'  '+det:''));};

// 1. urenberekening
{
  const d=basis({shifts:[
    {id:'1',werk:'W',date:'2026-07-01',start:'09:00',end:'17:00',pauze:30},   // 7u30
    {id:'2',werk:'W',date:'2026-07-02',start:'23:00',end:'02:00',pauze:0},    // 3u nachtdienst
    {id:'3',werk:'W',date:'2026-07-03',start:'08:00',end:'10:00',pauze:9999}, // pauze > dienst -> 0
    {id:'4',werk:'W',date:'2026-07-04',start:'09:00',end:'09:00',pauze:0},    // 0u
  ]});
  const r=run(d,a=>d.shifts.map(s=>a.fmtDur(a.hoursOf(s))));
  meld('uren: normaal/nacht/te lange pauze/nul', !r.fout && JSON.stringify(r.extra)==='["7u 30m","3u 00m","0u 00m","0u 00m"]', JSON.stringify(r.extra||r.fout));
}
// 2. loondagen per frequentie
{
  const varianten=[
    ['maandelijks 25e',{mode:'month',dag:25},12],
    ['laatste dag',{mode:'month',dag:31},12],
    ['29e (feb kort)',{mode:'month',dag:29},12],
    ['wekelijks',{mode:'weeks',intervalWeeks:1,start:'2026-01-02'},52],
    ['2-wekelijks',{mode:'weeks',intervalWeeks:2,start:'2026-01-02'},26],
    ['3-wekelijks',{mode:'weeks',intervalWeeks:3,start:'2026-01-02'},18],
    ['4-wekelijks',{mode:'weeks',intervalWeeks:4,start:'2026-01-02'},13],
  ];
  varianten.forEach(([naam,L,verwacht])=>{
    const r=run(basis({loon:Object.assign({dag:25,intervalWeeks:4,start:''},L)}),a=>a.loonDatesInRange(new Date(2026,0,1),new Date(2026,11,31)).length);
    meld('loondagen '+naam+' = '+verwacht+'/jaar', !r.fout && r.extra===verwacht, String(r.extra||r.fout));
  });
}
// 3. weekendregel
{
  const r=run(basis({loon:{mode:'month',dag:25,intervalWeeks:4,start:'',weekend:'voor'}}),
    a=>a.loonDatesInRange(new Date(2026,0,1),new Date(2026,11,31)).map(x=>a.isoDate(x)+'('+a.DAG[x.getDay()]+')'));
  const geenWeekend=!r.fout && r.extra.every(s=>!/\(za\)|\(zo\)/.test(s));
  meld('weekendregel "vrijdag ervoor": nooit za/zo', geenWeekend, (r.extra||[]).slice(6,9).join(' '));
  const r2=run(basis({loon:{mode:'month',dag:25,intervalWeeks:4,start:'',weekend:'na'}}),
    a=>a.loonDatesInRange(new Date(2026,0,1),new Date(2026,11,31)).map(x=>a.DAG[x.getDay()]));
  meld('weekendregel "maandag erna": nooit za/zo', !r2.fout && r2.extra.every(x=>x!=='za'&&x!=='zo'), (r2.extra||[]).join(','));
}
// 4. doorstappen mag niet driften door de weekendregel
{
  const r=run(basis({loon:{mode:'weeks',dag:25,intervalWeeks:4,start:'2026-07-25',weekend:'voor'}}),
    a=>a.upcomingPaydays(6).map(x=>a.isoDate(x)));
  const dagen=(r.extra||[]).map(s=>new Date(s));
  let ok=true;for(let i=1;i<dagen.length;i++){const v=Math.round((dagen[i]-dagen[i-1])/86400000);if(v<26||v>30)ok=false;}
  meld('4-wekelijks + weekendregel: geen drift', !r.fout&&ok, (r.extra||[]).join(' '));
}
// 5. potberekening met toeslag
{
  const d=basis({potjes:[{n:'P',saldo:100,log:[],items:[
    {id:'a',n:'Zorg',v:176.34,fn:1,fu:'m',due:'2026-07-29',paidDates:{},receivedDates:{},toeslag:{v:129,fn:1,fu:'m'}},
    {id:'b',n:'Jaar',v:120,fn:1,fu:'j',due:'2026-12-01',paidDates:{},receivedDates:{}},
  ]}]});
  const r=run(d,a=>a.potTot(a.db.potjes[0]).toFixed(2));
  meld('potTot: 176,34-129 + 120/12 = 57,34', !r.fout && r.extra==='57.34', String(r.extra||r.fout));
}
// 6. toeslag groter dan bedrag -> nooit negatief
{
  const d=basis({potjes:[{n:'P',saldo:0,log:[],items:[{id:'a',n:'x',v:20,fn:1,fu:'m',due:'2026-07-28',paidDates:{},receivedDates:{},toeslag:{v:200,fn:1,fu:'m'}}]}]});
  const r=run(d,a=>a.potTot(a.db.potjes[0]));
  meld('toeslag > bedrag geeft geen negatief maandbedrag', !r.fout && r.extra===0, String(r.extra||r.fout));
}
// 7. occInRange kan niet ontploffen
{
  const r=run(basis(),a=>({neg:a.occInRange('2026-01-01',-5,'m',new Date(2026,0,1),new Date(2026,11,31)).length,
                           nul:a.occInRange('2026-01-01',0,'m',new Date(2026,0,1),new Date(2026,11,31)).length,
                           kapot:a.occInRange('zomaar',1,'m',new Date(2026,0,1),new Date(2026,11,31)).length,
                           groot:a.occInRange('2026-01-01',1,'d',new Date(2026,0,1),new Date(2036,11,31)).length}));
  const e=r.extra||{};
  meld('occInRange begrensd bij rare invoer', !r.fout && e.neg===12 && e.nul===12 && e.kapot===0 && e.groot<=400, JSON.stringify(e));
}
// 8. Pasen — bepaalt vijf van de tien feestdagen, dus als dit misgaat klopt de rest ook niet
{
  const bekend={2024:'2024-03-31',2025:'2025-04-20',2026:'2026-04-05',2027:'2027-03-28',2028:'2028-04-16',2030:'2030-04-21'};
  const r=run(basis(),a=>Object.keys(bekend).map(y=>a.isoDate(a.pasen(+y))));
  const ok=!r.fout && JSON.stringify(r.extra)===JSON.stringify(Object.values(bekend));
  meld('Pasen 2024-2030 klopt', ok, JSON.stringify(r.extra||r.fout));
}
// 9. Nederlandse feestdagen 2026
{
  const r=run(basis(),a=>a.feestdagen(2026));
  const f=r.extra||{};
  const wil={'2026-01-01':'Nieuwjaarsdag','2026-04-03':'Goede Vrijdag','2026-04-05':'Eerste Paasdag','2026-04-06':'Tweede Paasdag',
             '2026-04-27':'Koningsdag','2026-05-14':'Hemelvaartsdag','2026-05-24':'Eerste Pinksterdag','2026-05-25':'Tweede Pinksterdag',
             '2026-12-25':'Eerste Kerstdag','2026-12-26':'Tweede Kerstdag'};
  meld('feestdagen 2026 compleet en juist', !r.fout && JSON.stringify(f)===JSON.stringify(wil), JSON.stringify(f).slice(0,150));
  // 27 april 2025 is een zondag -> Koningsdag schuift naar de 26e
  const r2=run(basis(),a=>a.feestdagen(2025)['2025-04-26']);
  meld('Koningsdag 2025 valt op 26 april (27e is zondag)', !r2.fout && r2.extra==='Koningsdag', String(r2.extra||r2.fout));
  const r3=run(basis(),a=>Object.keys(a.feestdagen(2026)).indexOf('2026-05-05'));
  meld('5 mei staat er bewust niet in (banken verwerken door)', !r3.fout && r3.extra===-1, String(r3.extra));
}
// 10. feestdag-regel op de loondag zelf
{
  // 25 dec 2026 is een vrijdag EN Eerste Kerstdag -> met feestdagen aan wordt het do 24 dec
  const r=run(basis({loon:{mode:'month',dag:25,weekend:'voor',feest:true}}),
    a=>a.loonDatesInRange(new Date(2026,11,1),new Date(2026,11,31)).map(x=>a.isoDate(x)));
  meld('loondag 25 dec 2026 schuift naar 24 dec (Kerst)', !r.fout && JSON.stringify(r.extra)==='["2026-12-24"]', JSON.stringify(r.extra||r.fout));
  // zonder feestdagen blijft het gewoon vrijdag de 25e
  const r2=run(basis({loon:{mode:'month',dag:25,weekend:'voor',feest:false}}),
    a=>a.loonDatesInRange(new Date(2026,11,1),new Date(2026,11,31)).map(x=>a.isoDate(x)));
  meld('feestdagen uit: 25 dec 2026 blijft staan', !r2.fout && JSON.stringify(r2.extra)==='["2026-12-25"]', JSON.stringify(r2.extra||r2.fout));
  // 6 april 2026 is Tweede Paasdag (maandag) -> "werkdag ervoor" moet helemaal terug naar vrijdag 3 april?
  // nee: 3 april is Goede Vrijdag, dus door naar donderdag 2 april
  const r3=run(basis({loon:{mode:'month',dag:6,weekend:'voor',feest:true}}),
    a=>a.loonDatesInRange(new Date(2026,3,1),new Date(2026,3,30)).map(x=>a.isoDate(x)));
  meld('Pasen: 6 apr 2026 loopt door tot do 2 apr', !r3.fout && JSON.stringify(r3.extra)==='["2026-04-02"]', JSON.stringify(r3.extra||r3.fout));
  // een heel jaar mag nooit op een feestdag of in het weekend uitkomen
  const r4=run(basis({loon:{mode:'month',dag:25,weekend:'voor',feest:true}}),
    a=>a.loonDatesInRange(new Date(2026,0,1),new Date(2026,11,31)).map(x=>({d:a.isoDate(x),g:x.getDay(),f:a.feestNaam(x)})));
  const schoon=!r4.fout && r4.extra.length===12 && r4.extra.every(x=>x.g!==0&&x.g!==6&&!x.f);
  meld('heel 2026: nooit weekend, nooit feestdag', schoon, JSON.stringify((r4.extra||[]).filter(x=>x.g===0||x.g===6||x.f)));
}
// 11. twee keer per maand
{
  const r=run(basis({loon:{mode:'twice',dag:15,dag2:31}}),
    a=>a.loonDatesInRange(new Date(2026,0,1),new Date(2026,11,31)).map(x=>a.isoDate(x)));
  meld('2x per maand = 24 loondagen per jaar', !r.fout && r.extra.length===24, String((r.extra||[]).length));
  meld('2x per maand: feb pakt de 15e en de 28e', !r.fout && r.extra.indexOf('2026-02-15')>=0 && r.extra.indexOf('2026-02-28')>=0, (r.extra||[]).slice(2,4).join(' '));
  // twee dezelfde dagen mag nooit dubbeltellen of vastlopen
  const r2=run(basis({loon:{mode:'twice',dag:25,dag2:25}}),
    a=>a.loonDatesInRange(new Date(2026,0,1),new Date(2026,11,31)).length);
  meld('2x per maand met 2x dezelfde dag telt als 12, niet 24', !r2.fout && r2.extra===12, String(r2.extra||r2.fout));
  // 29e + laatste dag vallen in februari samen -> die maand één loondag
  const r3=run(basis({loon:{mode:'twice',dag:29,dag2:31}}),
    a=>a.loonDatesInRange(new Date(2026,1,1),new Date(2026,1,28)).map(x=>a.isoDate(x)));
  meld('29e + laatste dag: feb geeft één loondag', !r3.fout && JSON.stringify(r3.extra)==='["2026-02-28"]', JSON.stringify(r3.extra||r3.fout));
  // heen en weer stappen moet consistent zijn
  const r4=run(basis({loon:{mode:'twice',dag:15,dag2:31}}),a=>{
    const d1=a.rawNextPayday(a.db.loon);const d2=a.rawPaydayAfter(a.db.loon,d1);const terug=a.rawPaydayBefore(a.db.loon,d2);
    return [a.isoDate(d1),a.isoDate(d2),a.isoDate(terug)];
  });
  meld('2x per maand: vooruit en terug stappen komt uit', !r.fout&&!r4.fout && r4.extra[0]===r4.extra[2], JSON.stringify(r4.extra||r4.fout));
}
// 12. laatste vrijdag / laatste werkdag van de maand
{
  const r=run(basis({loon:{mode:'month',dagType:'weekdag',wd:5,wdN:5}}),
    a=>a.loonDatesInRange(new Date(2026,0,1),new Date(2026,11,31)).map(x=>a.isoDate(x)+'('+a.DAG[x.getDay()]+')'));
  const alleVr=!r.fout && r.extra.length===12 && r.extra.every(s=>s.endsWith('(vr)'));
  meld('laatste vrijdag: 12x per jaar en altijd vrijdag', alleVr, (r.extra||[]).slice(0,3).join(' '));
  // laatste vrijdag van juli 2026 is de 31e
  meld('laatste vrijdag juli 2026 = 31 juli', !r.fout && (r.extra||[]).some(s=>s.startsWith('2026-07-31')), (r.extra||[])[6]);
  // eerste maandag
  const r2=run(basis({loon:{mode:'month',dagType:'weekdag',wd:1,wdN:1}}),
    a=>a.loonDatesInRange(new Date(2026,0,1),new Date(2026,11,31)).map(x=>x.getDay()+':'+x.getDate()));
  meld('eerste maandag: altijd maandag en in de eerste week', !r2.fout && r2.extra.length===12 && r2.extra.every(s=>s.split(':')[0]==='1'&&+s.split(':')[1]<=7), (r2.extra||[]).slice(0,3).join(' '));
  // laatste werkdag: nooit weekend, nooit feestdag
  const r3=run(basis({loon:{mode:'month',dagType:'werkdag'}}),
    a=>a.loonDatesInRange(new Date(2026,0,1),new Date(2026,11,31)).map(x=>({d:a.isoDate(x),g:x.getDay(),f:a.feestNaam(x)})));
  meld('laatste werkdag: 12x, nooit weekend of feestdag', !r3.fout && r3.extra.length===12 && r3.extra.every(x=>x.g!==0&&x.g!==6&&!x.f), JSON.stringify((r3.extra||[]).filter(x=>x.g===0||x.g===6||x.f)));
  // mei 2026: 31 mei is zondag, 30 zaterdag -> vrijdag 29 mei
  meld('laatste werkdag mei 2026 = vrijdag 29 mei', !r3.fout && (r3.extra||[]).some(x=>x.d==='2026-05-29'), JSON.stringify((r3.extra||[])[4]));
  // 1 januari is Nieuwjaarsdag -> laatste werkdag van dec 2026 is niet 31 dec (do) maar wel: 31 dec is gewoon werkdag
  meld('laatste werkdag dec 2026 = do 31 dec', !r3.fout && (r3.extra||[]).some(x=>x.d==='2026-12-31'), JSON.stringify((r3.extra||[])[11]));
}
// 13. wisselende loondag zonder patroon
{
  const dts=['2026-08-03','2026-09-11','2026-10-02','2026-11-20'];
  const r=run(basis({loon:{mode:'manual',dates:dts,weekend:'voor',feest:true}}),
    a=>a.loonDatesInRange(new Date(2026,7,1),new Date(2026,11,31)).map(x=>a.isoDate(x)));
  meld('wisselend: precies de ingevulde datums', !r.fout && JSON.stringify(r.extra)===JSON.stringify(dts), JSON.stringify(r.extra||r.fout));
  // 3 aug 2026 is een maandag; 2 okt een vrijdag. Er mag NIETS verschoven worden, ook niet met een weekendregel
  const r2=run(basis({loon:{mode:'manual',dates:['2026-08-08'],weekend:'voor',feest:true}}),
    a=>a.loonDatesInRange(new Date(2026,7,1),new Date(2026,7,31)).map(x=>a.isoDate(x)));
  meld('wisselend: een zaterdag blijft die zaterdag', !r2.fout && JSON.stringify(r2.extra)==='["2026-08-08"]', JSON.stringify(r2.extra||r2.fout));
  // lege lijst mag niet vastlopen en levert gewoon niks op
  const r3=run(basis({loon:{mode:'manual',dates:[]}}),a=>({n:a.loonDatesInRange(new Date(2026,0,1),new Date(2026,11,31)).length,volg:String(a.nextPaydayEff()),per:a.currentPeriodKey()}));
  meld('wisselend zonder datums loopt niet vast', !r3.fout && r3.extra.n===0 && r3.extra.volg==='null', JSON.stringify(r3.extra||r3.fout));
  // rommel in de lijst wordt eruit gefilterd
  const r4=run(basis({loon:{mode:'manual',dates:['2026-08-03','zomaar',null,'2026-08-03','1999-01-01',42]}}),
    a=>a.db.loon.dates);
  meld('wisselend: rommel en dubbele datums worden opgeruimd', !r4.fout && JSON.stringify(r4.extra)==='["2026-08-03"]', JSON.stringify(r4.extra||r4.fout));
}
// 14. rare instellingen mogen nooit vastlopen of ontploffen
{
  const raar=[
    ['onbekende modus',{mode:'raketaandrijving',dag:25}],
    ['dagType rommel',{mode:'month',dagType:'blabla',dag:25}],
    ['dag2 is NaN',{mode:'twice',dag:15,dag2:'x'}],
    ['weekdag buiten bereik',{mode:'month',dagType:'weekdag',wd:99,wdN:-4}],
    ['weekendregel rommel',{mode:'month',dag:25,weekend:'ergens'}],
    ['dates is geen lijst',{mode:'manual',dates:'2026-08-03'}],
    ['interval 9999',{mode:'weeks',intervalWeeks:9999,start:'2026-01-02'}],
    ['start in het jaar 3000',{mode:'weeks',intervalWeeks:4,start:'3000-01-01'}],
  ];
  raar.forEach(([naam,L])=>{
    const r=run(basis({loon:L}),a=>({
      n:a.loonDatesInRange(new Date(2026,0,1),new Date(2026,11,31)).length,
      volg:String(a.nextPaydayEff()),
      per:a.currentPeriodKey(),
      kort:a.loonKort(a.db.loon),
    }));
    meld('blijft heel bij: '+naam, !r.fout && r.extra.n<=60, JSON.stringify(r.extra||r.fout));
  });
  // Een vertypte referentiedatum (3000 i.p.v. 2026) moet gewoon het ritme volgen, niet in het jaar 2616 uitkomen
  const r=run(basis({loon:{mode:'weeks',intervalWeeks:4,start:'3000-01-01'}}),
    a=>({volg:a.isoDate(a.nextPayday(a.db.loon)),jaar:a.loonDatesInRange(new Date(2026,0,1),new Date(2026,11,31)).length}));
  meld('vertypte referentiedatum blijft in het heden', !r.fout && r.extra.volg.startsWith('2026-') && r.extra.jaar===13, JSON.stringify(r.extra||r.fout));
  const r2=run(basis({loon:{mode:'weeks',intervalWeeks:4,start:'1901-01-01'}}),
    a=>({volg:a.isoDate(a.nextPayday(a.db.loon)),jaar:a.loonDatesInRange(new Date(2026,0,1),new Date(2026,11,31)).length}));
  meld('referentiedatum van heel lang geleden werkt ook', !r2.fout && r2.extra.volg.startsWith('2026-') && r2.extra.jaar===13, JSON.stringify(r2.extra||r2.fout));
}
// 15. een losse loon-ontvangst mag niet meerdere loondagen tegelijk afvinken
{
  const r=run(basis({loon:{mode:'twice',dag:15,dag2:31},loonLog:[{date:'2026-08-14',amount:900}]}),a=>({
    vroeg:!!a.loonEntryFor('2026-08-15'),
    laat:!!a.loonEntryFor('2026-08-31'),
  }));
  meld('2x per maand: ontvangst hoort bij één loondag', !r.fout && r.extra.vroeg===true && r.extra.laat===false, JSON.stringify(r.extra||r.fout));
  const r2=run(basis({loon:{mode:'month',dag:25},loonLog:[{date:'2026-08-25',amount:900}]}),a=>!!a.loonEntryFor('2026-08-25'));
  meld('maandelijks: ontvangst wordt gewoon gekoppeld', !r2.fout && r2.extra===true, String(r2.extra||r2.fout));
}
// 16. de omschrijvingen in gewone taal
{
  const r=run(basis(),a=>[
    a.loonKort(a.schoonLoonCfg({mode:'month',dag:25})),
    a.loonKort(a.schoonLoonCfg({mode:'month',dag:31})),
    a.loonKort(a.schoonLoonCfg({mode:'twice',dag:15,dag2:31})),
    a.loonKort(a.schoonLoonCfg({mode:'month',dagType:'weekdag',wd:5,wdN:5})),
    a.loonKort(a.schoonLoonCfg({mode:'month',dagType:'werkdag'})),
    a.loonKort(a.schoonLoonCfg({mode:'weeks',intervalWeeks:4,start:'2026-01-02'})),
    a.loonKort(a.schoonLoonCfg({mode:'manual',dates:['2026-08-03']})),
  ]);
  const wil=['loon op de 25e van de maand','loon op de laatste dag van de maand','loon op de 15e en de laatste dag van de maand',
             'loon op de laatste vrijdag van de maand','loon op de laatste werkdag van de maand','elke 4 weken loon','wisselende loondagen'];
  meld('omschrijving per modus klopt', !r.fout && JSON.stringify(r.extra)===JSON.stringify(wil), JSON.stringify(r.extra||r.fout));
}
// 17. gemiddeld inkomen = rollend jaar; vakantiegeld uitgesmeerd; lopende maand telt niet mee
{
  const mk=(back,amount)=>{const d=new Date();d.setDate(15);d.setMonth(d.getMonth()-back);
    return {id:'i'+back+'_'+amount,date:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-15',amount};};
  const logs=[];for(let b=1;b<=12;b++)logs.push(mk(b,1500));   // 12 volle maanden à 1500 = 18000
  logs.push(mk(5,3000));                                       // vakantiegeld, extra in maand -5
  logs.push(mk(0,9999));                                       // lopende maand -> moet worden genegeerd
  const r=run(basis({loonLog:logs}),a=>a.avgIncome());
  // (18000 + 3000) / 12 maanden = 1750; de 9999 van de lopende maand doet niet mee
  meld('gemiddeld inkomen = rollend jaar, vakantiegeld uitgesmeerd, lopende maand eruit', !r.fout && r.extra===1750, String(r.extra||r.fout));
  const kort=[mk(1,1000),mk(2,1200),mk(3,1400)];              // nog geen jaar historie
  const r2=run(basis({loonLog:kort}),a=>a.avgIncome());
  meld('minder dan een jaar: gemiddelde over wat er is', !r2.fout && r2.extra===1200, String(r2.extra||r2.fout));
  const r3=run(basis({loonLog:[]}),a=>a.avgIncome());
  meld('geen loon gelogd -> geen gemiddelde', !r3.fout && r3.extra===null, String(r3.extra));
  const r4=run(basis({loonLog:[{id:'x',date:'niet-een-datum',amount:500},mk(1,1600)]}),a=>a.avgIncome());
  meld('kapotte datum in loonLog laat het gemiddelde niet ontsporen', !r4.fout && r4.extra===1600, String(r4.extra||r4.fout));
}
// 18. brandstof-functie volgt de data (de import-bug)
{
  const d=basis({feat:{fuel:false},potjes:[{n:'Benzine',saldo:40,log:[],items:[],fuel:true}]});
  const r=run(d,a=>({fuel:a.featOn('fuel'),key:a.db.feat.fuel}));
  meld('brandstof-functie aan zodra er een benzine-potje is', !r.fout && r.extra.fuel===true, JSON.stringify(r.extra||r.fout));
  const d2=basis({feat:{fuel:false},potjes:[{n:'Gewoon',saldo:0,log:[],items:[]}]});
  const r2=run(d2,a=>a.featOn('fuel'));
  meld('geen benzine-potje: uitgezette functie blijft uit', !r2.fout && r2.extra===false, String(r2.extra));
}
console.log(check.join('\n'));
const fout=check.filter(c=>c.startsWith('FOUT')).length;
console.log('\n'+(fout?fout+' CONTROLES GEFAALD':'alle '+check.length+' rekencontroles kloppen'));
