import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { path, content, access = "private" } = req.body;

    if (!path || content === undefined) {
      return res.status(400).json({ error: "Path and content are required" });
    }

    const { url } = await put(path, content, { access });
    return res.status(200).json({ url });
  } catch (error) {
    console.error("Blob upload error:", error);
    return res.status(500).json({ error: error.message || "Blob upload failed" });
  }
}
