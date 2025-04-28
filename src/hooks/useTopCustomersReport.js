import { apiClient } from "../api/apiClient";
import { END_POINTS } from "../api/endPoints";

export const downloadTopCustomersReport = async () => {
  try {
    const response = await apiClient.get(END_POINTS.GET_TOP_CUSTOMERS_REPORT, {
      responseType: "blob", // important to handle PDF
    });

    // Create a blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Top_Customers_Report.pdf"); // set filename
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Failed to download the report:", error);
    alert("Failed to download report. Please try again.");
  }
};
