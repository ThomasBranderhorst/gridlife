# GridLife — gebruikerstest

_30 juli 2026. Acht testpersonas (16 t/m 68 jaar) liepen elk een deel van de app na. 119 bevindingen opgehaald, 102 bevestigd na kruiscontrole tegen de code, 17 afgevallen._

---

# Feedback GridLife — samengevoegd uit acht gebruikerstesten

## Wat goed gaat

De structuur klopt: testers snappen binnen een paar tellen waar ze moeten zijn, en niemand raakte de weg kwijt in de navigatie. De app rekent zichtbaar veel voor je uit, en juist dat wordt gewaardeerd. Lege schermen, bevestigingen en meldingen zijn er overal — de bouwstenen zitten er dus al. Het probleem is bijna nooit de functie, maar de tekst eromheen. Verreweg de meeste punten hieronder zijn op te lossen door een zin te herschrijven.

De rode draad in alle acht testen: **de app legt uit hoe hij zelf rékent, terwijl de gebruiker wil weten wat hij moet dóen.**

---

## 1. Onboarding (installatiewizard)

### 1.1 De loonstap opent met uitleg over de app in plaats van de vraag — *viel 2 testers op*
**Regel:** index.html:880 en 882
**Nu:** "Wanneer krijg je loon? Hier draait je hele planning op: je meldingen, \"volgende loon\" en het moment waarop je potjes-checklist opnieuw begint."
**Waarom mis:** Dit is ongeveer de derde zin die iemand in de app leest, en er staan al drie begrippen in die hij nooit heeft gezien (meldingen, "volgende loon", potjes-checklist). Hij wil alleen een datum invullen en weet nu niet of hij iets fout kan doen.
**Beter:** "Wanneer krijg je loon? Vul je loondag in — de app rekent daarna zelf uit wanneer je weer geld krijgt. Later aanpassen kan altijd."

### 1.2 "Contract-uren" en "boven of onder je contract" — *hinderlijk*
**Regel:** index.html:866
**Nu:** `obRow('contract','Contract-uren','Zien of je boven of onder je contract zit')`
**Waarom mis:** Iemand met een 0-urencontract weet niet of daar een getal in staat. "Onder je contract zitten" klinkt alsof je iets fout doet. Hij zet hem aan zonder te weten wat er gebeurt.
**Beter:** "Vast aantal uur per week? Dan zie je of je meer of minder hebt gewerkt dan afgesproken. Heb je een oproepcontract, laat dit dan uit."

### 1.3 Vier van de zes keuzes bij Geld & potjes staan vol vaktaal — *hinderlijk*
**Regel:** index.html:872, 873, 874, 876
**Nu:** "Buffers — Sparen voor onvoorspelbare kosten, met maandadvies", "Toeslagen ... verrekenen en volgen", "Losse ontvangsten", "Uitschieters niet laten meetellen in gemiddelden"
**Waarom mis:** Een 16-jarige heeft geen toeslagen en weet niet wat een buffer is. Alles staat standaard aan, dus hij laat het aan — en krijgt een app vol dingen die hij nooit gebruikt.
**Beter:** "Spaarpotje voor onverwachte kosten", "Geld dat je terugkrijgt van de overheid (bijv. zorgtoeslag)", "Los geld dat binnenkomt", "Eenmalige grote uitgave niet meetellen". Overweeg deze standaard uit te zetten.

### 1.4 Instellingenmenu heet hier anders dan elders — *hinderlijk*
**Regel:** index.html:893 (vergelijk 1209)
**Nu:** "Alles is later aan te passen via Instellingen → Personaliseren."
**Waarom mis:** Op het lege startscherm staat "Instellingen → Functies → Startscherm". Twee paden voor hetzelfde; de gebruiker zoekt "Personaliseren" en vindt dat niet.
**Beter:** Overal exact dezelfde menunaam, en hier simpel: "Alles kun je later aanpassen bij Instellingen."

### 1.5 "Zo rekent de app het uit" boven de voorbeelddatums — *klein, maar op 3 plekken*
**Regel:** index.html:887, 3281, 3925 (vergelijk 3268)
**Nu:** "Zo rekent de app het uit"
**Waarom mis:** Onder de kop staan gewoon de eerstvolgende loondagen — het antwoord dat mensen willen zien. Door de kop denken ze dat er iets technisch staat en scrollen ze er langs. Op regel 3268 heet exact hetzelfde blok wél goed.
**Beter:** Overal "Je eerstvolgende loondagen".

### 1.6 "Ik heb al een back-up" opent zomaar de bestandenmap — *klein*
**Regel:** index.html:854
**Nu:** knop "Ik heb al een back-up" die direct de bestandskiezer opent
**Waarom mis:** Een nieuwe gebruiker tikt uit nieuwsgierigheid, de bestandenmap springt open zonder uitleg en zonder duidelijke weg terug — en de wizard wordt overgeslagen.
**Beter:** Kleiner en onderaan: "Ik heb een back-upbestand van mijn oude telefoon", met een bevestiging vóór de bestandskiezer.

---

## 2. Potjes-pagina

### 2.1 BLOKKEREND — Lege Potjes-pagina loopt dood; de dikke ＋ geeft een foutmelding — *viel 2 testers op*
**Regel:** index.html:2460 (en 2650)
**Nu:** "Nog geen potjes.<br>Tik op Beheren om te beginnen.<br>Tip: een potje zonder kostenposten is gewoon een spaarpotje (bijv. Bunq)."
**Waarom mis:** De grote ronde ＋ rechtsonder is waar iedereen als eerste tikt; die zegt alleen "Maak eerst een potje aan". De knop die je nodig hebt heet "Beheren" en staat klein onderaan, half buiten beeld. De tip gebruikt twee onbekende woorden ("kostenposten", "spaarpotje") en noemt een bankmerk, wat de indruk wekt dat de app aan een bank hangt.
**Beter:** Een echte knop in het lege vlak: "Maak je eerste potje" (opent `newPot()`), en laat de ＋ bij nul potjes hetzelfde doen. Tekst: "Je hebt nog geen potjes. Een potje is een doel om geld voor apart te zetten, bijvoorbeeld 'Vaste lasten' of 'Vakantie'."

### 2.2 BLOKKEREND — "Alles afvinken" suggereert dat de app geld overmaakt — *viel 3 testers op*
**Regel:** index.html:306, 2505, 2511
**Nu:** knop "Alles afvinken"; bevestiging "Alle openstaande potjes afvinken en in totaal € 208,70 bij de saldo's optellen?"; terugdraaien: "Alle vinkjes weghalen en in totaal € 640 weer van de saldo's afhalen?" met knop "Uitvinken & afboeken"
**Waarom mis:** "Bij de saldo's optellen" en "afboeken" klinken alsof de app iets met echt geld doet. Niemand weet of hij zelf nog naar de bank moet. De knop verraadt ook niet dat dit ál je potjes tegelijk raakt, en per potje kun je het bedrag dan niet meer bijstellen (bij één potje wél). De knop is bovendien rood, wat "je gooit iets weg" suggereert.
**Beter:** Knop "Alles overgemaakt" (en ernaast "Potjes beheren"). Bevestiging: "Heb je het geld al overgemaakt bij je bank? Dan noteren we € 208,70 erbij in 4 potjes. De app maakt zelf niets over." Terugdraaiknop: "Ja, € 640 eraf".

### 2.3 "reset bij loon (25 sep 2026)" — *hinderlijk*
**Regel:** index.html:2404
**Nu:** "reset bij loon (25 sep 2026)"
**Waarom mis:** "Reset" is een Engels computerwoord, en er staat niet wát er reset. Een datum in de toekomst plus "reset" laat mensen schrikken: gaat de app dan geld van mijn potjes afhalen?
**Beter:** "De vinkjes beginnen weer opnieuw op je loondag, 25 september 2026. Je saldo blijft staan."

