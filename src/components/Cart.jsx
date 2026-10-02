import { money, emojiFor } from "../utils";
import "../css/Cart.css";

export default function Cart({
  cart,
  onQty,
  onRemove,
  onCheckout,
  onShop,
  onOrders,
}) {
  if (cart.items.length === 0) {
    return (
      <div className="empty">
        <div className="big">🧺</div>
        <h2>Your cart is empty</h2>
        <p>Add something fresh from the shop.</p>

        <button className="btn btn-primary" onClick={onShop}>
          Start shopping
        </button>

        <button className="btn" onClick={onOrders}>
          View My Orders
        </button>
      </div>
    );
  }

  const itemCount = cart.items.reduce((sum, item) => sum + Number(item.qty), 0);

  return (
    <section>
      <h2 className="page-title">Your Cart</h2>

      <div className="cart-layout">
        <div className="cart-list">
          {cart.items.map((item) => (
            <div className="cart-row" key={item.product_id}>
              <div className="cart-emoji">
                {emojiFor(item.name, item.category)}
              </div>

              <div className="cart-info">
                <b>{item.name}</b>
                <span>{money(item.price)} each</span>
              </div>

              <div className="qty">
                <button
                  type="button"
                  onClick={() => onQty(item.product_id, Number(item.qty) - 1)}
                >
                  −
                </button>

                <span>{item.qty}</span>

                <button
                  type="button"
                  disabled={Number(item.qty) >= Number(item.stock)}
                  onClick={() => onQty(item.product_id, Number(item.qty) + 1)}
                >
                  +
                </button>
              </div>

              <b className="line-total">
                {money(Number(item.price) * Number(item.qty))}
              </b>

              <button
                type="button"
                className="remove"
                onClick={() => onRemove(item.product_id)}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <aside className="summary">
          <h3>Order summary</h3>

          <div className="sum-row">
            <span>Items</span>
            <span>{itemCount}</span>
          </div>

          <div className="sum-row">
            <span>Pickup</span>
            <span>Free</span>
          </div>

          <div className="sum-row total">
            <span>Total</span>
            <span>{money(cart.total)}</span>
          </div>

          <button className="btn btn-primary btn-block" onClick={onCheckout}>
            Go to checkout
          </button>

          <button className="btn btn-block" onClick={onShop}>
            Continue shopping
          </button>
        </aside>
      </div>
    </section>
  );
}
