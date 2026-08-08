# Pura Vida Conecta — Frontend

Frontend en React 19 + Vite 8 + TypeScript 6 + Tailwind v4.

---

## Stack

```
React 19 + TypeScript 6 + Vite 8
  | react-router-dom (ruteo)
  | axios (HTTP con interceptor JWT)
  | react-i18next (internacionalización ES/EN)
  | Tailwind CSS v4 (estilos con tema personalizado)
  | lucide-react (iconos)
```

---

## Lo que ya está implementado (base)

### Infraestructura

- **Vite config** con proxy a `localhost:8000` para desarrollo, plugin de Tailwind
- **Tailwind** con tema personalizado (`pv-green`, `pv-blue`, `pv-yellow`, `pv-sand`, etc.)
- **Router** con 8 rutas públicas + protegidas, layout global con Navbar/Footer
- **i18n** completo: detección automática de idioma, switcher en Navbar, archivos `es.json`/`en.json`

### Autenticación

- **AuthContext** con `login()`, `register()`, `logout()`, `useAuth()` hook
- Token persistido en `sessionStorage` (se borra al cerrar pestaña)
- **Axios interceptor** que inyecta `Authorization: Bearer` a cada request y redirige a `/login` en 401
- **PrivateRoute** con flag `adminOnly` para proteger rutas por rol

### Capa de datos

- **Tipos compartidos** en `src/types/` — `usuario.ts`, `proveedor.ts`, `destino.ts`, `auth.ts`
- Axios instance configurada con `baseURL: /api/v1`

### Páginas

| Ruta | Estado | Descripción |
|---|---|---|
| `/` | Listo | Landing con hero, categorías, destacados, CTA |
| `/login` | Listo | Formulario de inicio de sesión |
| `/register` | Listo | Formulario de registro |
| `/explorar` | Listo | Listado con búsqueda y filtro por categoría |
| `/explorar/:id` | Listo | Detalle con horarios y contacto |
| `/proveedor/*` | Placeholder | Panel del proveedor (vacío) |
| `/admin/*` | Placeholder | Panel de administración (vacío) |
| `*` | Listo | 404 con i18n |

### Componentes UI reutilizables

- `Button` — variantes: primary, secondary, ghost, danger
- `Input` — con label y mensaje de error
- `Card` — container con hover effect opcional
- `Badge` — success, warning, error, info

---

## Conexión con el backend

### Proxy de Vite (desarrollo)

`vite.config.ts` tiene un proxy: `/api/*` → `http://localhost:8000/*`.  
El frontend corre en `:5173`, el backend en `:8000`. Sin CORS issues en desarrollo.

### Flujo de autenticación real

```
Login/Register → POST /api/v1/auth/login → { access_token }
                     ↓
               sessionStorage.setItem('access_token', token)
                     ↓
               GET /api/v1/usuarios/me → { nombre, correo, estado, rol_id, ... }
                     ↓
               AuthContext expone { user, token, isAdmin, isAuthenticated }
```

**El rol de administrador** se extrae decodificando el payload del JWT localmente (`atob` sobre el segmento central del token). No hay endpoint dedicado para consultar el rol del usuario — el JWT contiene `{"sub": UUID, "rol": "administrador"|"turista"}`.

### Lo que NO existe (todavía)

- **`/auth/refresh`** — no hay refresh token. Si el JWT expira, el interceptor redirige a `/login`.
- **OAuth Google** — no implementado. Todo es auth local con email + password.
- **httpOnly cookies** — el token viaja en el body de la respuesta y se persiste en `sessionStorage` (no en cookie). Es una decisión deliberada para este momento del proyecto.

## Decisiones técnicas (léanlas antes de codificar)

| Decisión | Por qué |
|---|---|
| **sessionStorage, no localStorage** | Mitiga robo de JWT por XSS. Se pierde al cerrar pestaña. Cuando el backend implemente httpOnly cookies, se migra. |
| **Sin `/auth/refresh`** | No existe en el backend. El interceptor solo redirige a `/login` en 401. Si alguien agrega refresh, actualizar el interceptor. |
| **Rol desde JWT, no desde BD** | `useAuth().isAdmin` se calcula decodificando el token, no consultando la tabla `rol`. Más rápido y no requiere fetch extra. |
| **i18n con detección automática** | Usa `localStorage` + `navigator.language`. El botón ES/EN en Navbar cambia el idioma al vuelo. |
| **Tema Tailwind** | Variables en `index.css` con `@theme`. No tocar clases nativas de Tailwind, usar `pv-*` para colores del branding. |
| **Proxy Vite** | `vite.config.ts` proxy `/api` -> `localhost:8000`. En producción se cambia por variable de entorno o se sirve desde el mismo dominio. |

---

## Lo que falta (por persona)

### Clarence — Landing + CMS + validación
- CMS básico admin: tabla `configuracion` clave/valor en Postgres
- Endpoint para editar textos de la landing desde el panel admin
- Validar flujos completos contra backend via Swagger

### Luis — Autenticación completa listo
- Registro de proveedor en 2 pasos (`/register/provider`)
- Redirección por rol después del login
- Manejo de errores más fino (400 vs 401 vs 403)

### Wagner — Exploración pública
- Filtros combinados (categoría + búsqueda + ubicación)
- Galería de imágenes en detalle
- Mapa con coordenadas del proveedor

### Andres — Panel del proveedor
- Mi Perfil: formulario editable conectado a `PUT /proveedores/{id}`
- Imágenes: drag & drop, visualización tipo grid
- Horarios: tabla semanal editable + excepciones con alerta
- Estado de verificación: los 3 estados visuales
- Contacto: editar teléfono, web, Instagram, WhatsApp

### Andrey — Panel de administración
- Tabla de proveedores con aprobar/rechazar + motivo
- Tabla de usuarios con suspender/reactivar + confirmación
- CRUD de destinos con mapa interactivo
- Tabla de logs de auditoría (solo lectura, con filtros por fecha/entidad)

---

## Convenciones

| Concepto | Regla |
|---|---|
| Archivos | PascalCase para componentes, camelCase para hooks/utils |
| Importaciones | Absolutas no, relativas siempre desde `src/` |
| i18n | Toda string visible al usuario va en `locales/es.json`, se referencia con `t('clave')` |
| Estado global | AuthContext para sesión. El resto, estado local o parámetros de ruta. |
| Axios | Usar la instancia de `api/axios.ts`, no `fetch()` ni otra instancia |
| Rutas | Agregar a `App.tsx` en orden: públicas, protegidas, admin, 404 |

---

## Cómo correr

```bash
cd Frontend
npm install
npm run dev
# → http://localhost:5173
```

El proxy de Vite redirige `/api/*` a `http://localhost:8000`. Asegurate que el backend esté corriendo.

```bash
# Backend aparte
cd Backend
docker compose up -d
```
