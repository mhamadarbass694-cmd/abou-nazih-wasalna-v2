import "@shopify/ui-extensions/preact";
import { render } from "preact";

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  const { close, data } = shopify;

  return (
    <s-admin-action title="Send to Wasalna">
      <s-text>Order:</s-text>
      <s-text>{data.selected[0].id}</s-text>

      <s-button
        slot="primary-action"
        onClick={async () => {
          const res = await fetch("api/send-to-wasalna", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId: data.selected[0].id,
            }),
          });

          const result = await res.json();
          console.log(result);

          close();
        }}
      >
        Send to Wasalna
      </s-button>
    </s-admin-action>
  );
}