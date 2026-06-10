import { useState, useRef, useEffect } from "react";

const GRUPOS = [
  { label: "Finanzas", emojis: [
    "💰","💵","💴","💶","💷","💳","🏦","📈","📉","💹",
    "🪙","💸","🏧","💎","🤑","💼","📊","🤝","🧾","📑",
  ]},
  { label: "Hogar", emojis: [
    "🏠","🏡","🏘️","🔑","🗝️","💡","💧","🔥","📡","🏢",
    "🛋️","🛠️","🪑","🫙","🪟","🚿","🛁","🧹","🧺","🪴",
    "🛏️","🧱","🏗️","🪣","🧯","🔩","🪚","🧲",
  ]},
  { label: "Comida", emojis: [
    "🛒","🍽️","🍕","🍔","🌮","🌯","🥗","🍱","🥩","🥐",
    "🥖","🍞","🧀","🥚","🍳","🥞","🍜","🍝","🍣","🍛",
    "🥘","🫕","🍲","🥙","🧆","🥪","☕","🍵","🧃","🥤",
    "🍺","🍷","🥛","🧁","🍰","🎂","🍫","🍬","🍭","🍦",
  ]},
  { label: "Transporte", emojis: [
    "🚗","🚕","🚙","🚌","🚎","🚐","🚂","🚃","✈️","🚁",
    "🛸","🚇","🚆","🛺","🚲","🛵","🏍️","⛽","🛞","🚦",
    "🅿️","🗺️","⚓","🚀","🛳️","⛵","🚤","🛥️","🚠","🚡",
  ]},
  { label: "Salud", emojis: [
    "🏥","💊","🩺","💪","🦷","🧬","🩹","🧘","🌡️","🩻",
    "🧪","🫀","🫁","🦴","🧠","💉","🩸","🔬","🏃","🚴",
    "🧖","🛀","😴","🥗","🥦","🫐","🍎",
  ]},
  { label: "Ocio", emojis: [
    "🎮","📺","🎬","🎵","🎨","⚽","🏀","🎾","🏈","🎭",
    "🎲","🎸","🎯","🏋️","🎳","🎪","🎡","🎢","🎻","🎺",
    "🥁","🎤","🎧","🕹️","🎰","🏊","🤿","🎿","⛷️","🏄",
    "🧗","🏇","🎣","🏕️","🌄","🎠","🎆","🎇",
  ]},
  { label: "Tecnología", emojis: [
    "📱","💻","🖥️","🖨️","⌨️","🖱️","💾","💿","📀","🔋",
    "📷","📸","📹","🎥","📞","☎️","📠","📟","🔭","🔌",
    "🔧","🪛","🔩","📡","🛰️","🤖","🧩","💡","🔦","🕹️",
  ]},
  { label: "Moda", emojis: [
    "👗","👔","👟","👠","👡","👜","👛","🧳","💄","👒",
    "🧢","🎩","🕶️","⌚","💍","🛍️","🪞","👙","🩳","🧥",
    "🧤","🧣","🧦","👢","👞","🩴","🪭",
  ]},
  { label: "Educación", emojis: [
    "📚","🎓","📖","✏️","🔬","🧮","📐","📝","🖊️","🗒️",
    "📓","🏫","🎒","🔭","🖋️","📜","📋","🗂️","📌","📎",
    "✂️","🖍️","📏","🗃️","🧑‍💻","🧑‍🏫","🧑‍🔬",
  ]},
  { label: "Personas", emojis: [
    "👶","🧒","👦","👧","🧑","👨","👩","🧓","👴","👵",
    "🤝","🫂","💏","👪","🧑‍💼","👷","🧑‍⚕️","🧑‍🍳","🧑‍🎨","🧑‍🚒",
    "💃","🕺","🙏","👏","🤲",
  ]},
  { label: "Mascotas", emojis: [
    "🐾","🐶","🐱","🐠","🐦","🐇","🦊","🐢","🦮","🐈",
    "🦜","🐹","🐰","🐻","🐼","🐮","🐷","🦁","🐯","🐸",
    "🦋","🐝","🐾",
  ]},
  { label: "Naturaleza", emojis: [
    "🌿","🌱","🌲","🌳","🌴","🌵","🍀","🌸","🌺","🌻",
    "🌹","🍁","🍂","🌍","🌊","🌋","🏔️","🏕️","⭐","🌙",
    "☀️","🌤️","⛅","🌧️","⛈️","❄️","🌈","🌬️","🍄","🌾",
  ]},
  { label: "Otros", emojis: [
    "📦","🌟","❓","🎁","🪴","🎀","🌈","⚡","🎊","🎉",
    "🔔","🚨","💫","⚠️","✅","❌","🔒","🔓","🌐","🏷️",
    "📌","📎","🔗","🧧","🪄","🎗️","🏅","🥇","🏆","🎖️",
    "📣","📢","💬","💭","🗯️","🔖","🪬","🧿",
  ]},
];

export default function EmojiPicker({ value, onChange }) {
  const [open,       setOpen]       = useState(false);
  const [grupoActivo,setGrupoActivo]= useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-14 h-10 border rounded-lg text-xl flex items-center justify-center hover:bg-gray-50 transition"
        title="Elegir icono"
      >
        {value || "📦"}
      </button>

      {open && (
        <div className="absolute left-0 top-12 z-50 bg-white border rounded-xl shadow-xl w-72 p-3">
          {/* Tabs de grupos */}
          <div className="flex gap-1 overflow-x-auto pb-2 mb-2 scrollbar-hide">
            {GRUPOS.map((g, i) => (
              <button
                key={g.label}
                type="button"
                onClick={() => setGrupoActivo(i)}
                className={`text-xs whitespace-nowrap px-2 py-1 rounded-lg transition flex-shrink-0 ${
                  grupoActivo === i
                    ? "bg-teal-100 text-teal-700 font-medium"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Grid de emojis del grupo activo */}
          <div className="grid grid-cols-8 gap-0.5 max-h-48 overflow-y-auto pr-1">
            {GRUPOS[grupoActivo].emojis.map((e, i) => (
              <button
                key={`${e}-${i}`}
                type="button"
                onClick={() => { onChange(e); setOpen(false); }}
                className={`text-xl p-1 rounded hover:bg-teal-50 transition ${value === e ? "bg-teal-100" : ""}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
