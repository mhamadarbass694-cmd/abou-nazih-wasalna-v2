import { chromium } from "playwright";

export async function sendToWasalna(order) {
  const context = await chromium.launchPersistentContext(
    "C:\\Users\\Dell\\Playwright\\wasalna-profile",
    {
      headless: false,
      slowMo: 300,
    }
  );

  const page = await context.newPage();

  console.log(order);

  await page.goto("https://www.wasalnacashdelivery.com/clients/orders/add.php");

  // Phone
let phone = order.phone.replace(/\D/g, "").replace(/^961/, "");

if (phone.length === 7 && phone.startsWith("3")) {
  phone = "0" + phone;
}

await page
  .getByRole("textbox", { name: "Phone Number *" })
  .fill(phone);

  // First Name
  await page.locator('input[name="first_name"]').evaluate(
    (el, value) => {
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    },
    order.firstName
  );

  // Last Name
  await page.locator('input[name="last_name"]').fill(order.lastName);

  // Customer City
  const city = detectWasalnaCity(
    `${order.address ?? ""} ${order.city ?? ""} ${order.province ?? ""}`
  );

  await page.locator(".select2-selection").nth(1).click();
  await page.locator(".select2-search__field").nth(1).fill(city);
  await page
    .locator(".select2-results__option")
    .filter({ hasText: city })
    .first()
    .click();

  // Address
await page
  .getByRole("textbox", { name: "Address" })
  .fill(
    `${order.address}${order.address2 ? " - " + order.address2 : ""}`
  );

  // Price
  await page
    .getByRole("textbox", { name: "Total USD Price" })
    .fill(order.price);

  await page
    .getByRole("textbox", { name: "Total USD Price" })
    .press("Tab");

  await page.waitForTimeout(1000);

  // Save
  await page
    .getByRole("button", { name: "Save", exact: true })
    .click();

  await page.waitForTimeout(3000);
  const referenceId = await page
  .locator("text=Reference ID:")
  .locator("..")
  .textContent();

console.log("Reference ID:", referenceId);

await page.pause();

  // await context.close();

  return { success: true };
}

function detectWasalnaCity(address = "") {
  const text = address.toLowerCase();

  const cities = {
    akkar: ["akkar", "عكار", "halba", "حلبا"],

    aalay: ["aalay", "aley", "عاليه", "عالية"],

    batroun: ["batroun", "البترون"],

    bcharri: ["bcharri", "بشري"],

    beirut: ["beirut", "بيروت"],

    bikaa: ["bekaa", "bikaa", "البقاع"],

    chouf: ["chouf", "الشوف"],

    chwayfet: ["choueifat", "chwayfet", "الشويفات"],

    denieh: ["denieh", "dinnieh", "الضنية", "المنية الضنية"],

    iklimAlkharroub: ["iklim alkharroub", "إقليم الخروب"],

    jabalLobnan: ["jabal lobnan", "mount lebanon", "جبل لبنان"],

    janoub: ["janoub", "south", "الجنوب", "صيدا", "صور", "النبطية"],

    jbeil: ["jbeil", "byblos", "جبيل"],

    kesrwane: ["kesrwane", "keserwan", "كسروان"],

    koura: ["koura", "الكورة"],

    maten: ["maten", "matn", "المتن"],

    minieh: ["minieh", "minyeh", "المنية"],

    tripoli: [
      "tripoli",
      "طرابلس",
      "mina",
      "الميناء",
      "qobbeh",
      "القبة",
      "zahriyeh",
      "الزاهرية",
      "bab el tabbaneh",
      "التبانة",
      "beddawi",
      "البداوي",
      "abi samra",
      "abou samra",
      "abu samra",
      "ابي سمراء"
    ],

    zgharta: ["zgharta", "زغرتا"]
  };

  const wasalnaNames = {
    akkar: "Aakkar",
    aalay: "Aalay",
    batroun: "Batroun",
    bcharri: "Bcharri",
    beirut: "Beirut",
    bikaa: "Bikaa",
    chouf: "Chouf",
    chwayfet: "Chwayfet",
    denieh: "Denieh",
    iklimAlkharroub: "Iklim Alkharroub",
    jabalLobnan: "Jabal Lobnan",
    janoub: "Janoub",
    jbeil: "Jbeil",
    kesrwane: "Kesrwane",
    koura: "Koura",
    maten: "Maten",
    minieh: "Minieh",
    tripoli: "Tripoli",
    zgharta: "Zgharta"
  };

  for (const [city, keywords] of Object.entries(cities)) {
    if (keywords.some((k) => text.includes(k.toLowerCase()))) {
      return wasalnaNames[city];
    }
  }

  throw new Error(`لم أتمكن من تحديد المنطقة من العنوان: ${address}`);
}