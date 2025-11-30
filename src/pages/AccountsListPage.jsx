import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { getGroups } from "../services/groupsService";

export default function GroupsPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchGroups() {
      try {
        const data = await getGroups(); // 🔹 petición al backend
        setGroups(data);
      } catch (err) {
        console.error("Error cargando grupos:", err);
        setError("No se pudieron cargar los grupos.");
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, []);

  if (loading) return <p className="text-center mt-10">Cargando grupos...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Grupos de gastos</h1>
        <Button
          onClick={() => navigate("/groups/create")}
          className="rounded-xl px-4 py-2"
        >
          + Nuevo grupo
        </Button>
      </div>

      {/* Lista de grupos */}
      {groups.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">
          No tienes grupos creados todavía.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) => (
            <Card
              key={group.id}
              className="p-5 cursor-pointer hover:shadow-lg transition rounded-2xl border border-gray-200 bg-white"
              onClick={() => navigate(`/movements-groups/${group.id}`)}
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">{group.name}</h2>
                <span
                  className={`text-lg font-bold ${
                    group.balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {group.balance.toFixed(2)}€
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {group.members > 1
                  ? `${group.members} miembros`
                  : "Solo tú"}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
