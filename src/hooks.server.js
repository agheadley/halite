
export const handle= async ({ event, resolve }) => {
  if (event.route.id && event.route.id.indexOf("(protected)") > 0) {
    return new Response("Authentication required");
  }
  return await resolve(event);
};


/*
import { SvelteKitAuth } from "@auth/sveltekit"
import AzureADProvider from '@auth/core/providers/azure-ad';


export const handle = SvelteKitAuth({
    providers: [
        AzureADProvider({
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.SECRET_ID,
            tenantId: process.env.TENANT_ID
        })
    ]
}) 
*/