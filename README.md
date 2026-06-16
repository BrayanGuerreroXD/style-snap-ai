# StyleSnap AI

PWA mobile-first: toma una selfie con la cámara frontal, elige uno de 3 estilos
aleatorios y obtén un retrato artístico generado con IA (Hugging Face FLUX.1-schnell).

- **Frontend:** React + Vite + TypeScript + MUI + React Router + React Query, PWA.
- **Backend:** Supabase Edge Function (`generate-image`) + Storage + Postgres.
- **IA:** Hugging Face Serverless Inference — `black-forest-labs/FLUX.1-schnell`
  (text-to-image, llamado solo desde la Edge Function).
- **Diseño:** design system "Lumina Creative" (Google Stitch) — ver `docs/design/`.

> **Nota:** FLUX.1-schnell vía la Inference API es **text-to-image**: genera el
> retrato a partir del prompt del estilo, no usa la selfie como entrada, por lo que
> **no preserva la identidad facial**. La selfie se guarda como `original`.

## Requisitos

- Node 20+ y npm
- Supabase CLI (`npx supabase`)
- Un token de Hugging Face (`HF_TOKEN`) con acceso a la Inference API.

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
npx supabase secrets set HF_TOKEN=hf_...    # token de Hugging Face
# opcional: cambiar de modelo
# npx supabase secrets set HF_MODEL=stabilityai/stable-diffusion-xl-base-1.0
npx supabase functions deploy generate-image
```

### Modo demo offline

Para ver el flujo completo sin llamar a Hugging Face (la función devuelve la propia
selfie como "resultado"):

```bash
npx supabase secrets set MOCK_GENERATION=true   # demo
npx supabase secrets unset MOCK_GENERATION      # generación real
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
