# Colors

Click on a palette to get a list of lists of hex strings.

### Credit

Credit goes to [dicopal.js](https://github.com/riatelab/dicopal.js) for compiling the colors from these sources:

-   [Colorbrewer2](https://colorbrewer2.org/)
-   [Fabio Crameri's Scientific Colour Maps](https://www.fabiocrameri.ch/colourmaps/)
-   [CARTOColors](https://carto.com/carto-colors/)
-   [cmocean](https://matplotlib.org/cmocean/)
-   [Light & Bartlein](https://agupubs.onlinelibrary.wiley.com/doi/abs/10.1029/2004EO400002)
-   [Matplotlib](https://bids.github.io/colormap/)
-   [MyCarta](https://mycartablog.com/color-palettes/)
-   [Tableau](https://help.tableau.com/current/pro/desktop/en-us/formatting_create_custom_colors.htm#hex-values-for-discontinued-color-palettes)
-   [The Wes Anderson Palettes blog](https://wesandersonpalettes.tumblr.com/)
-   [Joshua Stevens' palettes](https://www.joshuastevens.net/)
-   [Masataka Okabe and Kei Ito's Color Universal Design (CUD) categorical palette](https://jfly.uni-koeln.de/color/)
-   [D3 "Observable10" categorical palette](https://d3js.org/d3-scale-chromatic/categorical#schemeObservable10)

```js
const data = FileAttachment("data/palettes.json").json();
```

```js
const container = document.createElement("div");
container.style.display = "grid";
container.style.gridTemplateColumns = "repeat(4, 1fr)";
container.style.gap = "20px";
document.getElementById("observablehq-main").appendChild(container);

Object.entries(data.cartocolors).forEach(([paletteName, paletteData]) => {
    const paletteContainer = document.createElement("div");
    paletteContainer.style.display = "flex";
    paletteContainer.style.flexDirection = "column";
    paletteContainer.style.cursor = "pointer"; // indicates clickable

    const title = document.createElement("h3");
    title.textContent = paletteName;
    paletteContainer.appendChild(title);

    // Build the rows of color squares
    Object.entries(paletteData.values).forEach(([level, colors]) => {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.marginBottom = "5px";

        colors.forEach((color) => {
            const square = document.createElement("div");
            square.style.width = "20px";
            square.style.height = "20px";
            square.style.backgroundColor = color;
            square.style.marginRight = "2px";
            row.appendChild(square);
        });
        paletteContainer.appendChild(row);
    });

    // When the palette is clicked, copy the list of hex values to the clipboard.
    paletteContainer.addEventListener("click", () => {
        // Extract the list of lists of hex strings from the palette
        const hexLists = Object.values(paletteData.values);
        const textToCopy = JSON.stringify(hexLists, null, 2);

        navigator.clipboard
            .writeText(textToCopy)
            .then(() => {
                // Create a temporary alert element
                const alertBox = document.createElement("div");
                alertBox.textContent = "Copied palettes to clipboard.";
                // Basic styling for the alert box
                alertBox.style.position = "fixed";
                alertBox.style.top = "20px";
                alertBox.style.left = "50%";
                alertBox.style.transform = "translateX(-50%)";
                alertBox.style.backgroundColor = "#333";
                alertBox.style.color = "#fff";
                alertBox.style.padding = "10px 20px";
                alertBox.style.borderRadius = "4px";
                alertBox.style.zIndex = 1000;
                document.body.appendChild(alertBox);

                // Remove the alert box after 500 milliseconds
                setTimeout(() => {
                    alertBox.remove();
                }, 500);
            })
            .catch((err) => console.error("Error copying text: ", err));
    });

    container.appendChild(paletteContainer);
});
```
