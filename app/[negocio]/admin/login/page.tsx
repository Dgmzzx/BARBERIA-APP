"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabase/client";

export default function LoginAdmin({
  params,
}: {
  params: { negocio: string };
}) {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");

  async function iniciarSesion() {
    const supabase = crearClienteSupabase();
    const { error: errorAuth } = await supabase.auth.signInWithPassword({
      email: correo,
      password: clave,
    });

    if (errorAuth) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.push(`/${params.negocio}/admin/panel`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="font-display text-2xl mb-6">Panel de administración</h1>
        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="w-full bg-surface border border-line rounded-lg p-3"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          className="w-full bg-surface border border-line rounded-lg p-3"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          onClick={iniciarSesion}
          className="w-full bg-signal rounded-lg py-3 font-medium text-cream"
        >
          Entrar
        </button>
      </div>
    </main>
  );
}
