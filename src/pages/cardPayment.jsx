import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../routes/paths";
import { useSaveCardDetails } from "../hooks/useSaveCardDetails";
import { useSavePaymentDetails } from "../hooks/useSavePaymentDetails";
import { useAuth } from "../context/authContext";
import { useEditCardDetails } from "../hooks/useEditCardDetails";
import { useDeleteCardDetails } from "../hooks/useDeleteCardDetails";
import { FaCreditCard, FaUser, FaCalendarAlt, FaLock } from "react-icons/fa";
import { useSaveOrderDetails } from "../hooks/useSaveOrder.js";
import CardSec from "../assets/images/CardPayment.png";
import Visa from "../assets/images/visa-logo.png";
import MasterCard from "../assets/images/master-card.png";
import Amex from "../assets/images/american-express.png";

const CardPayment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const paymentDetails = location.state || {};

  const { mutate: saveCardDetails } = useSaveCardDetails();
  const { mutate: savePaymentDetails } = useSavePaymentDetails();
  const { mutate: editCardDetails } = useEditCardDetails();
  const { mutate: deleteCardDetails } = useDeleteCardDetails();
  const { mutate: saveOrderDetails } = useSaveOrderDetails();

  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isCardSaved, setIsCardSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [cardHolderNameError, setCardHolderNameError] = useState("");
  const [cardNumberError, setCardNumberError] = useState("");
  const [expiryDateError, setExpiryDateError] = useState("");
  const [cvvError, setCvvError] = useState("");

  const handleSaveCard = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    if (cardHolderName && cardNumber && expiryDate && cvv) {
      saveCardDetails(
        {
          customer: user?._id,
          cardholder_name: cardHolderName,
          card_number: cardNumber.replace(/\s+/g, ""),
          cvv,
          exp_date: expiryDate,
        },
        {
          onSuccess: (data) => {
            localStorage.setItem("savedCard", JSON.stringify(data.data));
            alert("Card details saved.");
            setIsCardSaved(true);
          },
          onError: (error) => {
            alert("Invalid Card Number . PLease Check Again");
          },
        }
      );
    } else {
      alert("Please fill in all Card details.");
    }
  };

  const validateFields = () => {
    let isValid = true;

    if (!cardHolderName.trim()) {
      setCardHolderNameError("Cardholder name is required.");
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(cardHolderName.trim())) {
      setCardHolderNameError("Cardholder name must contain only letters.");
      isValid = false;
    } else {
      setCardHolderNameError("");
    }

    if (!/^\d{4} \d{4} \d{4} \d{4}$/.test(cardNumber)) {
      setCardNumberError("Invalid card number format.");
      isValid = false;
    } else {
      setCardNumberError("");
    }

    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      setExpiryDateError("Expiry date must be in MM/YY format.");
      isValid = false;
    } else {
      const [month, year] = expiryDate.split("/").map(Number);
      const expiry = new Date(2000 + year, month - 1); // assuming year is 2-digit like 25 = 2025
      const now = new Date();

      if (month < 1 || month > 12) {
        setExpiryDateError("Invalid expiry month.");
        isValid = false;
      } else if (expiry < new Date(now.getFullYear(), now.getMonth())) {
        setExpiryDateError("Expiry date must be a future date.");
        isValid = false;
      } else {
        setExpiryDateError("");
      }
    }

    if (!/^\d{3}$/.test(cvv)) {
      setCvvError("CVV must be exactly 3 digits.");
      isValid = false;
    } else {
      setCvvError("");
    }

    return isValid;
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleEditCard = async () => {
    const savedCard = JSON.parse(localStorage.getItem("savedCard"));

    const updatedCardData = {
      customer: savedCard?.cardDetails?.customer,
      cardholder_name: cardHolderName?.trim(),
      card_number: cardNumber.replace(/\s+/g, ""),
      cvv: cvv?.trim(),
      exp_date: expiryDate?.trim(),
    };

    try {
      await editCardDetails({
        cardId: savedCard?.cardDetails._id,
        updatedCardData,
      });

      alert("Card details updated.");
      setIsEditing(false);

      localStorage.setItem(
        "savedCard",
        JSON.stringify({
          cardDetails: { ...updatedCardData, _id: savedCard?.cardDetails._id },
        })
      );
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert("Error updating card details: " + error.message);
    }
  };

  const handleDeleteCard = async () => {
    const savedCard = JSON.parse(localStorage.getItem("savedCard"));
    try {
      await deleteCardDetails(savedCard?.cardDetails._id);
      alert("Card details deleted.");
      setCardHolderName("");
      setCardNumber("");
      setCvv("");
      setExpiryDate("");
      setIsCardSaved(false);
      setIsEditing(false);
    } catch (error) {
      alert("Error deleting card details: " + error.message);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      await savePaymentDetails(
        {
          customer: user?._id,
          address: paymentDetails?.address,
          phone_number: paymentDetails?.phone_number,
          payment_amount: paymentDetails?.payment_amount,
          payment_type: paymentDetails?.payment_type,
          card_details:
            paymentDetails?.payment_type === "CardPayment"
              ? {
                  cardholder_name: cardHolderName,
                  card_number: cardNumber.replace(/\s+/g, ""),
                  cvv,
                  exp_date: expiryDate,
                }
              : undefined,
        },
        {
          onSuccess: async (responseData) => {
            console.log(
              "Order placed successfully! Payment Response:",
              responseData
            );

            try {
              await saveOrderDetails({
                customer: user?._id,
                payment: responseData.data._id,
                cart_items: paymentDetails.cart_items.map((item) => ({
                  meal_id: item.meal,
                  meal_name: item.meal_name,
                  meal_price: item.meal_price,
                  quantity: item.quantity,
                  total_price: item.total_price,
                })),
                order_received_date: new Date(),
              });
              alert("Order placed successfully!");
              navigate(ROUTES.ORDER);
            } catch (orderError) {
              console.error("Error saving order:", orderError);
              alert("Error saving order: " + orderError.message);
            }
          },
          onError: (error) => {
            console.error("Error placing payment:", error);
            alert("Error placing payment: " + error.message);
          },
        }
      );
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Unexpected error: " + error.message);
    }
  };

  const isInputDisabled = isCardSaved && !isEditing;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-green-200 p-6">
      <div className="w-full max-w-xl mb-6 text-center">
        <div className="flex justify-center space-x-4 mb-4">
          <img src={Visa} alt="Visa" className="h-6" />
          <img src={MasterCard} alt="MasterCard" className="h-6" />
          <img src={Amex} alt="American Express" className="h-6" />
        </div>
        <div className="flex items-center justify-center space-x-3">
          <img src={CardSec} alt="Secure Payment" className="mb-8 h-8 w-8" />
          <h1 className="mb-8 text-2xl font-bold text-green-800">
            Payment Gateway
          </h1>
        </div>

        {/* Card Preview */}
        <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-green-500 to-green-700 text-white shadow-2xl transform scale-105 transition duration-300">
          <div className="text-sm uppercase tracking-wide">Card Preview</div>
          <div className="mt-4 text-xl font-bold">
            {cardNumber || "**** **** **** ****"}
          </div>
          <div className="flex justify-between mt-4">
            <div>
              <div className="text-xs">Card Holder</div>
              <div className="font-medium">{cardHolderName || "John Doe"}</div>
            </div>
            <div>
              <div className="text-xs">Expiry</div>
              <div className="font-medium">{expiryDate || "MM/YY"}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveCard} className="space-y-6">
          {/* Card Holder Name */}
          <div>
            <hr className="my-6 border-t border-gray-300" />
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Enter Card Details
            </h3>
            <label className="block mb-1 font-semibold text-gray-700">
              Card Holder Name
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="John Doe"
                value={cardHolderName}
                onChange={(e) => {
                  const value = e.target.value;
                  setCardHolderName(value);
                  if (/^[A-Za-z\s]+$/.test(value)) {
                    setCardHolderNameError("");
                  }
                }}
                disabled={isInputDisabled}
              />
              {cardHolderNameError && (
                <div style={{ color: "red", fontSize: "12px" }}>
                  {cardHolderNameError}
                </div>
              )}
            </div>
          </div>

          {/* Card Number */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Card Number
            </label>
            <div className="relative">
              <FaCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  value = value.match(/.{1,4}/g)?.join(" ") || value;
                  setCardNumber(value);
                  if (/^\d{4} \d{4} \d{4} \d{4}$/.test(value)) {
                    setCardNumberError("");
                  }
                }}
                disabled={isInputDisabled}
              />
              {cardNumberError && (
                <div style={{ color: "red", fontSize: "12px" }}>
                  {cardNumberError}
                </div>
              )}
            </div>
          </div>

          {/* Expiry & CVV */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-700">
                Expiry Date
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length >= 3) {
                      value = value.slice(0, 2) + "/" + value.slice(2, 4);
                    }
                    setExpiryDate(value);

                    const [monthStr, yearStr] = value.split("/");
                    const month = parseInt(monthStr, 10);
                    const year = parseInt(yearStr, 10);
                    const now = new Date();
                    const expiry = new Date(2000 + year, month - 1);

                    if (
                      /^\d{2}\/\d{2}$/.test(value) &&
                      month >= 1 &&
                      month <= 12 &&
                      expiry >= new Date(now.getFullYear(), now.getMonth())
                    ) {
                      setExpiryDateError("");
                    }
                  }}
                  disabled={isInputDisabled}
                />
                {expiryDateError && (
                  <div style={{ color: "red", fontSize: "12px" }}>
                    {expiryDateError}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-700">
                CVV
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setCvv(value);
                    if (/^\d{3}$/.test(value)) {
                      setCvvError("");
                    }
                  }}
                  disabled={isInputDisabled}
                />
                {cvvError && (
                  <div style={{ color: "red", fontSize: "12px" }}>
                    {cvvError}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          {isCardSaved ? (
            <>
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleEditCard}
                  className="w-full py-3 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-semibold transition"
                >
                  Save Changes
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
                >
                  Edit Card Details
                </button>
              )}
              <button
                type="button"
                onClick={handleDeleteCard}
                className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold mt-3 transition"
              >
                Delete Card Details
              </button>
            </>
          ) : (
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
            >
              Save Card Details
            </button>
          )}

          {/* Confirm Payment */}
          {isCardSaved && !isEditing && (
            <button
              type="button"
              onClick={handleConfirmPayment}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold mt-3 transition"
            >
              Confirm Payment
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default CardPayment;
