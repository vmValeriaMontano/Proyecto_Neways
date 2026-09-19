import React from "react";
import { useNavigate } from "react-router-dom";

const SHIPPING_COST = 3.50;
const FALLBACK_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='%23ccc'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23666'>Sin Foto</text></svg>";

export default function Cart() {
  const navigate = useNavigate();
  // Datos de demostración locales o desde contexto[cite: 5]
  const [items, setItems] = React.useState([
    { cart_item_id: 1, name: "Leggings Fit Pro", color: "Negro", size: "M", price: 35.00, quantity: 1, image_url: "" }
  ]);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = items.length > 0 ? subtotal + SHIPPING_COST : 0;

  const updateQuantity = (id, newQty) => {
    setItems(items.map(item => item.cart_item_id === id ? { ...item, quantity: newQty } : item));
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.cart_item_id !== id));
  };

  return (
    <div style={{ padding: 20 }}>
      <div className="cart-header">
        <h1>Tu carrito</h1>
        <p>{items.length} {items.length === 1 ? "Producto" : "Productos"}</p>
      </div>

      {items.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        items.map((item) => (
          <div key={item.cart_item_id} style={{ display: 'flex', gap: 10, marginBottom: 15, background: '#f9f9f9', padding: 10, borderRadius: 10 }}>
            <img 
              src={item.image_url || FALLBACK_IMAGE} 
              alt={item.name} 
              style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 10 }}
            />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 'bold', margin: 0 }}>{item.name}</p>
              <p style={{ fontSize: 12, margin: '2px 0' }}>{item.color} / Talla {item.size}</p>
              <p style={{ color: 'var(--quantic-blue)', fontWeight: 'bold', margin: 0 }}>${item.price.toFixed(2)}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <button onClick={() => removeItem(item.cart_item_id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'red' }}>🗑️</button>
              <div>
                <button onClick={() => updateQuantity(item.cart_item_id, Math.max(1, item.quantity - 1))}>-</button>
                <span style={{ margin: '0 5px' }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}>+</button>
              </div>
            </div>
          </div>
        ))
      )}

      {items.length > 0 && (
        <div style={{ borderTop: '1px solid #eee', paddingTop: 10, marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><p>Subtotal</p><p>${subtotal.toFixed(2)}</p></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><p>Envío</p><p>${SHIPPING_COST.toFixed(2)}</p></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 18 }}><p>Total</p><p>${total.toFixed(2)}</p></div>
          <button className="btn-primary" style={{ width: '100%', marginTop: 10 }} onClick={() => navigate('/checkout')}>Continuar con el pago →</button>
        </div>
      )}
    </div>
  );
}