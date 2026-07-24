import { authenticate } from "../shopify.server";
import { sendToWasalna } from "../../wasalna.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://extensions.shopifycdn.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function loader() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function action({ request }) {
  let admin;
  let cors;

  try {
    ({ admin, cors } = await authenticate.admin(request));
  } catch (error) {
    console.error("AUTH ERROR:", error);
    return new Response(
      JSON.stringify({
        error: "AUTH FAILED",
        details: error.message,
      }),
      {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

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

  return cors(
    Response.json({
      success: true,
    }),
  );
}