### 2.4 Statusbalkje is telegramstijl met twee bedragen — *hinderlijk*
**Regel:** index.html:2426
**Nu:** "● Deze maand nog € 225,59 · saldo genoeg"
**Waarom mis:** Is dat bedrag wat er nog afgaat of wat je nog moet overmaken? En "saldo" van dit potje, van alle potjes, of van je bankrekening? De rode variant ("€ 30 te weinig") zegt niet wat je moet doen.
**Beter:** "Er gaat deze maand nog € 225,59 af. Er staat genoeg in dit potje." / "Er staat € 30,00 te weinig in dit potje. Maak dit bedrag nog over."

### 2.5 De vooruitblikregel legt de rekensom uit — *hinderlijk*
**Regel:** index.html:2208
**Nu:** "Op 1 aug: € 208,09 · precies de € 208,70 voor volgende maand"
**Waarom mis:** Vier bedragen en twee datums op één kaart; niemand weet welk getal hij moet onthouden. En waarom vergelijkt de app twee bedragen die 61 cent schelen?
**Beter:** Alleen het oordeel, en het bedrag pas als het misgaat: "Op 1 aug staat er genoeg klaar voor volgende maand" / "Op 1 aug kom je € 12,40 tekort voor volgende maand".

### 2.6 "Telt mee zodra je 'm afvinkt" — wat is 'm? — *viel 3 testers op*
**Regel:** index.html:2272
**Nu:** "Telt mee zodra je 'm afvinkt" (en de variant "Bijhouden gestart · telt vanaf je volgende loondag")
**Waarom mis:** 'm verwijst nergens naar. Wát telt mee, waarin, en welk vinkje wordt bedoeld? Er staan er drie op dat scherm. Mensen weten niet of er iets misgaat of dat het gewoon informatie is.
**Beter:** "Vink dit potje af zodra je het geld hebt overgemaakt. De app houdt dan bij hoe vaak je dat echt doet."

### 2.7 "Betaald voor nu" zonder te zeggen tot wanneer — *viel 2 testers op*
**Regel:** index.html:2413
**Nu:** "Status — Betaald voor nu"
**Waarom mis:** "Voor nu" geeft geen houvast: tot volgende week, tot volgend jaar? Bij alle andere posten staat op die plek een datum, dus de uitzondering valt op. En de gebruiker heeft in de app niets betaald, dus "betaald" verwart extra.
**Beter:** De echte informatie tonen: "Volgende betaaldatum — 1 aug 2027 (deze termijn is al betaald)", of de regel weglaten als er niets te doen is.

### 2.8 Knop "Overzicht" zegt niet waarvan — *klein*
**Regel:** index.html:304
**Nu:** knop over de volle breedte met alleen "Overzicht"
**Waarom mis:** De hele pagina is al een overzicht. Wat er opent zijn in werkelijkheid al je geboekte uitgaven en ontvangsten.
**Beter:** "Al mijn uitgaven & ontvangsten" — die tekst berekent de app al (`uitOntvLabel`, regel 2394); gebruik die gewoon.

### 2.9 Hetzelfde bedrag heet op drie plekken anders — *klein*
**Regel:** index.html:1204, 2401, 2451
**Nu:** "Opzij voor komende maand" / "Opzij voor de komende maand" / "Per maand opzij"
**Waarom mis:** Mensen gaan zitten vergelijken of het wel om hetzelfde getal gaat.
**Beter:** Overal één term, bijvoorbeeld "Opzij zetten deze maand".

---

## 3. Potje bewerken / vaste lasten

### 3.1 BLOKKEREND — "Geplande datum (optioneel)" is in werkelijkheid verplicht
**Regel:** index.html:3134
**Nu:** "Geplande datum (optioneel)"
**Waarom mis:** Er staat letterlijk "optioneel", dus mensen slaan hun huur op zonder datum. Daarna verschijnt die nergens in Geldstroom, staat er "Geen betalingen deze maand" bij het potje, en niets legt uit waarom. Die datum is juist de motor van de hele planning.
**Beter:** "Wanneer wordt het afgeschreven?" met eronder: "Zonder datum verschijnt deze rekening niet in je betalingen." En waarschuw bij opslaan als het veld leeg is.

### 3.2 "Kostenpost" is boekhoudtaal — *viel 2 testers op, komt op 5 plekken terug*
**Regel:** index.html:3070, 3112, 3023, 2588, 2665 (vergelijk 1011)
**Nu:** "Kostenpost toevoegen" / "Nog geen kostenposten."
**Waarom mis:** Klinkt als iets uit een jaarrekening. De eigen uitlegpagina noemt het al "Hoe voeg ik een vaste last toe?" — twee namen voor hetzelfde ding.
**Beter:** Overal "vaste last" of "rekening". Knop: "Vaste last toevoegen", met eronder "Bijv. huur, zorgverzekering, Spotify". Leeg: "Nog geen rekeningen toegevoegd. Denk aan huur, zorgverzekering of je telefoonabonnement."

### 3.3 Buffer belooft "zonder vast bedrag" en vraagt daarna om een vast bedrag — *hinderlijk*
**Regel:** index.html:3131 (en 3147)
**Nu:** "Buffer — Voor onvoorspelbare kosten, zonder vast bedrag", direct gevolgd door "Maandbedrag dat je opzij zet"
**Waarom mis:** Dat spreekt elkaar tegen: is het nou met of zonder bedrag? En het woord "buffer" wordt op dit scherm nergens uitgelegd.
**Beter:** "Spaarpost voor onverwachte kosten — je weet niet wanneer of hoeveel, dus je zet er elke maand een vast bedrag voor opzij." Dan sluit het volgende veld er logisch op aan.

### 3.4 "aangepast…" en het lege getalveld bij frequentie — *hinderlijk*
**Regel:** index.html:403 (en 3014)
**Nu:** `{k:'x',label:'aangepast…',n:1,u:'m'}` → "elke [ ] [maanden]"
**Waarom mis:** Niemand weet wat er gebeurt als je dit kiest. Het getalveld is leeg met alleen een grijze 2 als hint; sla je op zonder te typen, dan wordt het stiekem 1.
**Beter:** Optie "Anders — zelf instellen". Vul het getalveld écht met 2 (geen placeholder) en toon eronder: "Wordt afgeschreven elke 2 maanden."

---

## 4. Geldstroom / Betalingen

### 4.1 BLOKKEREND — Bevestiging bij een vinkje weghalen legt de rekenregels uit
**Regel:** index.html:2064
**Nu:** "Deze termijn staat niet in het schema van \"X\", dus hij verdwijnt uit je overzicht in plaats van open te blijven staan. De uitgave wordt verwijderd"
**Waarom mis:** "Termijn", "schema", "open blijven staan" — dat is de app die uitlegt hoe hij zelf denkt. Iemand wilde alleen een vinkje weghalen en weet nu niet of hij iets kwijtraakt.
**Beter:** "Je haalt het vinkje weg. Omdat deze datum niet meer bij de vaste lasten hoort, zie je hem daarna niet meer in de lijst. De betaling van € 54,20 wordt gewist."

### 4.2 Tabblad heet "Geldstroom", de inhoud heet "betalingen" — *hinderlijk*
**Regel:** index.html:746 (en 2588)
**Nu:** `betalingen:'Geldstroom'`
**Waarom mis:** "Geldstroom" is bedrijfstaal (cashflow). Binnen het scherm komt het woord nergens terug — daar heet alles "betalingen" en "ontvangsten".
**Beter:** Noem het tabblad "Betalingen" (of "In & uit"), zodat knop en scherm dezelfde taal spreken.

### 4.3 Knop "Bevestigen — boekt af en logt uitgave" — *hinderlijk*
**Regel:** index.html:2097
**Nu:** "Bevestigen — boekt af en logt uitgave"
**Waarom mis:** "Boekt af" en "logt" zijn geen woorden die je over je eigen geld gebruikt. Mensen durven niet te tikken omdat ze niet weten of er echt geld ergens vandaan gaat. Vlak erboven staat óók een vinkje "Saldo van het potje bijwerken", dus twee dingen die over hetzelfde lijken te gaan.
**Beter:** "Betaald — haal € 148,20 van dit potje af", en met het saldo-vinkje uit: "Betaald — mijn saldo blijft gelijk".

