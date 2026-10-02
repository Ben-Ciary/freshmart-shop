import { useEffect, useState } from "react";
import { api } from "../api";
import { money } from "../utils";

export default function AdminOrders({ notify }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const data = await api("/orders/");
      setOrders(data);
    } catch (error) {
      notify(error.message || "Could not load orders.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const changeStatus = async (orderId, status) => {
    try {
      const updated = await api(`/orders/${orderId}`, {
        method: "PUT",
        body: { status },
      });

      setOrders((current) =>
        current.map((order) =>
          order.id === updated.id ? updated : order,
        ),
      );

      notify("Order status updated.");
    } catch (error) {
      notify(error.message || "Could not update order.", "error");
    }
  };

  const activeOrders = orders.filter(
    (order) =>
      order.status !== "collected" &&
      order.status !== "cancelled",
  );

  const oldOrders = orders.filter(
    (order) =>
      order.status === "collected" ||
      order.status === "cancelled",
  );

  if (loading) {
    return <div className="boot">Loading orders...</div>;
  }

  return (
    <section>
      <h2 className="page-title">Shop Orders</h2>

      <h3>Active Orders</h3>

      {activeOrders.length === 0 ? (
        <p>No active orders.</p>
      ) : (
        activeOrders.map((order) => (
          <div className="order-card" key={order.id}>
            <h3>Order #{order.id}</h3>

            <p>
              <b>Customer:</b> {order.name}
            </p>

            <p>
              <b>Phone:</b> {order.phone}
            </p>

            <p>
              <b>Pickup:</b> {order.pickup_time}
            </p>

            <p>
              <b>Total:</b> {money(order.total)}
            </p>

            <p>
              <b>Status:</b> {order.status}
            </p>

            <div>
              {order.items.map((item) => (
                <p key={item.id}>
                  {item.name} × {item.qty}
                </p>
              ))}
            </div>

            <select
              value={order.status}
              onChange={(e) =>
                changeStatus(order.id, e.target.value)
              }
            >
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="collected">Collected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        ))
      )}

      <h3>Order History</h3>

      {oldOrders.length === 0 ? (
        <p>No old orders yet.</p>
      ) : (
        oldOrders.map((order) => (
          <div className="order-card" key={order.id}>
            <h3>Order #{order.id}</h3>

            <p>
              {order.name} — {order.phone}
            </p>

            <p>
              {money(order.total)} — {order.status}
            </p>
          </div>
        ))
      )}
    </section>
  );
}
