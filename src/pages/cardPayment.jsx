import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/paths";
import { useSaveCardDetails } from "../hooks/useSaveCardDetails.js";
import { useLocation } from "react-router-dom";
import { useSavePaymentDetails } from "../hooks/useSavePaymentDetails.js";

const CardPayment = () => {
  const navigate = useNavigate();
  const saveCardDetails = useSaveCardDetails();
  const location = useLocation();
  const paymentDetails = location.state || {};

  const { mutate: savePaymentDetails } = useSavePaymentDetails();

  console.log("Payment Details", paymentDetails);
  // Input fields state
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  console.log("cardHolderName", cardHolderName);
  console.log("cardNumber", cardNumber);
  console.log("expiryDate", expiryDate);
  console.log("cvv", cvv);

  // Track if card is saved
  const [isCardSaved, setIsCardSaved] = useState(false);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cardHolderName && cardNumber && expiryDate && cvv) {
      try {
        await saveCardDetails.mutateAsync({
          customer: "64f0d2a5c6c12345abc67890", // Replace with dynamic customer if needed
          cardholder_name: cardHolderName,
          card_number: cardNumber,
          cvv: cvv,
          exp_date: expiryDate,
        });

        alert("Payment Successful! Card details saved.");
        setIsCardSaved(true); // Disable inputs and show confirm button
      } catch (error) {
        alert("Error saving card details: " + error.message);
      }
    } else {
      alert("Please fill in all payment details.");
    }
  };

  // Confirm Payment button handler
  const handleConfirmPayment = async () => {
    try {
      await savePaymentDetails({
        customer: "64f0d2a5c6c12345abc67890", // Replace with dynamic customer if needed
        address: paymentDetails?.address, // Ensure these fields are not undefined
        phone_number: paymentDetails?.phone_number,
        payment_amount: paymentDetails?.payment_amount,
        payment_type: paymentDetails?.payment_type,
        card_details:
          paymentDetails?.payment_type === "CardPayment"
            ? {
                cardholder_name: cardHolderName || "", // Provide default values if needed
                card_number: cardNumber || "",
                cvv: cvv || "",
                exp_date: expiryDate || "",
              }
            : undefined, // Send undefined for "CashOnDelivery"
      });
      alert("Order placed successfully! Cash on Delivery selected.");
      navigate(ROUTES.HOME);
    } catch (error) {
      alert("Error placing order: " + error.message);
    }
    alert("Payment Confirmed!");
    navigate(ROUTES.PAYMENTSUCCESS); // Adjust route as needed
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-6 text-green-700">Card Payment</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg"
      >
        {/* Card Holder Name */}
        <div className="mb-6">
          <label className="block mb-2 text-gray-700 font-semibold">
            Card Holder Name:
          </label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={cardHolderName}
            onChange={(e) => setCardHolderName(e.target.value)}
            required
            placeholder="John Doe"
            disabled={isCardSaved}
          />
        </div>

        {/* Card Number */}
        <div className="mb-6">
          <label className="block mb-2 text-gray-700 font-semibold">
            Card Number:
          </label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            required
            placeholder="1234-5678-9101-1121"
            disabled={isCardSaved}
          />
        </div>

        {/* Expiry Date and CVV */}
        <div className="mb-6 flex space-x-4">
          <div className="w-1/2">
            <label className="block mb-2 text-gray-700 font-semibold">
              Expiry Date:
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
              placeholder="MM/YY"
              disabled={isCardSaved}
            />
          </div>

          <div className="w-1/2">
            <label className="block mb-2 text-gray-700 font-semibold">
              CVV:
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              required
              placeholder="123"
              disabled={isCardSaved}
            />
          </div>
        </div>

        {/* Buttons Section */}
        {!isCardSaved ? (
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={saveCardDetails.isLoading}
          >
            {saveCardDetails.isLoading ? "Processing..." : "Save Card Details"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleConfirmPayment}
            className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-1000 transition focus:outline-none focus:ring-2 focus:ring-green-800"
          >
            Confirm Payment
          </button>
        )}
      </form>
    </div>
  );
};

export default CardPayment;
