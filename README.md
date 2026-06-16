# StyleSnap AI

PWA mobile-first: toma una selfie con la cámara frontal, elige uno de 3 estilos
aleatorios y obtén un retrato artístico generado con IA (Gemini 2.5 Flash Image).

- **Frontend:** React + Vite + TypeScript + MUI + React Router + React Query, PWA.
- **Backend:** Supabase Edge Function (`generate-image`) + Storage + Postgres.
- **IA:** `gemini-2.5-flash-image` (llamada solo desde la Edge Function).
- **Diseño:** design system "Lumina Creative" (Google Stitch) — ver `docs/design/`.

## Requisitos

- Node 20+ y npm
- Supabase CLI (`npx supabase`)
- Cuenta de Google AI con **billing habilitado** para generación de imágenes
  (el free tier devuelve HTTP 429; ver más abajo).

## Desarrollo local

```bash
npm install
cp .env.example .env   # rellena VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev
```

> La cámara requiere un contexto seguro: `localhost` funciona; en otros hosts usa HTTPS.

## Backend (Supabase)

Proyecto: `kmxehgjftoashzhmfjhr` (región us-east-2).

```bash
export SUPABASE_DB_PASSWORD=...
npx supabase link --project-ref kmxehgjftoashzhmfjhr
npx supabase db push                       # crea tabla generations + buckets privados
npx supabase secrets set GEMINI_API_KEY=...
npx supabase functions deploy generate-image
```

### Modo demo sin billing

Mientras no haya billing en Gemini, puedes ver el flujo completo activando el modo
mock (la función devuelve la propia selfie como "resultado"):

```bash
npx supabase secrets set MOCK_GENERATION=true
```

Para generación real, desactívalo:

```bash
npx supabase secrets unset MOCK_GENERATION
```

## Modelo de datos

Tabla `generations` (`id`, `user_id` nullable, `style_id`, `original_image_url`,
`generated_image_url`, `created_at`). Buckets privados `selfies` y `generated`.
El cliente nunca accede directo: la Edge Function devuelve **signed URLs** (1h).

## Build y deploy a GitHub Pages

El workflow `.github/workflows/deploy.yml` construye con `BASE_PATH=/<repo>/` y
publica `dist/` en Pages. Configura los secrets del repo:
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

```bash
BASE_PATH=/style-snap-ai/ npm run build   # build manual equivalente
```

## Tests

```bash
npm test
```

## Estructura

Ver `docs/superpowers/specs/2026-06-15-stylesnap-ai-design.md`.
