import { useState } from "react";
import { api } from "../api";
import { money, pickupSlots } from "../utils";

export default function EditOrder({ order, onClose, onSaved }) {
  const [phone, setPhone] = useState(order.phone);
  const [pickup, setPickup] = useState(order.pickup_time || "");
  const [note, setNote] = useState(order.note || "");
  const [qty, setQty] = useState(
    Object.fromEntries(order.items.map((i) => [i.product_id, i.qty])),
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const slots = pickupSlots();
  if (pickup && !slots.includes(pickup)) slots.unshift(pickup);

  const total = order.items.reduce(
    (s, i) => s + Number(i.price) * qty[i.product_id],
    0,
  );
  const change = (id, d) => setQty({ ...qty, [id]: Math.max(0, qty[id] + d) });

  const save = async () => {
    setError("");
    setSaving(true);
    try {
      await api(`/orders/${order.id}`, {
        method: "PUT",
        body: {
          phone,
          pickup_time: pickup,
          note,
          items: order.items.map((i) => ({
            product_id: i.product_id,
            qty: qty[i.product_id],
          })),
        },
      });
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Edit order #{order.id}</h3>
        {error && <div className="error">{error}</div>}

        {order.items.map((i) => (
          <div className="edit-row" key={i.id}>
            <span className={qty[i.product_id] === 0 ? "struck" : ""}>
              {i.name}
            </span>
            <div className="qty">
              <button onClick={() => change(i.product_id, -1)}>−</button>
              <span>{qty[i.product_id]}</span>
              <button onClick={() => change(i.product_id, 1)}>+</button>
            </div>
          </div>
        ))}

        <label>Pickup time</label>
        <select value={pickup} onChange={(e) => setPickup(e.target.value)}>
          {slots.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <label>Phone</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <label>Note</label>
        <textarea
          rows="2"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="modal-foot">
          <b>New total: {money(total)}</b>
          <div className="actions">
            <button className="btn" onClick={onClose}>
              Close
            </button>
            <button
              className="btn btn-primary"
              disabled={saving}
              onClick={save}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