### 4.4 "Termijn" komt overal terug en betekent iets anders dan mensen denken — *hinderlijk*
**Regel:** index.html:2098 (ook 2134, 2665, 2868)
**Nu:** "Deze termijn komt niet", "Welke termijn dekt dit af?"
**Waarom mis:** "Termijn" kennen mensen van afbetalen in delen. Hier betekent het "deze ene afschrijving". De grijze knop staat bovendien direct onder de blauwe bevestigknop, dus je tikt er makkelijk naast en weet dan niet wat je hebt gedaan.
**Beter:** Overal "afschrijving" of "deze keer". Knop: "Deze keer wordt er niets afgeschreven". En "Welke afschrijving hoort hierbij?"

### 4.5 Zin over het saldo verklaart de boekhouding — *hinderlijk*
**Regel:** index.html:2061
**Nu:** "; je saldo blijft zoals het is, want deze boeking heeft het nooit veranderd"
**Waarom mis:** Interne logica. De gebruiker wil één zin: gaat er geld bij of af, en hoeveel.
**Beter:** "Je saldo blijft € 430 — dit bedrag was er nooit vanaf gehaald."

### 4.6 Toast "Betaald · saldo ongewijzigd" laat twijfel achter — *hinderlijk*
**Regel:** index.html:2123
**Nu:** "Betaald · saldo ongewijzigd"
**Waarom mis:** De app zegt dat er níets is gebeurd met je saldo. Is dat de bedoeling of ging er iets mis? De andere variant noemt wél een bedrag, dus het voelt als een fout. En de melding is na twee seconden weg.
**Beter:** "Betaald genoteerd. Je saldo blijft € 430 — deze last gaat rechtstreeks van je rekening."

### 4.7 Lege staat stuurt je nergens heen — *hinderlijk*
**Regel:** index.html:2588
**Nu:** "Nog geen betalingen of ontvangsten. Voeg kostenposten toe bij een potje."
**Waarom mis:** Een opdracht met twee app-woorden erin en geen knop. Een lege staat zonder knop is een doodlopende weg.
**Beter:** "Hier komen je vaste lasten te staan, zoals huur en verzekering. Zodra je er één invult, zie je per maand wat eraf gaat." Met knop "Vaste last toevoegen".

### 4.8 "Waarvan eigen deel" komt uit het niets — *hinderlijk*
**Regel:** index.html:2556
**Nu:** "Waarvan eigen deel"
**Waarom mis:** Eigen deel van wát? De regel verschijnt alleen bij toeslag, maar het woord toeslag staat er niet bij. Twee bedragen onder elkaar zonder uitleg van het verschil.
**Beter:** "Wat je zelf betaalt (na toeslag)", met daaronder het toeslagbedrag zelf.

---

## 5. Uren-pagina en nieuwe dienst

### 5.1 Lege Uren-pagina wijst naar een plus die je niet ziet — *hinderlijk*
**Regel:** index.html:1448 (en 1439)
**Nu:** "Nog geen diensten. Tik op ＋."
**Waarom mis:** De tekst wijst niet waarheen. "Dienst" is bovendien niet het woord dat mensen gebruiken ("shift", "gewerkt"). En daarboven staat tegelijk "Alle uren gecontroleerd" terwijl er nul uren zijn — dat klopt niet.
**Beter:** Een grote knop "+ Gewerkte dag toevoegen" in het lege vlak zelf, en de groene controle-kaart verbergen zolang er geen enkele dienst is.

### 5.2 Uitleg onder Controle gaat over dubbeltellen — *hinderlijk*
**Regel:** index.html:1540
**Nu:** "Los van je gewerkte uren hierboven — telt nooit dubbel. Rechtzetten doe je via de controle-kaart bovenaan het Uren-scherm."
**Waarom mis:** Bij je eerste dienst krijg je een waarschuwing over dubbeltellen en een "controle-kaart" die je nog niet kent. Mensen durven de vinkjes niet aan te raken.
**Beter:** Bij een nieuwe dienst dit blok verbergen (er valt nog niets te controleren) en pas tonen bij bewerken, met: "Stond dit ook zo op je loonstrook?"

### 5.3 Hetzelfde ding heet "Afwijking" en "Klopt niet" — *hinderlijk*
**Regel:** index.html:1441 (vergelijk 1541 en 1438)
**Nu:** filter `[['','Alles'],['todo','Te controleren'],['afw','Afwijking']]`, terwijl het bewerkscherm "Te controleren / Klopt / Klopt niet" heet
**Waarom mis:** Mensen denken dat "Afwijking" iets anders is en zoeken zich suf. Ook "nabetaling verwacht" (1438) is een onbekend woord.
**Beter:** Filter ook "Klopt niet" noemen, en "nabetaling" vervangen door "krijg je later betaald".

### 5.4 "0u 0m" ziet eruit als een storing — *klein*
**Regel:** index.html:296
**Nu:** "Deze maand gewerkt — 0u 0m"
**Waarom mis:** Mensen lezen uren als "7:30" of "7,5 uur". "0u 0m" oogt als een fout in plaats van "je hebt nog niets ingevuld".
**Beter:** Bij nul: "nog niets". En elders "7 uur 30" in plaats van "7u 30m".

---

## 6. Uren-controle

### 6.1 BLOKKEREND — Drie knoppen zonder uitleg wat er daarna gebeurt
**Regel:** index.html:1628
**Nu:** "Hoe recht zetten? — Op latere dienst · Apart nabetaald · Zelf geregeld"
**Waarom mis:** Niemand weet wat er gebeurt na het drukken. "Op latere dienst" — worden die uren ergens bij opgeteld? Krijg ik geld? De uitleg bestaat wel, maar staat verstopt op de Uitleg-pagina, niet hier waar de keuze wordt gemaakt.
**Beter:** Onder elke knop één regel: "Je baas draait de uren mee op een volgende dienst" / "Je krijgt het los uitbetaald, bijv. op je loonstrook" / "Al opgelost, melding mag weg".

### 6.2 Uitleg bovenaan vertelt hoe de app rekent — *hinderlijk*
**Regel:** index.html:1589
**Nu:** "Vergelijk je gewerkte uren met wat de werkgever registreerde. Klopt iets niet, dan noteer je het en zet je het later recht — los van je gewerkte uren, dus niets telt dubbel."
**Waarom mis:** De tweede helft gaat over de interne boekhouding. Mensen vroegen zich niet af of iets dubbel telde tot de app het zelf noemde — nu twijfelen ze.
**Beter:** "Ging er een uur af dat je wel gewerkt hebt? Vink hier per dienst af of het klopt." De rekenuitleg weglaten.

### 6.3 "Heropenen" en de bevestiging staan vol vaktermen — *hinderlijk*
**Regel:** index.html:1633
**Nu:** knop "Heropenen"; bevestiging "Deze afwijking wordt weer als open (nog recht te zetten) gemarkeerd. Je kunt hem daarna opnieuw rechtzetten."
**Waarom mis:** "Heropenen" lees je als "opnieuw bekijken", maar het zet de regel terug op onopgelost — dat merk je pas na het drukken. In de bevestiging staan vier vaktermen in twee zinnen (afwijking, open, gemarkeerd, rechtzetten) en de tweede zin herhaalt de eerste.
**Beter:** Knop "Toch niet opgelost", en de regel zelf aantikbaar maken om te bekijken. Tekst: "Je zet deze uren weer op 'nog niet betaald gekregen'. Ze verschijnen weer in je lijstje."

### 6.4 Het label "standaard" onder een knop betekent niets — *hinderlijk*
**Regel:** index.html:1625
**Nu:** "standaard"
**Waarom mis:** Standaard wát? Dat de app het al gekozen heeft, of dat je dit meestal moet kiezen? De gebruiker heeft nergens iets als standaard ingesteld.
**Beter:** "jouw gebruikelijke keuze" — of het label pas tonen zodra iemand het bij de werkgever bewust heeft ingesteld.

