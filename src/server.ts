import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const body: any = await request.json();
        const apiKey = (env as any)?.VITE_NVIDIA_API_KEY || (process as any).env?.VITE_NVIDIA_API_KEY;
        if (!apiKey) {
          return new Response("NVIDIA API key not set in environment", { status: 500 });
        }

        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            messages: body.messages,
            temperature: 1,
            top_p: 1,
            max_tokens: 4096,
            stream: false
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          return new Response(`API error: ${errText}`, { status: response.status });
        }

        const json = await response.json();
        return new Response(JSON.stringify(json), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err: any) {
        return new Response(err.message, { status: 500 });
      }
    }

    if (url.pathname === "/api/cashfree/create-order" && request.method === "POST") {
      try {
        const body: any = await request.json();
        const appId = (env as any)?.CASHFREE_APP_ID || (process as any).env?.CASHFREE_APP_ID;
        const secretKey = (env as any)?.CASHFREE_SECRET_KEY || (process as any).env?.CASHFREE_SECRET_KEY;

        if (!appId || !secretKey) {
          return new Response("Cashfree credentials not set in environment", { status: 500 });
        }

        const response = await fetch("https://api.cashfree.com/pg/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-client-id": appId,
            "x-client-secret": secretKey,
            "x-api-version": "2023-08-01"
          },
          body: JSON.stringify({
            order_amount: body.order_amount,
            order_currency: "INR",
            customer_details: {
              customer_id: body.customer_id || "cust_" + Date.now(),
              customer_name: body.customer_name || "Customer",
              customer_email: body.customer_email || "akdigitalhubudt@gmail.com",
              customer_phone: body.customer_phone || "9363351084"
            },
            order_meta: {
              return_url: body.return_url || "https://akdigitalhub.com/success",
            },
            order_note: body.order_note
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          return new Response(`API error: ${errText}`, { status: response.status });
        }

        const json = await response.json();
        return new Response(JSON.stringify(json), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err: any) {
        return new Response(err.message, { status: 500 });
      }
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
