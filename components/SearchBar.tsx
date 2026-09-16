"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [valor, setValor] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  function actualizar(texto: string) {
    setValor(texto);
    const params = new URLSearchParams(searchParams.toString());
    if (texto) {
      params.set("q", texto);
    } else {
      params.delete("q");
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <input
      type="text"
      value={valor}
      onChange={(e) => actualizar(e.target.value)}
      placeholder="Buscar por nombre, material u observaciones..."
      className="w-full rounded-lg border border-line bg-paperLight px-4 py-2.5 text-sm text-ink outline-none focus:border-clay"
    />
  );
}