### 6.5 "· niet je loondag" leest als een foutmelding — *hinderlijk*
**Regel:** index.html:1636
**Nu:** "Staat op je loondag" / achter een andere datum: "· niet je loondag"
**Waarom mis:** Het is een constatering, maar het leest als een waarschuwing dat je iets fout doet.
**Beter:** Alleen de bevestigende variant tonen ("Dit is je loondag") en bij andere datums niets extra's zeggen.

### 6.6 Tijdveld accepteert vrije tekst zonder duidelijke regel — *hinderlijk*
**Regel:** index.html:1656
**Nu:** "bijv. 30 min of 1 uur 15 min"
**Waarom mis:** Twee schrijfwijzen als voorbeeld, en elders in de app staat "7u 30m" — een derde. Mag "0:30"? Mag "half uur"?
**Beter:** Twee losse velden (uren / minuten), of overal exact dezelfde notatie.

### 6.7 "Nabetaald verwacht" is boekhoudtaal — *klein*
**Regel:** index.html:1605
**Nu:** "Nabetaald verwacht" (ook "Apart nabetaald" op de knop)
**Beter:** "Krijg je nog", met eronder de datum en het aantal uren.

---

## 7. Loon-pagina en loon-instellingen

### 7.1 "Loondatum", "loondag", "referentiedatum" en "Uitbetaling" door elkaar — *viel 2 testers op*
**Regel:** index.html:3284 (ook 321, 1349)
**Nu:** `msg=w?'Vul de referentiedatum aan bij je werkgever.':'Stel je loondatum hierboven in.'`; kaartkop "Uitbetaling"; label "Referentiedatum"
**Waarom mis:** Vier woorden voor hetzelfde ding, deels op één scherm. De gebruiker zoekt een veld dat "loondatum" heet en dat bestaat niet. "Referentiedatum" is bovendien geen Nederlands dat mensen kennen, en de uitleg staat pas ná het veld.
**Beter:** Kies één woord: **loondag**. Kaartkop: "Je loondag". Label: "Een datum waarop je loon kreeg" (met de uitleg bóven het veld). Foutmelding: "Kies hierboven wanneer je loon krijgt."

### 7.2 De knop "Wisselend" zegt niet wat er dan gebeurt — *hinderlijk*
**Regel:** index.html:1310
**Nu:** `['manual','Wisselend']`
**Waarom mis:** Bij "Maandelijks" en "Per aantal weken" snap je meteen wat je krijgt. Bij "Wisselend" niet: rekent de app iets uit, of moet je alles zelf doen? Dat je álle datums zelf moet invullen zie je pas na het tikken.
**Beter:** "Ik vul de datums zelf in".

### 7.3 Grijs woord "weekend" achter een vrijdag — *hinderlijk*
**Regel:** index.html:1394
**Nu:** "vr 27 feb 2027 · weekend"
**Waarom mis:** Vrijdag is geen weekend. Nergens staat dat de datum al verschoven is en wat de oorspronkelijke dag was. Mensen denken dat de app zich vergist.
**Beter:** De reden voluit: "· eerder betaald, 28 feb valt in het weekend".

### 7.4 "Log wat er binnenkomt" — *hinderlijk*
**Regel:** index.html:3313
**Nu:** "Log wat er binnenkomt; de app rekent je maandinkomen uit."
**Waarom mis:** "Loggen" ken je van computers, niet van geld. De knop ernaast heet "＋ Loon" en de kaart "Netto ontvangen" — drie manieren om hetzelfde te zeggen. Vul ik hier mijn maandloon in of één betaling?
**Beter:** "Vul elke keer in wat er op je rekening kwam. Na een paar keer weet de app wat je gemiddeld per maand verdient."

### 7.5 "Gemiddeld inkomen" zonder te zeggen waarover — *hinderlijk*
**Regel:** index.html:3314
**Nu:** "Gemiddeld inkomen — € X p/mnd"
**Waarom mis:** Over welke periode? Zit vakantiegeld erin? En "Naar potjes − € 208,70": al afgeschreven of nog te doen? "p/mnd" kun je hardop niet lezen.
**Beter:** Eronder: "Gemiddelde van je laatste 12 maanden (nu: 2 keer loon ingevuld)", en "per maand" voluit.

### 7.6 "Naar potjes →" zonder reden — *klein*
**Regel:** index.html:325
**Nu:** grote gekleurde knop "Naar potjes →"
**Waarom mis:** Suggereert dat dit de volgende stap is, maar niemand legt uit wat potjes met je loondag te maken hebben. Op een willekeurige dinsdag stuurt hij je weg van waar je was.
**Beter:** Alleen rond je loondag tonen: "Je loon is binnen — bedragen naar je potjes afvinken".

### 7.7 Inhaalscherm: alles is al opgeslagen, maar de knop heet "Klaar" — *klein*
**Regel:** index.html:2313
**Nu:** knop "Klaar"
**Waarom mis:** Je denkt dat je daarmee opslaat, maar elk vinkje is al vastgelegd. Er is geen annuleren, en per ongeluk aanvinken kun je niet terugdraaien voor zover je weet.
**Beter:** Knop "Sluiten", met erbij: "Elk vinkje wordt meteen bewaard; tik nog eens om het weg te halen."

---

## 8. Meldingen

### 8.1 BLOKKEREND — De loondag-melding zegt "Tik om over te boeken" maar boekt niets over
**Regel:** index.html:3603
**Nu:** "Vul je potjes. Tik om over te boeken."
**Waarom mis:** Dit klinkt alsof de app geld gaat overmaken als je tikt. Dat doet hij niet — je moet zelf naar je bank en daarna een vinkje zetten. Bij geld is zo'n misverstand eng.
**Beter:** "Je loon is binnen. Maak zelf je potjes-bedragen over en vink ze daarna af in de app."

### 8.2 Samenvatting "1 d vooraf · op de dag · 08:00" is code — *klein*
**Regel:** index.html:3592
**Nu:** `remShort` met afkortingen d / w / mnd / jr en puntjes ertussen
**Waarom mis:** Je moet erop tikken om te snappen wat je hebt ingesteld — precies wat een samenvatting zou moeten voorkomen.
**Beter:** Voluit: "1 dag vooraf en op de dag zelf, om 08:00".

### 8.3 Knop "Testmelding": ik weet niet wat er gebeurt — *klein*
**Regel:** index.html:354 (en 3672)
**Nu:** knop "Testmelding"; pas ná het drukken: "Melding volgt over ± 5 sec"
**Waarom mis:** Stuurt hij iets naar iemand? Verandert hij mijn instellingen? Mensen durven niet te drukken.
**Beter:** "Stuur mezelf een proefmelding", met eronder: "Je krijgt over 5 seconden een voorbeeldmelding op deze telefoon."

### 8.4 Foutmelding met een codewoord tussen haakjes — *klein*
**Regel:** index.html:3672
**Nu:** "Meldingen niet beschikbaar (geen Capacitor)" — soms alleen "(?)"
**Beter:** "Meldingen werken alleen in de geïnstalleerde app, niet in de browser." Zonder haakjes, zonder codewoorden.

---

## 9. Instellingen — App-slot

### 9.1 BLOKKEREND — Pincode vergeten? Dan kom je er nooit meer in
**Regel:** index.html:4077
**Nu:** `toast('Onjuiste code')` en verder niets
**Waarom mis:** Geen "pincode vergeten"-knop, geen uitleg, geen weg terug. Je hele administratie zit opgesloten. Dit is precies de angst die mensen hebben bij zo'n slot.
**Beter:** Onder het pincodescherm: "Pincode vergeten? Dan kun je alleen nog opnieuw beginnen met een back-upbestand." En waarschuw dát al bij het aanzetten van het slot, vóór het instellen van de code.

