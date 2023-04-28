"use client";

import getStripe from "@/utils/get-stripejs";
import { useState } from "react";

const CheckoutForm = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    setLoading(true);

    // Criar sessão de checkout
    const response = await fetch("/api/checkout_sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    // Erro se não retornar a sessão de checkout
    if (response.status !== 200) {
      console.error(await response.text());
      return;
    }

    // Inicializa o stripe
    const stripe = await getStripe();
    // Extrai o id da sessão de checkout e redireciona para o checkout
    const { id } = await response.json();

    // Redireciona para o checkout
    const { error } = await stripe!.redirectToCheckout({
      sessionId: id,
    });

    console.warn(error.message);

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <button
        className="mt-8 px-4 py-2 text-white bg-blue-500 rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        type="submit"
        disabled={loading}
      >
        Ativar conta
      </button>
    </form>
  );
};

export default CheckoutForm;
