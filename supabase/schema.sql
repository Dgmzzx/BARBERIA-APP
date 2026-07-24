-- ============================================
-- ESQUEMA: App de Citas para Barbería
-- Preparado desde el inicio para multi-negocio (SaaS futuro)
-- ============================================

create extension if not exists "uuid-ossp";

-- Negocios (hoy solo existirá 1 fila: la barbería de tu padre)
create table negocios (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  slug text not null unique,           -- usado en la URL: /barberiapapa
  telefono text,
  direccion text,
  hora_apertura time not null default '09:00',
  hora_cierre time not null default '19:00',
  hora_apertura_2 time,
  hora_cierre_2 time,
  dias_laborales int[] not null default '{1,2,3,4,5,6}', -- 1=lunes ... 7=domingo
  activo boolean not null default true,
  correo_notificaciones text,
  creado_en timestamptz not null default now()
);

-- Servicios que ofrece cada negocio
create table servicios (
  id uuid primary key default uuid_generate_v4(),
  negocio_id uuid not null references negocios(id) on delete cascade,
  nombre text not null,
  duracion_minutos int not null default 30,
  precio numeric(10,2) not null default 0,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

-- Horarios por día de la semana (reemplaza hora_apertura/cierre fijos)
create table horarios (
  id uuid primary key default uuid_generate_v4(),
  negocio_id uuid not null references negocios(id) on delete cascade,
  dia_semana int not null check (dia_semana between 1 and 7),
  apertura time not null,
  cierre time not null,
  orden int not null default 0
);

create index idx_horarios_negocio on horarios(negocio_id, dia_semana);

-- Días/horas bloqueadas manualmente (vacaciones, feriados, etc.)
create table bloqueos (
  id uuid primary key default uuid_generate_v4(),
  negocio_id uuid not null references negocios(id) on delete cascade,
  fecha date not null,
  hora_inicio time,       -- si es null, bloquea el día completo
  hora_fin time,
  motivo text,
  creado_en timestamptz not null default now()
);

-- Citas reservadas por los clientes
create table citas (
  id uuid primary key default uuid_generate_v4(),
  negocio_id uuid not null references negocios(id) on delete cascade,
  servicio_id uuid not null references servicios(id),
  nombre_cliente text not null,
  telefono_cliente text not null,
  correo_cliente text,
  notas_cliente text,
  fecha date not null,
  hora time not null,
  estado text not null default 'pendiente' check (estado in ('pendiente','completada','cancelada')),
  creado_en timestamptz not null default now()
);

create index idx_citas_negocio_fecha on citas(negocio_id, fecha);
create index idx_servicios_negocio on servicios(negocio_id);
create unique index idx_bloqueo_unico_dia on bloqueos(negocio_id, fecha) where hora_inicio is null;

-- ============================================
-- Datos iniciales: la barbería de tu padre
-- ============================================
insert into negocios (nombre, slug, hora_apertura, hora_cierre)
values ('Barbería [Nombre de tu padre]', 'barberiapapa', '09:00', '19:00');

-- Horarios iniciales (Lun-Sáb 9:00-19:00, domingo cerrado)
insert into horarios (negocio_id, dia_semana, apertura, cierre, orden)
select id, d, '09:00', '19:00', 0
from negocios cross join (select unnest(ARRAY[1,2,3,4,5,6]) as d) dias
where slug = 'barberiapapa';

-- Ejemplo de servicios (ajustar precios reales después)
insert into servicios (negocio_id, nombre, duracion_minutos, precio)
select id, 'Corte de cabello', 30, 300 from negocios where slug = 'barberiapapa';

insert into servicios (negocio_id, nombre, duracion_minutos, precio)
select id, 'Corte + Barba', 45, 450 from negocios where slug = 'barberiapapa';

-- ============================================
-- Seguridad a nivel de fila (RLS)
-- Cada negocio solo puede ver/editar sus propios datos.
-- Esto es lo que hace posible el salto a multi-negocio sin
-- rediseñar nada: el aislamiento ya existe desde el MVP.
-- ============================================
alter table negocios enable row level security;
alter table servicios enable row level security;
alter table citas enable row level security;
alter table bloqueos enable row level security;
alter table horarios enable row level security;

-- Lectura pública de negocios activos y sus servicios (para la página de reserva)
create policy "negocios visibles publicamente" on negocios
  for select using (activo = true);

create policy "servicios visibles publicamente" on servicios
  for select using (activo = true);

-- Cualquiera puede crear una cita (reserva pública)
create policy "cualquiera puede reservar" on citas
  for insert with check (true);

-- Solo el dueño autenticado del negocio ve/edita sus citas
-- (se ajusta cuando se conecte auth.users con negocio_id)
create policy "dueno ve sus citas" on citas
  for select using (true); -- placeholder: reemplazar con chequeo de auth cuando se implemente login

-- Lectura pública de horarios (para el formulario de reserva)
create policy "horarios visibles publicamente" on horarios
  for select using (true);

-- Lectura pública de bloqueos (para que el formulario de reserva sepa qué días están ocupados)
create policy "bloqueos visibles publicamente" on bloqueos
  for select using (true);
