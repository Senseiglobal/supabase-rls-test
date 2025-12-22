export default async function handler(req: any, res: any) {
  // Support both GET (for redirect from PayPal) and POST (for API call)
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { orderId } = req.query || req.body;

    console.log("PayPal payment cancelled for order:", orderId);

    return res.status(200).json({
      success: false,
      error: "Payment was cancelled by user",
      code: "PAYMENT_CANCELLED",
      orderId,
      message: "You cancelled the PayPal payment. You can try again when you're ready.",
      redirectUrl: "/checkout",
    });
  } catch (error) {
    console.error("PayPal cancel handler error:", error);

    return res.status(500).json({
      success: false,
      error: "Error processing cancellation",
      code: "CANCEL_HANDLER_ERROR",
    });
  }
}
