# React TS + Vite app starting guide

## Vytvoříme aplikaci

```powershell
npm create vite@latest frontend --template react-ts
cd frontend
npm install
```

## Instalace Tailwind

```powershell
npm install tailwindcss @tailwindcss/vite
```

`vite.config.ts` upravíme takto:
```Typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
})
```

Smažeme obsah `index.css` a nahradíme:
```css
@import "tailwindcss";
```


## Rozběhneme aplikaci
```powershell
npm run dev
```


Nyní nám běží aplikace na `http://localhost:5173/`

## Rozběhneme backend

V novém ps terminálu:
```powershell
cd docker
docker compose up --build
```
## Vygenerovat logiku pro backend

V novém ps terminálu:
```powershell
cd frontend
npm install @openapitools/openapi-generator-cli
npx openapi-generator-cli generate -i http://localhost:8000/openapi.json -g typescript-fetch -o ./src/api
```
V `src/api/models` se nám nyní automaticky vytvořila logika (funkce pro volání a návratové modely) pro každy endpoint z backendu.

### K čemu je to dobré?
* Ušetří nám psaní opakovaného kódu pro každé API volání.
* Zabrání chybám – všechny požadavky i odpovědi mají typy, které se automaticky generují podle specifikace.
* Snadné aktualizace – když se změní backend (OpenAPI specifikace), jen přegenerujeme kód.