### 9.2 App-slot uitzetten vraagt niets en wist stilletjes je code — *hinderlijk*
**Regel:** index.html:4045
**Nu:** `toggleLock()` zet `lock.on`, `lock.pin` en `lock.bio` in één tik leeg, met alleen een toast "App-slot uit"
**Waarom mis:** Eén tikje tijdens het scrollen en je beveiliging staat uit, zonder bevestiging en zonder je pincode. Je vingerafdruk-instelling gaat er ook stilletjes af.
**Beter:** Vraag eerst de huidige pincode of een bevestiging: "App-slot uitzetten? Iedereen die je telefoon openheeft kan dan bij je gegevens."

---

## 10. Instellingen — Back-up & herstel

### 10.1 BLOKKEREND — "Niets wordt overschreven" klopt niet
**Regel:** index.html:365
**Nu:** "Importeren voegt samen; niets wordt overschreven."
**Waarom mis:** Dit is niet waar: de app neemt wél je loon-instellingen, thema, naam en welke functies aanstaan over uit het bestand. Wie zijn app daarna anders aantreft, weet niet meer wat hij kan geloven.
**Beter:** "Je lijsten worden samengevoegd: wat er al staat blijft staan. Je instellingen (loondag, thema, naam, welke functies aan staan) worden wél overgenomen uit de back-up."

### 10.2 BLOKKEREND — Importeren start meteen, zonder één vraag vooraf
**Regel:** index.html:4218 (`importData`)
**Nu:** je kiest een bestand en het gebeurt gewoon
**Waarom mis:** Geen "weet je het zeker", geen waarschuwing dat je instellingen veranderen, geen weg terug. Wie ooit gegevens is kwijtgeraakt durft deze knop niet aan te raken.
**Beter:** Eerst een bevestiging: uit welk bestand, van welke datum, en wat er wordt toegevoegd of overgenomen. Pas na "Terugzetten" uitvoeren.

### 10.3 BLOKKEREND — "Ongeldig bestand" laat je met lege handen staan — *viel 2 testers op*
**Regel:** index.html:917 en 4218
**Nu:** "Ongeldig bestand"
**Waarom mis:** Twee woorden die weer verdwijnen. Verkeerd bestand? Back-up kapot? Wat moet ik nu? Mensen durven niet opnieuw te proberen — juist iemand die net een nieuwe telefoon heeft.
**Beter:** "Dit bestand komt niet van GridLife. Zoek een bestand dat begint met gridlife-backup- en eindigt op .json, meestal in je map Documenten of Downloads. Er is niets veranderd aan je gegevens."

### 10.4 Locatiekeuze "Documenten / GridLife" of "App-map" — *viel 2 testers op*
**Regel:** index.html:362-363
**Nu:** `<option>Documenten / GridLife</option><option>App-map</option>`
**Waarom mis:** Twee technische mapnamen zonder uitleg wat het verschil voor jóu betekent. Blijft de back-up bestaan als ik de app verwijder? Kan ik er zelf bij? Dat is precies de vraag en het antwoord staat er niet.
**Beter:** "In je map Documenten (je vindt het bestand zelf terug en het blijft staan)" en "In de app zelf (verdwijnt als je de app verwijdert)".

### 10.5 "Maak eerst een back-up!" maar er is geen knop om dat te doen — *hinderlijk*
**Regel:** index.html:4040
**Nu:** "Dit verwijdert alle gegevens en kan niet ongedaan worden gemaakt. Maak eerst een back-up!"
**Waarom mis:** Je zit al in het wis-scherm. Je moet zelf terug, de back-upkaart zoeken, exporteren, en weer terugkomen. Grote kans dat mensen dat overslaan en alles kwijt zijn.
**Beter:** Een knop "Eerst back-up maken" boven het invulvak, plus de datum van je laatste back-up.

### 10.6 "Werkt alleen in de app" terwijl ik in de app zit — *hinderlijk*
**Regel:** index.html:3821
**Nu:** "Automatische back-up werkt alleen in de app."
**Beter:** "De automatische back-up werkt alleen in de geïnstalleerde app op je telefoon. Hier kun je wel zelf een back-up opslaan met de knop hieronder."

### 10.7 Foutmelding bij exporteren toont Engelse computertaal — *hinderlijk*
**Regel:** index.html:4103
**Nu:** "Export mislukt: " + technische foutregel
**Waarom mis:** Je weet niet of je back-up nu wel of niet ergens staat, en wat je moet doen.
**Beter:** "Opslaan is niet gelukt. Er is niets veranderd aan je gegevens. Probeer het nog eens, of kies een andere plek om op te slaan."

### 10.8 Exportverslag: badge "Gedeeld" zonder bestandsnaam — *hinderlijk*
**Regel:** index.html:4095
**Nu:** "● Gedeeld"
**Waarom mis:** Eén woord. Je wilt zwart-op-wit zien waar het bestand staat en hoe het heet, anders vind je het over een half jaar niet terug.
**Beter:** "Opgeslagen als gridlife-backup-2026-07-30.json — bewaar dit bestand ergens buiten je telefoon."

### 10.9 Exportverslag: kale getallen — *hinderlijk*
**Regel:** index.html:4097
**Nu:** "Diensten 37 · Potjes 4 · Uitgaven en ontvangsten …"
**Waarom mis:** 37 wát? En bij nul verdwijnt de regel helemaal, dus je weet niet of er iets ontbreekt of gewoon leeg is. Juist bij een back-up wil je zien dat álles erin zit.
**Beter:** "37 diensten", "4 potjes", en lege onderdelen tonen als "geen".

### 10.10 Importverslag: rijen met app-woorden — *hinderlijk*
**Regel:** index.html:4294
**Nu:** "Documentsoorten", "Rekeningen", "Openstaande afwijkingen", "Receptcategorieën", met "+ 3" erachter
**Waarom mis:** Dat zijn geen dingen die de gebruiker kent; hij weet niet of er iets goed of fout ging.
**Beter:** "Uren die nog rechtgezet moeten worden", "Soorten documenten", "Groepjes recepten".

### 10.11 Importverslag: "Uitgezet" voelt als kwijtraken — *hinderlijk*
**Regel:** index.html:4302
**Nu:** "In de back-up stonden deze functies uit. Je kunt ze bij Functies weer aanzetten."
**Waarom mis:** Nergens staat de geruststelling dat de gegevens van die onderdelen er nog gewoon zijn.
**Beter:** Toevoegen: "Er is niets verwijderd — deze onderdelen zijn alleen verborgen. Zet je ze weer aan, dan staat alles er nog."

### 10.12 Melding "Uit" — uit wát? — *klein*
**Regel:** index.html:4039
**Nu:** `toast(db.backup.on?'Automatische back-up aan':'Uit')`
**Beter:** "Automatische back-up uit — je maakt vanaf nu zelf back-ups."

### 10.13 "Frequentie" en "Bij elke wijziging" — *klein*
**Regel:** index.html:362
**Nu:** "Frequentie" / "Bij elke wijziging"
**Waarom mis:** "Frequentie" is geen alledaags woord, en wijziging van wát? Van één cijfer? Mensen vrezen dat hun telefoon volloopt.
**Beter:** "Hoe vaak?" met "Meteen na elke aanpassing", "Eén keer per dag", "Eén keer per week".

---

## 11. Instellingen — Functies

### 11.1 "3 functies en 1 onderdeel staan uit" — maar wélke? — *hinderlijk*
**Regel:** index.html:3802
**Nu:** "${uit} functies en ${modUit} onderdeel staan uit."
**Waarom mis:** Je leest een getal maar ziet nergens wát er uitstaat, dus je moet een lange lijst met uitklappers doorzoeken. "Onderdeel" versus "functie" is voor de gebruiker hetzelfde woord.
**Beter:** Noem de namen: "Uit: Buffers, Statistieken, Recepten." Bij meer dan drie: "…en 2 andere".

