/**
 * Select de categorías con optgroup por padre, icono y sangría ↳ en subcategorías.
 * Usar en cualquier lugar donde se elija categoría para mantener el formato consistente.
 *
 * Props:
 *   categorias   – array con estructura [{ id, nombre, icono, color, subcategorias[] }]
 *   value        – valor seleccionado actualmente
 *   onChange     – handler (e) => ...
 *   valueKey     – "id" | "nombre"  (qué campo usar como value de cada option, default "id")
 *   placeholder  – texto de la opción vacía (si se pasa, se muestra como primera opción)
 *   allLabel     – si se pasa, muestra una opción "todas" con ese texto antes de los grupos
 *   allValue     – valor de la opción "todas" (default "")
 *   className    – clases CSS extra para el <select>
 *   required     – boolean
 */
export default function CategoriasSelect({
  categorias = [],
  value,
  onChange,
  valueKey = "id",
  placeholder,
  allLabel,
  allValue = "",
  className = "",
  required = false,
}) {
  return (
    <select
      className={className}
      value={value}
      onChange={onChange}
      required={required}
    >
      {allLabel  && <option value={allValue}>{allLabel}</option>}
      {placeholder && <option value="">{placeholder}</option>}
      {categorias.map(cat => (
        <optgroup key={cat.id} label={`${cat.icono} ${cat.nombre}`}>
          <option value={cat[valueKey]}>{cat.nombre}</option>
          {(cat.subcategorias || []).map(sub => (
            <option key={sub.id} value={sub[valueKey]}>↳ {sub.nombre}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
