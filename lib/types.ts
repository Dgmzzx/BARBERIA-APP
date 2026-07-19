export type Negocio = {
  id: string;
  nombre: string;
  slug: string;
  telefono: string | null;
  direccion: string | null;
  hora_apertura: string;
  hora_cierre: string;
  hora_apertura_2?: string | null;
  hora_cierre_2?: string | null;
  dias_laborales: number[];
  activo: boolean;
};

export type Servicio = {
  id: string;
  negocio_id: string;
  nombre: string;
  duracion_minutos: number;
  precio: number;
  activo: boolean;
};

export type Horario = {
  id: string;
  negocio_id: string;
  dia_semana: number;
  apertura: string;
  cierre: string;
  orden: number;
};

export type Cita = {
  id: string;
  negocio_id: string;
  servicio_id: string;
  nombre_cliente: string;
  telefono_cliente: string;
  correo_cliente: string | null;
  fecha: string;
  hora: string;
  estado: "pendiente" | "completada" | "cancelada";
};
