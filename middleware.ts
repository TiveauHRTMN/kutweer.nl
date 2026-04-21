
import { proxy } from "./proxy";

export default proxy;

export const config = {
  matcher: [
    // Sla static/image/favicons over — run op alles behalve deze
    "/((?!_next/static|_next/image|favicon|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|js|css|woff2?)$).*)",
  ],
};
