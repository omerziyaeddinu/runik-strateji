import { put, get } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      try {
        const raw = await get("generated/index.json");
        const text = typeof raw === "string" ? raw : JSON.stringify(raw);
        const index = JSON.parse(text || "[]");
        return res.status(200).json({ items: index });
      } catch (e) {
        return res.status(200).json({ items: [] });
      }
    }

    if (req.method === "POST") {
      const { title = "Untitled", content } = req.body || {};
      if (content === undefined) {
        return res.status(400).json({ error: "content is required" });
      }

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const createdAt = new Date().toISOString();
      const path = `generated/${id}.json`;
      const payload = { id, title, content, createdAt };

      // Save the draft as its own blob (public so it can be fetched)
      const { url } = await put(path, JSON.stringify(payload), { access: "public" });

      // Try to read existing index, append, and overwrite it
      let index = [];
      try {
        const raw = await get("generated/index.json");
        const text = typeof raw === "string" ? raw : JSON.stringify(raw);
        index = JSON.parse(text || "[]");
      } catch (e) {
        index = [];
      }

      index.unshift({ id, title, url, createdAt });

      await put("generated/index.json", JSON.stringify(index), { access: "public" });

      return res.status(200).json({ id, url, createdAt });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Drafts handler error:", error);
    return res.status(500).json({ error: error.message || "Drafts failed" });
  }
}
