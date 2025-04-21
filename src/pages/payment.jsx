import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/paths";
import { CartContext } from "../context/cartContext";
import { useSavePaymentDetails } from "../hooks/useSavePaymentDetails.js";
import paymentBg from "../assets/images/paymentBg.jpg";


const Payment = () => {
  const navigate = useNavigate();
  const { cartItems } = useContext(CartContext);
  const {
    mutate: savePaymentDetails,
    isLoading,
    isError,
    error,
  } = useSavePaymentDetails();
  // Delivery Info States
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState("CashOnDelivery");

  // Dummy Total (Ideally, should be passed via props/context)
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const deliveryFee = 300;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address || !phoneNumber) {
      alert("Please fill in all delivery details.");
      return;
    }

    if (paymentMethod === "CashOnDelivery") {
      try {
        await savePaymentDetails({
          customer: "64f0d2a5c6c12345abc67890", // Replace with dynamic customer if needed
          address: address,
          phone_number: phoneNumber,
          payment_amount: total,
          payment_type: paymentMethod,
        });
        alert("Order placed successfully! Cash on Delivery selected.");
        navigate(ROUTES.HOME);
      } catch (error) {
        alert("Error placing order: " + error.message);
      }
    } else if (paymentMethod === "CardPayment") {
      navigate(ROUTES.CARDPAYMENT, {
        state: {
          customer: "64f0d2a5c6c12345abc67890", // Replace dynamically if needed
          address,
          phone_number: phoneNumber,
          payment_amount: total,
          payment_type: paymentMethod,
        },
      });
    }
  };

  return (

    <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center p-8"
         style={{ backgroundImage: `url(${paymentBg})` }}
     >

    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      {/* Back to Cart Button */}
      <button
        onClick={() => navigate(ROUTES.CART)}
        className="self-start mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        ← Back to Cart
      </button>

      <h1 className="text-4xl font-bold mb-4 text-green-700">Payment Page</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-green-50 p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-4 text-green-800">
          Delivery Information
        </h2>

        <div className="mb-4">
          <label className="block mb-2 text-green-900">Address:</label>
          <textarea
            className="w-full p-2 border border-green-300 rounded"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-green-900">Phone Number:</label>
          <input
            type="tel"
            className="w-full p-2 border border-green-300 rounded"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>

        <h2 className="text-xl font-semibold mb-4 text-green-800">
          Select Payment Method:
        </h2>

        <div className="mb-4 flex flex-col space-y-2">
          <label className="flex items-center text-green-900">
            <input
              type="radio"
              value="CashOnDelivery"
              checked={paymentMethod === "CashOnDelivery"}
              onChange={() => setPaymentMethod("CashOnDelivery")}
              className="mr-2"
            />
            Cash on Delivery
          </label>
          <label className="flex items-center text-green-900">
            <input
              type="radio"
              value="CardPayment"
              checked={paymentMethod === "CardPayment"}
              onChange={() => setPaymentMethod("CardPayment")}
              className="mr-2"
            />
            Card Payment
          </label>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <p className="text-green-800 mb-2">
            Subtotal: Rs {subtotal.toFixed(2)}
          </p>
          <p className="text-green-800 mb-2">
            Delivery Fee: Rs {deliveryFee.toFixed(2)}
          </p>
          <p className="font-bold text-green-900 text-lg">
            Total: Rs {total.toFixed(2)}
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition"
        >
          Confirm & Proceed
        </button>
      </form>
    </div>
    </div>
  );
};

export default Payment;
