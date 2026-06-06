import { useState, useEffect } from "react";
import { getCuentas } from "../../services/cuentasService";
import { createTraspaso } from "../../services/traspasosService";
import { Button } from "../ui/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";

export default function TraspasoForm({ cuentaOrigenId, onCreated, onClose }) {
  const [cuentas, setCuentas] = useState([]);
  const [form, setForm] = useState({
    cuentaOrigenId: cuentaOrigenId || "",
    cuentaDestinoId: "",
    importe: "",
    fecha: new Date(),
    notas: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCuentas().then(setCuentas).catch(() => {});
  }, []);

  const destinos = cuentas.filter((c) => String(c.id) !== String(form.cuentaOrigenId));
  const origen   = cuentas.find((c) => String(c.id) === String(form.cuentaOrigenId));
  const destino  = cuentas.find((c) => String(c.id) === String(form.cuentaDestinoId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.cuentaOrigenId || !form.cuentaDestinoId || !form.importe || !form.fecha) {
      setError("Completa todos los campos obligatorios");
      return;
    }
    if (Number(form.importe) <= 0) {
      setError("El importe debe ser mayor que cero");
      return;
    }
    setLoading(true);
    try {
      await createTraspaso({
        cuentaOrigenId:  Number(form.cuentaOrigenId),
        cuentaDestinoId: Number(form.cuentaDestinoId),
        importe: Number(form.importe),
        fecha: form.fecha instanceof Date ? form.fecha.toISOString() : form.fecha,
        notas: form.notas || null,
      });
      toast.success("Traspaso realizado");
      onCreated?.();
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.error || "Error al realizar el traspaso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-1">Nuevo traspaso</h2>

        {origen && destino && form.importe > 0 && (
          <p className="text-sm text-indigo-600 mb-4">
            Mover <strong>{Number(form.importe).toFixed(2)} {origen.moneda}</strong> de{" "}
            <strong>{origen.nombre}</strong> → <strong>{destino.nombre}</strong>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Cuenta origen</label>
            <select
              className="w-full border rounded-lg p-2"
              value={form.cuentaOrigenId}
              onChange={(e) => setForm({ ...form, cuentaOrigenId: e.target.value, cuentaDestinoId: "" })}
              required
            >
              <option value="">Selecciona cuenta origen</option>
              {cuentas.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre} — {c.balance?.toFixed(2)} {c.moneda}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Cuenta destino</label>
            <select
              className="w-full border rounded-lg p-2"
              value={form.cuentaDestinoId}
              onChange={(e) => setForm({ ...form, cuentaDestinoId: e.target.value })}
              required
              disabled={!form.cuentaOrigenId}
            >
              <option value="">Selecciona cuenta destino</option>
              {destinos.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre} — {c.balance?.toFixed(2)} {c.moneda}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Importe</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              className="w-full border rounded-lg p-2"
              placeholder="0.00"
              value={form.importe}
              onChange={(e) => setForm({ ...form, importe: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Fecha</label>
            <DatePicker
              selected={form.fecha}
              onChange={(date) => setForm({ ...form, fecha: date })}
              className="w-full border rounded-lg p-2"
              dateFormat="dd/MM/yyyy"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Notas (opcional)</label>
            <input
              className="w-full border rounded-lg p-2"
              placeholder="Ej. Fondos de emergencia"
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" className="bg-gray-200 text-gray-700" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Confirmar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