### 11.2 De laatste tab uitzetten mislukt zonder uitleg — *hinderlijk*
**Regel:** index.html:824
**Nu:** `toggleModuleFeat` zet de waarde stilzwijgend terug
**Waarom mis:** Het vinkje springt terug en er gebeurt niets. Mensen denken dat hun scherm hapert of de app stuk is. De regel over "minstens een" staat bovenaan en is allang weggescrold.
**Beter:** Een melding op het moment zelf: "Er moet minstens één tabblad onderin blijven staan."

### 11.3 "Overmaak-teller" en "buffer- en jaarpotjes" — *viel 2 testers op*
**Regel:** index.html:777-778
**Nu:** "Overmaak-teller — Bij buffer- en jaarpotjes zien hoe vaak je de laatste 12 loondagen echt hebt overgemaakt"
**Waarom mis:** Drie app-eigen woorden in één zin. "Bufferpotje" en "jaarpotje" bestaan alleen hier en worden nergens uitgelegd, en "Overmaak-teller" staat op het potjes-scherm zelf nergens — je kunt dus niet nagaan wat je aan- of uitzet. Mensen laten het uit angst maar staan.
**Beter:** "Bijhouden of je echt overmaakt — bij potjes waar je voor spaart, zie je hoe vaak je het geld de afgelopen 12 loondagen echt hebt overgemaakt."

### 11.4 "Slimme hints" — *viel 2 testers op, klein*
**Regel:** index.html:782 (en 877)
**Nu:** "Slimme hints — Verwachte échte datum en bedrag tonen op basis van je historie"
**Waarom mis:** Wat is een "échte" datum, tegenover welke onechte? "Hints" klinkt als tips, maar het gaat over datums en bedragen. "Op basis van je historie" klinkt alsof de app iets over je weet, dus voorzichtige mensen zetten het uit en missen iets nuttigs.
**Beter:** "Vooruitblik bij een betaling — bijvoorbeeld: Spotify, 22 aug, € 10,99 (vorige keer ging dit bedrag er op de 3e af)."

### 11.5 "Uitschieters niet laten meetellen in gemiddelden" — *klein*
**Regel:** index.html:781
**Nu:** "Eenmalige uitgaven — Uitschieters niet laten meetellen in gemiddelden"
**Waarom mis:** Vertelt hoe de app rekent, niet waarom jij dit zou willen. Bij "eenmalige uitgave" denk je aan een losse aankoop, niet aan gemiddelden.
**Beter:** "Losse, ongewone uitgave — die dure reparatie telt dan niet mee als je normale maandbedrag."

### 11.6 "Categorieen" mist een trema en heet elders anders — *klein*
**Regel:** index.html:786 (vergelijk 3828)
**Nu:** "Categorieen — Recepten indelen en filteren op categorie"
**Beter:** Overal "Recept-categorieën", mét trema.

---

## 12. Instellingen — overig

### 12.1 Weergave: drie losse woorden zonder uitleg — *klein*
**Regel:** index.html:347
**Nu:** "Weergave" met chips "Volg telefoon", "Licht", "Donker"
**Waarom mis:** Nergens staat dat dit over de kleur van het scherm gaat. "Volg telefoon" klinkt alsof de app iets van je telefoon gaat bijhouden.
**Beter:** Kopregel "Kleur van de app", en "Zelfde als mijn telefoon".

### 12.2 Werkgever verwijderen zegt niet wat er met je diensten gebeurt — *hinderlijk*
**Regel:** index.html:3880
**Nu:** "\"X\" heeft nog diensten. Toch verwijderen?" — venstertitel is alleen "Verwijderen"
**Waarom mis:** Worden die diensten gewist, of blijven ze naamloos staan? Mensen durven niet te kiezen, en aan de titel zie je niet eens waar het over gaat.
**Beter:** Titel "Werkgever verwijderen". Tekst: "Bij Albert Heijn staan nog 41 diensten. Die blijven gewoon staan, maar je kunt er geen nieuwe meer voor invoeren."

### 12.3 De rij "Uitleg" heeft het recepten-icoon — *viel 2 testers op, klein*
**Regel:** index.html:3728
**Nu:** `row('recept','Uitleg','Antwoord op alle vragen, met voorbeelden','openGuide()')`
**Waarom mis:** Hetzelfde plaatje als bij recepten; mensen denken dat ze hun kookboek openen. Bovendien staat een helppagina tussen echte functies.
**Beter:** Een eigen vraagteken- of boek-icoon, en de rij apart onderaan zetten.

---

## 13. Door de hele app heen

### 13.1 Elke bevestiging heeft een rode knop — *hinderlijk*
**Regel:** index.html:4321
**Nu:** `<button class="danger" …>` bij álle bevestigingen, ook "Weer openstaand", "Terugzetten", "Ja" en "Toch toevoegen"
**Waarom mis:** Rood betekent: pas op, dit kan niet meer terug. Als álles rood is, gaan mensen overal aarzelen en letten ze uiteindelijk nergens meer op — precies bij de echte verwijderknop.
**Beter:** Rood alleen bij echt verwijderen; groen of neutraal bij bevestigen, heropenen en toevoegen. `confirmRich` doet dit al goed — gebruik die ook hier.

### 13.2 Bij onopgeslagen wijzigingen ontbreekt de knop "Opslaan" — *hinderlijk*
**Regel:** index.html:4385
**Nu:** "Je hebt hier iets gewijzigd zonder op te slaan. Wil je die wijziging weggooien?" met Annuleren / Weggooien
**Waarom mis:** Je hebt net vijf velden ingevuld en drukt per ongeluk op terug. De enige knop die je nodig hebt — Opslaan — zit er niet bij. Bij Annuleren sta je voor hetzelfde probleem.
**Beter:** Drie knoppen: "Opslaan", "Weggooien", "Terug naar het formulier".

---

## 14. Uitleg-pagina

### 14.1 BLOKKEREND — Het antwoord over back-ups is een lap van tien regels
**Regel:** index.html:1123
**Nu:** één blok over automatisch, exporteren, importeren, instellingen, het verslag, de pincode én hoe je alles uitzet, eindigend met: "Wil je niets van dit alles? Zet dan bij Functies de hele back-up-kaart uit…"
**Waarom mis:** Precies de vraag waarvoor mensen komen, en ze raken halverwege het spoor kwijt. Het slot (alles uitzetten) is het tegenovergestelde van waar ze naar zochten.
**Beter:** Splits in drie korte vragen: "Hoe maak ik een back-up?", "Hoe zet ik een back-up terug?", "Wat komt er wel en niet mee?" — en begin elk met de stappen, niet met de uitleg.

### 14.2 Vier alinea's over hoe de app telt bij Potjes en sparen — *hinderlijk*
**Regel:** index.html:1031
**Nu:** "Daarom kijkt de app hier niet naar je saldo maar naar wat jij er zelf in stopte: hoe vaak heb je dit potje op je loondag afgevinkt?"
**Waarom mis:** Vier alinea's met 12 loondagen, buffers, jaarposten en lopende loonperiodes. De lezer wilde alleen weten wat "5 van 7 keer overgemaakt" betekent en wat hij nu moet doen. Hij haakt af na alinea twee.
**Beter:** Begin met één zin: "Van de laatste 7 loondagen heb je dit potje 5 keer afgevinkt." Dan de actie: "Klopt dat niet? Tik op 'Toch overgemaakt'." De rekenuitleg als optioneel blokje eronder.

---

## 15. Documenten

### 15.1 "Eerste waarschuwing vooraf" — en er komen er stiekem meer — *hinderlijk*
**Regel:** index.html:3768
**Nu:** "Daarna volgen ook de algemene document-herinneringen (instelbaar bij Meldingen)."
**Waarom mis:** Je stelt één moment in en hoort dat er dáárna nog meer meldingen komen, die je elders moet gaan zoeken. Je weet niet hoeveel en wanneer. Dit is precies waarom mensen meldingen uitzetten.
**Beter:** Concreet tonen: "Je krijgt een melding op 3 mrt, 3 mei en 1 jun", met een link om dat aan te passen.

