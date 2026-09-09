import Perplexity from "@perplexity-ai/perplexity_ai";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const QUERRY_epost = `ROLE & CONTEXT:
You are an expert student-economy newsletter editor. Your job is to create a weekly newsletter called 'Student-Kupp' that highlights the best deals for students in Norway, focusing on budget-friendly, healthy eating and essential non-food purchases.

DATA SOURCES:
- Web Search: Search for this week's current grocery store leaflets (kundeaviser) in Norway (REMA 1000, Kiwi, Coop, Meny, Spar, Bunnpris).

REQUIRED CONTENT SECTIONS:
1. Catchy Header: Mention the current week and a small teaser.
2. Top 10 Grocery Deals: A beautifully styled HTML table with Product, Price, and Store.
3. Healthy & Cheap Meal Plans: 3 concrete dinner recipes utilizing the top deals above. Include an estimated 'Price per portion'.
4. Best Non-Food Deals: Separated clearly from the food section. Focus on student hygiene, laundry, or household essentials currently on sale.
5. Source List: A clean list of references/links at the very bottom.

OUTPUT FORMAT & DESIGN RULES (CRITICAL):
- Respond ONLY with 100% pure, valid HTML code inside a responsive container (max-width: 600px).
- Use modern, clean inline CSS. Avoid boring default tables. Use soft pastel colors (e.g., emerald green accents for food, soft blue for non-food).
- The language of the newsletter content must be Norwegian (Bokmål).
- DO NOT wrap the code in markdown code blocks like \`\`\`html ... \`\`\`. Start directly with <html> and end with </html>. No conversational pre-text or post-text.`;

const QUERRY = `ROLE & CONTEXT:
You are an expert student-economy newsletter editor. Your job is to create a weekly newsletter called 'Student-Kupp' that highlights the best deals for students in Norway, focusing on budget-friendly, healthy eating and essential non-food purchases.

DATA SOURCES:
- Web Search: Search for this week's current grocery store leaflets (kundeaviser) in Norway (REMA 1000, Kiwi, Coop, Meny, Spar, Bunnpris).

REQUIRED CONTENT SECTIONS:
1. Catchy Header: Mention the current week and a small teaser.
2. Top 10 Grocery Deals: A beautifully styled HTML table with Product, Price, and Store.
3. Healthy & Cheap Meal Plans: 3 concrete dinner recipes utilizing the top deals above. Include an estimated 'Price per portion'.
4. Best Non-Food Deals: Separated clearly from the food section. Focus on student hygiene, laundry, or household essentials currently on sale.
5. Source List: A clean list of references/links at the very bottom.

OUTPUT FORMAT & DESIGN RULES (CRITICAL):
- Respond ONLY with 100% pure, valid HTML code representing a single responsive webpage section (this is NOT an email).
- Do NOT include <html>, <head>, <body>, or <!DOCTYPE> tags. Return only the inner content wrapped in a single root element with id="student-kupp-newsletter", since this will be injected directly into an existing webpage via innerHTML.
- Use inline CSS on every element as the base/fallback styling (this must look correct even if the <style> block below is stripped for any reason).
- In addition to inline CSS, include exactly ONE <style> tag at the very top of the output (before the root div) containing responsive rules scoped strictly under the #student-kupp-newsletter selector, so it never leaks into the rest of the page. Use this style block to:
  - Set #student-kupp-newsletter to max-width:600px on mobile (default), then widen it at larger breakpoints: max-width:700px at min-width:768px, and max-width:850px at min-width:1024px.
  - Increase base font size slightly on wider screens (e.g. body text 16px -> 17px at min-width:768px).
  - On screens min-width:768px and above, lay out the 3 meal plan cards and non-food deal cards using flexbox in a row (flex-wrap:wrap, gap) instead of stacked full-width blocks, so they use the available horizontal space instead of looking narrow and mobile-only.
  - Keep the grocery deals table full-width and horizontally scrollable (overflow-x:auto) at all sizes, since tables don't reflow well.
- Design mobile-first: on the smallest screens (no media query matched), everything must still look correct — minimum 14px font size for body text, generous padding (at least 16px), full-width stacked cards.
- Avoid boring default tables. Use soft pastel colors (e.g., emerald green accents for food, soft blue for non-food).
- The language of the newsletter content must be Norwegian (Bokmål).
- DO NOT wrap the code in markdown code blocks like \\\`\\\`\\\`html ... \\\`\\\`\\\`. Start directly with <style> and end with </div>. No conversational pre-text or post-text.`;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== "Bearer ${process.env.CRON_SECRET}") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const client = new Perplexity({
    apiKey: process.env["PERPLEXITY_API_KEY"], // This is the default and can be omitted
  });

  const response = await client.responses.create({
    preset: "fast",
    input: QUERRY,
  });

  const data = response.output_text;

  const redis = new Redis({
    url: process.env["UPSTASH_REDIS_REST_URL"],
    token: process.env["UPSTASH_REDIS_REST_TOKEN"],
  });

  await redis.set("foo", data);

  return new Response("ok");
}
