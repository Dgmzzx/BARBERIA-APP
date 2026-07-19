import { redirect } from "next/navigation";

export default function PaginaAdmin({
  params,
}: {
  params: { negocio: string };
}) {
  redirect(`/${params.negocio}/admin/login`);
}
