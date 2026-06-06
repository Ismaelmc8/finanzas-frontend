import UploadButton from "../ui/UploadButton";

export default function ImportExpensesButton({extraData = {}, onImported }) {
  return (
    <UploadButton
      endpoint="/api/import/gastos"
      acceptedTypes={[
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel"
      ]}
      maxSizeMb={10}
      labels={{
        idle: "Importar Excel",
        loading: "Importando..."
      }}
      validate={(file) => {
        if (!file.name.toLowerCase().includes("movimientos")) {
          return "El archivo no parece un extracto bancario";
        }
        return null;
      }}
      
      // Añadimos todos los campos extra dinámicamente
      extraFormData={extraData}

      onSuccess={(result) => {
        onImported?.(result.imported);
      }}
      onError={(msg) => {
        console.error("Error importando gastos:", msg);
      }}
    />
  );
}
