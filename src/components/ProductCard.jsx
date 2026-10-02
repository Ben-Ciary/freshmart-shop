import { money, emojiFor } from "../utils";
import "../css/ProductCard.css";

export default function ProductCard({ product, onAdd }) {
  const out = product.stock <= 0;
  return (
    <div className={`card ${out ? "out" : ""}`}>
      <div className="card-img">{emojiFor(product.name, product.category)}</div>
      <span className="tag">{product.category}</span>
      <h3>{product.name}</h3>
      <p className="stock">
        {out
          ? "Out of stock"
          : product.stock <= 5
            ? `Only ${product.stock} left!`
            : "In stock"}
      </p>
      <div className="card-foot">
        <span className="price">{money(product.price)}</span>
        <button
          className="btn btn-primary"
          disabled={out}
          onClick={() => onAdd(product.id)}
        >
          + Add
        </button>
      </div>
    </div>
  );
}
