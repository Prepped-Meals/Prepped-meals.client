import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../routes/paths";
import { useSaveCardDetails } from "../hooks/useSaveCardDetails";
import { useSavePaymentDetails } from "../hooks/useSavePaymentDetails";
import { useAuth } from "../context/authContext";
import { useGetCardDetails } from "../hooks/useGetCardDetails";
import { useEditCardDetails } from "../hooks/useEditCardDetails";
import { useDeleteCardDetails } from "../hooks/useDeleteCardDetails";
import { FaCreditCard, FaUser, FaCalendarAlt, FaLock } from "react-icons/fa";

const CardPayment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const paymentDetails = location.state || {};

  const { data: cardDetails, refetch: refetchCardDetails } = useGetCardDetails(user?._id);
  const { mutate: saveCardDetails } = useSaveCardDetails();
  const { mutate: savePaymentDetails } = useSavePaymentDetails();
  const { mutate: editCardDetails } = useEditCardDetails();
  const { mutate: deleteCardDetails } = useDeleteCardDetails();

  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isCardSaved, setIsCardSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (cardDetails) {
      setCardHolderName(cardDetails.cardholder_name);
      setCardNumber(cardDetails.card_number);
      setExpiryDate(cardDetails.exp_date);
      setCvv(cardDetails.cvv);
      setIsCardSaved(true);
    }
  }, [cardDetails]);

  const handleSaveCard = async (e) => {
    e.preventDefault();

    if (cardHolderName && cardNumber && expiryDate && cvv) {
      saveCardDetails(
        {
          customer: user?._id,
          cardholder_name: cardHolderName,
          card_number: cardNumber,
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
            alert("Error saving card details: " + error.message);
          },
        }
      );
    } else {
      alert("Please fill in all Card details.");
    }
  };

  const handleEditClick = () => {
    setIsEditing(true); // Enable editing mode
  };

  const handleEditCard = async () => {
    const savedCard = JSON.parse(localStorage.getItem("savedCard"));
  
    const updatedCardData = {
      customer: savedCard?.cardDetails?.customer,
      cardholder_name: cardHolderName?.trim(),
      card_number: cardNumber?.trim(),
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
      refetchCardDetails();
  
      localStorage.setItem(
        "savedCard",
        JSON.stringify({ cardDetails: { ...updatedCardData, _id: savedCard?.cardDetails._id } })
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
      refetchCardDetails();
    } catch (error) {
      alert("Error deleting card details: " + error.message);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      await savePaymentDetails({
        customer: user?._id,
        address: paymentDetails?.address,
        phone_number: paymentDetails?.phone_number,
        payment_amount: paymentDetails?.payment_amount,
        payment_type: paymentDetails?.payment_type,
        card_details:
          paymentDetails?.payment_type === "CardPayment"
            ? {
                cardholder_name: cardHolderName,
                card_number: cardNumber,
                cvv,
                exp_date: expiryDate,
              }
            : undefined,
      });
      alert("Order placed successfully!");
      navigate(ROUTES.ORDER);
    } catch (error) {
      alert("Error placing order: " + error.message);
    }
  };

  const isInputDisabled = isCardSaved && !isEditing;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-green-100 via-white to-green-100 p-4">
      <div className="w-full max-w-xl p-8 bg-white shadow-xl rounded-2xl">
        <h2 className="text-3xl font-bold text-green-800 mb-8 text-center">Secure Card Payment</h2>

        {/* Card Preview */}
        <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg">
          <div className="text-sm uppercase tracking-wide">Card Preview</div>
          <div className="mt-4 text-xl font-bold">{cardNumber || "**** **** **** ****"}</div>
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
            <label className="block mb-1 font-semibold text-gray-700">Card Holder Name</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="John Doe"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
                disabled={isInputDisabled}
                required
              />
            </div>
          </div>

          {/* Card Number */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Card Number</label>
            <div className="relative">
              <FaCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                disabled={isInputDisabled}
                required
              />
            </div>
          </div>

          {/* Expiry & CVV */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-700">Expiry Date</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  disabled={isInputDisabled}
                  required
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-semibold text-gray-700">CVV</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  disabled={isInputDisabled}
                  required
                />
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





