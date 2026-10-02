# Můj Paměťový palác — MVP

Funkční MVP vizuálního „druhého mozku“ postavené v React + TypeScript + Tailwind CSS + React Flow.

## Co funguje

- domovská stránka se seznamem paláců
- vytvoření nového paláce
- demo palác „Projekt Aurora“
- mapa uzlů přes React Flow
- drag & drop uzlů
- přidání, editace a odstranění uzlu
- propojování uzlů tažením mezi oranžovými úchyty
- pojmenování vztahu při vytvoření spojení
- editace názvu vztahu dvojklikem na hranu
- detail uzlu v pravém panelu na desktopu
- detail uzlu jako bottom sheet na mobilu
- seznamový pohled
- časová osa
- vyhledávání uvnitř paláce
- localStorage autosave
- responzivní mobilní navigace

## Spuštění

```bash
npm install
npm run dev
```

Vite vypíše lokální adresu aplikace, typicky `http://localhost:5173`.

## Produkční build

```bash
npm run build
npm run preview
```

## Poznámka

AI prvky jsou v této první iteraci pouze připravené v UI. Datová struktura je lokální a lze ji v další iteraci nahradit Supabase databází.
