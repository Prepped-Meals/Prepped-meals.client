export const END_POINTS = {
  GET_CARD_DETAILS: "api/get-payment-card",
  SAVE_CARD_DETAILS: "api/card-details/add-payment-card",
  SAVE_PAYMENT_DETAILS: "api/payments/add-payment",
  SAVE_CUSTOMER_DETAILS: "api/customers/register",
  GET_CUSTOMER_DETAILS: "api/customers",
  SAVE_MEAL_DETAILS: "api/create-meals",
  GET_MEAL_DETAILS: "api/get-meals/get",
  SAVE_CART_DETAILS: "api/cart/add-to-cart" ,
  UPDATE_CART_DETAILS: (cart_id) => `api/cart/update-cart/${cart_id}`, 
  DELETE_CART_DETAILS: (cart_id) => `api/cart/delete-cart/${cart_id}`, 
  UPDATE_MEAL: "api/create-meals",
  DELETE_MEAL: "api/create-meals",
  UPDATE_CARD_DETAILS: (cardId) =>
    `api/card-details/update-payment-card/${cardId}`,
  DELETE_CARD_DETAILS: (cardId) =>
    `api/card-details/delete-payment-card/${cardId}`,
  GET_ORDER_DETAILS:`api/orders/get-all-orders`,
  SAVE_ORDER_DETAILS: "api/orders/add-order",
  GET_PAYMENT_REPORT: "api/payments/weekly-report",
};
