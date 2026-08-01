# Voortgang gebruikerstest

Bijgehouden vanaf 30 juli 2026. Elke regel hieronder is gecontroleerd tegen de
huidige code — niet uit het geheugen opgeschreven. Zie
[gebruikerstest-2026-07.md](gebruikerstest-2026-07.md) voor de volledige
oorspronkelijke bevindingen en [woordenlijst.md](woordenlijst.md) voor de
afgesproken woorden.

Legenda: ✅ gedaan · 🔲 nog te doen · ⏭️ bewuste keuze (met reden)

## 1. Onboarding — 6/6 ✅

| # | Punt | Status |
|---|---|---|
| 1.1 | Loonstap opende met drie onbekende begrippen | ✅ |
| 1.2 | "Contract-uren" klonk als een fout | ✅ |
| 1.3 | Geldstap vol vaktaal | ✅ (hele stap is later trouwens komen te vervallen — zie "Verder dan het rapport") |
| 1.4 | Menu-naam die niet bestond | ✅ |
| 1.5 | "Zo rekent de app het uit" | ✅ |
| 1.6 | Back-upknop opende zomaar de bestandenmap | ✅ |

## 2. Potjes-pagina — 9/9 ✅

| # | Punt | Status |
|---|---|---|
| 2.1 | Lege pagina liep dood | ✅ |
| 2.2 | "Alles afvinken" leek geld over te maken | ✅ |
| 2.3 | "reset bij loon" zonder uitleg | ✅ |
| 2.4 | Telegramstijl statusbalkje | ✅ |
| 2.5 | Vooruitblikregel legde de rekensom uit | ✅ |
| 2.6 | "Telt mee zodra je 'm afvinkt" | ✅ |
| 2.7 | "Betaald voor nu" zonder datum | ✅ |
| 2.8 | Knop "Overzicht" zonder onderwerp | ✅ |
| 2.9 | Eén bedrag, drie namen | ✅ |

## 3. Potje bewerken — 4/4 ✅

| # | Punt | Status |
|---|---|---|
| 3.1 | "Geplande datum (optioneel)" was verplicht | ✅ |
| 3.2 | "Kostenpost" is nu overal "vaste last" | ✅ |
| 3.3 | Buffer beloofde "zonder vast bedrag" | ✅ |
| 3.4 | "aangepast…" zei niets | ✅ |

## 4. Geldstroom / Betalingen — 8/8 ✅

Allemaal gedaan, inclusief het tabblad zelf dat nu "Betalingen" heet (4.2).

## 5. Uren-pagina — 4/4 ✅

## 6. Uren-controle — 7/7 ✅

| # | Punt | Status |
|---|---|---|
| 6.1 | Drie knoppen zonder uitleg | ✅ |
| 6.2 | Uitleg ging over dubbeltellen | ✅ |
| 6.3 | "Heropenen" + vaktermen | ✅ — de bevestiging zelf was eerder al gedaan, maar de twee knoppen die 'm openen heetten nog "Heropenen"; dat viel op tijdens het opstellen van dit overzicht en is rechtgezet |
| 6.4 | Label "standaard" | ✅ |
| 6.5 | "· niet je loondag" las als fout | ✅ |
| 6.6 | Tijdveld accepteert vrije tekst | ✅ — "Hoeveel tijd miste je?" is nu twee losse velden (Uren / Minuten) op beide plekken waar afwijkingen worden ingevoerd, i.p.v. vrije tekst als "30 min" of "1 uur 15". |
| 6.7 | "Nabetaald verwacht" | ✅ |

## 7. Loon-pagina — 7/7 ✅

Inclusief de vier samengevoegd in de Uitleg-vraag "Waar stel ik in wanneer ik loon krijg?".

## 8. Meldingen — 4/4 ✅

## 9. App-slot — 2/2 ✅

Zowel de waarschuwing vóór het instellen van een pincode als de hulptekst ná
een foute code zijn er, in beide richtingen getest.

## 10. Back-up & herstel — 13/13 ✅

Het grootste hoofdstuk, en alles bevestigd — inclusief twee dingen die pas
opvielen tijdens latere controles: de Uitleg-vraag over back-ups toonde nog de
oude knopnamen "Exporteren"/"Importeren" (herschreven als genummerde stappen
met de huidige namen), en er stonden nog twee dode `if(false){...}`-restjes in
`exportData()`/`importData()` van de eerdere schakelaar-opruiming.

## 11. Functies — 6/6 ✅

