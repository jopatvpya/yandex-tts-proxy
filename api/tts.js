export default async function handler(req, res) {
  const { text } = JSON.parse(req.body || '{}');

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  const token = process.env.YANDEX_IAM_TOKEN;
  const folderId = process.env.YANDEX_FOLDER_ID;

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
  res.send(Buffer.from(audioBuffer));
}
