import "../css/Header.css";

export default function Header({ user, count, setView, onLogout }) {
  return (
    <header className="header">
      <h1 onClick={() => setView("shop")}>🛒 My Shop</h1>
      <nav>
        <button onClick={() => setView("shop")}>Shop</button>
        <button onClick={() => setView("cart")}>Cart ({count})</button>
        {user ? (
          <>
            <span className="user">Hi, {user.name}</span>
            <button onClick={onLogout}>Logout</button>
          </>
        ) : (
          <button onClick={() => setView("login")}>Login</button>
        )}
      </nav>
    </header>
  );
}
