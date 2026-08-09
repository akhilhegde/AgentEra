// ===========================================
// x402 Payment Middleware Configuration
// ===========================================
import { paymentMiddleware, x402ResourceServer } from "@x402-avm/hono";
import { HTTPFacilitatorClient } from "@x402-avm/core/server";
import { ExactAvmScheme } from "@x402-avm/avm/exact/server";
import { ALGORAND_TESTNET_CAIP2 } from "@x402-avm/avm";
import { x402Config } from "../config/x402.config.js";
import { getAllSkills } from "../services/skill-registry.js";

/** Build route payment config from skill registry */
function buildRouteConfig() {
  const routes: Record<string, any> = {};
  const skills = getAllSkills();

  for (const skill of skills) {
    const routeKey = `POST ${skill.endpoint}`;
    routes[routeKey] = {
      accepts: {
        scheme: "exact",
        network: ALGORAND_TESTNET_CAIP2,
        payTo: x402Config.receiverAddress,
        price: `$${skill.price}`,
      },
      description: `${skill.name} — ${skill.description}`,
    };
  }

  return routes;
}

/** Create the x402 payment middleware for Hono */
export function createPaymentMiddleware() {
  const facilitatorClient = new HTTPFacilitatorClient({
    url: x402Config.facilitatorUrl,
  });

  const resourceServer = new x402ResourceServer(facilitatorClient).register(
    ALGORAND_TESTNET_CAIP2,
    new ExactAvmScheme()
  );

  const routes = buildRouteConfig();
  console.log(
    "🔒 x402 payment routes configured:",
    Object.keys(routes).join(", ")
  );

  return paymentMiddleware(routes, resourceServer);
}
