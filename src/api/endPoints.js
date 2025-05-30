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
  DELETE_CART_MEAL: (cart_id, meal_id) => `api/cart/${cart_id}/meal/${meal_id}`,
  GET_CART_BY_CUSTOMER: (customer_id) => `api/cart/customer/${customer_id}`, 
  UPDATE_MEAL: "api/create-meals",
  DELETE_MEAL: "api/create-meals",
  UPDATE_CARD_DETAILS: (cardId) =>
    `api/card-details/update-payment-card/${cardId}`,
  DELETE_CARD_DETAILS: (cardId) =>
    `api/card-details/delete-payment-card/${cardId}`,
  GET_ORDER_DETAILS:`api/orders/get-all-orders`,
  SAVE_ORDER_DETAILS: "api/orders/add-order",
  GET_TOP_CUSTOMERS_REPORT: "api/orders/top-customers-report",
  GET_ORDER_STATUS_REPORT: "api/orders/generate-order-status-report",
  GET_PAYMENT_REPORT: "api/payments/weekly-report",
  UPDATE_ORDER_STATUS: (orderId) => `api/orders/update-status/${orderId}`,
  GET_MOVING_MEALS_BY_DATE: (startDate, endDate) =>`api/mealReports/moving-meals-by-date?startDate=${startDate}&endDate=${endDate}`,

};
