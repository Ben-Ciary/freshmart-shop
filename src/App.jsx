import { useCallback, useEffect, useState } from "react";
import AdminOrders from "./components/AdminOrders";
import Header from "./components/Header";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Login from "./components/Login";
import Orders from "./components/Orders";
import Toast from "./components/Toast";

import { api, clearToken, getToken, saveToken } from "./api";

const EMPTY_CART = {
  items: [],
  total: 0,
};

export default function App() {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(Boolean(getToken()));
  const [view, setView] = useState(localStorage.getItem("shop_view") || "shop");
  const [cart, setCart] = useState(EMPTY_CART);
  const [toast, setToast] = useState(null);

  const notify = useCallback((msg, type = "ok") => {
    setToast({
      msg,
      type,
      id: Date.now(),
    });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  const go = (nextView) => {
    setView(nextView);
    localStorage.setItem("shop_view", nextView);
    window.scrollTo(0, 0);
  };

  const clearSession = useCallback(() => {
    clearToken();
    localStorage.removeItem("shop_view");
    setUser(null);
    setCart(EMPTY_CART);
  }, []);

  // Restore the user session when the page is refreshed.
  useEffect(() => {
    const token = getToken();

    if (!token) {
      setBooting(false);
      return;
    }

    api("/auth/me")
      .then(async (currentUser) => {
        setUser(currentUser);

        try {
          const currentCart = await api("/cart");
          setCart(currentCart);
        } catch {
          setCart(EMPTY_CART);
        }
      })
      .catch(() => {
        clearSession();
      })
      .finally(() => {
        setBooting(false);
      });
  }, [clearSession]);

  // Login or registration.
  const handleAuth = async (data) => {
    try {
      const { tokens, user } = data;

      if (!tokens?.access) {
        throw new Error("Login succeeded, but no access token was received.");
      }

      saveToken(tokens.access);

      localStorage.setItem("shop_last_email", user.email);

      setUser(user);

      try {
        const currentCart = await api("/cart");
        setCart(currentCart);
      } catch {
        setCart(EMPTY_CART);
      }

      go("shop");
      notify(`Welcome, ${user.name}!`);
    } catch (error) {
      notify(error.message || "Login failed.", "error");
    }
  };

  const logout = () => {
    clearSession();
    go("shop");
  };

  const reloadCart = async () => {
    try {
      const currentCart = await api("/cart");
      setCart(currentCart);
    } catch {
      setCart(EMPTY_CART);
    }
  };

  const run = async (fn, successMessage) => {
    try {
      const updatedCart = await fn();
      setCart(updatedCart);

      if (successMessage) {
        notify(successMessage);
      }
    } catch (error) {
      console.error("Cart error:", error);
      notify(error.message || "Something went wrong.", "error");
    }
  };

  const addToCart = (productId) => {
    run(
      () =>
        api("/cart/items", {
          method: "POST",
          body: {
            productId,
            qty: 1,
          },
        }),
      "Added to cart",
    );
  };

  const setQty = (productId, qty) => {
    run(() =>
      api(`/cart/items/${productId}`, {
        method: "PATCH",
        body: {
          qty,
        },
      }),
    );
  };

  const removeItem = (productId) => {
    run(
      () =>
        api(`/cart/items/${productId}`, {
          method: "DELETE",
        }),
      "Item removed",
    );
  };

  const count = cart.items.reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0,
  );

  if (booting) {
    return <div className="boot">🛒 Loading your shop...</div>;
  }

  if (!user) {
    return (
      <>
        <Login onAuth={handleAuth} />
        <Toast toast={toast} />
      </>
    );
  }

  return (
    <>
      <Header
        user={user}
        count={count}
        view={view}
        setView={go}
        onLogout={logout}
      />

      <main className="container">
        {view === "shop" && <ProductList onAdd={addToCart} />}
        {view === "cart" && (
          <Cart
            cart={cart}
            onQty={setQty}
            onRemove={removeItem}
            onCheckout={() => go("checkout")}
            onShop={() => go("shop")}
            onOrders={() => go("orders")}
          />
        )}
        {view === "checkout" && (
          <Checkout
            cart={cart}
            user={user}
            onPlaced={reloadCart}
            onOrders={() => go("orders")}
            onShop={() => go("shop")}
          />
        )}
        {view === "orders" &&
          (user.is_staff ? (
            <AdminOrders notify={notify} />
          ) : (
            <Orders notify={notify} onShop={() => go("shop")} />
          ))}{" "}
      </main>

      <Toast toast={toast} />
    </>
  );
}
