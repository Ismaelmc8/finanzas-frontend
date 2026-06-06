import { useRef, useState } from "react";

export default function UploadButton({
  endpoint,
  acceptedTypes,
  maxSizeMb = 5,
  fieldName = "file",

  headers = {},
  extraFormData = {},

  validate,

  onStart,
  onSuccess,
  onError,
  onFinish,

  labels = {
    idle: "Subir archivo",
    loading: "Subiendo..."
  },

  className = ""
}) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const openDialog = () => inputRef.current.click();

  const uploadFile = async (file) => {
    if (!file) return;

    if (!acceptedTypes.includes(file.type)) {
      onError?.("Tipo de archivo no permitido");
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      onError?.(`Máximo permitido: ${maxSizeMb}MB`);
      return;
    }

    const validationError = validate?.(file);
    if (validationError) {
      onError?.(validationError);
      return;
    }

    const formData = new FormData();
    formData.append(fieldName, file);
    console.log(extraFormData)
    Object.entries(extraFormData).forEach(([k, v]) =>
      formData.append(k, v)
    );

    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    try {
      setLoading(true);
      onStart?.();

      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: formData
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      onSuccess?.(await res.json());
    } catch (err) {
      onError?.(err.message || "Error al subir el archivo");
    } finally {
      setLoading(false);
      onFinish?.();
      inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        hidden
        onChange={(e) => uploadFile(e.target.files[0])}
      />

      <button
        type="button"
        disabled={loading}
        onClick={openDialog}
        className={`
          px-4 py-2 rounded-md text-sm font-medium
          bg-blue-600 text-white
          hover:bg-blue-700
          disabled:opacity-50 disabled:cursor-not-allowed
          transition
          ${className}
        `}
      >
        {loading ? labels.loading : labels.idle}
      </button>
    </>
  );
}
