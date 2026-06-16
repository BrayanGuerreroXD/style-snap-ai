# StyleSnap AI — Design Doc

**Date:** 2026-06-15
**Status:** Approved for implementation

## 1. Purpose

PWA mobile-first donde el usuario toma una selfie con la cámara frontal, elige
uno de 3 estilos aleatorios y obtiene un retrato artístico generado por IA.
Valor: selfie rápida → estilos aleatorios → resultado visual llamativo → simple.

## 2. Stack

- **Frontend:** React + Vite + TypeScript, MUI, React Router, React Query (`@tanstack/react-query`), `vite-plugin-pwa`.
- **Backend:** Supabase (cloud project `kmxehgjftoashzhmfjhr`, región us-east-2) — Edge Function, Storage, Postgres.
- **IA:** Hugging Face Inference, `black-forest-labs/FLUX.2-klein-9B` (**image-to-image**) vía provider `replicate`, llamado **solo** desde la Edge Function con `@huggingface/inference`. *(Historia: Gemini free-tier sin image-gen → FLUX.1-schnell text-to-image (no usaba la selfie) → FLUX.2-klein-9B img2img que sí usa la selfie y preserva identidad. Replicate es de pago; en cuenta free corre con crédito mensual de HF.)*
- **Hosting:** Frontend en GitHub Pages; backend en Supabase.

## 3. Diseño visual — "Lumina Creative" (de Google Stitch)

Fuente: proyecto Stitch `projects/5869872889398960226`. Tokens completos en
`docs/design/lumina-creative.designMd.md`; mockups en `docs/design/mockups/`.

- **Tema:** dark-mode first, glassmorphism, alto contraste.
- **Color:** background `#0f1419`; primary `#7c4dff` / `#cdbdff`; secondary (cyan) `#00c2ff` / `#8fd8ff`; error `#ffb4ab`; surfaces `#181c24`/`#1c2026`.
- **Tipografía:** Plus Jakarta Sans. Headlines 700/600 con tracking negativo; body 16px; labels en mayúsculas con tracking.
- **Formas:** botones `rounded-lg` (16px), cards `rounded-xl` (24px), tags `rounded-md` (8px).
- **Componentes clave:** botón "Generate" con gradiente primary→secondary, min-height 56px; cards con borde interior `white@10%`; sombras suaves con tinte morado (glow); barras de progreso en gradiente.

Estos tokens se traducen a un `theme` de MUI (`createTheme`, dark palette + typography + shape + component overrides).

## 4. Pantallas (de los mockups de Stitch)

1. **Cámara** (`/creator`, estado `camera`): preview de cámara frontal con guía oval, botón obturador grande, switch cámara. Título "Take your selfie".
2. **Selección de estilo** (`/creator`, estado `styles`): "Choose your transformation / 3 random styles selected for you", 3 StyleCards (thumbnail + icono + nombre, seleccionado con borde morado 3px + badge ✓), botón Generate con gradiente.
3. **Loading** (`/creator`, estado `loading`): barra/indicador de progreso en gradiente mientras Gemini genera.
4. **Resultado** (`/creator` estado `result`, y `/result/:id`): card grande con el retrato + chip del estilo. Acciones: **Descargar** y **Volver a tomar**.

**Desviación de alcance:** los mockups muestran una bottom-nav (Capture/Gallery/Profile) y Gallery/Profile están *fuera del MVP*. Se conserva el lenguaje visual pero NO se implementan Gallery ni Profile. El flujo MVP es la máquina de estados dentro de `/creator`.

## 5. Rutas

- `/` — landing (entrada, CTA "Empezar").
- `/creator` — máquina de estados: `camera → styles → loading → result` (sin recargas).
- `/result/:id` — deep-link compartible; re-fetch por id (regenera signed URL).

**GitHub Pages:** `BrowserRouter` con `basename` = nombre del repo + `404.html` (copia de `index.html`) como fallback de deep-links.

