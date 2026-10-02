import "../css/Toast.css";

export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div key={toast.id} className={`toast ${toast.type}`}>
      {toast.type === "error" ? "⚠️" : "✅"} {toast.msg}
    </div>
  );
}
