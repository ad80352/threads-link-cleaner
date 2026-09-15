const ALLOWED_ORIGIN = "https://ad80352.github.io";
const ALLOWED_HOSTS = new Set(["www.threads.com", "threads.com", "www.threads.net", "threads.net"]);

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    const { searchParams } = new URL(request.url);
    const target = searchParams.get("url");

    if (!target) {
      return json({ error: "Missing url parameter" }, 400);
    }

    let targetUrl;
    try {
      targetUrl = new URL(target);
    } catch (e) {
      return json({ error: "Invalid url" }, 400);
    }

    if (!ALLOWED_HOSTS.has(targetUrl.hostname) || !targetUrl.pathname.startsWith("/share/")) {
      return json({ error: "Only threads.com/threads.net /share/ links are allowed" }, 400);
    }

    let resp;
    try {
      resp = await fetch(targetUrl.toString(), {
        method: "HEAD",
        redirect: "manual",
        headers: { "User-Agent": "Mozilla/5.0" },
      });
    } catch (e) {
      return json({ error: "Failed to reach threads.com" }, 502);
    }

    const location = resp.headers.get("location");
    if (!location) {
      return json({ error: "No redirect returned by threads.com, link may be invalid or expired" }, 502);
    }

    let clean;
    try {
      const u = new URL(location, targetUrl);
      u.search = "";
      u.hash = "";
      clean = u.toString();
    } catch (e) {
      return json({ error: "Could not parse redirect target" }, 502);
    }

    return json({ clean });
  },
};
