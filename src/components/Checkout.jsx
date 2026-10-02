import { useState } from "react";
import { api } from "../api";
import { money, pickupSlots } from "../utils";
import "../css/Checkout.css";

export default function Checkout({ cart, user, onPlaced, onOrders, onShop }) {
  const slots = pickupSlots();

  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    pickup_time: slots[0],
    note: "",
  });

  const [placed, setPlaced] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const order = await api("/orders/", {
        method: "POST",
        body: {
          ...form,
          items: cart.items.map((item) => ({
            product_id: item.product_id,
            qty: item.qty,
          })),
        },
      });

      setPlaced(order);
      onPlaced();
    } catch (err) {
      setError(err.message || "Could not place your order.");
    } finally {
      setLoading(false);
    }
  };

  if (placed) {
    return (
      <div className="checkout success">
        <div className="big">🎉</div>

        <h2>Order #{placed.id} placed!</h2>

        <p>
          Pickup: <b>{placed.pickup_time}</b>
        </p>

        <p>
          Your order has been saved. You can view, edit, or cancel it while it
          is still pending.
        </p>

        <button className="btn btn-primary" onClick={onOrders}>
          View My Orders
        </button>

        <button className="btn" onClick={onShop}>
          Keep shopping
        </button>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="empty">
        <h2>Nothing to check out</h2>

        <button className="btn btn-primary" onClick={onShop}>
          Go to shop
        </button>

        <button className="btn" onClick={onOrders}>
          View My Orders
        </button>
      </div>
    );
  }

  return (
    <section>
      <h2 className="page-title">Checkout</h2>

      <div className="checkout-layout">
        <form className="checkout" onSubmit={submit}>
          <h3>Pickup details</h3>

          {error && <div className="error">{error}</div>}

          <label>Full name</label>

          <input name="name" value={form.name} onChange={update} required />

          <label>Email</label>

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={update}
            required
          />

          <label>Phone</label>

          <input
            name="phone"
            value={form.phone}
            onChange={update}
            placeholder="07xx xxx xxx"
            required
          />

          <label>Pickup time</label>

          <select name="pickup_time" value={form.pickup_time} onChange={update}>
            {slots.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <label>Note for the shop (optional)</label>

          <textarea
            name="note"
            rows="3"
            value={form.note}
            onChange={update}
            placeholder="e.g. Ripe bananas please"
          />

          <p className="pay-note">💵 Pay at the counter when you collect.</p>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading
              ? "Placing order..."
              : `Place order · ${money(cart.total)}`}
          </button>

          <button type="button" className="btn btn-block" onClick={onOrders}>
            View My Orders
          </button>
        </form>

        <aside className="summary">
          <h3>Your items</h3>

          {cart.items.map((i) => (
            <div className="sum-row" key={i.id}>
              <span>
                {i.name} × {i.qty}
              </span>

              <span>{money(i.price * i.qty)}</span>
            </div>
          ))}

          <div className="sum-row total">
            <span>Total</span>

            <span>{money(cart.total)}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
