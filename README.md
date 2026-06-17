# StyleSnap AI

PWA mobile-first: toma una selfie con la cámara frontal, elige uno de 3 estilos
aleatorios y obtén un retrato artístico generado con IA (Hugging Face FLUX.2-klein-9B).

- **Frontend:** React + Vite + TypeScript + MUI + React Router + React Query, PWA.
- **Backend:** Supabase Edge Function (`generate-image`) + Storage + Postgres.
- **IA:** Hugging Face Inference — `black-forest-labs/FLUX.2-klein-9B`
  (**image-to-image**, vía provider `replicate`, llamado solo desde la Edge Function).
- **Diseño:** design system "Lumina Creative" (Google Stitch) — ver `docs/design/`.

> **Backends de generación** (la Edge Function elige por secrets, primer match gana):
> - `MOCK_GENERATION="true"` → demo offline (devuelve la selfie).
> - `HF_SPACE="owner/Space"` → **img2img GRATIS** vía un Space público de Gradio (sin
>   créditos). Default usado en este proyecto: `Manjushri/SDXL-Turbo-Img2Img-CPU`
>   (CPU, ~35s/imagen, calidad media; ideal para pruebas sin billing).
> - Sin lo anterior → **provider de pago** (`HF_MODEL`=FLUX.2-klein-9B, `HF_PROVIDER`=replicate;
>   mejor calidad, consume créditos de HF/Replicate).
>
> Todos los caminos img2img usan la selfie y preservan identidad/pose. El Space gratis
> puede estar en cola, dormirse o cambiar (es un demo público) — suficiente para tests.

## Requisitos

- Node 20+ y npm
- Supabase CLI (`npx supabase`)
- Un token de Hugging Face (`HF_TOKEN`) con acceso a la Inference API y al provider
  Replicate (gate del modelo aceptado en su página de HF).

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
# opcional: cambiar modelo / provider (defaults: FLUX.2-klein-9B / replicate)
# npx supabase secrets set HF_MODEL=... HF_PROVIDER=...
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
