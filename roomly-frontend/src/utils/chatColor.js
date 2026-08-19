const palettes = [
  { key: "violet", bg: "bg-violet-500", soft: "bg-violet-500/12", border: "border-violet-400/30", text: "text-violet-200", hex: "#8b5cf6" },
  { key: "blue", bg: "bg-blue-500", soft: "bg-blue-500/12", border: "border-blue-400/30", text: "text-blue-200", hex: "#3b82f6" },
  { key: "emerald", bg: "bg-emerald-500", soft: "bg-emerald-500/12", border: "border-emerald-400/30", text: "text-emerald-200", hex: "#10b981" },
  { key: "orange", bg: "bg-orange-500", soft: "bg-orange-500/12", border: "border-orange-400/30", text: "text-orange-200", hex: "#f97316" },
  { key: "pink", bg: "bg-pink-500", soft: "bg-pink-500/12", border: "border-pink-400/30", text: "text-pink-200", hex: "#ec4899" },
  { key: "cyan", bg: "bg-cyan-500", soft: "bg-cyan-500/12", border: "border-cyan-400/30", text: "text-cyan-200", hex: "#06b6d4" },
  { key: "rose", bg: "bg-rose-500", soft: "bg-rose-500/12", border: "border-rose-400/30", text: "text-rose-200", hex: "#f43f5e" },
  { key: "indigo", bg: "bg-indigo-500", soft: "bg-indigo-500/12", border: "border-indigo-400/30", text: "text-indigo-200", hex: "#6366f1" },
  { key: "teal", bg: "bg-teal-500", soft: "bg-teal-500/12", border: "border-teal-400/30", text: "text-teal-200", hex: "#14b8a6" },
  { key: "amber", bg: "bg-amber-500", soft: "bg-amber-500/12", border: "border-amber-400/30", text: "text-amber-200", hex: "#f59e0b" },
];

export const getUserColor = (username = "") => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palettes[Math.abs(hash) % palettes.length];
};

export const getUserAvatar = (username = "") => {
  const seed = encodeURIComponent(username.trim() || "user");
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`;
};