### 15.2 Tijdseenheid wisselt per kaart — *klein*
**Regel:** index.html:3750
**Nu:** "Nog 3 maanden" naast "Nog 47 dagen" en "Nog 12 dagen"
**Waarom mis:** Niet in één oogopslag te vergelijken, en "3 maanden" is afgerond; de echte datum staat klein en grijs.
**Beter:** Overal dezelfde eenheid, of de datum groot en de teller klein.

---

## 16. Statistieken

### 16.1 Lege staat zegt alleen "Geen gegevens." — *hinderlijk*
**Regel:** index.html:1703
**Nu:** "Geen gegevens."
**Waarom mis:** Vier tabjes, een keuzelijst, twee streepjes en dan dit. Geen enkele hint wat je moet doen om hier wél iets te zien.
**Beter:** "Zodra je een gewerkte dienst invult, zie je hier je uren per week en maand." Met een knop naar Uren.

---

## 17. PDF-export

### 17.1 Kolomkoppen zijn afgekort en onbegrijpelijk — *hinderlijk*
**Regel:** index.html:4187
**Nu:** "Potje · Saldo · Opzij/mnd · Uitg. 12mnd · Status deze maand"
**Waarom mis:** Deze PDF laat je aan een ander zien — je moeder, de gemeente, je partner. Die snapt "Opzij/mnd" en "Uitg. 12mnd" niet, en "Potje" bestaat alleen in deze app. Op papier kun je niet doorklikken voor uitleg.
**Beter:** "Waarvoor · Wat er nu op staat · Elke maand opzij · Uitgegeven afgelopen jaar".

### 17.2 Kolom "Eigen deel" zonder uitleg — *hinderlijk*
**Regel:** index.html:4194
**Nu:** "Post · Datum · Bedrag · Eigen deel · Status"
**Waarom mis:** "Eigen deel" is lager dan "Bedrag", maar nergens in de PDF staat dat er toeslag af is. Bij posten zónder toeslag staat exact hetzelfde bedrag twee keer, wat op een fout lijkt.
**Beter:** Kolom "Betaal je zelf" met voetnoot "toeslag is er al af"; laat de kolom weg als er geen toeslag in het spel is.

### 17.3 Eén lange regel met acht getallen achter elkaar — *klein*
**Regel:** index.html:4178
**Nu:** "Totaal (laatste 12 mnd): … · Gem. per maand: … · per week: … · Afwijkingen open: 3 (2u 15m) · …"
**Waarom mis:** Op papier een muur van cijfers. "per week" heeft niet eens een eigen label — je moet raden dat het een gemiddelde is.
**Beter:** In een klein tabelletje of blokjes, elk getal met zijn eigen volledige label.

### 17.4 "PDF mislukt:" met een Engelse foutregel erachter — *klein*
**Regel:** index.html:4216
**Nu:** "PDF mislukt: " + technische melding, twee seconden in beeld
**Beter:** "Het overzicht kon niet gemaakt worden. Probeer het opnieuw; lukt het weer niet, maak dan ruimte vrij op je telefoon."

---

# Dit eerst — top 10

Gekozen op: veel winst, weinig werk. Nummer 1 tot en met 7 zijn puur tekst.

| # | Wat | Regel | Waarom eerst |
|---|-----|-------|--------------|
| 1 | Loondag-melding "Tik om over te boeken" herschrijven | 3603 | Mensen denken dat de app hun geld overmaakt. Eén zin, grootste misverstand weg. |
| 2 | "Niets wordt overschreven" corrigeren | 365 | De tekst is aantoonbaar onjuist over je instellingen. Eén zin. |
| 3 | "Ongeldig bestand" vervangen door een bruikbare zin | 917 + 4218 | Blokkeert iemand met een nieuwe telefoon volledig. Twee plekken, dezelfde zin. |
| 4 | Lege Potjes-pagina: echte knop "Maak je eerste potje" + de ＋ hetzelfde laten doen | 2460 + 2650 | Dé instap van de app loopt nu dood. Kleine ingreep, iedereen raakt hem. |
| 5 | "Alles afvinken" en de bevestiging herschrijven ("De app maakt zelf niets over") | 306 + 2505 + 2511 | Angst rond echt geld, bij de meest gebruikte handeling. |
| 6 | "Zo rekent de app het uit" → "Je eerstvolgende loondagen" | 887, 3281, 3925 | Drie keer zoeken-en-vervangen; het blokje dat mensen nu overslaan is juist het nuttigste. |
| 7 | Eén woord kiezen voor de loondag (loondag), overal doorvoeren | 321, 1349, 3284 | Vier namen voor hetzelfde ding op één scherm. Zoeken-en-vervangen. |
| 8 | Rode knop alleen bij echt verwijderen | 4321 | Eén klasse-wijziging per bevestiging; herstelt de betekenis van "rood" in de hele app. |
| 9 | "Kostenpost" overal vervangen door "vaste last" | 3070, 3112, 3023, 2588, 2665 | Vijf plekken, één woord, en het sluit meteen aan op je eigen uitlegpagina. |
| 10 | Regeltje "Pincode vergeten?" onder het pincodescherm + waarschuwing bij het aanzetten | 4077 | Voorkomt dat iemand zijn hele administratie kwijt is. Eén regel tekst plus één bevestiging. |

---

# Analyse: is GridLife over-engineered?

## 1. Hoeveel knoppen, schakelaars en keuzes krijgt de gebruiker?

Geteld in de code:

**Functies-scherm (regel 752-798, geopend via Instellingen → Functies):** 4 hoofdonderdelen (MODULES, regel 402) plus 29 losse functieschakelaars in 7 uitklapgroepen. Samen **33 aan/uit-vinkjes** op één plek. Acht daarvan gaan alleen over welke kaartjes je op je startscherm ziet.

**Instellingen-pagina zelf (regel 344-368):** naam, 3 themakeuzes, meldingen aan/uit, een vast tijdstip, een lijst met 4 meldingstypes die elk hun eigen tijdstip, herinneringsmomenten en meldingstekst kunnen hebben (uit `db.meldCfg`, regel 536-541 — dat zijn nog eens ~16 instelbare dingen), 3 beheerlijsten, app-slot met pincode én vingerafdruk, automatische back-up met locatie (2 opties) en frequentie (3 opties), exporteren, importeren, PDF, alles wissen. Ruwweg **35 losse keuzes**.

**Per werkgever (regel 3900-3960):** in dienst/uit dienst, contract-uren, 4 loonmodi, 3 soorten loondag (vaste dag / laatste werkdag / bijv. laatste vrijdag), dag van de maand, tweede loondag, weekdag, hoeveelste weekdag, wat er gebeurt als de loondag in het weekend valt (3 opties), feestdagen ja/nee, eerste loondag, hoe vaak de werkgever uren klaarzet (getal + 4 eenheden), klaar-op-dag, hoe missende uren rechtgezet worden (3 opties), en bij "apart nabetaald" nog eens 3 submodi met een getal, eenheid of datum. Dat zijn **ruim 18 keuzes per werkgever**, en die krijg je meteen bij het toevoegen van een werkgever voor je kiezen.

**Onboarding (regel 834-838):** de wizard loopt 4 onderdelen én 11 functieschakelaars langs vóórdat de app iets doet.

**Uitleg (GUIDE, regel 960-1140):** **49 uitlegvragen** in 9 hoofdstukken. Dat aantal is het duidelijkste signaal in het hele bestand. Een app die je in vijf minuten snapt heeft geen 49 veelgestelde vragen nodig. 49 vragen is de omvang van een handleiding, en het feit dat de maker die heeft moeten schrijven — mét nagebouwde voorbeeldschermpjes per vraag — betekent dat het product zichzelf niet uitlegt.

Totaal, ruw: **rond de 120 instelbare dingen** voor iemand met één werkgever. De uitleg alleen al is bijna een vijfde van het hele bestand.

## 2. Wat vindt of begrijpt een gewone gebruiker nooit?

