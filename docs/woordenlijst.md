# Woordenlijst GridLife

Vastgelegd 30 juli 2026, na de gebruikerstest met acht testpersonen (16 t/m 68 jaar).
Deze lijst gaat vóór persoonlijke voorkeur: één woord per begrip, overal hetzelfde.

## Afgesproken woorden

| Begrip | Gebruik dit | Gebruik dit niet |
|---|---|---|
| Een regel met een bedrag en een ritme binnen een potje | **vaste last** | kostenpost, rekening, kosten |
| Zo'n regel zonder vaste datum, voor onvoorspelbare kosten | **buffer** | — |
| Eén keer dat een vaste last vervalt | **betaling** | termijn, afschrijving, occurrence |
| Een doel om geld voor apart te zetten | **potje** | spaarpot, envelop |
| Een potje zonder vaste lasten | **spaarpotje** | — |
| De dag waarop je loon binnenkomt | **loondag** | betaaldag, uitbetaling, salarisdag |
| Een kopie van je gegevens wegschrijven | **Kopie opslaan** | exporteren, back-uppen |
| Een kopie terugzetten | **Kopie terugzetten** | importeren, herstellen |
| De kaart in Instellingen met dit alles | **Back-up & herstel** | Back-up, import & PDF · Back-up & veiligheid |
| Het tabblad met wat er af- en bijgeschreven wordt | **Betalingen** | Geldstroom |
| Iets vastleggen in de app | **noteren** | loggen, registreren |

## Waarom deze keuzes

**vaste last** — de app legde zijn eigen woord al uit met een haakje ("kostenposten (vaste lasten)").
Als je een haakje nodig hebt om je term uit te leggen, is de term het probleem. Een buffer heet
gewoon buffer en houdt zijn eigen label, want autoonderhoud is geen vaste last.

**betaling** — "termijn" kwam 74 keer voor zonder ooit uitgelegd te worden, en testers dachten aan
een afbetalingsregeling. De functienamen in de code (`termijnDatumTekst`) blijven ongewijzigd; die
ziet niemand.

**Kopie opslaan / terugzetten** — het risico is asymmetrisch. Gok je verkeerd bij opslaan, dan heb
je een bestand te veel. Gok je verkeerd bij terugzetten, dan is je administratie door de war. Twee
vreemde woorden naast elkaar maakten dat een gok.

**Betalingen** — een betaling is in het Nederlands richting-neutraal: de Belastingdienst *betaalt*
jou de zorgtoeslag. Het scherm scheidt de richtingen al met een groene regel eronder.

**potje blijft potje** — geen enkele tester struikelde erover, het is warm en Nederlands, en het is
de identiteit van de app.

## Schrijfregels

- Zeg wat de gebruiker moet **doen**, niet hoe de app **rekent**. Dat was de rode draad in alle acht
  testen. Rekenverantwoording mag, maar dan ingeklapt onder een eigen kopje.
- Rood is alleen voor onherstelbaar verwijderen. Niet voor afvinken, uitvinken of afboeken.
- Nooit een technische foutmelding van het toestel doorgeven aan de gebruiker. Zeg wat er misging
  en wat de volgende stap is.
- Een label dat "(optioneel)" zegt, moet ook echt optioneel zijn.
- Codenamen (variabelen, functies, sleutels in `db.feat`) blijven zoals ze zijn. Een sleutel
  hernoemen breekt de instellingen van iedereen die de app al gebruikt; een label hernoemen is veilig.
