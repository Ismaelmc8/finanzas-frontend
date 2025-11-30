export default function Perfil() {
  // Ejemplo de datos estáticos (en el futuro se pueden cargar desde el backend)
  const user = {
    nombre: "Juan Pérez",
    email: "juanperez@email.com",
    fechaRegistro: "2025-01-15",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Perfil</h1>
      <p className="mt-2 text-gray-600">Información de tu cuenta.</p>

      <div className="mt-6 bg-white shadow rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Nombre</h2>
          <p className="text-lg text-gray-800">{user.nombre}</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-500">Correo electrónico</h2>
          <p className="text-lg text-gray-800">{user.email}</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-500">Miembro desde</h2>
          <p className="text-lg text-gray-800">{user.fechaRegistro}</p>
        </div>

        <button className="mt-4 w-full rounded-xl bg-indigo-600 py-3 text-white font-semibold shadow-md hover:bg-indigo-700 transition">
          Editar perfil
        </button>
      </div>
    </div>
  );
}
