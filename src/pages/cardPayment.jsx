import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../routes/paths";
import { useSaveCardDetails } from "../hooks/useSaveCardDetails";
import { useSavePaymentDetails } from "../hooks/useSavePaymentDetails";
import { useAuth } from "../context/authContext";
import { useEditCardDetails } from "../hooks/useEditCardDetails";
import { useDeleteCardDetails } from "../hooks/useDeleteCardDetails";
import { FaCreditCard, FaUser, FaCalendarAlt, FaLock, FaTimes } from "react-icons/fa";
import { useSaveOrderDetails } from "../hooks/useSaveOrder.js";
import CardSec from "../assets/images/CardPayment.png";
import Visa from "../assets/images/visa-logo.png";
import MasterCard from "../assets/images/master-card.png";
import Amex from "../assets/images/american-express.png";
import PaymentGatewayBG from "../assets/images/paymentBg.jpg";

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

  // Popup states
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showOrderConfirm, setShowOrderConfirm] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState({ text: "", isSuccess: true });

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
      const expiry = new Date(2000 + year, month - 1);
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

  const handleSaveClick = (e) => {
    e.preventDefault();
    if (!validateFields()) return;
    setShowSaveConfirm(true);
  };

  const confirmSaveCard = async () => {
    setShowSaveConfirm(false);
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
          showMessageWithStatus("Card details saved successfully!", true);
          setIsCardSaved(true);
        },
        onError: (error) => {
          showMessageWithStatus("Invalid Card Number. Please Check Again", false);
        },
      }
    );
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleEditSaveClick = () => {
    if (!validateFields()) return;
    setShowEditConfirm(true);
  };

  const confirmEditCard = async () => {
    setShowEditConfirm(false);
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

      showMessageWithStatus("Card details updated successfully!", true);
      setIsEditing(false);

      localStorage.setItem(
        "savedCard",
        JSON.stringify({
          cardDetails: { ...updatedCardData, _id: savedCard?.cardDetails._id },
        })
      );
    } catch (error) {
      showMessageWithStatus("Error updating card details: " + error.message, false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCard = async () => {
    setShowDeleteConfirm(false);
    const savedCard = JSON.parse(localStorage.getItem("savedCard"));
    try {
      await deleteCardDetails(savedCard?.cardDetails._id);
      showMessageWithStatus("Card details deleted successfully!", true);
      setCardHolderName("");
      setCardNumber("");
      setCvv("");
      setExpiryDate("");
      setIsCardSaved(false);
      setIsEditing(false);
    } catch (error) {
      showMessageWithStatus("Error deleting card details: " + error.message, false);
    }
  };

  const handleConfirmPaymentClick = () => {
    setShowOrderConfirm(true);
  };

  const confirmOrder = async () => {
    setShowOrderConfirm(false);
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
              showMessageWithStatus("Order placed successfully!", true);
              setTimeout(() => navigate(ROUTES.ORDER), 2000);
            } catch (orderError) {
              showMessageWithStatus("Error saving order: " + orderError.message, false);
            }
          },
          onError: (error) => {
            showMessageWithStatus("Error placing payment: " + error.message, false);
          },
        }
      );
    } catch (error) {
      showMessageWithStatus("Unexpected error: " + error.message, false);
    }
  };

  const showMessageWithStatus = (text, isSuccess) => {
    setMessage({ text, isSuccess });
    setShowMessage(true);
  };

  const closeMessage = () => {
    setShowMessage(false);
  };

  const isInputDisabled = isCardSaved && !isEditing;

  // Popup component
  const Popup = ({ show, title, message, onConfirm, onCancel, confirmText = "Yes", cancelText = "No" }) => {
    if (!show) return null;
    
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={(e) => e.target === e.currentTarget && onCancel()}
      >
        <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
          <h3 className="text-xl font-bold text-green-800 mb-4">{title}</h3>
          <p className="mb-6">{message}</p>
          <div className="flex justify-end gap-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Message component
  const Message = ({ show, message, isSuccess, onClose }) => {
    if (!show) return null;
    
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full text-center">
          <h3 className="text-xl font-bold text-green-800 mb-4">
            {isSuccess ? "Success!" : "Error"}
          </h3>
          <p className="mb-4">{message}</p>
          <div className={`animate-pulse ${isSuccess ? "text-green-600" : "text-red-600"}`}>
            {isSuccess ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <FaTimes className="h-12 w-12 mx-auto" />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen p-6"
      style={{ 
        backgroundImage: `url(${PaymentGatewayBG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Confirmation Popups */}
      <Popup
        show={showSaveConfirm}
        title="Confirm Save"
        message="Are you sure you want to save these card details?"
        onConfirm={confirmSaveCard}
        onCancel={() => setShowSaveConfirm(false)}
      />
      
      <Popup
        show={showEditConfirm}
        title="Confirm Edit"
        message="Are you sure you want to update these card details?"
        onConfirm={confirmEditCard}
        onCancel={() => setShowEditConfirm(false)}
      />
      
      <Popup
        show={showDeleteConfirm}
        title="Confirm Delete"
        message="Are you sure you want to delete these card details?"
        onConfirm={confirmDeleteCard}
        onCancel={() => setShowDeleteConfirm(false)}
      />
      
      <Popup
        show={showOrderConfirm}
        title="Confirm Order"
        message="Do you want to place this order?"
        onConfirm={confirmOrder}
        onCancel={() => setShowOrderConfirm(false)}
      />
      
      {/* Message Popup */}
      <Message
        show={showMessage}
        message={message.text}
        isSuccess={message.isSuccess}
        onClose={closeMessage}
      />

      <div className="w-full max-w-xl mb-6">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          {/* Payment Gateway Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center space-x-4 mb-4">
              <img src={Visa} alt="Visa" className="h-8" />
              <img src={MasterCard} alt="MasterCard" className="h-8" />
              <img src={Amex} alt="American Express" className="h-8" />
            </div>
            <div className="flex items-center justify-center space-x-3">
              <img src={CardSec} alt="Secure Payment" className="h-10 w-10" />
              <h1 className="text-3xl font-bold text-green-800">
                Secure Payment Gateway
              </h1>
            </div>
            <p className="text-gray-600 mt-2">
              Safe and secure payment processing
            </p>
          </div>

          {/* Card Preview */}
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-green-600 to-green-800 text-white shadow-lg transform transition duration-300 hover:scale-[1.02]">
            <div className="flex justify-between items-start">
              <div className="text-sm uppercase tracking-wider">Card Preview</div>
              <div className="text-xs bg-white/20 px-2 py-1 rounded">
                {cardNumber.startsWith('4') ? 'VISA' : 
                 cardNumber.startsWith('5') ? 'MASTERCARD' : 
                 cardNumber.startsWith('3') ? 'AMEX' : 'CARD'}
              </div>
            </div>
            <div className="mt-6 text-2xl font-bold tracking-wider">
              {cardNumber || "•••• •••• •••• ••••"}
            </div>
            <div className="flex justify-between mt-8">
              <div>
                <div className="text-xs opacity-80">Card Holder</div>
                <div className="font-medium uppercase tracking-wider">
                  {cardHolderName || "YOUR NAME"}
                </div>
              </div>
              <div>
                <div className="text-xs opacity-80">Expiry</div>
                <div className="font-medium tracking-wider">
                  {expiryDate || "MM/YY"}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveClick} className="space-y-6">
            {/* Card Holder Name */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
                Enter Card Details
              </h3>
              <label className="block mb-2 font-medium text-gray-700">
                Card Holder Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  <div className="text-sm text-red-600 mt-1">
                    {cardHolderNameError}
                  </div>
                )}
              </div>
            </div>

            {/* Card Number */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Card Number
              </label>
              <div className="relative">
                <FaCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  <div className="text-sm text-red-600 mt-1">
                    {cardNumberError}
                  </div>
                )}
              </div>
            </div>

            {/* Expiry & CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Expiry Date
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    <div className="text-sm text-red-600 mt-1">
                      {expiryDateError}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  CVV
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    <div className="text-sm text-red-600 mt-1">
                      {cvvError}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              {isCardSaved ? (
                <>
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={handleEditSaveClick}
                      className="w-full py-3 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-semibold transition shadow-md"
                    >
                      Save Changes
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleEditClick}
                      className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition shadow-md"
                    >
                      Edit Card Details
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition shadow-md"
                  >
                    Delete Card Details
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition shadow-md"
                >
                  Save Card Details
                </button>
              )}

              {/* Confirm Payment */}
              {isCardSaved && !isEditing && (
                <button
                  type="button"
                  onClick={handleConfirmPaymentClick}
                  className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow-md"
                >
                  Confirm Payment
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CardPayment;