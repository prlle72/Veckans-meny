export default async function handler(req, res) {

  try {

    const { url } = req.body;

    // HÄMTA RECEPTSIDA
    const page = await fetch(url);
    const html = await page.text();

    // OPENAI
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
                "Extrahera endast ingredienser från receptet som JSON-array."
            },
            {
              role: "user",
              content: html.slice(0, 15000)
            }
          ],
          temperature: 0.2
        })
      }
    );

    const aiData = await aiResponse.json();

    const text =
      aiData.choices[0].message.content;

    let ingredients = [];

    try {
      ingredients = JSON.parse(text);
    } catch {
      ingredients = [text];
    }

    // SUPERENKEL PRISLOGIK
    let ica = 0;
    let willys = 0;

    ingredients.forEach(item => {

      const lower =
        item.toLowerCase();

      if (lower.includes("köttfärs")) {
        ica += 69;
        willys += 59;
      }

      else if (lower.includes("lök")) {
        ica += 12;
        willys += 10;
      }

      else {
        ica += 20;
        willys += 18;
      }
    });

    res.status(200).json({
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

    res.status(500).json({
      error: error.message
    });
  }
}
