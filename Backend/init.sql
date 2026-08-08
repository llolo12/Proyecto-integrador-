-- ============================================================
-- Pura Vida Conecta — DDL Inicial
-- PostgreSQL 16 + UUIDs + ENUMs + Seed Data
-- Idempotente: todo con IF NOT EXISTS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE tipo_auth AS ENUM ('local', 'oauth');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE estado_usuario AS ENUM ('activo', 'suspendido', 'pendiente');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE estado_verificacion AS ENUM ('pendiente', 'aprobado', 'rechazado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE dia_semana AS ENUM ('lunes','martes','miercoles','jueves','viernes','sabado','domingo');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE tipo_contacto AS ENUM ('telefono','web','instagram','whatsapp');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- DOMINIO USUARIOS
-- ============================================================

CREATE TABLE IF NOT EXISTS rol (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  permisos JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(150) NOT NULL,
  correo VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  tipo_auth tipo_auth NOT NULL DEFAULT 'local',
  rol_id UUID NOT NULL REFERENCES rol(id),
  estado estado_usuario NOT NULL DEFAULT 'pendiente',
  idioma VARCHAR(5) NOT NULL DEFAULT 'es',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sesion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  ip VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- ============================================================
-- DOMINIO PROVEEDORES
-- ============================================================

CREATE TABLE IF NOT EXISTS categoria_proveedor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS proveedor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL UNIQUE REFERENCES usuario(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES categoria_proveedor(id),
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  declaratoria_ict BOOLEAN NOT NULL DEFAULT false,
  estado_verificacion estado_verificacion NOT NULL DEFAULT 'pendiente',
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS imagen_proveedor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id UUID NOT NULL REFERENCES proveedor(id) ON DELETE CASCADE,
  url_webp VARCHAR(500) NOT NULL,
  orden INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS contacto_proveedor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id UUID NOT NULL REFERENCES proveedor(id) ON DELETE CASCADE,
  tipo tipo_contacto NOT NULL,
  valor VARCHAR(300) NOT NULL
);

-- ============================================================
-- DOMINIO HORARIOS
-- ============================================================

CREATE TABLE IF NOT EXISTS horario_semanal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id UUID NOT NULL REFERENCES proveedor(id) ON DELETE CASCADE,
  dia_semana dia_semana NOT NULL,
  hora_apertura TIME NOT NULL,
  hora_cierre TIME NOT NULL,
  abierto BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS excepcion_horario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id UUID NOT NULL REFERENCES proveedor(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  motivo TEXT,
  hora_apertura TIME,
  hora_cierre TIME,
  cerrado BOOLEAN NOT NULL DEFAULT true,
  alerta BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOMINIO CONTENIDO
-- ============================================================

CREATE TABLE IF NOT EXISTS destino (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8)
);

CREATE TABLE IF NOT EXISTS proveedor_destino (
  proveedor_id UUID NOT NULL REFERENCES proveedor(id) ON DELETE CASCADE,
  destino_id UUID NOT NULL REFERENCES destino(id) ON DELETE CASCADE,
  PRIMARY KEY (proveedor_id, destino_id)
);

-- ============================================================
-- DOMINIO AUDITORÍA
-- ============================================================

CREATE TABLE IF NOT EXISTS log_accion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuario(id),
  accion VARCHAR(100) NOT NULL,
  entidad VARCHAR(100) NOT NULL,
  entidad_id UUID,
  ip VARCHAR(45),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MÓDULO SECUNDARIO (comentado — descomentar cuando se requiera)
-- ============================================================

-- CREATE TABLE IF NOT EXISTS resena (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   usuario_id UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
--   proveedor_id UUID NOT NULL REFERENCES proveedor(id) ON DELETE CASCADE,
--   calificacion INT NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
--   comentario TEXT,
--   fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO categoria_proveedor (nombre) VALUES
  ('hotel'),
  ('restaurante'),
  ('guia_turistica'),
  ('actividad')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO rol (nombre, permisos) VALUES
  ('turista', '{"resenas":["crear","leer"],"perfil":["editar","leer"],"favoritos":["crear","leer","eliminar"]}'),
  ('administrador', '{"usuarios":["crear","leer","editar","eliminar"],"proveedores":["crear","leer","editar","eliminar","verificar"],"roles":["crear","leer","editar","eliminar"],"auditoria":["leer"],"configuracion":["leer","editar"]}')
ON CONFLICT (nombre) DO NOTHING;
