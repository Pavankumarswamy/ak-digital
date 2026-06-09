import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiKey = env.VITE_NVIDIA_API_KEY;

  return {
    plugins: [
      TanStackRouterVite(),
      react(),
      tsconfigPaths(),
      tailwindcss(),
      {
        name: "api-chat-dev-server",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if ((req.url === "/api/chat" || req.url === "/api/chat/") && req.method === "POST") {
              try {
                const bodyBuffers: any[] = [];
                for await (const chunk of req) {
                  bodyBuffers.push(chunk);
                }
                const bodyText = Buffer.concat(bodyBuffers).toString("utf-8");
                const body = JSON.parse(bodyText);

                if (!apiKey) {
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ error: "VITE_NVIDIA_API_KEY not set in local environment" }));
                  return;
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

                const data = await response.text();
                res.statusCode = response.status;
                res.setHeader("Content-Type", "application/json");
                res.end(data);
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: err.message }));
              }
              return;
            }

            // Cashfree Create Order
            if ((req.url === "/api/cashfree/create-order" || req.url === "/api/cashfree/create-order/") && req.method === "POST") {
              try {
                const bodyBuffers: any[] = [];
                for await (const chunk of req) {
                  bodyBuffers.push(chunk);
                }
                const bodyText = Buffer.concat(bodyBuffers).toString("utf-8");
                const body = JSON.parse(bodyText);

                const appId = env.CASHFREE_APP_ID;
                const secretKey = env.CASHFREE_SECRET_KEY;

                if (!appId || !secretKey) {
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ error: "Cashfree credentials not set in local environment" }));
                  return;
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
                      customer_email: body.customer_email || "no-reply@akdigitalhub.com",
                      customer_phone: body.customer_phone || "9999999999"
                    },
                    order_meta: {
                      return_url: body.return_url || "https://localhost:5173/success",
                    },
                    order_note: body.order_note
                  })
                });

                const data = await response.text();
                res.statusCode = response.status;
                res.setHeader("Content-Type", "application/json");
                res.end(data);
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: err.message }));
              }
              return;
            }

            next();
          });
        }
      }
    ],
    base: "/",
    build: {
      outDir: "public_html",
    },
  };
});
