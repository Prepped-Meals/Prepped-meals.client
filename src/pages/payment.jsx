import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/paths";
import { CartContext } from "../context/cartContext";
import { useSavePaymentDetails } from "../hooks/useSavePaymentDetails.js";
import paymentBg from "../assets/images/paymentBg.jpg";
import { useAuth } from "../context/authContext";
import { useSaveOrderDetails } from "../hooks/useSaveOrder.js";

const Payment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mutate: savePaymentDetails } = useSavePaymentDetails();
  const { mutate: saveOrderDetails } = useSaveOrderDetails();

  const [errors, setErrors] = useState({
    address: "",
    phoneNumber: "",
    paymentMethod: "",
  });
  const [checkboxError, setCheckboxError] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isGift, setIsGift] = useState(false);
  const [sendToMyself, setSendToMyself] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
  });
  const { subtotal, deliveryFee, total, cartItems } = useContext(CartContext);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (sendToMyself) {
      const autoPhone = profileData.phoneNumber || "";
      const autoAddress = profileData.firstName || "";

      setPhoneNumber(autoPhone);
      setAddress(autoAddress);

      setErrors((prev) => ({
        ...prev,
        phoneNumber: /^\d{10}$/.test(autoPhone) ? "" : prev.phoneNumber,
      }));
    } else {
      setPhoneNumber("");
      setAddress("");

      setErrors((prev) => ({
        ...prev,
        phoneNumber: "",
        address: "",
      }));
    }
  }, [sendToMyself, profileData]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/customers/me", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Unauthorized");

      const data = await res.json();
      setProfileData({
        firstName: data.f_name || "",
        lastName: data.l_name || "",
        phoneNumber: data.contact_no || "",
        email: data.email || "",
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err.message);
    }
  };

  const validateInputs = () => {
    let valid = true;
    const newErrors = {
      address: "",
      phoneNumber: "",
      paymentMethod: "",
    };
    setCheckboxError(false);

    if (!isGift && !sendToMyself) {
      setCheckboxError(true);
      valid = false;
    }

    const hasLetter = /[a-zA-Z]/.test(address);
    const hasNumber = /\d/.test(address);
    if (!address.trim() || !(hasLetter && hasNumber)) {
      newErrors.address = "Address required";
      valid = false;
    } else if (address.length < 10) {
      newErrors.address = "Address must be valid address";
      valid = false;
    }

    if (!/^\d{10}$/.test(phoneNumber) || /^0+$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Enter a valid 10-digit phone number";
      valid = false;
    }

    const allowedMethods = ["CashOnDelivery", "CardPayment"];
    if (!allowedMethods.includes(paymentMethod)) {
      newErrors.paymentMethod = "Invalid payment method selected";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    if (!user || !user._id) {
      alert("User not logged in properly!");
      return;
    }

    if (paymentMethod === "CashOnDelivery") {
      setShowConfirmation(true);
    } else if (paymentMethod === "CardPayment") {
      navigate(ROUTES.CARDPAYMENT, {
        state: {
          customer: user._id,
          address,
          phone_number: phoneNumber,
          payment_amount: total,
          payment_type: paymentMethod,
          cart_items: cartItems,
        },
      });
    }
  };

  const confirmOrder = async () => {
    setShowConfirmation(false);
    try {
      savePaymentDetails(
        {
          customer: user._id,
          address,
          phone_number: phoneNumber,
          payment_amount: total,
          payment_type: paymentMethod,
        },
        {
          onSuccess: async (responseData) => {
            try {
              await saveOrderDetails({
                customer: user._id,
                payment: responseData.data._id,
                cart_items: cartItems.map((item) => ({
                  meal_id: item.meal,
                  meal_name: item.meal_name,
                  meal_price: item.meal_price,
                  quantity: item.quantity,
                  total_price: item.total_price,
                })),
                order_received_date: new Date(),
              });
              setShowSuccess(true);
              setTimeout(() => {
                setShowSuccess(false);
                navigate(ROUTES.ORDER);
              }, 2000);
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
      console.error("Error:", error);
      alert("An error occurred: " + error.message);
    }
  };

  const cancelOrder = () => {
    setShowConfirmation(false);
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-10"
      style={{ backgroundImage: `url(${paymentBg})` }}
    >
      {/* Confirmation Popup */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold text-green-800 mb-4">
              Confirm Order
            </h3>
            <p className="mb-6">Are you sure you want to place this order?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelOrder}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                No
              </button>
              <button
                onClick={confirmOrder}
                className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full text-center">
            <h3 className="text-xl font-bold text-green-800 mb-4">
              Order Placed Successfully!
            </h3>
            <p className="mb-4">Your order has been placed successfully.</p>
            <div className="animate-pulse text-green-600">
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
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 to-black/60 backdrop-blur-sm z-0" />
      <div className="relative z-10 bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-10 max-w-2xl w-full">
        <button
          onClick={() => navigate(ROUTES.CART)}
          className="mb-6 text-sm font-medium text-green-700 hover:text-green-900 transition"
        >
          ← Back to Cart
        </button>

        <h1 className="text-4xl font-extrabold text-green-800 mb-6 text-center">
          Checkout & Payment
        </h1>

        <div className="flex flex-row gap-6 pb-5">
          {/* Gift Checkbox */}
          <label className="relative flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={isGift}
              onChange={() => {
                const newIsGift = !isGift;
                setIsGift(newIsGift);
                if (newIsGift) setSendToMyself(false);
                setCheckboxError(false);
              }}
              disabled={sendToMyself}
              className="sr-only peer" // Hide default checkbox
            />
            <div
              className={`
      w-5 h-5 rounded-md border-2 transition-all duration-200
      ${
        sendToMyself
          ? "border-gray-300 bg-gray-100"
          : "border-green-600 group-hover:border-green-700"
      }
      ${isGift ? "bg-green-600 border-green-600" : "bg-white"}
      flex items-center justify-center
    `}
            >
              {isGift && (
                <svg
                  className="w-3 h-3 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span
              className={`
      text-sm font-medium transition-colors
      ${
        sendToMyself
          ? "text-gray-400"
          : "text-green-700 group-hover:text-green-800"
      }
    `}
            >
              Send as a Gift
            </span>
          </label>

          {/* Myself Checkbox */}
          <label className="relative flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={sendToMyself}
              onChange={() => {
                const newSendToMyself = !sendToMyself;
                setSendToMyself(newSendToMyself);
                if (newSendToMyself) setIsGift(false);
                setCheckboxError(false);
              }}
              disabled={isGift}
              className="sr-only peer" // Hide default checkbox
            />
            <div
              className={`
      w-5 h-5 rounded-md border-2 transition-all duration-200
      ${
        isGift
          ? "border-gray-300 bg-gray-100"
          : "border-green-600 group-hover:border-green-700"
      }
      ${sendToMyself ? "bg-green-600 border-green-600" : "bg-white"}
      flex items-center justify-center
    `}
            >
              {sendToMyself && (
                <svg
                  className="w-3 h-3 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span
              className={`
      text-sm font-medium transition-colors
      ${isGift ? "text-gray-400" : "text-green-700 group-hover:text-green-800"}
    `}
            >
              Send to Myself
            </span>
          </label>
        </div>
        {checkboxError && (
          <p className="text-sm text-red-600 mb-3">
            Please select either "Send as a Gift" or "Send to Myself"
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-green-700 mb-6">
              Delivery Information
            </h2>
            <label className="block text-sm font-medium text-green-700 mb-1">
              Recipient Name & Address <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-1 font-semibold">
              Example: Dulen, 123 Main St, Colombo
            </p>
            <input
              type="text"
              disabled={!isGift && !sendToMyself}
              className="w-full p-3 border border-green-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-green-400"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setErrors((prev) => ({ ...prev, address: "" }));
              }}
              required
            />
            {errors.address && (
              <p className="text-sm text-red-600 mt-1">{errors.address}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-green-700 mb-1">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600 mb-1 font-semibold">
              Example: 0771234567
            </p>
            <input
              type="tel"
              disabled={!isGift && !sendToMyself}
              className="w-full p-3 border border-green-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-green-400"
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,10}$/.test(value)) {
                  setPhoneNumber(value);
                  setErrors((prev) => ({ ...prev, phoneNumber: "" }));
                }
              }}
              required
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-green-700 mb-2">
              Payment Method <span className="text-red-500">*</span>
            </h2>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 text-green-900">
                <input
                  type="radio"
                  value="CashOnDelivery"
                  checked={paymentMethod === "CashOnDelivery"}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setErrors((prev) => ({ ...prev, paymentMethod: "" }));
                  }}
                />
                Cash on Delivery
              </label>
              <label className="flex items-center gap-3 text-green-900">
                <input
                  type="radio"
                  value="CardPayment"
                  checked={paymentMethod === "CardPayment"}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setErrors((prev) => ({ ...prev, paymentMethod: "" }));
                  }}
                />
                Card Payment
              </label>
              {errors.paymentMethod && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.paymentMethod}
                </p>
              )}
            </div>
          </div>

          <div className="bg-green-100 rounded-xl p-5 shadow-md">
            <p className="text-green-800">
              Subtotal:{" "}
              <span className="font-medium">Rs {subtotal.toFixed(2)}</span>
            </p>
            <p className="text-green-800">
              Delivery Fee:{" "}
              <span className="font-medium">Rs {deliveryFee.toFixed(2)}</span>
            </p>
            <p className="text-green-900 font-bold text-lg mt-2">
              Total: Rs {total.toFixed(2)}
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition-all duration-300"
          >
            Confirm & Proceed
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;
