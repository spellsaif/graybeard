import React, { useState } from 'react';

export function CheckoutButton({ onCheckout, label = "Pay Now" }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onCheckout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleClick} className="btn-primary">
      {loading ? "Processing..." : label}
    </button>
  );
}
