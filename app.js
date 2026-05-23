async function analyzeRecipe() {

  const url =
    document.getElementById("recipeUrl").value;

  const loading =
    document.getElementById("loading");

  const result =
    document.getElementById("result");

  loading.innerHTML = "⏳ Analyserar recept...";
  result.innerHTML = "";

  try {

    const response = await fetch(
      "/api/recipe",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({ url })
      }
    );

    const data =
      await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    loading.innerHTML = "";

    result.innerHTML = `
      <div class="card">
        <h2>🛒 Inköpslista</h2>

        <ul>
          ${data.ingredients
            .map(i => `<li>${i}</li>`)
            .join("")}
        </ul>
      </div>

      <div class="card">
        <h2>💰 Prisjämförelse</h2>

        <p>ICA: ${data.prices.ica} kr</p>
        <p>Willys: ${data.prices.willys} kr</p>

        <p class="green">
          Billigast:
          ${data.cheapest}
        </p>
      </div>
    `;

  } catch (error) {

    loading.innerHTML = "";

    result.innerHTML = `
      <div class="card">
        ❌ ${error.message}
      </div>
    `;
  }
}
