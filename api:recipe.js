export default async function handler(req, res) {

  try {

    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        error: "Ingen URL skickades"
      });
    }

    // HÄMTA RECEPTSIDA
    const page = await fetch(url);

    if (!page.ok) {
      return res.status(500).json({
        error: "Kunde inte läsa receptsidan"
      });
    }

    const html = await page.text();

    // KORTA NER HTML
    const trimmed =
      html.slice(0, 8000);

    // OPENAI REQUEST
    const aiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization":
            `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [
            {
              role: "system",
              content:
                "Extrahera ingredienser från receptet. Returnera ENDAST JSON-array. Exempel: [\"500g köttfärs\", \"1 lök\"]"
            },
            {
              role: "user",
              content: trimmed
            }
          ],
          temperature: 0
        })
      }
    );

    const aiData =
      await aiResponse.json();

    // DEBUG
    console.log(aiData);

    if (!aiData.choices) {
      return res.status(500).json({
        error: "Fel från OpenAI",
        details: aiData
      });
    }

    const text =
      aiData.choices[0].message.content;

    let ingredients = [];

    try {

      ingredients =
        JSON.parse(text);

    } catch {

      ingredients =
        text
          .split("\n")
          .filter(Boolean);
    }

    // ENKEL PRISLOGIK
    let ica = 0;
    let willys = 0;

    ingredients.forEach(item => {

      const lower =
        item.toLowerCase();

      if (lower.includes("köttfärs")) {
        ica += 69;
        willys += 59;
      }

      else if (
        lower.includes("lök")
      ) {
        ica += 12;
        willys += 10;
      }

      else {
        ica += 20;
        willys += 18;
      }
    });

    return res.status(200).json({
      ingredients,
      prices: {
        ica,
        willys
      },
      cheapest:
        ica < willys
          ? "ICA"
          : "Willys"
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
}