- **Overmaak-teller** (`opzijtel`, regel 777): "bij buffer- en jaarpotjes zien hoe vaak je de laatste 12 loondagen echt hebt overgemaakt". Niemand zoekt hierop, niemand mist het als het weg is.
- **Slimme hints** (`hints`, regel 782): verwachte datum en bedrag op basis van historie. Onzichtbaar mechanisme met een vage naam.
- **Eenmalige uitgaven** (`once`, regel 781): "uitschieters niet laten meetellen in gemiddelden" — dit is boekhoudersdenken.
- **Klaar op dag / ritme "per loonperiode"** (regel 3944-3948): instellen hoe vaak je werkgever je uren klaarzet. Vrijwel niemand kan dit beantwoorden zonder erover na te denken.
- **Nabetaal-modus met vast interval** (regel 3950-3953): "elke 2 weken nabetaald". Extreem zeldzaam geval, wel permanent zichtbaar zodra je "apart nabetaald" kiest.
- **Weekendverschuiving + feestdagen bij de loondag** (regel 410-411, `loonWeekendHTML`): drie opties over wat er gebeurt als je loondag op zaterdag valt. Correct gedacht, maar de bank doet dit al en de gebruiker merkt het vanzelf.
- **Loondag-type "laatste vrijdag van de maand"** (`dagType:'weekdag'` met `wd`/`wdN`, regel 409): vier knoppen diep, voor een minderheid.
- **Back-uplocatie "App-map" vs "Documenten"** (regel 364): een technische keuze die niets oplost voor de gebruiker.
- **Brandstof-potjes met liters en literprijs** (`fuel`, regel 780): een compleet apart subproduct in een geldapp.
- **De acht losse startscherm-schakelaars** (regel 763-770): dat je een enkele kaart kunt uitzetten is prima, maar dat het als acht aparte instellingen in een uitklapmenu staat vindt bijna niemand.

## 3. Welke begrippen moet je leren?

Voordat de app werkt moet je snappen: potje, kostenpost, buffer, spaarpotje, saldo, "per maand opzij", "saldo genoeg", toeslag, losse ontvangst, eenmalige uitgave, geldstroom, potjes-periode, loonperiode, loondag, eerste loondag, contract-uren, uren-controle met drie statussen (te controleren / klopt / afwijking), gemiste tijd, correctie op latere dienst, apart nabetaald, zelf geregeld, nabetaal-moment, module, functie, en het onderscheid tussen een module uitzetten en een functie uitzetten.

Dat zijn **ruim 20 begrippen**, waarvan zeker acht door de app zelf zijn bedacht. Voor een app die "gewoon je vaste lasten bijhouden" moet doen is dat niet redelijk. Een normale gebruiker houdt er drie of vier vol: potje, vaste last, saldo, loondag. De rest is de reden dat er 49 uitlegvragen zijn.

## 4. Wat kan weg of samen?

Durf hier te snijden:

- **De acht startscherm-schakelaars → één instelling.** Laat de kaarten verschijnen zodra je gegevens hebt, en laat de gebruiker een kaart wegvegen op het startscherm zelf. De hele groep `start` (regel 763-770) kan uit Functies verdwijnen.
- **De vijf data-schakelaars (regel 793-797) helemaal weg.** Wie zet er ooit "Exporteren" uit? Back-up, export, import en PDF horen er gewoon te zijn. Dit zijn schakelaars om schakelaars.
- **`profiel` (regel 791) weg.** Een naamveld hoeft geen aan/uit-knop; leeg laten is al "uit".
- **`opzijtel`, `hints`, `once` samenvoegen of schrappen.** Maak er hooguit één keuze van, of laat ze simpelweg altijd aanstaan zonder dat de gebruiker ervan hoeft te weten.
- **De drie recept-schakelaars (regel 786-788) weg.** Categorieën, favorieten en porties zijn geen functies om te configureren; die gebruik je of niet.
- **Loondag-instelling terugbrengen tot twee vragen.** "Hoe vaak?" en "welke dag?". Verplaats `dagType:'weekdag'`, weekendverschuiving en feestdagen naar een "geavanceerd"-uitklapper of laat ze weg — de app kan dit prima zelf raden en corrigeren.
- **Uren-controle: het ritme, de klaardag en de nabetaal-submodi kunnen weg** (regel 3944-3953). Houd alleen "Klopt / Klopt niet" over met daarachter drie manieren om het recht te zetten. De rest is planning van iets wat je toch handmatig afvinkt.
- **Onboarding: stop met vragen naar functies.** Vraag naar naam, werkgever en loondag, en laat de rest vanzelf verschijnen. De app hééft al de logica om functies aan te zetten zodra er data is (`HEEFT_DATA`, regel 518-533) — gebruik dat mechanisme in plaats van de wizard.
- **49 uitlegvragen → hooguit 15.** De rest is een symptoom, geen oplossing.

Netto: van 33 schakelaars naar ongeveer 8, van ~18 werkgeverkeuzes naar ~6.

## 5. Waar is de complexiteit verdiend?

Veel, en dat verdient eerlijke erkenning:

- **Het vangnet rond opstarten en opslaan (regel 445-473, 645-657).** Onleesbare gegevens worden apart bewaard in plaats van weggegooid, een mislukte migratie legt de app niet plat, een volle telefoon geeft een echte melding. Dit is precies het soort zorg dat gewone gebruikers redt, en ze merken er nooit iets van. Onzichtbare complexiteit is goede complexiteit.
- **De migraties (regel 475-643).** Alle oude gegevensvormen worden meegenomen zonder dat de gebruiker iets hoeft te doen. Dat is werk dat je doet zodat de gebruiker niks hoeft te leren.
- **`schoonLoonCfg` (regel 417-443).** Elke instelling die van buiten komt wordt binnen veilige grenzen getrokken. Dit voorkomt witte schermen. Verdiend.
- **Uren controleren tegen je werkgever.** Dit lost een écht probleem op: werkgevers maken fouten met urenregistratie en mensen merken het niet. Dit is de sterkste reden dat de app bestaat. De uitvoering is te fijnmazig, maar de functie zelf niet.
- **"Per maand opzij" voor jaar- en kwartaalkosten.** Rekenwerk dat mensen echt niet zelf doen, weggestopt achter één getal. Dit is complexiteit die de gebruiker juist bespaard blijft.
- **Namen vergelijken (regel 708-725)** zodat "jumbo" en "Jumbo " hetzelfde zijn, mét de nuance dat "Café" wél anders is dan "Cafe". Klein, doordacht, onzichtbaar.
- **Het blokje "Zo rekent de app het uit"** met de eerstvolgende vijf loondagen. Je controleert een instelling aan de uitkomst in plaats van aan de knoppen. Dat is uitstekend ontwerp — en tegelijk het bewijs dat de instelling eronder te ingewikkeld is.

## 6. Eindoordeel

**Deels — de motor is niet over-engineered, de bedieningspaneel wel.**

Alles wat de gebruiker niet ziet, is precies goed gebouwd: de foutafhandeling, de migraties, het rekenwerk. Daar zit complexiteit die echte problemen oplost en die niemand hoeft te begrijpen. Het probleem zit in de laag erboven: 33 schakelaars, 18 keuzes per werkgever en 20-plus zelfbedachte begrippen die de gebruiker wél moet begrijpen. De 49 uitlegvragen zijn de rekening daarvan — dat is geen hulpfunctie meer, dat is een handleiding die de app compenseert. De diepste ironie is dat het Functies-scherm bedoeld is om de app simpeler te maken, maar zelf het ingewikkeldste scherm van de app is geworden: je moet 33 dingen begrijpen om te kiezen wat je niet wilt begrijpen. De app heeft bovendien al het juiste mechanisme in huis om dit op te lossen — functies verschijnen automatisch zodra er gegevens zijn — maar durft er niet op te vertrouwen. Snijd de schakelaars weg en vertrouw op dat mechanisme, en er blijft een sterke, goed gebouwde app over. Laat ze staan, en de meeste mensen komen niet voorbij de wizard.