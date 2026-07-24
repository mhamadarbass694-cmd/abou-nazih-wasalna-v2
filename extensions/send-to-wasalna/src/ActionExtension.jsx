import "@shopify/ui-extensions/preact";
import { render } from "preact";

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  const { close, data } = shopify;

  async function send() {
  try {
    const response = await fetch("/api/send-to-wasalna", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: data.selected[0].id,
      }),
    });

    const result = await response.json();
    console.log("Response:", result);

    close();
  } catch (error) {
    console.error("Send error:", error);
  }
}

  return (
    <s-admin-action title="Send to Wasalna">
      <s-text>Order:</s-text>
      <s-text>{data.selected[0].id}</s-text>

      <s-button slot="primary-action" onClick={send}>
        Send to Wasalna
      </s-button>
    </s-admin-action>
  );
}