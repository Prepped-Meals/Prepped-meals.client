import { useState, useEffect } from "react";
import axios from "axios";

const useGetPaymentDetails = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/payments/weekly-report");
        setData(response.data.data);
      } catch (err) {
        setError("Failed to fetch payment report");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, []);

  return { loading, data, error };
};

export default useGetPaymentDetails;
