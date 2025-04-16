# React TS + Vite app starting guide

## Nejdříve si nainstalujeme Node :)

- Pokud pracujete na školních PC, tak už by měl být nainstalovanej
- Pokud jste na Linuxu, tak si určitě dokážete dohledat, jak nainstalovat Node pro Vaši distribuci :)
- Ověřte pomocí
```powershell
npm -v
```
- Instalace pro Windows:
  1. Jděte na https://nodejs.org/en/download, stáhněte .msi installer a postupujte podle instrukcí
  2. !!! Restartujte Powershell/VS Code !!!
  3. Ověřte instalaci pomocí příkazů
     ```powershell
     node -v
     npm -v
     ```


## Extensions

- **Semafor** (povinné!)

1. Extensions -> Traffic Light (by Pavel Falta) -> Install
2. Search bar (Ctrl + Shift + P) -> Show Traffic Light -> Připojit se k otevřené místnosti

- **Tailwind CSS IntelliSense**

## Vytvoříme aplikaci

```powershell
npm create vite@latest frontend --- --template react-ts
cd frontend
npm install
```

## Rozběhneme aplikaci
```powershell
npm run dev
```


Nyní nám běží aplikace na `http://localhost:5173/`


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


## Přidáme tailwindcss třídy do kódu
```typescript
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="flex gap-4 mb-6">
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img src={viteLogo} className="h-20 w-20" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src={reactLogo} className="h-20 w-20" alt="React logo" />
        </a>
      </div>

      <h1 className="text-4xl font-bold mb-4">Vite + React</h1>

      <div className="mb-6 text-center">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="bg-gray-800 px-4 py-2 rounded hover:border hover:border-indigo-400"
        >
          count is {count}
        </button>
        <p className="mt-4 text-sm">
          Edit <code className="bg-gray-800 px-1 rounded">src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <p className="text-sm text-gray-400 text-center max-w-xs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App

```

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
