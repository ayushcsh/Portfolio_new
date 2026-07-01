const fishAudioApiKey = process.env.FISH_AUDIO_API_KEY;
const fishAudioModel = process.env.FISH_AUDIO_MODEL ?? "s2.1-pro-free";
const fishAudioReferenceId = process.env.FISH_AUDIO_REFERENCE_ID;

function cleanTextForSpeech(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/https?:\/\/\S+/g, "link")
    .trim()
    .slice(0, 1200);
}

export async function POST(req: Request) {
  if (!fishAudioApiKey) {
    return Response.json(
      { error: "FISH_AUDIO_API_KEY is missing." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const text = cleanTextForSpeech(String(body?.text ?? ""));

    if (!text) {
      return Response.json(
        { error: "Text is required for voice playback." },
        { status: 400 }
      );
    }

    const fishResponse = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${fishAudioApiKey}`,
        "Content-Type": "application/json",
        model: fishAudioModel,
      },
      body: JSON.stringify({
        text,
        ...(fishAudioReferenceId
          ? { reference_id: fishAudioReferenceId }
          : {}),
        temperature: 0.7,
        top_p: 0.7,
        prosody: {
          speed: 1,
          volume: 0,
          normalize_loudness: true,
        },
        chunk_length: 300,
        normalize: true,
        format: "mp3",
        sample_rate: 44100,
        mp3_bitrate: 128,
        latency: "balanced",
        max_new_tokens: 1024,
        repetition_penalty: 1.2,
        min_chunk_length: 50,
        condition_on_previous_chunks: true,
        early_stop_threshold: 1,
      }),
    });

    if (!fishResponse.ok) {
      const errorText = await fishResponse.text();
      const isPaymentError = fishResponse.status === 402;

      return Response.json(
        {
          error: isPaymentError
            ? "Fish Audio could not generate audio because the selected model needs credits or account access. Try FISH_AUDIO_MODEL=s2.1-pro-free or check your Fish Audio account."
            : errorText ||
              "Fish Audio could not generate this voice response.",
        },
        { status: fishResponse.status }
      );
    }

    const audio = await fishResponse.arrayBuffer();

    return new Response(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Fish Audio Error:", error);

    return Response.json(
      { error: "Unable to generate voice response." },
      { status: 500 }
    );
  }
}
