import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';

function TransaccionForm() {
  const [transacciones, setTransacciones] = useState([]);
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [tipo, setTipo] = useState('ingreso');
  const [fecha, setFecha] = useState(''); // fecha en formato YYYY-MM-DD


  const fetchTransacciones = async () => {
    const res = await api.get('/transacciones');
    setTransacciones(res.data);
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/transacciones', { descripcion, monto, tipo, fecha_gasto: fecha });
    fetchTransacciones();
    setDescripcion('');
    setMonto('');
    setFecha('');
  };

  useEffect(() => {
    fetchTransacciones();
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción"
        />
        <input
          type="number"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          placeholder="Monto"
        />
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          placeholder="Fecha"
        />
        <select value={tipo} onChange={e => setTipo(e.target.value)}>
          <option value="ingreso">Ingreso</option>
          <option value="gasto">Gasto</option>
        </select>
        <button type="submit">Agregar</button>
      </form>
      <ul>
        {transacciones.map((t) => (
          <li key={t.id}>
            {t.descripcion}: ${t.monto} ({t.tipo}) - {formatFecha(t.fecha_gasto)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransaccionForm;
