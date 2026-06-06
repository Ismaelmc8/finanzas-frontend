function Summary({ ingresos, gastos }) {
  const balance = ingresos - gastos;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-green-100 p-4 rounded-lg shadow flex flex-col items-center">
        <span className="text-gray-600 font-semibold">Ingresos</span>
        <span className="text-2xl font-bold text-green-700">{ingresos.toLocaleString()}€</span>
      </div>
      <div className="bg-red-100 p-4 rounded-lg shadow flex flex-col items-center">
        <span className="text-gray-600 font-semibold">Gastos</span>
        <span className="text-2xl font-bold text-red-700">{gastos.toLocaleString()}€</span>
      </div>
      <div className={`p-4 rounded-lg shadow flex flex-col items-center ${
        balance >= 0 ? "bg-indigo-100" : "bg-yellow-100"
      }`}>
        <span className="text-gray-600 font-semibold">Balance</span>
        <span className={`text-2xl font-bold ${
          balance >= 0 ? "text-indigo-700" : "text-yellow-700"
        }`}>
          {balance.toLocaleString()}€
        </span>
      </div>
    </div>
  );
}

export default Summary;
