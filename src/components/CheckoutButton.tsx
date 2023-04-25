"use client";

const CheckoutButton = () => {
  const handleSubmit = async () => {
    const response = await fetch("/api/checkout_sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    console.log(response);
  };

  return (
    <button
      className="mt-8 px-4 py-2 text-white bg-blue-500 rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      onClick={handleSubmit}
    >
      Ativar conta
    </button>
  );
};

export default CheckoutButton;
