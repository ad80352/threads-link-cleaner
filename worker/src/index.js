const ALLOWED_ORIGINS = new Set(["https://ad80352.github.io", "http://localhost:8080"]);
const ALLOWED_HOSTS = new Set(["www.threads.com", "threads.com", "www.threads.net", "threads.net"]);

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://ad80352.github.io",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    const { searchParams } = new URL(request.url);
    const target = searchParams.get("url");

    if (!target) {
      return json({ error: "Missing url parameter" }, 400, origin);
    }

    let targetUrl;
    try {
      targetUrl = new URL(target);
    } catch (e) {
      return json({ error: "Invalid url" }, 400, origin);
    }

    if (!ALLOWED_HOSTS.has(targetUrl.hostname) || !targetUrl.pathname.startsWith("/share/")) {
      return json({ error: "Only threads.com/threads.net /share/ links are allowed" }, 400, origin);
    }

    let resp;
    try {
      resp = await fetch(targetUrl.toString(), {
        method: "HEAD",
        redirect: "manual",
        headers: { "User-Agent": "Mozilla/5.0" },
      });
    } catch (e) {
      return json({ error: "Failed to reach threads.com" }, 502, origin);
    }

    const location = resp.headers.get("location");
    if (!location) {
      return json({ error: "No redirect returned by threads.com, link may be invalid or expired" }, 502, origin);
    }

    let clean;
    try {
      const u = new URL(location, targetUrl);
      u.search = "";
      u.hash = "";
      clean = u.toString();
    } catch (e) {
      return json({ error: "Could not parse redirect target" }, 502, origin);
    }

    return json({ clean }, 200, origin);
  },
};
