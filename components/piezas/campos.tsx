import { Opcion, labelConEjemplo } from "@/lib/organologico-opciones";

export const inputClass =
  "w-full rounded-lg border border-line bg-paperLight px-3 py-2 text-sm text-ink outline-none focus:border-clay";
export const botonSecundarioClass =
  "shrink-0 rounded-lg border border-line px-3 py-2 text-xs text-inkSoft hover:bg-paper";
export const botonQuitarClass = "shrink-0 text-xs text-danger underline";

/** Par label + input, con soporte para ocupar las 2 columnas del grid. */
export function Campo({
  label,
  full = false,
  children,
}: {
  label?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      {label && <label className="mb-1 block text-xs font-medium text-inkSoft">{label}</label>}
      {children}
    </div>
  );
}

/** <select> nativo a partir de un diccionario de Opcion (con "Ej:" si aplica). */
export function Select({
  name,
  opciones,
  defaultValue,
  value,
  onChange,
  placeholder,
}: {
  name: string;
  opciones: Opcion[];
  defaultValue?: string | null;
  value?: string;
  onChange?: (valor: string) => void;
  placeholder?: string;
}) {
  const props = onChange
    ? { value: value ?? "", onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value) }
    : { defaultValue: defaultValue ?? "" };
  return (
    <select name={name} className={inputClass} {...props}>
      <option value="">{placeholder ?? "(sin especificar)"}</option>
      {opciones.map((o) => (
        <option key={o.value} value={o.value}>
          {labelConEjemplo(o)}
        </option>
      ))}
    </select>
  );
}
