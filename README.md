# LeCloset

LeCloset is een mobiele applicatie die mensen met ADHD helpt om meer overzicht en rust te creëren in hun kledingkast. Door kledingstukken te registreren en het draaggedrag bij te houden, helpt de app gebruikers om vaker ongebruikte kleding te dragen en eenvoudiger te declutteren.

---

## Over het project

Mensen met ADHD ervaren regelmatig keuzestress en overzichtsproblemen bij het uitzoeken van kleding. Hierdoor worden vaak dezelfde kledingstukken gedragen, terwijl andere kleding jarenlang ongebruikt in de kast blijven hangen.

LeCloset biedt een eenvoudige oplossing door:

* Het registreren van kledingstukken.
* Bijhouden hoe vaak kleding gedragen wordt.
* Suggesties te geven op basis van minst gedragen kleding.
* Gebruikers te helpen bij het declutteren van hun kledingkast.
* Advies te geven over wat er met ongebruikte kleding kan worden gedaan.

Het doel is niet om complete outfits voor de gebruiker te kiezen, maar juist om de keuze makkelijker te maken zonder extra prikkels te creëren.

---

## Functionaliteiten

### Kledingkast beheren

* Kleding toevoegen
* Foto maken of uploaden
* Kleding bewerken
* Kleding verwijderen
* Zoeken op naam
* Filteren op categorie
* Filteren op warm/koud weer

### Draaggedrag

* Registreren wanneer kleding gedragen is
* Automatisch bijhouden van:

  * Laatste draagdatum
  * Aantal keer gedragen
* Overzicht van meest en minst gedragen kleding

### Outfitondersteuning

* Suggesties op basis van de minst gedragen tops
* Suggesties op basis van de minst gedragen bottoms
* Zelf eenvoudig een combinatie maken

### Declutter

* Detecteren van kleding die lang niet gedragen is
* Decluttermandje
* Adviespagina met mogelijkheden zoals:

  * Doneren
  * Verkopen
  * Recyclen
  * Upcyclen

### Statistieken

* Draaggeschiedenis per kledingstuk
* Grafiek van draagmomenten
* Favoriete kledingstukken
* Vergeet-mij-nietjes (minst gedragen kleding)

---

## Technologie

### Front-end

* React Native
* Expo
* Expo Router
* TypeScript

### Back-end

* Supabase
* PostgreSQL Database
* Supabase Storage

### Testing

* Jest

---

## Projectstructuur

```
app/
components/
constants/
hooks/
lib/
supabase/
types/
assets/
```

---

## Installatie

### Repository clonen

```bash
git clone https://github.com/<username>/LeCloset.git
cd LeCloset
```

### Dependencies installeren

```bash
npm install
```

### Environment variables

Maak een `.env` bestand aan en voeg de volgende gegevens toe:

```env
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### Applicatie starten

```bash
npx expo start
```

Daarna kan de app worden geopend via:

* Expo Go
* Android Emulator
* iOS Simulator

---

## Testen

Alle unit tests uitvoeren:

```bash
npm test
```

---

## Doelgroep

LeCloset is ontwikkeld voor mensen met ADHD die moeite hebben met:

* Overzicht houden in hun kledingkast
* Keuzes maken
* Vergeetachtigheid
* Impulsief kleding kopen
* Het regelmatig dragen van dezelfde kleding

---

## Toekomstige uitbreidingen

* Weersinformatie koppelen
* Outfitplanning
* AI-herkenning van kleding
* Barcode of kledinglabel scannen
* Persoonlijke reminders
* Kalenderoverzicht
* Kledingcombinaties opslaan
* Synchronisatie tussen meerdere apparaten

---

## Ontwikkelaar

**Alana le Feber**

Creative Media & Game Technologies
Hogeschool Rotterdam

---

## Licentie

Dit project is ontwikkeld als schoolproject voor de opleiding Creative Media & Game Technologies aan de Hogeschool Rotterdam.
