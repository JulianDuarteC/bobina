# Bobina 🎞️

Diario social de cine — MVP Fase 1 (auth, catálogo TMDb con caché, reseñas,
listas y watchlist).

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Supabase**: Postgres administrado + Auth + Storage (avatares/banners)
- **Prisma**: ORM sobre el mismo Postgres de Supabase
- **TMDb API**: catálogo de películas, con caché local de 7 días

## Por qué Supabase en vez de JWT/WebSockets propios

El SRS original planteaba Auth con JWT propio y un motor de WebSockets a
medida. Para el MVP, Supabase cubre auth (con verificación de email y
OAuth listo para activar), storage de imágenes y realtime — todo sobre el
mismo Postgres que ya necesitas. Esto reduce semanas de trabajo de
infraestructura sin cerrarte puertas: Prisma sigue siendo dueño del schema
de tu dominio (reviews, listas, etc.), Supabase solo administra
`auth.users`.

## Setup local

### 1. Requisitos

- Node.js 20+
- Una cuenta gratuita en [supabase.com](https://supabase.com) (crea un
  proyecto nuevo)
- Una cuenta en [themoviedb.org](https://www.themoviedb.org) para tu API
  key

### 2. Instalar dependencias

```bash
npm install
```

### 3. Variables de entorno

```bash
cp .env.example .env
```

Rellena `.env` con:
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`: en tu
  proyecto de Supabase → **Project Settings → API**.
- `DATABASE_URL`: en **Project Settings → Database → Connection string**
  (usa el modo "Transaction pooler" para desarrollo).
- `TMDB_READ_ACCESS_TOKEN`: en tu cuenta de TMDb → **Settings → API →
  API Read Access Token (v4 auth)**.

### 4. Crear las tablas

```bash
npx prisma migrate dev --name init
```

Esto crea todas las tablas de `prisma/schema.prisma` (profiles, follows,
movies_cache, reviews, review_likes, custom_lists, list_items).

### 5. Activar el trigger de perfiles automáticos

Abre el **SQL Editor** de tu proyecto de Supabase y ejecuta el contenido
de `prisma/supabase_triggers.sql`. Esto hace que cada vez que alguien se
registre, se cree automáticamente su fila en `profiles` — y activa Row
Level Security básico.

### 6. Correr el proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Deberías poder
registrar una cuenta, confirmar el correo (revisa la bandeja de Supabase
Auth en modo desarrollo, o el correo real si configuraste SMTP) e iniciar
sesión.

### 7. (Nuevo) Activa el bucket de imágenes de perfil

Para que la edición de perfil (avatar/banner) funcione, corre en el
**SQL Editor** de Supabase el contenido de `prisma/supabase_storage.sql`.
Esto crea un bucket público llamado `profile-media` con las políticas
correctas (cada usuario solo puede escribir en su propia carpeta).

## 🚀 Cómo publicar Bobina (checklist de producción)

Esto es lo que falta para pasar de "corre en mi máquina" a "está en
internet". Los primeros pasos son cosas que ya dejé listas en el
código; los últimos son cuentas y decisiones que solo tú puedes tomar.

### Ya resuelto en el código

- ✅ Páginas legales (`/terms`, `/privacy`) — **son un borrador base,
  no un documento legal final**. Antes de publicar, complétalas con
  fecha real y tu correo de contacto, e idealmente que las revise un
  abogado (en Colombia aplica la Ley 1581 de 2012 de Protección de
  Datos; si esperas usuarios en la UE, también podría aplicar el
  RGPD/GDPR)
- ✅ Atribución obligatoria de TMDb en el footer de toda la app (es un
  requisito de sus términos de uso de API, no opcional)
- ✅ `robots.txt` y `sitemap.xml` generados por código (bloquean
  `/admin` y `/messages` de buscadores)
- ✅ Favicon y una imagen de vista previa para compartir en redes
  (Open Graph), ambos generados por código — no hacía falta subir
  archivos de imagen
- ✅ Estados de carga (`loading.tsx`) en las páginas de más tráfico

### Lo que tienes que hacer tú

**1. Sube el proyecto a GitHub** (todavía no existe el repositorio):

```bash
git init
git add .
git commit -m "Bobina — listo para publicar"
```

Crea un repositorio nuevo en [github.com](https://github.com/new) y
sigue las instrucciones para conectar tu carpeta local (`git remote
add origin ...` y `git push`).

**2. Despliega en Vercel** (recomendado — hecho por los creadores de
Next.js, nivel gratuito generoso):

1. Crea una cuenta en [vercel.com](https://vercel.com) (puedes entrar
   directo con tu cuenta de GitHub)
2. "Add New Project" → selecciona el repositorio de Bobina
3. En "Environment Variables", agrega **las mismas variables de tu
   `.env` local**: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`, `DIRECT_URL`,
   `TMDB_READ_ACCESS_TOKEN`, y agrega también
   `NEXT_PUBLIC_SITE_URL` con tu dominio real (ej.
   `https://bobina.vercel.app` o tu dominio propio) — la usan el
   sitemap, robots.txt y las imágenes de vista previa
4. Dale "Deploy" — Vercel detecta que es Next.js automáticamente, no
   hay que configurar nada más

**3. ⚠️ Muy importante — actualiza la configuración de Supabase Auth**:

Hasta ahora, Supabase le manda a la gente enlaces de confirmación de
correo apuntando a `localhost`. Si no cambias esto, **nadie va a poder
confirmar su cuenta en producción**. Ve a tu proyecto de Supabase →
**Authentication → URL Configuration**:

- **Site URL**: cámbiala a tu dominio real (ej. `https://bobina.vercel.app`)
- **Redirect URLs**: agrega tu dominio real ahí también

**4. (Opcional) Dominio propio**: en Vercel → tu proyecto → Settings →
Domains, puedes conectar un dominio que hayas comprado (Namecheap,
GoDaddy, etc.) siguiendo las instrucciones que te da Vercel ahí mismo.

**5. Activa anuncios reales** (opcional, ver la sección de "Sistema de
Anuncios" más abajo) — necesitas el sitio ya publicado con un dominio
real antes de poder solicitar una cuenta de Google AdSense.

### Después de publicar: prueba de humo

Antes de anunciarlo a nadie, prueba en el sitio real (no localhost):
registrar una cuenta nueva, confirmar el correo (¡este es el paso que
se rompe si no hiciste el punto 3!), iniciar sesión, escribir una
reseña, y mandar un mensaje.

### Cosas que quedan fuera de este checklist (por si las necesitas más adelante)

- Monitoreo de errores en producción (ej. Sentry) — no está integrado
- Sitemap dinámico (hoy solo incluye páginas estáticas, no cada
  perfil/película/comunidad individual)
- Backups automatizados de la base de datos — Supabase los ofrece en
  planes pagos, revisa su documentación
- Límites del plan gratuito de Supabase (tamaño de base de datos,
  usuarios de auth, almacenamiento) — si el proyecto crece, vale la
  pena revisar su [página de precios](https://supabase.com/pricing)

## Qué incluye este proyecto hasta ahora

- ✅ Schema completo de base de datos de la Fase 1, incluyendo
  `watchlist_items` y `favorite_movies`. El campo `rating` de `reviews`
  es opcional (permite "marcar como vista" sin calificar de inmediato)
- ✅ Registro e inicio de sesión con Supabase Auth
- ✅ Endpoints de catálogo: `GET /api/movies/search`, `GET /api/movies/[tmdbId]`
- ✅ Endpoints sociales: seguir/dejar de seguir, watchlist, favoritos
- ✅ Perfil de usuario público (`/[username]`) con header y 4 pestañas
- ✅ Búsqueda de películas (`/search`) con autocompletado
- ✅ Página de detalle de película (`/movies/[tmdbId]`): hero, sinopsis,
  reparto, tráiler, "Dónde ver" y métricas de la comunidad
- ✅ **`CreateReviewModal`**: selector de estrellas (0.5–5.0), fecha vista,
  checkboxes de spoilers/rewatch, texto libre
- ✅ **`ReviewFeedItem`**: feed de reseñas por película, con spoiler oculto
  tras clic y sistema de likes con animación
- ✅ `POST/DELETE /api/reviews/[id]/like` — toggle atómico de likes
- ✅ **Feed de actividad** en `/` para usuarios con sesión: reseñas
  recientes de la gente que sigues, con fallback a actividad global de
  toda la comunidad si aún no sigues a nadie (así resolvimos que la home
  se quedara en la pantalla de bienvenida estando logueado)
- ✅ **Listas personalizadas**: crear (`CreateListModal`), ver en
  `/lists/[id]`, y **reordenar con drag-and-drop** (`ListEditor`, usando
  `@dnd-kit`) + añadir/quitar películas con buscador inline. Listas
  privadas solo las ve su dueño.
- ✅ **Top de favoritos** (`FavoritesEditor`): elige hasta 5 películas con
  buscador inline y reordénalas con drag-and-drop, igual que las listas
- ✅ **Edición y eliminación de reseñas propias** (botones "Editar"/
  "Eliminar" visibles solo para el autor, en el feed y en la página de
  película)
- ✅ **Edición y eliminación de listas** desde `/lists/[id]` (visible solo
  para el dueño)
- ✅ **Paginación con "Cargar más"** en el feed de actividad y en las
  reseñas de cada película (`/api/feed`, `/api/movies/[tmdbId]/reviews`)
- ✅ Barra de navegación con Buscar, Mi perfil y cerrar sesión

## Fase 2: Comunidades y Foros (nuevo)

- ✅ Schema: `communities`, `community_members` (roles admin/moderador/
  miembro), `community_posts`
- ✅ `/communities`: explorar comunidades públicas + crear una nueva
- ✅ `/communities/[slug]`: header con descripción y conteo de miembros,
  botón de unirse/ya-eres-miembro, publicaciones (fijadas primero)
- ✅ Solo miembros pueden publicar; solo admin/moderador puede fijar
  publicaciones
- ✅ Comunidades privadas: el contenido solo es visible para miembros

### Simplificaciones de esta fase (actualizado)

- No hay edición/eliminación de publicaciones ni de comunidades
- El creador no puede abandonar su propia comunidad (evita comunidades
  sin admin)
- Los comentarios de publicaciones de foro son de un solo nivel (sin
  hilos de respuesta anidados)

## Fase 2.1: Invitaciones, roles de moderador y notificaciones (nuevo)

- ✅ Schema: `community_invites` (con estado pendiente/aceptada/
  rechazada) y `notifications` (like, follow, invitación a comunidad)
- ✅ **Invitar a una comunidad**: cualquier miembro puede invitar a otra
  persona buscándola por username (`InviteModal`) — genera una
  notificación con botones de Aceptar/Rechazar
- ✅ **Roles de moderador**: el admin (siempre el creador) puede
  promover a cualquier miembro a moderador o quitarle el rol, desde la
  sección "Miembros" de la comunidad
- ✅ **Bandeja de notificaciones** (`/notifications`, ícono 🔔 con
  contador en la barra de navegación): likes a tus reseñas, nuevos
  seguidores, invitaciones a comunidades. Se marcan como leídas al abrir
  la bandeja.

### Simplificaciones de esta fase

- El contador de notificaciones se calcula en cada carga de página (no
  hay actualización en tiempo real / polling todavía — para eso hace
  falta el sistema de Realtime, que llega con la fase de Chat)
- No hay notificaciones de comentarios ni menciones (`@usuario`) porque
  esas funcionalidades no existen todavía en la app
- Solo el admin puede promover/degradar moderadores; no hay forma de
  transferir el rol de admin a otra persona

## Fase 4: Chat directo en tiempo real (nuevo)

- ✅ Schema: `conversations`, `conversation_participants` (con estado
  aceptada/pendiente/rechazada), `direct_messages`, `chat_blocklist`
- ✅ **Flujo de permisos del SRS**: si dos personas se siguen mutuamente,
  la conversación nace aceptada para ambas; si no, nace pendiente para
  quien la recibe (puede previsualizar los mensajes sin que se marquen
  como leídos, hasta que decide)
- ✅ Acciones sobre una solicitud: **Aceptar**, **Rechazar** (la oculta),
  **Bloquear** (inserta en `chat_blocklist` y cierra el acceso a la sala
  para ambos)
- ✅ Botón **"Mensaje"** en cualquier perfil ajeno para iniciar/abrir la
  conversación
- ✅ `/messages`: bandeja con solicitudes pendientes arriba y
  conversaciones aceptadas abajo, con indicador de no leído
- ✅ `/messages/[id]`: la conversación en sí, **con mensajes en tiempo
  real** (sin recargar la página) usando **Supabase Realtime** —
  `postgres_changes` sobre `direct_messages` — en vez de un servidor de
  WebSockets propio (ver la nota de arquitectura más abajo)
- ✅ Indicador de **"Escribiendo..."** usando canales de *Broadcast* de
  Supabase Realtime (efímero, no toca la base de datos)
- ✅ Paginación de historial ("Cargar mensajes anteriores")

### Nota de arquitectura: por qué Supabase Realtime y no Socket.io

El SRS original pedía un motor de WebSockets propio (`join_room`,
`typing_start/stop`, etc. sobre Node.js/Express). Como ya decidimos usar
Supabase para auth y storage, tiene sentido también usar su sistema de
Realtime para esto: es Postgres Changes sobre la tabla `direct_messages`
(el navegador se suscribe directo, sin servidor intermedio que
mantener) más un canal de *Broadcast* para el indicador de escritura.
Esto ahorra la complejidad de correr y escalar un servidor de sockets
aparte, a cambio de depender de la infraestructura de Supabase.

### Simplificaciones de esta fase

- No hay indicador de "en línea" (usuario conectado ahora mismo) — el
  SRS lo pedía en el layout del chat, quedó fuera de esta versión
- No hay envío de imágenes/archivos en el chat (el campo `media_url`
  existe en el schema pero no hay UI de subida todavía)
- No hay previsualización de tarjetas de películas/reseñas compartidas
  dentro del chat (el SRS lo mencionaba como mejora de UX)
- El indicador de "escribiendo" no persiste si cierras y reabres la
  conversación muy rápido (es intencionalmente efímero)

## Fase 2.2: Comentarios en foros, aprobación de comunidades privadas, chat mejorado (nuevo)

- ✅ **Comentarios en publicaciones de foro**: cada post tiene un
  contador de comentarios y un hilo expandible de un solo nivel
  (`community_post_comments`) — visible al hacer clic en "💬 N
  comentarios"
- ✅ **Flujo de aprobación para comunidades privadas**: unirse a una
  comunidad pública sigue siendo inmediato, pero unirse a una **privada**
  ahora crea una solicitud pendiente. El admin/moderador la ve en una
  sección "Solicitudes de ingreso" con botones Aprobar/Rechazar.
  (Las invitaciones directas siguen dando acceso inmediato — tiene
  sentido, ya alguien de adentro te invitó.)
- ✅ **Indicador "en línea"** en el chat (punto verde junto al nombre),
  usando *Presence* de Supabase Realtime — se actualiza al instante
  cuando la otra persona entra o sale de la conversación
- ✅ **Compartir películas en el chat**: botón 🎬 junto al mensaje que
  abre un buscador; al elegir una película, se envía como tarjeta con
  póster dentro de la conversación

### Simplificaciones de esta fase

- El indicador "en línea" es específico de cada conversación (ves si la
  otra persona tiene *esa* conversación abierta, no un estado global de
  "conectado a Bobina")
- Compartir sigue siendo solo de películas — no hay tarjetas de reseñas
  compartidas todavía, aunque el patrón es extensible
- Denegar una solicitud de ingreso a comunidad privada no notifica a la
  persona (simplemente desaparece la solicitud)

## Personalización: 3 temas de color (nuevo)

- ✅ **Bobina** (default): borgoña de sala de cine + dorado de
  marquesina, cálido — el diseño original del proyecto
- ✅ **Noir**: grises azulados fríos + acento de acero, alto contraste,
  inspirado en el cine negro de detectives
- ✅ **Technicolor**: verde esmeralda profundo + coral vibrante,
  combinación complementaria típica de carteles vintage de Hollywood
- ✅ Selector rápido (círculo de color) en la barra de navegación —
  cambia al instante, sin recargar
- ✅ También seleccionable desde `/settings/profile`, con vista previa
  en vivo antes de guardar
- ✅ El tema elegido se guarda en tu perfil y se aplica ya resuelto en
  el servidor la próxima vez que entres (sin parpadeo del tema por
  defecto antes de cargar el tuyo)

### Cómo funciona técnicamente

Los colores del sistema de diseño (`reel`, `marquee`, `frame` en
`tailwind.config.ts`) están enlazados a variables CSS en vez de valores
fijos. Cada tema simplemente redefine esas variables bajo un selector
`[data-theme="..."]` en `globals.css` — ningún componente necesitó
cambiar. Esto también deja la puerta abierta para agregar más temas en
el futuro sin tocar el resto del código.

### Simplificaciones de esta fase

- Los 3 temas son variaciones de la misma base oscura — no hay todavía
  un modo claro real (el campo `theme_preference` para eso sigue sin
  implementarse visualmente, como ya se notaba más abajo)
- No hay opción de crear un tema personalizado (colores propios) — son
  3 paletas fijas y curadas

## Búsqueda global de personas (nuevo)

- ✅ `/search` ahora tiene **pestañas**: "Películas" (como antes) y
  "Personas" (nuevo) — consolidado en un solo lugar en vez de agregar
  otra entrada al menú
- ✅ Cada resultado de persona muestra avatar, nombre, `@usuario`,
  conteo de seguidores y bio (si tiene), con botón de Seguir/Siguiendo
  directamente desde ahí
- ✅ El endpoint `/api/users/search` (que ya existía para invitar a
  comunidades) ahora también devuelve bio, conteo de seguidores y si tú
  ya sigues a esa persona

## Corrección: cuentas no verificadas no deben existir (nuevo)

El trigger que crea el perfil se disparaba al **registrarse**, no al
**confirmar el correo** — así que alguien podía aparecer en búsquedas,
listas de miembros, etc. sin haber verificado nunca su email. Se
corrigió para que el perfil solo se cree cuando `email_confirmed_at`
pasa de `null` a tener fecha (o sea, justo al confirmar).

- ✅ `prisma/supabase_triggers.sql` actualizado con el trigger correcto
  (para instalaciones nuevas del proyecto)
- ✅ `prisma/supabase_fix_unverified_accounts.sql` (nuevo): limpia los
  perfiles fantasma que ya existían por el bug + aplica el mismo fix,
  para proyectos que ya tenían el trigger viejo corriendo

## Página de Explorar (nuevo)

- ✅ `/explore`, enlazada en la barra de navegación (visible sin sesión
  también)
- ✅ **"Tendencia esta semana"**: trending global de TMDb, en vivo (no
  se cachea en nuestra base de datos, similar a la búsqueda)
- ✅ **"Populares en Bobina"**: ranking basado en reseñas reales de la
  comunidad (`prisma.review.groupBy`, ordenado por cantidad de
  reseñas), con la calificación promedio real de Bobina en el badge
- ✅ Ambas secciones respetan tu watchlist y permiten las acciones
  rápidas de `MovieCard` (añadir a watchlist / marcar como vista) si
  tienes sesión

### Simplificaciones de esta fase

- "Populares en Bobina" no filtra por fecha (todo el histórico) — con
  poco volumen de reseñas, limitarlo a "esta semana" dejaría la sección
  casi siempre vacía. Cuando el proyecto tenga más actividad, vale la
  pena agregar ese filtro.
- No hay categorías/géneros para filtrar Explorar todavía

## Soporte para series de TV (nuevo)

- ✅ Schema: `movies_cache` ahora tiene un campo `mediaType`
  (`MOVIE`/`TV`)
- ✅ **Truco de arquitectura**: en vez de agregar una columna
  `mediaType` a *cada* tabla que ya usa `tmdbId` (reviews, watchlist,
  listas, favoritos, chat), el id que se guarda ahí está **codificado
  por signo**: positivo = película (como siempre), negativo = serie.
  Los ids de TMDb siempre son positivos, así que no hay ambigüedad. Esto
  significa que **reseñas, watchlist, listas, favoritos y compartir en
  el chat ya soportan series automáticamente**, sin haber tocado esos
  archivos — solo escriben y leen un entero.
- ✅ `/search` tiene una pestaña nueva **"Series"**
- ✅ `/explore` tiene una sección nueva **"Series en tendencia"**
- ✅ La página de detalle (`/movies/[tmdbId]`) detecta el tipo y
  muestra la etiqueta correspondiente ("Película"/"Serie"), usa
  "creadores" en vez de "director" para series, y muestra el número de
  temporadas cuando aplica

### Simplificaciones de esta fase

- Los buscadores rápidos dentro de Listas, Top Favoritos y "compartir
  en el chat" siguen buscando **solo películas** por ahora (el texto de
  esos campos dice explícitamente "busca una película...") — technically
  ya soportarían series si se les pasa un id negativo, pero la UI de
  búsqueda ahí no se extendió todavía. Es la extensión natural para una
  próxima ronda.
- El endpoint TMDb de "dónde ver" para series a veces tiene menos
  cobertura regional que para películas (limitación de TMDb, no
  nuestra)

## Sistema de Moderación y Censura (nuevo)

- ✅ Schema: `reports`, `moderation_logs`, `SiteRole` en `profiles`
  (USER/MODERATOR/ADMIN, distinto de los roles por comunidad), y
  `hidden_by_system` en `reviews` y `community_posts`
- ✅ **Filtro de texto** (`lib/moderation.ts`): normaliza leetspeak
  (`p4l4br4` → `palabra`) y evasión con espacios/guiones intercalados,
  reemplaza coincidencias por `***`. Se aplica automáticamente al crear
  o editar reseñas, publicaciones de comunidad y comentarios de foro.
- ✅ **Detección automática de spoilers** por palabras clave: si el
  texto de una reseña coincide y el autor no marcó "Contiene spoilers",
  el backend fuerza el flag
- ✅ **Botón "Reportar"** en reseñas (no propias) y publicaciones de
  foro (no propias), con selector de motivo (spam, discurso de odio,
  spoiler sin marcar, contenido explícito, acoso)
- ✅ **Cuarentena automática**: si un contenido acumula 5+ reportes de
  personas con `trust_score > 50`, se oculta automáticamente
  (`hidden_by_system = true`) de todos los listados públicos
- ✅ **Panel de moderación** (`/admin/moderation`, ícono 🛡️ en la barra
  para moderadores/admins): cola de contenido reportado, agrupada y
  priorizada por cantidad de reportes, con:
  - Vista previa del contenido y motivos de reporte
  - Historial de sanciones previas del autor
  - Acciones: **Aprobar** (descarta reportes), **Ocultar contenido**,
    **Aplicar strike** (registra advertencia + resta 20 puntos de
    `trust_score`)

### ⚠️ Cómo convertirte en moderador/admin (no hay UI para esto)

No existe un flujo de "invitar admin" — es una decisión de
infraestructura, no de producto. Para asignarte el primer rol de
moderador o admin del sitio, corre esto en el **SQL Editor de
Supabase** (reemplaza el username):

```sql
update public.profiles
set site_role = 'ADMIN'
where username = 'tu_usuario';
```

### Deliberadamente fuera de alcance

- **Moderación de imágenes con IA** (Cloudinary Content Moderation /
  AWS Rekognition, como pedía el SRS original): requiere contratar un
  servicio externo de pago con sus propias claves de API — no es algo
  que se pueda dejar "ya funcionando" sin que crees esa cuenta tú
  mismo. Si quieres esto más adelante, se puede integrar en la ruta de
  subida de avatar/banner (`ProfileEditForm`).
- **Lista real de palabras prohibidas**: `lib/moderation.ts` trae solo
  dos palabras de ejemplo (`ejemploprohibido`, `otrapalabraprohibida`)
  para probar el mecanismo. A propósito no se generó aquí una lista
  extensa de groserías/insultos — reemplázala por la tuya según tus
  políticas de comunidad.

### Simplificaciones de esta fase

- Los reportes solo cubren reseñas, publicaciones de foro y usuarios —
  no hay reportes de comentarios de foro ni de mensajes de chat todavía
- No hay forma de asignar moderadores desde la UI (solo vía SQL)
- El autor de contenido oculto no ve ningún aviso de que fue ocultado —
  simplemente desaparece de los listados hasta que un moderador lo
  revise
- "Aplicar strike" siempre registra tipo `WARNING` y resta 20 puntos de
  confianza — no hay selector de severidad (mute/ban) desde la UI
  todavía, aunque el enum `ModerationAction` ya los contempla

## Rediseño visual "Metropolis" (nuevo)

- ✅ **Paleta**: el tema "Bobina" (default) ahora usa Deep Text `#1A1A1A`,
  Platinum Grey `#E5E4E2`, Burgundy `#800020` y Antique White (corregido
  a `#FAEBD7` — el hex `#FAEB07` de la spec original era amarillo puro
  por error de transcripción, no un tono crema)
- ✅ **Tipografía**: Montserrat para cuerpo de texto (como pedías).
  Para títulos se sustituyó "St Bernard" por **Abril Fatface** — esa
  fuente no está en Google Fonts y no hay forma de descargar archivos
  de fuentes externas en este entorno; Abril Fatface tiene el mismo
  espíritu de cartel retro/art-decó
- ✅ **Botones**: `.btn-primary` (acento borgoña, para llamados a la
  acción), `.btn-ghost` (gris platino, para acciones secundarias), y
  `.btn-dark` nuevo (negro profundo, disponible para casos que lo
  necesiten aunque no se usa en todos lados todavía)
- ✅ **Campos de texto** ahora son tipo *pill* (redondeados por completo)
- ✅ **Logo**: "BOBINA" con marco oscuro en la barra de navegación,
  como en el mockup
- ✅ **Iconografía lineal real** (librería `lucide-react`, nueva
  dependencia): reemplazó los emojis 🔔/🛡️/♡ por íconos de contorno
  (campana, escudo, corazón, bandera de reportar, lupa)
- ✅ La mecánica de **cambio de tema se mantiene intacta** — Noir y
  Technicolor no se tocaron, siguen siendo paletas alternas completas

### Actualización: se implementó el volteo completo a fondo claro

La primera versión de este rediseño mantuvo el fondo oscuro por el
riesgo que te expliqué arriba. Se pidió explícitamente el volteo
completo, así que se hizo — correctamente, no a medias:

- Se separaron los tokens de color en dos familias independientes:
  `reel-*`/`frame-*` (para **tarjetas** — Review, Modals, Comunidades,
  NavBar, chat — que siguen oscuras en los 3 temas) y `page`/`ink`/
  `ink-muted` (para el **fondo general de la página** — claro en Bobina,
  oscuro en Noir/Technicolor, cada uno con su propio texto legible)
- Se recorrió **sistemáticamente cada página** de la app (feed, perfil,
  explorar, buscar, comunidades, listas, detalle de película/serie,
  mensajes, notificaciones, configuración, moderación) diferenciando
  qué texto vive directo sobre el fondo de página (ahora oscuro-sobre-
  claro) de qué texto vive dentro de una tarjeta (sigue claro-sobre-
  oscuro, sin cambios)
- Un par de componentes (lista de miembros de comunidad, filas de la
  bandeja de mensajes) dependían de un fondo oscuro que solo aparecía
  al pasar el mouse — se rediseñaron para verse bien sobre el fondo
  claro en su estado normal
- El formulario de "Editar perfil" no vivía dentro de ninguna tarjeta,
  así que se envolvió en una para no tener que tocar las clases de
  cada campo individualmente
- La pantalla de una conversación de chat se dejó como una superficie
  oscura inmersiva completa (como una app de mensajería aparte), en
  vez de intentar que cada burbuja de mensaje se adaptara al fondo
  claro
- La barra de navegación tiene ahora su propio fondo oscuro explícito
  (antes heredaba el del body, que era oscuro por coincidencia)

### No implementado en esta ronda

- Ilustraciones del micrófono vintage y la claqueta de cine (son piezas
  de arte, no algo que tenga sentido codificar a mano como SVG
  improvisado — si las quieres, puedo generarlas con la herramienta de
  visualización en una conversación aparte)
- Las fuentes reales "St Bernard"/"Metropolis" — si consigues los
  archivos de fuente (.woff2/.ttf) con licencia para usarlos, puedo
  integrarlos vía `next/font/local` en vez de Google Fonts

## Sistema de Anuncios (nuevo — último módulo del roadmap original)

- ✅ `AdSlot`: componente base con **detección de adblocker** (técnica
  del elemento "cebo" — los bloqueadores ocultan por CSS cualquier
  elemento con clases tipo `adsbygoogle`/`ad-banner`, sin necesitar
  bloquear una petición de red), **dimensiones fijas** (evita el
  Cumulative Layout Shift) y **carga diferida** del script del
  proveedor (`strategy="lazyOnload"` de Next.js, para no afectar Core
  Web Vitals)
- ✅ **`AdSlotHeader`**: banner horizontal 728×90 debajo de la barra de
  navegación, solo en escritorio
- ✅ **`AdSlotSidebar`**: rectángulo 300×250, en la columna lateral de
  la ficha de película/serie (junto a "Dónde ver")
- ✅ **`AdSlotFeed`**: anuncio nativo inyectado cada 10 elementos del
  feed principal

### Cómo activar anuncios reales

Por defecto, **todos los espacios muestran un placeholder** ("Publicidad"
+ las dimensiones) — así queda honesto y visualmente correcto mientras
no tengas una cuenta de anuncios conectada. Para activar anuncios reales
de Google AdSense:

1. Crea y haz aprobar una cuenta en [Google AdSense](https://www.google.com/adsense/) para tu dominio (esto lo tienes que hacer tú — no es algo que se pueda dejar "ya funcionando" sin un sitio en producción con tráfico real)
2. Copia tu ID de cliente (`ca-pub-XXXXXXXXXXXXXXXX`)
3. Ponlo en tu `.env` como `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
4. Los tres espacios empiezan a cargar el script real automáticamente,
   sin tocar código

### Simplificaciones de esta fase

- No hay panel de administración para configurar qué anuncios se
  muestran dónde, ni métricas de impresiones/clics — es integración
  técnica pura, tal como lo pedía el SRS
- El `slotId` de cada espacio es un identificador de ejemplo
  (`header-leaderboard`, `sidebar-rectangle`, `feed-native`) — en
  AdSense real tendrías que crear tus propios "ad units" y usar sus IDs
  reales ahí
- La detección de adblocker es la técnica estándar (elemento cebo), no
  es infalible contra todos los bloqueadores, pero cubre la gran
  mayoría

## Mejoras de responsividad móvil (nuevo)

- ✅ **Barra de navegación rediseñada para celular**: con el tiempo se le
  fueron agregando enlaces (Explorar, Comunidades, Buscar, Mensajes,
  notificaciones, perfil, moderación, tema, cerrar sesión) hasta que ya
  no cabían en una fila en pantallas chicas. Ahora, por debajo de la
  resolución `md` (768px), esos enlaces se ocultan y aparece un botón
  de menú ☰ que despliega todo en una lista vertical.
- ✅ **Protección contra scroll horizontal accidental** (`overflow-x:
  hidden` en `html`/`body`) — una causa común de que una página "se
  vea mal" en el celular es algún elemento empujando el ancho más allá
  de la pantalla
- ✅ **Espacios de anuncio responsivos**: tenían un ancho fijo de 300px
  que podía desbordar en celulares muy angostos (320-375px de ancho);
  ahora usan un ancho máximo en vez de fijo

### Si en tu celular específico algo se sigue viendo mal

Como no puedo ver tu pantalla directamente, hice la revisión más
probable (la barra de navegación, que aparece en cada página, era el
sospechoso principal). Si después de este cambio alguna pantalla en
particular se sigue viendo rota, mándame una captura de tu celular
señalando qué parte y la arreglo puntualmente.

## Ronda de mejoras de perfil, temas, favoritos y chat (nuevo)

- ✅ **3 temas de color nuevos**: Rosa (magenta vibrante sobre oscuro),
  Blanco (fondo claro de verdad, con texto oscuro — el primer tema
  claro real del proyecto) y Monocromo (escala de grises pura, sin
  tinte de color, acento plata). Ahora hay 6 temas en total.
- ✅ **Arreglado**: en Top favoritos, el botón de quitar (×) solo
  aparecía al pasar el mouse — en celular, sin "hover", era invisible
  e intocable. Ahora es visible siempre (tenue) y se resalta al tocar.
- ✅ **Favoritos separados por tipo**: "Películas favoritas" y "Series
  favoritas" ahora son dos secciones independientes, cada una con su
  propio set de hasta 5, en vez de compartir un solo cupo de 5 mezclado
- ✅ **Compartir series en el chat**: el botón 🎬 del compositor de
  mensajes ahora tiene pestañas "Películas"/"Series" para elegir qué
  buscar y compartir
- ✅ **Reposicionar el banner del perfil**: control deslizante para
  elegir qué parte de la imagen se ve dentro del recuadro fijo del
  banner — la vista previa en "Editar perfil" usa el mismo tamaño real
  que se ve en el perfil público, así no hay sorpresas

### Correcciones tras las primeras pruebas

- ✅ **Tema Blanco corregido**: se veía demasiado plano (casi todo el
  mismo blanco). Ahora usa un rango más amplio de grises entre el fondo
  de página y las tarjetas, para que se note la profundidad.
- ✅ **Eliminar de favoritos/listas, arreglado de raíz**: el botón × que
  aparecía encima del póster seguía sin funcionar bien en algunos
  casos (probablemente por conflicto con el gesto de arrastrar para
  reordenar). Se reemplazó por un botón **"Eliminar" completo, debajo
  del póster**, fuera del área que se arrastra — sin ambigüedad
  posible entre "quiero mover esto" y "quiero borrar esto".
- ✅ Mismo arreglo aplicado también a los botones rápidos de watchlist/
  marcar-vista en las tarjetas de búsqueda y Explorar (`MovieCard`),
  que tenían el mismo problema de visibilidad solo-en-hover

### Corrección importante: "marcar como vista" ya no crea una reseña

Antes, el botón rápido "marcar como vista" en realidad creaba una fila
de `reviews` sin calificación ni texto — mezclaba dos conceptos
distintos y permitía marcar la misma película "vista" tantas veces
como se quisiera, generando duplicados. Se corrigió de raíz:

- ✅ Nueva tabla **`watched_items`**, completamente separada de
  `reviews` — una sola fila por usuario+película (no se puede duplicar)
- ✅ El botón "marcar como vista" ahora usa su propio endpoint
  (`/api/watched/[tmdbId]`) y **nunca crea una reseña**
- ✅ Es un interruptor de verdad: se puede **desmarcar** desde el mismo
  botón (en la ficha de película) o directamente desde la pestaña
  "Vistas" del perfil, con un botón "Desmarcar" debajo de cada póster
- ✅ Escribir una reseña de verdad (con el modal completo) sigue
  marcando la película como vista automáticamente — tiene sentido, si
  la reseñaste es porque la viste
- ✅ La pestaña "Vistas" del perfil y su contador ahora leen de
  `watched_items`, no de `reviews`

## Simplificaciones conocidas (a mejorar más adelante)

- Un usuario puede tener varias reseñas para la misma película sin
  restricción (esto es intencional para permitir *rewatches*, pero
  todavía no hay UI para diferenciarlas claramente en el perfil)
- No se puede cambiar el username todavía desde la edición de perfil
- El modo claro/oscuro (`theme_preference`) existe en el schema pero
  el modo claro visualmente no está implementado aún
- El campo `notes` por película dentro de una lista existe en el schema
  pero no tiene UI todavía
- La confirmación de eliminar (reseña o lista) usa el `confirm()` nativo
  del navegador — funcional pero no sigue el sistema de diseño; se puede
  reemplazar por un modal propio más adelante

## Si vienes de una versión anterior del proyecto

**Corrección de infraestructura (si no la has aplicado todavía)**: si te
salía el error `max clients reached in session mode`, revisa que tu
`.env` tenga **ambas** variables `DATABASE_URL` (Transaction pooler,
puerto 6543, con `?pgbouncer=true`) y `DIRECT_URL` (Session pooler,
puerto 5432) — ver `.env.example`.

**Cambios de schema en esta ronda** (sistema de moderación): corre

```bash
npx prisma migrate dev --name moderation_system
```

Después, corre el SQL de la sección de arriba ("Cómo convertirte en
moderador/admin") para asignarte el rol — sin eso, el panel en
`/admin/moderation` te va a redirigir al inicio.

**Para el rediseño de íconos (más reciente)**: no hay cambios de base
de datos, pero sí revisa que `lucide-react` esté instalado. Corre:

```bash
npm install
```

**Preparación para producción**: no hay cambios de base de datos ni
dependencias nuevas — son páginas, metadatos y archivos de
configuración. Cuando quieras publicar de verdad, sigue el checklist
de la sección **"🚀 Cómo publicar Bobina"** más arriba — esos pasos
(GitHub, Vercel, configurar Supabase Auth para producción) los tienes
que hacer tú, con tus propias cuentas.

**Para esta ronda** (temas nuevos, favoritos por tipo, banner
reposicionable): **sí hay cambios de schema**. Como el proyecto ya
está en Git conectado a Vercel, actualiza así:

```bash
npx prisma migrate dev --name themes_favorites_banner
git add .
git commit -m "Temas nuevos, favoritos por tipo, banner reposicionable, chat con series"
git push
```

El deploy en Vercel se dispara solo. No hace falta tocar nada en el
SQL Editor de Supabase esta vez — solo la migración de Prisma.

**Para separar "vista" de "reseña"** (esta ronda): **sí hay cambios de
schema** (tabla `watched_items` nueva). Corre:

```bash
npx prisma migrate dev --name watched_items_separate
git add .
git commit -m "Separar marcar como vista de las reseñas, quitar tema Blanco"
git push
```

## Qué sigue (próximos pasos sugeridos)

1. Notificaciones en tiempo real (vía Realtime, igual que el chat)
2. Notificación al denegar una solicitud de comunidad privada
3. Moderación de imágenes con IA (requiere servicio externo de pago)
4. Sitemap dinámico y monitoreo de errores (Sentry) para cuando el
   proyecto esté en producción con tráfico real

## Estructura del proyecto

```
app/
  (auth)/login/          Página de inicio de sesión
  (auth)/register/       Página de registro
  api/movies/search/     Proxy de búsqueda a TMDb
  api/movies/[tmdbId]/   Detalle de película con caché
  layout.tsx             Layout raíz (fuentes, tema)
  page.tsx               Landing
lib/
  supabase/client.ts     Cliente Supabase (browser)
  supabase/server.ts     Cliente Supabase (server components)
  prisma.ts              Cliente Prisma singleton
  tmdb.ts                Wrapper de TMDb con caché
prisma/
  schema.prisma          Modelo de datos completo Fase 1
  supabase_triggers.sql  Trigger de creación automática de perfil
middleware.ts            Refresco de sesión de Supabase
```
