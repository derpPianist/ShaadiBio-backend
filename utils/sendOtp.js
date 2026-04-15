import axios from "axios";

export default async function sendOtp(otp, phone_number) {
  try {
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q",
        //sender_id: "SHAADI",
        message: `Your OTP is ${otp}`,
        language: "english",
        numbers: `91${phone_number}`,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
        },
        timeout: 5000,
      },
    );

    console.log("Response success: ", response.data);
    console.log("DATA:", response.data);
    console.log("TYPE:", typeof response.data);
    return response.data;
  } catch (error) {
    console.error("Error in sendOtp: ", error);
    console.error("ERROR MESSAGE:", error.message);
    console.error("ERROR STATUS:", error.response?.status);
    console.error("ERROR DATA:", error.response?.data);
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
}
