import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useState } from "react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function UsersTable() {
  const [rows, setRows] = useState([
    { id: 1, name: "Lindsay Walton", company: "Google", category: "Optimization", status: "Paid", date: new Date("2025-08-01") },
    { id: 2, name: "Courtney Henry", company: "Amazon", category: "Intranet", status: "Pending", date: new Date("2025-08-10") },
    { id: 3, name: "Tom Cook", company: "Apple", category: "Directives", status: "Paid", date: new Date("2025-08-15") },
    { id: 4, name: "Whitney Francis", company: "Meta", category: "Program", status: "Failed", date: new Date("2025-08-22") },
  ]);

  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");

  const categories = ["Optimization", "Intranet", "Directives", "Program", "Mobility", "Security"];
  const statuses = ["Paid", "Pending", "Failed"];

  const handleSave = () => {
    if (!formData.date || isNaN(formData.date.getTime())) {
      setError("Please select a valid date");
      return;
    }
    setError("");

    if (selectedRow) {
      // editar existente
      setRows(rows.map((r) => (r.id === selectedRow.id ? { ...formData, id: selectedRow.id } : r)));
    } else {
      // añadir nuevo
      const newId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
      setRows([...rows, { ...formData, id: newId }]);
    }

    setOpen(false);
    setSelectedRow(null);
    setFormData({});
  };

  return (
    <Card className="p-6 shadow-md rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-semibold">Payments</h1>
          <p className="text-sm text-gray-500">
            A list of all payments including name, company, category, status and payment date.
          </p>
        </div>
        <Button
          className="rounded-xl"
          onClick={() => {
            setSelectedRow(null);
            setFormData({ name: "", company: "", category: categories[0], status: statuses[0], date: new Date() });
            setOpen(true);
          }}
        >
          Add Payment
        </Button>
      </div>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Company</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Payment Date</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{row.name}</td>
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900">{row.company}</div>
                  <div className="text-sm text-gray-500">{row.category}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {row.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {row.date.toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => {
                      setSelectedRow(row);
                      setFormData(row);
                      setOpen(true);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => {
                      setSelectedRow(row);
                      setFormData(row);
                      setOpen(true);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              {selectedRow ? "Edit Payment" : "Add Payment"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Name</label>
                <input
                  className="w-full border rounded-lg p-2 mt-1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Company</label>
                <input
                  className="w-full border rounded-lg p-2 mt-1"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Category</label>
                <select
                  className="w-full border rounded-lg p-2 mt-1"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Status</label>
                <select
                  className="w-full border rounded-lg p-2 mt-1"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Payment Date</label>
                <DatePicker
                  selected={formData.date}
                  onChange={(date) => setFormData({ ...formData, date })}
                  className="w-full border rounded-lg p-2 mt-1"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button className="bg-gray-300 text-gray-800" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}