import { put, get } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    const { method } = req;
    const { id } = req.query; // session ID

    if (method === "POST") {
      // Save drafts to cloud
      const { sessionId, drafts, timestamp, adminPassword } = req.body;
      const expectedPassword = process.env.ADMIN_PASSWORD;

      if (!sessionId || !drafts) {
        return res.status(400).json({ error: "sessionId and drafts required" });
      }

      if (!expectedPassword) {
        return res.status(500).json({ error: "Admin password not configured" });
      }

      if (adminPassword !== expectedPassword) {
        return res.status(401).json({ error: "Invalid admin password" });
      }

      const payload = {
        sessionId,
        drafts,
        timestamp: timestamp || new Date().toISOString(),
      };

      const path = `sessions/${sessionId}.json`;

      try {
        await put(path, JSON.stringify(payload), { access: "private" });
        return res.status(200).json({ ok: true, sessionId });
      } catch (e) {
        // Blob storage failed, but don't break the app - just warn
        console.warn("Session save to blob failed:", e.message);
        return res.status(200).json({ ok: true, sessionId, warning: "Local save only" });
      }
    }

    if (method === "GET") {
      // Load drafts from cloud
      if (!id) {
        return res.status(400).json({ error: "session id required" });
      }

      try {
        const path = `sessions/${id}.json`;
        const raw = await get(path);
        const text = typeof raw === "string" ? raw : JSON.stringify(raw);
        const payload = JSON.parse(text || "{}");
        return res.status(200).json(payload);
      } catch (e) {
        console.warn("Session load failed:", e.message);
        return res.status(404).json({ error: "Session not found" });
      }
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Session handler error:", error);
    return res.status(500).json({ error: error.message || "Session failed" });
  }
}
