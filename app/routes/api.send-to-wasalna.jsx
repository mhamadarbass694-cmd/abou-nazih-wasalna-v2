import { authenticate } from "../shopify.server";
import { sendToWasalna } from "../../wasalna.js";

export async function loader() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "https://extensions.shopifycdn.com",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);

  const { orderId } = await request.json();

  const response = await admin.graphql(
    `#graphql
    query GetOrder($id: ID!) {
      order(id: $id) {
        name

        shippingAddress {
          firstName
          lastName
          phone
          address1
          address2
          city
          province
        }

        totalPriceSet {
          shopMoney {
            amount
          }
        }
      }
    }`,
    {
      variables: {
        id: orderId,
      },
    },
  );

  const { data } = await response.json();

  const order = data.order;

  console.log("Sending to Wasalna...");

  await sendToWasalna({
    phone: order.shippingAddress?.phone || "",
    firstName: order.shippingAddress?.firstName || "",
    lastName: order.shippingAddress?.lastName || "",
    address: order.shippingAddress?.address1 || "",
    address2: order.shippingAddress?.address2 || "",
    city: order.shippingAddress?.city || "",
    province: order.shippingAddress?.province || "",
    price: order.totalPriceSet.shopMoney.amount,
  });

  console.log("Wasalna finished");

  return new Response(
    JSON.stringify({
      success: true,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://extensions.shopifycdn.com",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    },
  );
}