## 6. Estilos (lista cerrada, frontend)

Constante en `src/constants/styles.ts` con los 6 estilos del spec (pixel-art, anime,
medieval, cyberpunk, comic, oil-painting). Al capturar: `shuffle(STYLES).slice(0,3)`.
El **prompt real vive en el catálogo server-side** de la Edge Function; el frontend
solo manda `styleId`. Gemini no inventa estilos.

## 7. Flujo de generación

1. Captura selfie → **downscale client-side** (máx ~1024px, JPEG ~0.85) → base64.
2. `POST` a Edge Function `generate-image` con `{ image, styleId }` (header anon key).
3. Función valida payload → busca estilo en catálogo interno → arma la instrucción de edición.
4. Llama HF `FLUX.2-klein-9B` (image+prompt → image) enviando la selfie como entrada.
5. Sube original a bucket `selfies`, generada a `generated` (**ambos privados**).
6. Inserta fila en `generations`.
7. Responde `{ id, generatedUrl, originalUrl }` como **signed URLs** (1h).
8. Frontend muestra resultado; permite descargar y volver a capturar.

La función usa **service-role key** (server-side); frontend usa anon key. Sin escrituras
expuestas por RLS → buckets privados seguros sin auth (user_id nullable, login fuera de MVP).

## 8. Modelo de datos

Tabla `generations`:
- `id uuid pk default gen_random_uuid()`
- `user_id uuid null`
- `style_id text not null`
- `original_image_url text` (path en storage)
- `generated_image_url text` (path en storage)
- `created_at timestamptz default now()`

Buckets: `selfies` (privado), `generated` (privado). RLS habilitado; solo service-role escribe/lee directamente; el cliente recibe signed URLs.

## 9. Prompt (server-side)

Instrucción de edición por estilo (catálogo en `supabase/functions/generate-image/styles.ts`).
`buildPrompt(stylePrompt)` produce: `Restyle this portrait as {{STYLE_PROMPT}}. Keep the
same person, facial identity, pose and composition. High quality, highly detailed,
artistic. No text, no watermark.`

## 10. Manejo de errores

Errores tipados con `ErrorState` (MUI) + retry: `camera-denied`, `invalid-capture`,
`generation-timeout`, `gemini-error`, `storage-error`, `network-error`.

## 11. Componentes

`AppHeader`, `CameraPreview`, `CaptureButton`, `StyleCard`, `LoadingState`,
`ResultCard`, `PrimaryButton`, `SecondaryButton`, `ErrorState`, `EmptyState`.

## 12. Estructura

```
src/
  app/            # App, router, theme, query client, providers
  pages/          # LandingPage, CreatorPage, ResultPage
  components/     # camera/ styles/ generation/ result/ common/
  services/       # supabase.ts, generation.ts
  hooks/          # useCamera, useGenerateImage, useRandomStyles
  types/          # generation.ts
  constants/      # styles.ts
  utils/          # image.ts (downscale/base64), shuffle.ts
supabase/
  functions/generate-image/
  migrations/
public/           # manifest, icons, 404.html
```

## 13. Estado

`useState` local para la máquina de estados; React Query para la mutación de
generación (`useMutation`) y el fetch de `/result/:id`. Sin Redux.

## 14. PWA

`vite-plugin-pwa` (autoUpdate), manifest (nombre, theme_color `#7c4dff`, background
`#0f1419`, display standalone), iconos 192/512 + maskable, fallback offline básico.

## 15. Verificación

- Edge Function probada contra el proyecto Supabase real con la Gemini key (camino
  caro probado primero).
- Frontend: la app abre en móvil, cámara frontal, captura, 3 estilos aleatorios,
  selección, generación, resultado, descarga, volver a capturar (criterios MVP).

## 16. Fuera de alcance (MVP)

Historial, favoritos, perfiles, feed, compartir directo, multi-cuenta, edición
manual, login obligatorio, suscripciones, pagos, bottom-nav Gallery/Profile.
