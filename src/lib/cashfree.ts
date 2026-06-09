export interface CheckoutOptions {
  amountInRupees: number; // Cashfree uses exact currency amount (rupees), not paise
  name: string;
  description: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: (response: any) => void;
  onError?: (error: any) => void;
  onClose?: () => void;
}

export function loadCashfreeScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Cashfree) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openCashfreeCheckout(options: CheckoutOptions) {
  const loaded = await loadCashfreeScript();
  if (!loaded) {
    if (options.onError) options.onError(new Error("Cashfree SDK failed to load. Are you offline?"));
    return;
  }

  try {
    // Call backend to create order and get payment session ID
    const response = await fetch('/api/cashfree/create-order/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_amount: options.amountInRupees,
        customer_name: options.customerName || "Customer",
        customer_email: options.customerEmail || "akdigitalhubudt@gmail.com",
        customer_phone: options.customerPhone || "9363351084",
        order_note: options.description
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create order: ${await response.text()}`);
    }

    const orderData = await response.json();
    if (!orderData.payment_session_id) {
      throw new Error("No payment session ID returned from server.");
    }

    const cashfree = window.Cashfree({
      mode: "production" // or "sandbox"
    });

    const checkoutOptions = {
      paymentSessionId: orderData.payment_session_id,
      redirectTarget: "_modal",
    };

    cashfree.checkout(checkoutOptions).then((result: any) => {
      if (result.error) {
        // This will be true whenever user closes the modal or if any error happens
        if (result.error.message === "Payment cancelled by user" && options.onClose) {
            options.onClose();
        } else if (options.onError) {
            options.onError(result.error);
        }
      }
      if (result.paymentDetails) {
        // This will be called whenever the payment is completed successfully
        options.onSuccess(result.paymentDetails);
      }
    });

  } catch (error) {
    if (options.onError) options.onError(error);
  }
}

declare global {
  interface Window {
    Cashfree: any;
  }
}
