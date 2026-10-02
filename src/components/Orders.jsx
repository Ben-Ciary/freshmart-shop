import { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import { money } from "../utils";
import EditOrder from "./EditOrder";
import "../css/Orders.css";

const STEPS = [
  ["pending", "Placed"],
  ["preparing", "Preparing"],
  ["ready", "Ready for pickup"],
  ["collected", "Collected"],
];

const LABEL = {
  pending: "Placed",
  preparing: "Preparing",
  ready: "Ready for pickup",
  collected: "Picked up",
  cancelled: "Cancelled",
};

function pickupHasPassed(pickupTime) {
  if (!pickupTime) {
    return false;
  }

  const now = new Date();

  let date = new Date(now);

  if (pickupTime.startsWith("Tomorrow")) {
    date.setDate(date.getDate() + 1);
  }

  const time = pickupTime.split(", ")[1];

  if (!time) {
    return false;
  }

  const [hours, minutes] = time.split(":").map(Number);

  date.setHours(hours, minutes, 0, 0);

  return date.getTime() < now.getTime();
}

function isPastOrder(order) {
  if (order.status === "cancelled") {
    return true;
  }

  return pickupHasPassed(order.pickup_time);
}

export default function Orders({ notify, onShop }) {
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);

  const load = useCallback(
    () =>
      api("/orders/")
        .then(setOrders)
        .catch((e) => notify(e.message, "error")),
    [notify],
  );

  useEffect(() => {
    load();

    const t = setInterval(load, 15000);

    return () => clearInterval(t);
  }, [load]);

  const cancel = async (order) => {
    if (!window.confirm(`Cancel order #${order.id}?`)) {
      return;
    }

    try {
      await api(`/orders/${order.id}`, {
        method: "DELETE",
      });

      notify("Order cancelled");

      load();
    } catch (e) {
      notify(e.message || "Could not cancel order.", "error");
    }
  };

  if (!orders) {
    return <p className="muted">Loading your orders...</p>;
  }

  const shown = orders.filter((order) => {
    const past = isPastOrder(order);

    if (filter === "active") {
      return !past;
    }

    if (filter === "past") {
      return past;
    }

    return true;
  });

  return (
    <section>
      <div className="orders-head">
        <h2 className="page-title">My Orders</h2>

        <div className="chips">
          {[
            ["all", "All"],
            ["active", "Active"],
            ["past", "History"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={`chip ${filter === id ? "on" : ""}`}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}

          <button className="chip" onClick={load}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {shown.length === 0 && (
        <div className="empty">
          <div className="big">📦</div>

          <h2>No orders here yet</h2>

          <button className="btn btn-primary" onClick={onShop}>
            Start shopping
          </button>
        </div>
      )}

      {shown.map((order) => {
        const past = isPastOrder(order);

        const step = STEPS.findIndex(([status]) => status === order.status);

        let displayStatus = LABEL[order.status];

        if (
          past &&
          order.status !== "collected" &&
          order.status !== "cancelled"
        ) {
          displayStatus = "Not picked up";
        }

        return (
          <article className="order" key={order.id}>
            <div className="order-top">
              <div>
                <h3>Order #{order.id}</h3>

                <span className="muted">
                  {new Date(order.created_at).toLocaleString()}
                </span>
              </div>

              <span className={`status ${order.status}`}>{displayStatus}</span>
            </div>

            {!past && order.status !== "cancelled" && (
              <ol className="tracker">
                {STEPS.map(([status, label], i) => (
                  <li key={status} className={i <= step ? "done" : ""}>
                    <span className="dot">{i <= step ? "✓" : i + 1}</span>

                    <small>{label}</small>
                  </li>
                ))}
              </ol>
            )}

            <ul className="order-items">
              {order.items.map((item) => (
                <li key={item.id}>
                  <span>
                    {item.name} × {item.qty}
                  </span>

                  <span>{money(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>

            <div className="order-meta">
              <span>
                👤 Name: <b>{order.name}</b>
              </span>

              <span>
                📧 Email: <b>{order.email}</b>
              </span>

              <span>
                📞 Phone: <b>{order.phone}</b>
              </span>

              <span>
                🕒 Pickup: <b>{order.pickup_time}</b>
              </span>

              {order.note && <span>📝 {order.note}</span>}
            </div>

            <div className="order-foot">
              <b className="order-total">{money(order.total)}</b>

              {!past && order.status === "pending" && (
                <div className="actions">
                  <button className="btn" onClick={() => setEditing(order)}>
                    ✏️ Edit
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() => cancel(order)}
                  >
                    Cancel order
                  </button>
                </div>
              )}
            </div>
          </article>
        );
      })}

      {editing && (
        <EditOrder
          order={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            notify("Order updated");
            load();
          }}
        />
      )}
    </section>
  );
}
