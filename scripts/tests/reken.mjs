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
// 19. migratie: de oude enkele toeslag wordt de eerste van de lijst, mét zijn afvinkgeschiedenis
{
  const d=basis({potjes:[{n:'P',saldo:0,log:[{id:'L1',date:'2026-07-20',amount:47,kind:'ontvangst',item:'Zorgtoeslag',itemId:'a',payIso:'2026-07-20'}],items:[
    {id:'a',n:'Zorg',v:148.2,fn:1,fu:'m',due:'2026-07-29',paidDates:{},receivedDates:{'2026-07-20':'L1'},recSkipDates:{'2026-08-20':true},
     toeslag:{naam:'Zorgtoeslag',v:47,fn:1,fu:'m',date:'2026-07-20'}},
  ]}]});
  const r=run(d,a=>{const it=a.db.potjes[0].items[0];const T=a.toeslagenOf(it)[0];
    return {n:a.toeslagenOf(it).length,naam:T.naam,ontv:T.receivedDates['2026-07-20'],skip:!!T.recSkipDates['2026-08-20'],
            oud:it.toeslag===undefined&&it.receivedDates===undefined,logToe:a.db.potjes[0].log[0].toeId===T.id};});
  const e=r.extra||{};
  meld('migratie: één toeslag met zijn ontvangsten en overslagen', !r.fout&&e.n===1&&e.naam==='Zorgtoeslag'&&e.ontv==='L1'&&e.skip&&e.oud&&e.logToe, JSON.stringify(r.extra||r.fout));
}
// 20. meerdere toeslagen op één kostenpost tellen samen op in je eigen deel
{
  const d=basis({potjes:[{n:'P',saldo:0,log:[],items:[
    {id:'a',n:'Zorg',v:200,fn:1,fu:'m',due:'2026-07-29',paidDates:{},toeslagen:[
      {id:'t1',naam:'Zorgtoeslag',v:47,fn:1,fu:'m',date:'2026-07-20',receivedDates:{},recSkipDates:{}},
      {id:'t2',naam:'Werkgever',v:120,fn:1,fu:'j',date:'2026-07-20',receivedDates:{},recSkipDates:{}},
      {id:'t3',naam:'Gestopt',v:99,fn:1,fu:'m',date:'2026-01-20',tot:'2026-03-01',receivedDates:{},recSkipDates:{}},
    ]},
  ]}]});
  const r=run(d,a=>({toe:+a.itToeslagMnd(a.db.potjes[0].items[0]).toFixed(2),eigen:+a.itMnd(a.db.potjes[0].items[0]).toFixed(2)}));
  const e=r.extra||{};
  meld('meerdere toeslagen: 47 + 120/12 opgeteld, gestopte telt niet mee', !r.fout&&e.toe===57&&e.eigen===143, JSON.stringify(r.extra||r.fout));
}
// 21. elke toeslag heeft zijn eigen regel én zijn eigen afvinkadministratie
{
  const d=basis({potjes:[{n:'P',saldo:0,log:[],items:[
    {id:'a',n:'Zorg',v:200,fn:1,fu:'m',due:'2026-07-29',paidDates:{},toeslagen:[
      {id:'t1',naam:'Zorgtoeslag',v:47,fn:1,fu:'m',date:'2026-07-20',receivedDates:{},recSkipDates:{}},
      {id:'t2',naam:'Werkvergoeding',v:30,fn:1,fu:'m',date:'2026-07-20',receivedDates:{},recSkipDates:{}},
    ]},
  ]}]});
  const r=run(d,a=>{
    const rows=a.receiptRows(new Date(2026,6,1),new Date(2026,6,31));
    /* Twee toeslagen op dezelfde dag: de ene afvinken mag de andere niet meenemen. */
    a.markOccurrence(0,'a','2026-07-20','ontvangst',47,'2026-07-20','','Zorgtoeslag',true,'t1');
    const na=a.receiptRows(new Date(2026,6,1),new Date(2026,6,31));
    return {n:rows.length,labels:rows.map(x=>x.label),
            ontvangen:na.filter(x=>x.received).map(x=>x.toeId),open:na.filter(x=>!x.received).map(x=>x.toeId)};
  });
  const e=r.extra||{};
  meld('elke toeslag een eigen regel op de Geldstroom-pagina', !r.fout&&e.n===2&&e.labels.slice().sort().join('|')==='Werkvergoeding|Zorgtoeslag', JSON.stringify(r.extra||r.fout));
  meld('toeslag afvinken raakt alleen die toeslag', !r.fout&&String(e.ontvangen)==='t1'&&String(e.open)==='t2', JSON.stringify(r.extra||r.fout));
}
// 22. datum kostenpost verschuift binnen dezelfde maand: afgevinkte termijn blijft gedekt, geen dubbele open regel
{
  const d=basis({potjes:[{n:'P',saldo:0,log:[{id:'L1',date:'2026-07-10',amount:800,kind:'uitgave',item:'Huur',itemId:'a',payIso:'2026-07-10'}],items:[
    {id:'a',n:'Huur',v:800,fn:1,fu:'m',due:'2026-07-22',paidDates:{'2026-07-10':'L1'},skipDates:{}},
  ]}]});
  const r=run(d,a=>{
    const rows=a.paymentRows(new Date(2026,6,1),new Date(2026,6,31));
    return {n:rows.length,paid:rows.filter(x=>x.paid).length,iso:rows.map(x=>x.iso)};
  });
  const e=r.extra||{};
  meld('datum binnen dezelfde maand verschoven: geen dubbele juli-regel', !r.fout&&e.n===1&&e.paid===1&&e.iso[0]==='2026-07-10', JSON.stringify(r.extra||r.fout));
}
// 23. datum kostenpost springt naar een andere maand: de vastgelegde termijn blijft (historie), en er komt een nieuwe open termijn bij in het nieuwe schema
{
  const d=basis({potjes:[{n:'P',saldo:0,log:[{id:'L1',date:'2026-06-05',amount:800,kind:'uitgave',item:'Huur',itemId:'a',payIso:'2026-06-05'}],items:[
    {id:'a',n:'Huur',v:800,fn:1,fu:'m',due:'2026-07-22',paidDates:{'2026-06-05':'L1'},skipDates:{}},
  ]}]});
  const r=run(d,a=>a.paymentRows(new Date(2026,5,1),new Date(2026,6,31)).map(x=>x.iso+':'+(x.paid?'betaald':'open')));
  meld('kostenpost-datum sprong naar volgende maand: juni blijft betaald, juli komt apart open te staan', !r.fout&&JSON.stringify(r.extra)==='["2026-06-05:betaald","2026-07-22:open"]', JSON.stringify(r.extra||r.fout));
}
// 24. datum van één toeslag verschuiven laat een andere toeslag op dezelfde kostenpost ongemoeid
{
  const d=basis({potjes:[{n:'P',saldo:0,log:[],items:[
    {id:'a',n:'Zorg',v:200,fn:1,fu:'m',due:'2026-07-29',paidDates:{},toeslagen:[
      {id:'t1',naam:'Zorgtoeslag',v:47,fn:1,fu:'m',date:'2026-07-20',receivedDates:{'2026-07-20':'x'},recSkipDates:{}},
      {id:'t2',naam:'Werk',v:30,fn:1,fu:'m',date:'2026-07-20',receivedDates:{'2026-07-20':'y'},recSkipDates:{}},
    ]},
  ]}]});
  const r=run(d,a=>{
    const it=a.db.potjes[0].items[0];
    /* alleen t1 verzetten, naar de 25e - zelfde maand, dus de afgevinkte termijn blijft gedekt */
    a.toeslagenOf(it)[0].date='2026-07-25';
    const rows=a.receiptRows(new Date(2026,6,1),new Date(2026,6,31));
    return {n:rows.length,t1:rows.find(x=>x.toeId==='t1'),t2:rows.find(x=>x.toeId==='t2')};
  });
  const e=r.extra||{};
  meld('toeslag-datum verschuift onafhankelijk van andere toeslag op dezelfde kostenpost', !r.fout&&e.n===2&&e.t1&&e.t1.received&&e.t1.iso==='2026-07-20'&&e.t2&&e.t2.received&&e.t2.iso==='2026-07-20', JSON.stringify(r.extra||r.fout));
}
// 25. toeslag met verstreken "loopt tot": telt niet meer mee in het maandbedrag en levert geen rijen meer op ná die datum
{
  const d=basis({potjes:[{n:'P',saldo:0,log:[],items:[
    {id:'a',n:'Zorg',v:200,fn:1,fu:'m',due:'2026-07-29',paidDates:{},toeslagen:[
      {id:'t1',naam:'Gestopt',v:47,fn:1,fu:'m',date:'2026-01-20',tot:'2026-03-15',receivedDates:{},recSkipDates:{}},
    ]},
  ]}]});
  const r=run(d,a=>({
    mnd:a.itToeslagMnd(a.db.potjes[0].items[0]),
    voorTot:a.receiptRows(new Date(2026,1,1),new Date(2026,1,28)).length,
    naTot:a.receiptRows(new Date(2026,6,1),new Date(2026,6,31)).length,
  }));
  const e=r.extra||{};
  meld('gestopte toeslag: telt niet meer mee, geen rijen meer na "loopt tot"', !r.fout&&e.mnd===0&&e.voorTot===1&&e.naTot===0, JSON.stringify(r.extra||r.fout));
}
// 26. toeslag zonder ontvangstdatum levert geen termijnen op en crasht niet
{
  const d=basis({potjes:[{n:'P',saldo:0,log:[],items:[
    {id:'a',n:'Zorg',v:200,fn:1,fu:'m',due:'2026-07-29',paidDates:{},toeslagen:[
      {id:'t1',naam:'Nog niet gepland',v:47,fn:1,fu:'m',date:null,receivedDates:{},recSkipDates:{}},
    ]},
  ]}]});
  const r=run(d,a=>({rows:a.receiptRows(new Date(2026,6,1),new Date(2026,6,31)).length,
                      termijnen:a.openTermijnen(a.db.potjes[0].items[0],'ontvangst','2026-07-20','t1').length}));
  const e=r.extra||{};
  meld('toeslag zonder datum: geen rijen, geen termijnen, geen crash', !r.fout&&e.rows===0&&e.termijnen===0, JSON.stringify(r.extra||r.fout));
}
// 27. kostenpost zonder enige toeslag: ontvangst-termijnen zijn leeg, ook zonder toeId
{
  const d=basis({potjes:[{n:'P',saldo:0,log:[],items:[{id:'a',n:'Huur',v:800,fn:1,fu:'m',due:'2026-07-22',paidDates:{}}]}]});
  const r=run(d,a=>({toe:a.toeslagenOf(a.db.potjes[0].items[0]).length,
                      termijnen:a.openTermijnen(a.db.potjes[0].items[0],'ontvangst','2026-07-20').length,
                      uitTermijnen:a.openTermijnen(a.db.potjes[0].items[0],'uitgave','2026-07-20').length}));
  const e=r.extra||{};
  meld('kostenpost zonder toeslag: geen ontvangst-termijnen, uitgave-termijnen werken gewoon door', !r.fout&&e.toe===0&&e.termijnen===0&&e.uitTermijnen>0, JSON.stringify(r.extra||r.fout));
}
// 28. een toeslag verwijderen terwijl er al een ontvangst voor geboekt is: de boeking blijft gewoon bestaan, alleen ontkoppeld van een bestaande toeslag
{
  const d=basis({potjes:[{n:'P',saldo:47,log:[{id:'L1',date:'2026-07-20',amount:47,kind:'ontvangst',item:'Zorgtoeslag',itemId:'a',payIso:'2026-07-20',toeId:'t1'}],items:[
    {id:'a',n:'Zorg',v:200,fn:1,fu:'m',due:'2026-07-29',paidDates:{},toeslagen:[
      {id:'t1',naam:'Zorgtoeslag',v:47,fn:1,fu:'m',date:'2026-07-20',receivedDates:{'2026-07-20':'L1'},recSkipDates:{}},
    ]},
  ]}]});
  const r=run(d,a=>{
    const it=a.db.potjes[0].items[0];
    it.toeslagen.splice(0,1); // toeslag weg, log-entry blijft
    return {toeVanLog:a.toeVanLog(it,a.db.potjes[0].log[0]),logBlijft:a.db.potjes[0].log.length,saldo:a.db.potjes[0].saldo};
  });
  const e=r.extra||{};
  meld('toeslag verwijderd terwijl er al een ontvangst voor geboekt is: boeking blijft staan, alleen ontkoppeld', !r.fout&&e.toeVanLog===null&&e.logBlijft===1&&e.saldo===47, JSON.stringify(r.extra||r.fout));
}
// 28b. diezelfde wees-boeking mag NIET stilzwijgend aan een andere, nog bestaande toeslag van dezelfde
// kostenpost gaan hangen - anders overschrijft een simpele "openen en opslaan" de datum-administratie
// van die andere toeslag.
{
  const d=basis({potjes:[{n:'P',saldo:0,log:[
    {id:'L1',date:'2026-08-20',amount:47,kind:'ontvangst',item:'Zorgtoeslag',itemId:'a',payIso:'2026-08-20',toeId:'t1'},
    {id:'L2',date:'2026-08-20',amount:30,kind:'ontvangst',item:'Werkvergoeding',itemId:'a',payIso:'2026-08-20',toeId:'t2'},
  ],items:[
    {id:'a',n:'Zorg',v:200,fn:1,fu:'m',due:'2026-07-29',paidDates:{},toeslagen:[
      {id:'t1',naam:'Zorgtoeslag',v:47,fn:1,fu:'m',date:'2026-08-20',receivedDates:{'2026-08-20':'L1'},recSkipDates:{}},
      // t2 (Werkvergoeding) bestaat expres niet meer in de lijst - alsof hij net verwijderd is.
    ]},
  ]}]});
  const r=run(d,a=>{
    const it=a.db.potjes[0].items[0];
    const wees=a.db.potjes[0].log[1]; // L2, wijst naar de verdwenen t2
    const gevonden=a.toeVanLog(it,wees);
    return {gevonden,t1OngemoeidVoorFix:a.toeslagenOf(it)[0].receivedDates};
  });
  const e=r.extra||{};
  meld('boeking met verwijderde toeslag adopteert niet stiekem een andere toeslag', !r.fout&&e.gevonden===null&&e.t1OngemoeidVoorFix['2026-08-20']==='L1', JSON.stringify(r.extra||r.fout));
}
// 29. vijf toeslagen op één kostenpost: correct totaal, elk zijn eigen regel, geen prestatieprobleem
{
  const T=[];for(let i=1;i<=5;i++)T.push({id:'t'+i,naam:'Toeslag '+i,v:10*i,fn:1,fu:'m',date:'2026-07-'+(10+i),receivedDates:{},recSkipDates:{}});
  const d=basis({potjes:[{n:'P',saldo:0,log:[],items:[{id:'a',n:'Combi',v:500,fn:1,fu:'m',due:'2026-07-29',paidDates:{},toeslagen:T}]}]});
  const r=run(d,a=>({mnd:a.itToeslagMnd(a.db.potjes[0].items[0]),rows:a.receiptRows(new Date(2026,6,1),new Date(2026,6,31)).length}));
  const e=r.extra||{};
  meld('vijf toeslagen: 10+20+30+40+50=150 opgeteld, elk een eigen rij', !r.fout&&e.mnd===150&&e.rows===5, JSON.stringify(r.extra||r.fout));
}
// 30. dubbele boeking-detectie werkt per toeslag: zelfde bedrag/dag op dezelfde toeslag is verdacht, op een andere toeslag niet
{
  const d=basis({potjes:[{n:'P',saldo:0,log:[{id:'L1',date:'2026-07-20',amount:47,kind:'ontvangst',item:'Zorgtoeslag',itemId:'a',payIso:'2026-07-20',toeId:'t1'}],items:[
    {id:'a',n:'Zorg',v:200,fn:1,fu:'m',due:'2026-07-29',paidDates:{},toeslagen:[
      {id:'t1',naam:'Zorgtoeslag',v:47,fn:1,fu:'m',date:'2026-07-20',receivedDates:{'2026-07-20':'L1'},recSkipDates:{}},
      {id:'t2',naam:'Werk',v:47,fn:1,fu:'m',date:'2026-07-20',receivedDates:{},recSkipDates:{}},
    ]},
  ]}]});
  const r=run(d,a=>{
    /* markOccurrence op t2 mag niet struikelen over de al bestaande boeking op t1 - andere termijn. */
    const id=a.markOccurrence(0,'a','2026-07-20','ontvangst',47,'2026-07-20','','Werk',true,'t2');
    return {id:!!id,t2ontvangen:a.toeReceived(a.toeVan(a.db.potjes[0].items[0],'t2'),new Date(2026,6,20)),saldo:a.db.potjes[0].saldo};
  });
  const e=r.extra||{};
  meld('boeken op een andere toeslag met hetzelfde bedrag/dag lukt gewoon', !r.fout&&e.id&&e.t2ontvangen&&e.saldo===47, JSON.stringify(r.extra||r.fout));
}
// 31. amountHint/dateHint zijn per toeslag geïsoleerd: twee toeslagen met een verschillend patroon beïnvloeden elkaar niet
{
  const mkLog=(id,payIso,date,amt,toeId)=>({id,date,amount:amt,kind:'ontvangst',itemId:'a',payIso,toeId});
  const d=basis({potjes:[{n:'P',saldo:0,log:[
    mkLog('l1','2026-05-20','2026-05-22',50,'t1'),mkLog('l2','2026-06-20','2026-06-22',50,'t1'), // t1: altijd 2 dagen later, altijd +3
    mkLog('l3','2026-05-20','2026-05-20',30,'t2'),mkLog('l4','2026-06-20','2026-06-20',30,'t2'), // t2: precies op tijd, precies gepland bedrag
  ],items:[
    {id:'a',n:'Zorg',v:200,fn:1,fu:'m',due:'2026-07-29',paidDates:{},toeslagen:[
      {id:'t1',naam:'A',v:47,fn:1,fu:'m',date:'2026-07-20',receivedDates:{},recSkipDates:{}},
      {id:'t2',naam:'B',v:30,fn:1,fu:'m',date:'2026-07-20',receivedDates:{},recSkipDates:{}},
    ]},
  ]}]});
  const r=run(d,a=>{
    const p=a.db.potjes[0],it=p.items[0];
    const h1=a.dateHint(p,it,'ontvangst','t1'),am1=a.amountHint(p,it,'ontvangst','t1');
    const h2=a.dateHint(p,it,'ontvangst','t2'),am2=a.amountHint(p,it,'ontvangst','t2');
    return {h1:h1&&h1.a,am1:am1&&am1.a,h2:h2&&h2.a,am2:am2&&am2.a};
  });
  const e=r.extra||{};
  meld('datum/bedrag-hints per toeslag geïsoleerd: t1 wijkt af, t2 klopt precies', !r.fout&&e.h1===2&&e.am1===3&&e.h2===0&&e.am2===0, JSON.stringify(r.extra||r.fout));
}
// 32. buffer-kostenpost blijft werken en heeft nooit toeslagen (regressie na de migratie)
{
  const d=basis({potjes:[{n:'P',saldo:0,log:[],items:[{id:'a',n:'Onderhoud',buffer:true,v:25,fn:1,fu:'m',paidDates:{},receivedDates:{}}]}]});
  const r=run(d,a=>({toe:a.toeslagenOf(a.db.potjes[0].items[0]).length,mnd:a.itMnd(a.db.potjes[0].items[0])}));
  const e=r.extra||{};
  meld('buffer-kostenpost: geen toeslagen, maandbedrag blijft gewoon werken', !r.fout&&e.toe===0&&e.mnd===25, JSON.stringify(r.extra||r.fout));
}
// 33. datum-venster: alles binnen het bereik is op tijd, daarbuiten telt de afstand tot de rand
{
  const d=basis({potjes:[{n:'P',saldo:0,log:[],items:[
    {id:'a',n:'Zorg',v:100,fn:1,fu:'m',due:'2026-06-04',dueTot:'2026-06-08',paidDates:{}},
  ]}]});
  const r=run(d,a=>{
    const it=a.db.potjes[0].items[0];const span=a.itemSpan(it);
    const afw=iso=>a.afwijkingDagen(iso,'2026-06-04',span);
    return {span,binnen:[afw('2026-06-04'),afw('2026-06-06'),afw('2026-06-08')],
            eerder:afw('2026-06-03'),later:afw('2026-06-10'),
            tekst:a.termijnDatumTekst(new Date(2026,5,4),span,true)};
  });
  const e=r.extra||{};
  meld('venster 4-8 juni: alles binnen het bereik wijkt niet af', !r.fout&&e.span===4&&String(e.binnen)==='0,0,0', JSON.stringify(r.extra||r.fout));
  meld('venster: 3 juni is 1 dag eerder, 10 juni is 2 dagen later', !r.fout&&e.eerder===-1&&e.later===2, JSON.stringify(r.extra||r.fout));
  meld('venster wordt getoond als bereik', !r.fout&&e.tekst==='4 – 8 jun 2026', JSON.stringify(r.extra||r.fout));
}
// 34. zonder venster blijft de afwijking gewoon het verschil in dagen (zoals het altijd was)
{
  const d=basis({potjes:[{n:'P',saldo:0,log:[],items:[{id:'a',n:'Zorg',v:100,fn:1,fu:'m',due:'2026-06-10',paidDates:{}}]}]});
  const r=run(d,a=>{const span=a.itemSpan(a.db.potjes[0].items[0]);
    return {span,op:a.afwijkingDagen('2026-06-10','2026-06-10',span),vroeg:a.afwijkingDagen('2026-06-09','2026-06-10',span),laat:a.afwijkingDagen('2026-06-11','2026-06-10',span),
            tekst:a.termijnDatumTekst(new Date(2026,5,10),span,true)};});
  const e=r.extra||{};
  meld('vaste datum: 9 en 11 juni wijken 1 dag af', !r.fout&&e.span===0&&e.op===0&&e.vroeg===-1&&e.laat===1&&e.tekst==='10 jun 2026', JSON.stringify(r.extra||r.fout));
}
// 35. te laat pas ná de laatste dag van het venster
{
  const d=basis({potjes:[{n:'P',saldo:0,log:[],items:[
    {id:'a',n:'Venster',v:100,fn:1,fu:'m',due:'2026-07-04',dueTot:'2026-07-08',paidDates:{}},
    {id:'b',n:'Vast',v:100,fn:1,fu:'m',due:'2026-07-04',paidDates:{}},
  ]}]});
  /* Vandaag is in de tests 29 juli 2026, dus beide juli-termijnen liggen achter ons. Het venster van
     augustus (4-8 aug) ligt vooruit en mag niet te laat zijn. */
  const r=run(d,a=>a.paymentRows(new Date(2026,6,1),new Date(2026,7,31)).map(x=>x.it.n+' '+x.iso+' '+(x.telaat?'telaat':'op tijd')));
  meld('te laat kijkt naar het einde van het venster, niet naar het begin',
    !r.fout&&JSON.stringify(r.extra)==='["Vast 2026-07-04:telaat","Venster 2026-07-04:telaat","Vast 2026-08-04:op tijd","Venster 2026-08-04:op tijd"]'.replace(/:/g,' '), JSON.stringify(r.extra||r.fout));
}
// 35b. een venster dat nu loopt: begonnen maar nog niet afgelopen = niet te laat
{
  /* Vroeger stonden hier vaste datums in juli 2026 met de aanname "de tests draaien op 29 juli". Op
     1 augustus was dat venster verstreken en faalde de test zonder dat er iets kapot was. Nu wordt
     alles om vandaag heen gebouwd: het venster begon twee dagen terug en loopt over twee dagen af,
     de vaste datum ligt twee dagen achter ons. */
  const nu=new Date();nu.setHours(0,0,0,0);
  const schuif=n=>{const x=new Date(nu);x.setDate(x.getDate()+n);return x.toISOString().slice(0,10);};
  const d=basis({potjes:[{n:'P',saldo:0,log:[],items:[
    {id:'a',n:'Loopt nu',v:100,fn:1,fu:'j',due:schuif(-2),dueTot:schuif(2),paidDates:{}},
    {id:'b',n:'Vast',v:100,fn:1,fu:'j',due:schuif(-2),paidDates:{}},
  ]}]});
  const van=new Date(nu);van.setDate(van.getDate()-10);
  const tot=new Date(nu);tot.setDate(tot.getDate()+10);
  const r=run(d,a=>a.paymentRows(van,tot).map(x=>x.it.n+' '+(x.telaat?'telaat':'op tijd')));
  meld('venster dat vandaag nog loopt is niet te laat, een verstreken vaste datum wel',
    !r.fout&&JSON.stringify(r.extra)==='["Loopt nu op tijd","Vast telaat"]', JSON.stringify(r.extra||r.fout));
}
// 36. het venster schuift mee met elke herhaling
{
  const d=basis({potjes:[{n:'P',saldo:0,log:[],items:[{id:'a',n:'Zorg',v:100,fn:1,fu:'m',due:'2026-06-04',dueTot:'2026-06-08',paidDates:{}}]}]});
  const r=run(d,a=>{const span=a.itemSpan(a.db.potjes[0].items[0]);
    return a.paymentRows(new Date(2026,5,1),new Date(2026,7,31)).map(x=>a.termijnDatumTekst(x.date,span,true));});
  meld('venster herhaalt mee: juni, juli en augustus 4-8', !r.fout&&JSON.stringify(r.extra)==='["4 – 8 jun 2026","4 – 8 jul 2026","4 – 8 aug 2026"]', JSON.stringify(r.extra||r.fout));
}
// 37. een toeslag kan ook een venster hebben
{
  const d=basis({potjes:[{n:'P',saldo:0,log:[],items:[
    {id:'a',n:'Zorg',v:200,fn:1,fu:'m',due:'2026-07-29',paidDates:{},toeslagen:[
      {id:'t1',naam:'Zorgtoeslag',v:47,fn:1,fu:'m',date:'2026-08-04',dateTot:'2026-08-08',receivedDates:{},recSkipDates:{}},
    ]},
  ]}]});
  const r=run(d,a=>{const rows=a.receiptRows(new Date(2026,7,1),new Date(2026,7,31));
    return {span:rows[0]&&rows[0].span,tekst:rows[0]&&a.termijnDatumTekst(rows[0].date,rows[0].span,true),telaat:rows[0]&&rows[0].telaat};});
  const e=r.extra||{};
  meld('toeslag met venster: bereik klopt en is niet te laat', !r.fout&&e.span===4&&e.tekst==='4 – 8 aug 2026'&&e.telaat===false, JSON.stringify(r.extra||r.fout));
}
// 38. een betaling binnen het venster kiest die termijn, niet de maand erna
{
  const d=basis({potjes:[{n:'P',saldo:0,log:[],items:[{id:'a',n:'Zorg',v:100,fn:1,fu:'m',due:'2026-06-04',dueTot:'2026-06-08',paidDates:{}}]}]});
  const r=run(d,a=>{
    const it=a.db.potjes[0].items[0];const span=a.itemSpan(it);
    const lijst=a.openTermijnen(it,'uitgave','2026-06-08');
    const gekozen=a.dichtstbijTermijn(lijst,'2026-06-08',span);
    return gekozen?a.isoDate(gekozen):null;});
  meld('betaling op de laatste dag van het venster hoort bij die termijn', !r.fout&&r.extra==='2026-06-04', JSON.stringify(r.extra||r.fout));
}
// 39. namen vergelijken: hoofdletters en spaties tellen niet mee, accenten wel
{
  const r=run(basis(),a=>({
    sleutel:a.naamSleutel('  Jumbo   BV '),
    zelfde:!!a.bestaandeNaam(['Jumbo'],' jumbo '),
    accent:!!a.bestaandeNaam(['Café'],'Cafe'),
    leeg:!!a.bestaandeNaam(['Jumbo'],'   '),
    zichzelf:!!a.bestaandeNaam(['Jumbo','Lidl'],'Jumbo',0),
    vrij:a.vrijeNaam(['Nieuw potje','Nieuw potje 2'],'Nieuw potje'),
  }));
  const e=r.extra||{};
  meld('naamvergelijking: hoofdletters/spaties negeren, accenten behouden',
    !r.fout&&e.sleutel==='jumbo bv'&&e.zelfde===true&&e.accent===false&&e.leeg===false&&e.zichzelf===false&&e.vrij==='Nieuw potje 3', JSON.stringify(r.extra||r.fout));
}
// 40. afwijking-hint telt alleen wat buiten het venster viel
{
  const mk=(id,payIso,date)=>({id,date,amount:100,kind:'uitgave',itemId:'a',payIso});
  const d=basis({potjes:[{n:'P',saldo:0,log:[
    mk('l1','2026-05-04','2026-05-06'),   // binnen 4-8 mei -> geen afwijking
    mk('l2','2026-06-04','2026-06-10'),   // 2 dagen na het venster
    mk('l3','2026-07-04','2026-07-10'),   // 2 dagen na het venster
  ],items:[{id:'a',n:'Zorg',v:100,fn:1,fu:'m',due:'2026-05-04',dueTot:'2026-05-08',paidDates:{}}]}]});
  const r=run(d,a=>{const p=a.db.potjes[0];const h=a.dateHint(p,p.items[0],'uitgave');return h&&h.a;});
  meld('hint: binnen het venster telt niet mee, gemiddelde over de echte afwijkingen', !r.fout&&r.extra===1, JSON.stringify(r.extra||r.fout));
}
// 41. een nieuw potje waar je niets van maakt hoort weer weg; met inhoud blijft het staan
{
  const d=basis({potjes:[{n:'Vaste lasten',saldo:100,log:[],items:[]}]});
  const r=run(d,a=>{
    const uit={};
    a.newPot();                                    // staat er nu bij, nog niet bevestigd
    uit.tijdens=a.db.potjes.length;
    uit.weg=a.potWegAlsLeeg();                     // weglopen zonder iets in te vullen
    uit.na=a.db.potjes.length;
    a.newPot();
    a.db.potjes[a.db.potjes.length-1].items.push({id:'x',n:'Iets',v:10,fn:1,fu:'m',paidDates:{},toeslagen:[]});
    uit.metInhoudWeg=a.potWegAlsLeeg();           // nu is er echt werk gedaan
    uit.metInhoudAantal=a.db.potjes.length;
    /* Twee keer opruimen mag niet per ongeluk een ánder potje pakken. */
    uit.nogmaals=a.potWegAlsLeeg();
    uit.eindAantal=a.db.potjes.length;
    return uit;
  });
  const e=r.extra||{};
  meld('nieuw potje zonder inhoud verdwijnt weer, met inhoud blijft het',
    !r.fout&&e.tijdens===2&&e.weg===true&&e.na===1&&e.metInhoudWeg===false&&e.metInhoudAantal===2&&e.nogmaals===false&&e.eindAantal===2,
    JSON.stringify(r.extra||r.fout));
}
// 42. een saldo of notitie is ook "inhoud": dat gooien we niet weg
{
  const d=basis({potjes:[]});
  const r=run(d,a=>{
    a.newPot();a.db.potjes[0].saldo=50;
    const wegMetSaldo=a.potWegAlsLeeg();
    a.newPot();a.db.potjes[a.db.potjes.length-1].note='let op';
    const wegMetNotitie=a.potWegAlsLeeg();
    return {wegMetSaldo,wegMetNotitie,aantal:a.db.potjes.length};
  });
  const e=r.extra||{};
  meld('potje met saldo of notitie blijft staan', !r.fout&&e.wegMetSaldo===false&&e.wegMetNotitie===false&&e.aantal===2, JSON.stringify(r.extra||r.fout));
}
/* ===== OVERMAAK-TELLER =====
   De sleutels van db.overboek hangen aan echte loondagen, dus die vragen we eerst aan de app zelf op.
   Anders zou deze test alleen kloppen op de dag dat hij geschreven is. */
{
  const bufferPot=()=>({n:'Auto',saldo:0,log:[],items:[{n:'Onderhoud',v:50,fn:1,fu:'m',buffer:true}]});
  const kR=run(basis({potjes:[bufferPot()]}),a=>a.recentePeriodes(13));
  const keys=kR.extra||[];
  meld('teller: 13 loonperiodes terug te tellen', !kR.fout&&keys.length===13&&new Set(keys).size===13, JSON.stringify(kR.fout||keys.length));
  const af=keys.slice(1);                                   // afgeronde periodes, nieuwste eerst
  const vink=ks=>{const o={};ks.forEach(k=>{o[k]={0:{done:true,amt:50}};});return o;};
  const tel=(overboek,extra)=>{
    const p=bufferPot();if(extra)Object.assign(p,extra);
    const r=run(basis({potjes:[p],overboek}),a=>a.potOpzijTeller(0));
    return r.fout?{fout:r.fout}:r.extra;
  };
  // 43. alles afgevinkt = 12 van 12, geen achterstand
  {
    const e=tel(vink(af))||{};
    meld('teller: 12 van 12 afgevinkt geeft geen achterstand',
      e.gestart===true&&e.periodes===12&&e.gedaan===12&&e.gemist===0&&e.achterstand===0, JSON.stringify(e));
  }
  // 44. tellen begint pas bij de EERSTE afvinking - niet bij de oudste periode
  {
    const e=tel(vink(af.slice(0,3)))||{};
    meld('teller: begint bij je eerste afvinking, niet 12 periodes terug',
      e.gestart===true&&e.periodes===3&&e.gedaan===3&&e.gemist===0, JSON.stringify(e));
  }
  // 45. overgeslagen periodes binnen dat venster = achterstand tegen het maandbedrag
  {
    const e=tel(vink([af[0],af[4]]))||{};
    meld('teller: 2 van 5, dus 3 overgeslagen a 50 = 150 achterstand',
      e.gestart===true&&e.periodes===5&&e.gedaan===2&&e.gemist===3&&e.achterstand===150, JSON.stringify(e));
  }
  // 46. uitgaven uit het potje raken de teller niet - een buffer gebruiken is de bedoeling
  {
    const log=[{date:af[1].slice(1),amount:900,kind:'uitgave'},{date:af[2].slice(1),amount:400,kind:'uitgave'}];
    const e=tel(vink([af[0],af[4]]),{log,saldo:-99})||{};
    meld('teller: uitgaven en een leeg saldo veranderen de telling niet',
      e.gestart===true&&e.periodes===5&&e.gedaan===2&&e.gemist===3&&e.achterstand===150, JSON.stringify(e));
  }
  // 47. de lopende loonperiode telt nog niet mee: die kun je vandaag nog overmaken
  {
    const e=tel(vink([keys[0]]))||{};
    meld('teller: alleen de lopende periode afgevinkt = nog niet gestart, maar wel herkend',
      e&&e.gestart===false&&e.lopendGedaan===true&&e.achterstand===0, JSON.stringify(e));
  }
  // 48. nooit afgevinkt = geen oordeel
  {
    const e=tel({})||{};
    meld('teller: nooit afgevinkt geeft geen achterstand', e&&e.gestart===false&&e.periodes===0, JSON.stringify(e));
  }
  // 49. verder dan 12 loondagen terug kijkt hij niet
  {
    const lang=run(basis({potjes:[bufferPot()]}),a=>a.recentePeriodes(30)).extra||[];
    const e=tel(vink([lang[20]]))||{};
    meld('teller: een afvinking van 20 loondagen terug valt buiten het venster',
      lang.length===30&&e&&e.gestart===false, JSON.stringify({n:lang.length,e}));
  }
  // 49b. gemiste loondagen zijn precies de periodes zonder vinkje binnen het venster
  {
    const p=bufferPot();
    const r=run(basis({potjes:[p],overboek:vink([af[0],af[4]])}),a=>a.gemistePeriodes(0));
    meld('inhalen: precies de 3 loondagen zonder vinkje worden aangeboden',
      !r.fout&&JSON.stringify(r.extra)===JSON.stringify([af[3],af[2],af[1]]), JSON.stringify(r.fout||r.extra));
  }
  // 49c. een gemiste loondag alsnog aanvinken haalt de achterstand weg, zonder het saldo te raken
  {
    const ob=vink([af[0],af[4]]);
    ob[af[2]]={0:{done:true,amt:50,inhaal:true}};
    const r=run(basis({potjes:[Object.assign(bufferPot(),{saldo:75})],overboek:ob}),
      a=>({t:a.potOpzijTeller(0),saldo:a.db.potjes[0].saldo,rest:a.gemistePeriodes(0).length}));
    const e=r.extra||{};
    meld('inhalen: ingehaalde loondag telt mee, saldo blijft ongemoeid',
      !r.fout&&e.t&&e.t.gedaan===3&&e.t.gemist===2&&e.t.achterstand===100&&e.saldo===75&&e.rest===2, JSON.stringify(r.fout||e));
  }
  // 49d. een vastgelegde periode die vóór de berekende loondag ligt (loondag gewijzigd) blijft de kop
  {
    const laat='2099-01-25';
    const r=run(basis({potjes:[bufferPot()],periode:laat}),a=>({
      cur:a.currentPeriodKey(),kop:a.recentePeriodes(13)[0],n:a.recentePeriodes(13).length}));
    const e=r.extra||{};
    meld('teller: lopende periode blijft gelijk aan die van de potjes-checklist',
      !r.fout&&e.cur==='p'+laat&&e.kop===e.cur&&e.n===13, JSON.stringify(r.fout||e));
  }
  // 50. zonder maandbedrag valt er niets te tellen (spaarpotje)
  {
    const r=run(basis({potjes:[{n:'Bunq',saldo:4000,log:[],items:[]}],overboek:vink(af)}),a=>a.potOpzijTeller(0));
    meld('teller: spaarpotje zonder kostenposten krijgt geen teller', !r.fout&&r.extra===null, JSON.stringify(r.fout||r.extra));
  }
  // 51. alleen potjes waar projectieRegel geen oordeel geeft, krijgen de teller
  {
    const maand={n:'Vaste lasten',saldo:0,log:[],items:[{n:'Huur',v:800,fn:1,fu:'m',due:'2026-01-01'}]};
    const jaar={n:'Auto',saldo:0,log:[],items:[{n:'APK',v:50,fn:1,fu:'j',due:'2026-07-01'}]};
    const r=run(basis({potjes:[maand,jaar,bufferPot()]}),a=>a.db.potjes.map(p=>a.potIsMaandelijks(p)));
    meld('teller: maandpotje wel maandelijks, jaarpost en buffer niet',
      !r.fout&&JSON.stringify(r.extra)==='[true,false,false]', JSON.stringify(r.fout||r.extra));
  }
  // 52. APK van 50 per jaar = 4,17 per maand opzij
  {
    const r=run(basis({potjes:[{n:'Auto',saldo:0,log:[],items:[
      {n:'APK',v:50,fn:1,fu:'j',due:'2026-07-01'},{n:'Onderhoud',v:40,fn:1,fu:'m',buffer:true}]}]}),
      a=>Math.round(a.potTot(a.db.potjes[0])*100)/100);
    meld('jaarpost van 50 + buffer van 40 = 44,17 per maand opzij', !r.fout&&r.extra===44.17, JSON.stringify(r.fout||r.extra));
  }
}
/* ===== LANGE RITMES =====
   Tweejaarlijks, vijfjaarlijks en alles daartussen: klopt het maandbedrag, en vindt de app de
   eerstvolgende vervaldatum ook als die verder weg ligt dan het oude venster van 36 maanden? */
{
  const jaar=new Date().getFullYear();
  const gevallen=[
    ['jaarlijks',        1,'j', 50,  (jaar+1)+'-07-10', 4.17,  (jaar+1)+'-07-10'],
    ['tweejaarlijks',    2,'j', 480, (jaar+2)+'-03-10', 20,    (jaar+2)+'-03-10'],
    ['driejaarlijks',    3,'j', 300, (jaar+1)+'-09-01', 8.33,  (jaar+1)+'-09-01'],
    ['vierjaarlijks',    4,'j', 800, (jaar+4)+'-06-01', 16.67, (jaar+4)+'-06-01'],
    ['tienjaarlijks',   10,'j',1000, (jaar+8)+'-05-05', 8.33,  (jaar+8)+'-05-05'],
    ['tweemaandelijks',  2,'m',  60, (jaar+0)+'-08-05', 30,    null],
  ];
  gevallen.forEach(([naam,fn,fu,v,due,perMnd,verwachteDatum])=>{
    const it={id:'x',n:naam,v,fn,fu,due,toeslagen:[]};
    const r=run(basis({potjes:[{n:'P',saldo:0,log:[],items:[it]}]}),a=>{
      const q=a.db.potjes[0].items[0];const occ=a.itemNextOcc(q);
      return {mnd:Math.round(a.itMnd(q)*100)/100,occ:occ?a.isoDate(occ):null,maandelijks:a.potIsMaandelijks(a.db.potjes[0])};
    });
    const e=r.extra||{};
    meld('lang ritme '+naam+': maandbedrag '+perMnd,
      !r.fout&&e.mnd===perMnd&&e.maandelijks===false, JSON.stringify(r.fout||e));
    if(verwachteDatum)meld('lang ritme '+naam+': eerstvolgende datum gevonden',
      !r.fout&&e.occ===verwachteDatum, JSON.stringify(r.fout||e));
  });
  // een kostenpost die pas ver in de toekomst begint mag niet als "betaald voor nu" gelden
  {
    const it={id:'x',n:'Ver weg',v:100,fn:1,fu:'m',due:(jaar+9)+'-01-15',toeslagen:[]};
    const r=run(basis({potjes:[{n:'P',saldo:0,log:[],items:[it]}]}),
      a=>{const occ=a.itemNextOcc(a.db.potjes[0].items[0]);return occ?a.isoDate(occ):null;});
    meld('kostenpost die pas over 9 jaar begint wordt gevonden, niet "betaald voor nu"',
      !r.fout&&r.extra===(jaar+9)+'-01-15', JSON.stringify(r.fout||r.extra));
  }
}
// 53. loondag-tekst: kort laat de weekdag zien, lang de referentiedatum
{
  const L={mode:'weeks',intervalWeeks:4,start:'2026-07-22',dag:25};
  const r=run(basis({loon:L}),a=>[a.loonDagTekst(a.db.loon,true),a.loonDagTekst(a.db.loon)]);
  const m=run(basis({loon:{mode:'month',dag:25,intervalWeeks:4,start:''}}),a=>[a.loonDagTekst(a.db.loon,true),a.loonDagTekst(a.db.loon)]);
  meld('loondag: wekenritme kort = weekdag, lang = referentiedatum',
    !r.fout&&r.extra[0]==='steeds op woensdag'&&r.extra[1]==='geteld vanaf 22 jul 2026', JSON.stringify(r.fout||r.extra));
  meld('loondag: maandritme verandert niet door kort',
    !m.fout&&m.extra[0]==='de 25e van de maand'&&m.extra[0]===m.extra[1], JSON.stringify(m.fout||m.extra));
}
/* ===== WAAR IS JE SALDO VOOR? =====
   Alles relatief aan vandaag, zodat deze controles niet over een maand bederven. */
{
  const J=new Date().getFullYear();
  const post=(n,v,fn,fu,due)=>({id:n,n,v,fn,fu,due,toeslagen:[]});
  const buf=(n,v)=>({id:n,n,v,fn:1,fu:'m',buffer:true,toeslagen:[]});
  const mkPot=(saldo,items)=>({n:'P',saldo,log:[],items});
  const res=(saldo,items)=>{
    const r=run(basis({potjes:[mkPot(saldo,items)]}),a=>({
      res:a.potReservering(0),maandelijks:a.potIsMaandelijks(a.db.potjes[0])}));
    return r.fout?{fout:r.fout}:r.extra;
  };
  // 54. een potje zonder gedateerde vaste lasten heeft niets te verdelen
  {
    const a=res(500,[buf('Onvoorzien',50)]),b=res(4000,[]);
    meld('reservering: buffer-only en spaarpotje krijgen geen verdeling',
      a.res===null&&b.res===null, JSON.stringify({a:a.res,b:b.res}));
  }
  // 55. de rest heet alleen "vrij" als er geen buffer op wacht
  {
    const a=res(96,[post('APK',50,1,'j',(J+1)+'-07-01'),buf('Onderhoud',40)]);
    const b=res(96,[post('APK',50,1,'j',(J+1)+'-07-01')]);
    meld('reservering: de rest wordt bij naam genoemd, of heet vrij besteedbaar',
      a.res.restLabel==='Rest — voor Onderhoud'&&b.res.restLabel==='Vrij te besteden',
      JSON.stringify({a:a.res.restLabel,b:b.res.restLabel}));
  }
  // 56. meerdere gedateerde posten: op volgorde van vervaldatum, en alles telt op tot het saldo
  {
    const e=res(300,[post('APK',50,1,'j',(J+1)+'-07-01'),post('Verz',180,3,'m',(J)+'-09-01'),post('Weg',90,3,'m',(J)+'-08-15')]);
    const namen=e.res.rijen.map(x=>x.n);
    const som=Math.round((e.res.bezet+e.res.vrij)*100)/100;
    meld('reservering: drie posten op volgorde van vervaldatum, samen precies het saldo',
      JSON.stringify(namen)===JSON.stringify(['Weg','Verz','APK'])&&som===300&&e.res.tekort===0, JSON.stringify({namen,som,tekort:e.res.tekort}));
  }
  // 57. te weinig saldo: wie het eerst vervalt krijgt het geld, de rest wordt tekort
  {
    const e=res(40,[post('Weg',90,3,'m',(J)+'-08-15'),post('Verz',180,3,'m',(J)+'-09-01')]);
    const r0=e.res.rijen[0],r1=e.res.rijen[1];
    meld('reservering: bij te weinig saldo krijgt de eerstvolgende betaling voorrang',
      r0.n==='Weg'&&r0.bezet===40&&r1.bezet===0&&e.res.vrij===0&&e.res.tekort>0, JSON.stringify(e.res));
  }
  // 58. saldo nul: niets bezet, alles tekort, geen negatieve bedragen
  {
    const e=res(0,[post('APK',50,1,'j',(J+1)+'-07-01')]);
    meld('reservering: leeg potje geeft nul bezet en geen negatieve bedragen',
      e.res.bezet===0&&e.res.vrij===0&&e.res.tekort>0, JSON.stringify(e.res));
  }
  /* dagOffset gebruikt lokale datumdelen, geen toISOString(): die valt op lokale middernacht een dag
     terug zodra de tijdzone voor op UTC ligt (bijv. zomertijd, UTC+2), en zou "over 2 dagen" soms als
     "morgen" laten doorkomen. Dat kostte een halve avond uitzoeken toen het per ongeluk in een
     wegwerpscript stond - vastgelegd zodat het niet nog eens gebeurt. */
  const pad2=v=>String(v).padStart(2,'0');
  const dagOffset=n=>{const x=new Date();x.setHours(0,0,0,0);x.setDate(x.getDate()+n);return x.getFullYear()+'-'+pad2(x.getMonth()+1)+'-'+pad2(x.getDate());};
  // 59. de reservering loopt nooit boven het bedrag van de vaste last uit
  {
    const e=res(1000,[post('Opstal',400,1,'j',dagOffset(2))]);
    meld('reservering: vlak voor de vervaldatum staat er hooguit het hele bedrag',
      e.res.rijen[0].nodig<=400&&e.res.rijen[0].nodig>380, JSON.stringify(e.res.rijen[0]));
  }
  // 60. een verre vervaldatum reserveert bijna niets
  {
    const e=res(1000,[post('Opstal',400,1,'j',dagOffset(350))]);
    meld('reservering: een jaarpost die net betaald is reserveert bijna niets',
      e.res.rijen[0].nodig<25, JSON.stringify(e.res.rijen[0]));
  }
  // 61. maandpotje: het paneel wordt daar niet getoond, want de badge zegt het al
  {
    const e=res(900,[post('Huur',800,1,'m',(J)+'-08-05')]);
    meld('reservering: potje met alleen maandposten wordt als maandelijks herkend',
      e.maandelijks===true, JSON.stringify({maandelijks:e.maandelijks}));
  }
  // 62. mix van meerdere gedateerde vaste lasten MET verschillende ritmes plus meerdere buffers samen
  {
    const mixItems=[
      post('Wegenbelasting',90,3,'m',dagOffset(14)),
      post('Autoverzekering',480,1,'j',dagOffset(120)),
      post('Opstalverzekering',300,1,'j',dagOffset(45)),
      post('APK',50,1,'j',dagOffset(240)),
      buf('Onderhoud auto',40),buf('Tandarts',20),buf('Kapotte apparaten',25),
    ];
    // Bij 700 is precies genoeg voor alle vier gedateerde posten samen (76.20+263.04+322.26+17.15 ≈ 678.65);
    // pas daarboven mag er iets voor de buffers overblijven.
    const laag=res(400,mixItems), hoog=res(2000,mixItems);
    const gedateerdeNamen=['Wegenbelasting','Opstalverzekering','Autoverzekering','APK'];
    meld('mix: vier gedateerde posten met eigen ritme + drie buffers, geen buffer tussen de rijen',
      laag.res.rijen.length===4
      && laag.res.rijen.every(r=>gedateerdeNamen.includes(r.n))
      && laag.res.rijen.every((r,i)=>i===0||r.datum>=laag.res.rijen[i-1].datum),
      JSON.stringify(laag.res.rijen.map(r=>r.n)));
    meld('mix: bij weinig saldo krijgt de eerstvolgende post voorrang, geen "vrij" naast een tekort',
      laag.res.tekort>0&&laag.res.vrij===0, JSON.stringify({tekort:laag.res.tekort,vrij:laag.res.vrij}));
    meld('mix: bij ruim saldo zijn alle vier gedateerde posten volledig gedekt en rest gaat naar de buffers',
      hoog.res.tekort===0
      && hoog.res.rijen.every(r=>Math.abs(r.bezet-r.nodig)<0.01)
      && hoog.res.vrij>0
      && hoog.res.restLabel==='Rest — voor Onderhoud auto, Tandarts en 1 andere',
      JSON.stringify({tekort:hoog.res.tekort,vrij:hoog.res.vrij,label:hoog.res.restLabel}));
    meld('mix: bezet plus vrij is op elk saldo-niveau precies het saldo, nooit negatief',
      [0,50,200,400,700,2000].every(saldo=>{
        const e=res(saldo,mixItems).res;
        const som=Math.round((e.bezet+e.vrij)*100)/100;
        return som===saldo&&e.vrij>=0&&e.tekort>=0&&e.rijen.every(r=>r.bezet>=0&&r.nodig<=(mixItems.find(it=>it.n===r.n).v+0.01));
      }), 'gecontroleerd op saldo 0, 50, 200, 400, 700, 2000');
  }
}
console.log(check.join('\n'));
const fout=check.filter(c=>c.startsWith('FOUT')).length;
console.log('\n'+(fout?fout+' CONTROLES GEFAALD':'alle '+check.length+' rekencontroles kloppen'));