## 12. Instellingen overig — 3/3 ✅

## 13. Door de hele app — 2/2 ✅

Rood is alleen nog voor verwijderen (de `.danger`-klasse zelf bestaat
uiteraard nog — die hoort er terecht te zijn bij "Potje verwijderen" e.d.).

## 14. Uitleg-pagina — 2/2 ✅ + volledige herziening

De twee losse punten (back-up-antwoord als lap tekst, vier alinea's
rekenverantwoording bij de teller) zijn gedaan. Daarnaast is de hele pagina
teruggebracht van 49 naar 22 vragen — zie "Verder dan het rapport".

## 15. Documenten — 2/2 ✅

## 16. Statistieken — 1/1 ✅

## 17. PDF-export — 4/4 ✅

---

## Verder dan het rapport

Dingen die niet uit de gebruikerstest kwamen, maar wel onderweg zijn gedaan:

- **Woordenlijst vastgelegd** ([woordenlijst.md](woordenlijst.md)) — kostenpost
  → vaste last, termijn → betaling, Geldstroom → Betalingen, exporteren/
  importeren → Kopie opslaan/Kopie terugzetten.
- **Bug: uren rechtzetten kon op een dienst van vóór de afwijking.** De lijst
  bij "Op latere dienst" filterde niet op datum.
- **Bug: kostenposten verder dan 3 jaar weg** zeiden onterecht "Betaald voor
  nu" door een vast venster van 36 maanden.
- **De wizard stelt geen functievragen meer** — van elf vinkjes naar nul.
  Alles staat aan; wie iets niet wil zet het uit bij Functies.
- **Van 29 naar 12 schakelaars.** De 8 startscherm-kaarten en de 5
  back-up/PDF-schakelaars zijn weg; die dingen horen er gewoon te zijn of
  verschijnen vanzelf zodra er gegevens zijn.
- **"Waar is je saldo voor?"** — nieuwe functie. Bij een potje met meerdere
  gedateerde vaste lasten én buffers rekent de app nu uit hoeveel van je
  saldo al bezet is voor wat eraan komt, in plaats van dat je saldo één
  ongedeelde hoop is. Getest met 18 losse situaties plus een combinatie van
  vier vaste lasten met verschillende ritmes en drie buffers tegelijk, op
  zes saldostanden.
- **Loondag- en werkgeverinstellingen deels achter "Geavanceerd".**
  Weekendverschuiving, feestdagen, het ritme waarin een werkgever uren
  klaarzet en de nabetaal-submodi staan dicht bij de standaardwaarden, en
  klappen automatisch open als je zelf al iets anders had ingesteld.
- **De Uitleg-pagina van 49 naar 22 vragen**, met de inhoud van wat wegviel
  waar nodig kort verwerkt in de vraag die overbleef.
- **"Gewerkt" in het dienst-scherm werkt nu live bij.** Begin, einde en pauze
  aanpassen liet het "Gewerkt: 3u 45m"-regeltje eerder pas bijwerken nadat je
  het scherm sloot en weer opende.
- **Pincode-terugkeerknop.** Bij een foute pincode staat er nu naast de
  bestaande uitleg ook een knop "Pincode kwijt? Opnieuw beginnen", die (na
  het typen van WISSEN) de app leeg opnieuw laat beginnen zonder opnieuw te
  installeren.
- **Bug: loon ontbrak in het PDF-overzicht "Uitgaven & ontvangsten".** Op het
  scherm zelf ("Alle uitgaven") stond loon er al tussen; in de PDF nog niet.
- **Bug: een negatief bedrag kon in een groen "klopt"-vinkje verschijnen.**
  Bij een potje waar de verwachte toeslag/ontvangst deze maand groter is dan
  wat er nog te betalen staat, toonde de app bijv. "€ -120,00" als
  geruststellend groen bedrag. Nu een aparte, positieve boodschap ("Je krijgt
  deze maand per saldo geld bij dit potje").
- **Bug: "Nog te betalen deze maand" negeerde een openstaande betaling van
  een vorige maand.** Een vaste last die nooit is afgevinkt viel buiten het
  kalendermaand-venster van het kopbedrag en de "dekt mijn potje dit"-check,
  terwijl hij wel nog moest gebeuren.

## Nog open

- **Naar GitHub pushen** — alles staat lokaal klaar, nog niet gepusht.
- **Testen op een echte telefoon** — alles is geverifieerd in de
  browser-preview; een APK-build en een testlijst volgen aan het einde.
