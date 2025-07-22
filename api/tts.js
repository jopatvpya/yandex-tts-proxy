export default async function handler(req, res) {
  // Обработка preflight-запроса (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  let text = "";
  try {
    text = JSON.parse(req.body).text;
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  const token = process.env.YANDEX_IAM_TOKEN;
  const folderId = process.env.YANDEX_FOLDER_ID;

  try {
    const ttsResponse = await fetch("https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        text,
        lang: "ru-RU",
        voice: "alena",
        folderId,
        format: "mp3"
      }).toString()
    });

    if (!ttsResponse.ok) {
      const error = await ttsResponse.text();
      return res.status(500).json({ error });
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.status(200).end(Buffer.from(audioBuffer));
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}
