interface Env {
  ASSETS: {
    fetch: (request: Request | string) => Promise<Response>;
  };
}

const EXACT_HTML_ROUTES: Record<string, string> = {
  "/privacy": "/privacy.html",
  "/terms": "/terms.html",
  "/support": "/support.html",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";

    if (pathname === "/delete-account" || pathname === "/hapus-akun") {
      return Response.redirect(`${url.origin}/privacy#choices`, 301);
    }

    if (EXACT_HTML_ROUTES[pathname]) {
      const targetUrl = new URL(EXACT_HTML_ROUTES[pathname], url.origin);
      return env.ASSETS.fetch(new Request(targetUrl.toString(), request));
    }

    if (
      pathname === "/login" ||
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/")
    ) {
      const appUrl = new URL("/app.html", url.origin);
      return env.ASSETS.fetch(new Request(appUrl.toString(), request));
    }

    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    const landingUrl = new URL("/index.html", url.origin);
    return env.ASSETS.fetch(new Request(landingUrl.toString(), request));
  },
};
