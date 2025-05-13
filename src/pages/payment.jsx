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

  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CashOnDelivery");
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
      setPhoneNumber(profileData.phoneNumber || "");
      setAddress(profileData.firstName || "");
    } else {
      setPhoneNumber("");
      setAddress("");
    }
  }, [sendToMyself, profileData]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/customers/me", {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Unauthorized");

      const data = await res.json();
      const profilePicPath = data.profile_pic
        ? `http://localhost:8000${data.profile_pic}`
        : "http://localhost:8000/uploads/user.png";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address || !phoneNumber) {
      alert("Please fill in all delivery details.");
      return;
    }

    if (!user || !user._id) {
      alert("User not logged in properly!");
      return;
    }

    if (paymentMethod === "CashOnDelivery") {
      savePaymentDetails(
        {
          customer: user?._id,
          address,
          phone_number: phoneNumber,
          payment_amount: total,
          payment_type: paymentMethod,
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
                cart_items: cartItems.map((item) => ({
                  meal_id: item.meal,
                  meal_name: item.meal_name,
                  meal_price: item.meal_price,
                  quantity: item.quantity,
                  total_price: item.total_price,
                })),
                order_received_date: new Date(),
              });
              alert("Order placed successfully! Cash on Delivery selected.");
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
    } else if (paymentMethod === "CardPayment") {
      navigate(ROUTES.CARDPAYMENT, {
        state: {
          customer: user?._id,
          address,
          phone_number: phoneNumber,
          payment_amount: total,
          payment_type: paymentMethod,
          cart_items: cartItems,
        },
      });
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-10"
      style={{ backgroundImage: `url(${paymentBg})` }}
    >
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

        <div className="flex flex-raw gap-2 pb-5">
          <label className="flex items-center gap-3 text-green-900">
            <input
              type="checkbox"
              checked={isGift}
              onChange={() => setIsGift(!isGift)}
              disabled={sendToMyself}
            />
            Send as a Gift
          </label>
          <label className="flex items-center gap-3 text-green-900">
            <input
              type="checkbox"
              checked={sendToMyself}
              onChange={() => setSendToMyself(!sendToMyself)}
              disabled={isGift}
            />
            Send to Myself
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-green-700 mb-2">
              Delivery Information
            </h2>
            <textarea
              className="w-full p-3 border border-green-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder=" Enter Receiver's Name...
                            Enter Delivery Address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div>
            <input
              type="tel"
              className="w-full p-3 border border-green-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder=" Enter phone number..."
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-green-700 mb-2">
              Payment Method
            </h2>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 text-green-900">
                <input
                  type="radio"
                  value="CashOnDelivery"
                  checked={paymentMethod === "CashOnDelivery"}
                  onChange={() => setPaymentMethod("CashOnDelivery")}
                />
                Cash on Delivery
              </label>
              <label className="flex items-center gap-3 text-green-900">
                <input
                  type="radio"
                  value="CardPayment"
                  checked={paymentMethod === "CardPayment"}
                  onChange={() => setPaymentMethod("CardPayment")}
                />
                Card Payment
              </label>
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
