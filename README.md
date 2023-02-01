
Visualisering - Datadelingsoversikt for Felles datakatalog
=====================

Dette repoet inneholder verktøy for å lese data fra [Felles datakatalog](https://data.norge.no/) og lage Treemap visualiseringer i SVG format som viser hvordan datadeling fordeler seg over ulike virksomheter.


Installering og bruk
----

Prosjektet er løst som Node.js script (se `public/scripts`), med hjelpefunksjoner definert som moduler (`public/scripts/lib`). Det bruker JSON data fra et [API som gir oversikt](https://kodeverkstad.no/api/fdk_api.php?short) over virksomheter, og hvilke datasett de har publisert i Felles datakatalog.

Vi bruker [treemap-squarify](https://www.npmjs.com/package/treemap-squarify) til å kalkulere visualiseringen, som så oversettes til SVG med egne verktøy (se `TreemapGenerator.js`, `SVGUtil.js`.)

For å installere avhengigheter og kjøre generering av treemaps:

```
yarn
cd public/scripts
node main.js
```

----

Scripts
------

`main.js` viser hvordan data om datakatalogen leses og struktureres, og hvordan Treemaps genereres. Man kan bruke dette scriptet som et utgangspunkt og tilrettelegge for nye visualiseringer basert på en annen kategorisering.

`read_brreg.js` viser hvordan man kan lese XLSX filer  fra Brønnøysundregisteret med oversikt over offentlige virksomheter.

Videre arbeid
---


SVG'ene som genereres er statiske. En utfordring er tegning av tekst, siden SVG ikke støtter automatisk tekstflyt slik man har i HTML. Det brukes en primitiv måte å brekke linjer på, men noen virksomheter vises med navn som løper utenfor rektangelet de tilhører. Hvis dette skulle vises på en webside kunne man evt brukt Javascript til å teste font metrics og få til linjebrekk på den måten.

Man kunne også videreført Treemap logikken til å bli React komponenter som genererer SVG inline, slik at de kan skaleres dynamisk og har interaktivitet som tooltips o.l.

----

**Marius Watz, frog | Januar 2023**