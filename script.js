const generateBtn = document.getElementById('generateBtn');
const addBtn = document.getElementById('addButton');
const paletteContainer = document.getElementById('paletteContainer');

document.querySelectorAll('.action-btn[title="Lock color"]').forEach((btn) => {
  btn.addEventListener('click', (event) => {
    console.log('Lock button clicked:', btn);

    const isNowLocked = btn.classList.toggle('locked');
    console.log('Is now locked?', isNowLocked);

    const tile = btn.closest('.color-strip');
    tile.classList.toggle('locked');
  });
});

document.querySelectorAll('.action-btn[title="Copy hex"]').forEach((btn) => {
  btn.addEventListener('click', (event) => {
    console.log('Copy button clicked:', btn);

    const tile = btn.closest('.color-strip');
    const colorHexText = tile.querySelector('.hex-code').textContent;
    navigator.clipboard.writeText(colorHexText);
  });
});

document
  .querySelectorAll('.action-btn[title="Remove color"]')
  .forEach((btn) => {
    btn.addEventListener('click', (event) => {
      console.log('Remove button clicked:', btn);

      const tile = btn.closest('.color-strip');
      tile.remove();
    });
  });

document
  .querySelectorAll('.action-btn[title="Adjust color"]')
  .forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const tile = btn.closest('.color-strip');
      const colorPicker = btn.querySelector('input[type="color"]');

      console.log('Adjust color button clicked:', btn);

      if (colorPicker) {
        colorPicker.click();

        let debounceTimeout;

        colorPicker.addEventListener('input', (e) => {
          const newColor = e.target.value;
          tile.style.backgroundColor = newColor;

          clearTimeout(debounceTimeout);

          debounceTimeout = setTimeout(async () => {
            console.log('Final color chosen:', newColor);

            const response = await fetch('https://backhendcolorgen.vercel.app/api/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: `name this color and do not say anything else! the color in hex: ${newColor}`,
              }),
            });

            if (!response.ok) {
              console.error('Error fetching response:', response.statusText);
              chat.innerHTML += `<div class="message error-message">Error: Unable to fetch response</div>`;
              return;
            }

            const data = await response.json();
            console.log(data);
            tile.querySelector('.color-name').textContent = data.response;
            tile.querySelector('.hex-code').textContent = e.target.value;
          }, 1000);
        });
      }
    });
  });

async function getRandomColor() {
  const colorStrips = paletteContainer.querySelectorAll('.color-strip');
  const NumOfStrips = colorStrips.length;
  console.log(NumOfStrips);

  const response = await fetch(
    'https://backhendcolorgen.vercel.app/api/chat',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Give me 1 combination with ${NumOfStrips} colors in hex that match each other and are suitable for modern, clean designs (e.g. for websites or apps). The colors should be mostly cohesive but not all identical—include some variation for visual interest.
Here’s the format you must use: 'color1, color2, color3, color4, color5'.
Only return the combination—no explanations or extra text!`,
      }),
    }
  );

  if (!response.ok) {
    console.error('Error fetching response:', response.statusText);
    chat.innerHTML += `<div class="message error-message">Error: Unable to fetch response</div>`;
    return;
  }

  const data = await response.json();

  const colorsByAI = data.response;
  const colorsByAIArr = colorsByAI.split(',').map((color) => color.trim());

  return colorsByAIArr;
}

async function generatePalette() {
  const tiles = document.querySelectorAll('.color-strip');
  const colors = await getRandomColor();

  tiles.forEach(async (tile, index) => {
    const lockBtn = tile.querySelector('.action-btn[title="Lock color"]');
    const isLocked = lockBtn.classList.contains('locked');

    if (!isLocked) {
      const color = colors[index];
      tile.style.backgroundColor = color;
      tile.querySelector('.hex-code').textContent = color;

      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `name this color and do not say anything else! the color in hex: ${color}`,
        }),
      });

      if (!response.ok) {
        console.error('Error fetching response:', response.statusText);
        return;
      }

      const data = await response.json();
      tile.querySelector('.color-name').textContent = data.response;
    }
  });
}

function addColorStrip() {
  const colorStrips = paletteContainer.querySelectorAll('.color-strip');
  console.log('Number of color strip children:', colorStrips.length + 1);

  if (colorStrips.length + 1 < 10) {
    const colorStrip = document.createElement('div');
    colorStrip.style.backgroundColor = getRandomColor();
    colorStrip.className = 'color-strip';
    colorStrip.innerHTML = `
  <div class="hex-code">PlaceHolder</div>
        <div class="color-name">PlaceHolder</div>
        <div class="actions">
          <button
            class="action-btn"
            title="Remove color"
          >
            <svg viewBox="0 0 24 24">
              <line
                x1="18"
                y1="6"
                x2="6"
                y2="18"
              ></line>
              <line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
              ></line>
            </svg>
          </button>
          <button
            class="action-btn"
            title="Color info"
          >
            <svg viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
              ></circle>
              <line
                x1="12"
                y1="16"
                x2="12"
                y2="12"
              ></line>
              <line
                x1="12"
                y1="8"
                x2="12.01"
                y2="8"
              ></line>
            </svg>
          </button>
          <button
            class="action-btn"
            title="Adjust color"
          >
            <input
              type="color"
              id="colorPicker"
              style="display: none"
            />
            <svg viewBox="0 0 24 24">
              <line
                x1="4"
                y1="21"
                x2="4"
                y2="14"
              ></line>
              <line
                x1="4"
                y1="10"
                x2="4"
                y2="3"
              ></line>
              <line
                x1="12"
                y1="21"
                x2="12"
                y2="12"
              ></line>
              <line
                x1="12"
                y1="8"
                x2="12"
                y2="3"
              ></line>
              <line
                x1="20"
                y1="21"
                x2="20"
                y2="16"
              ></line>
              <line
                x1="20"
                y1="12"
                x2="20"
                y2="3"
              ></line>
              <line
                x1="1"
                y1="14"
                x2="7"
                y2="14"
              ></line>
              <line
                x1="9"
                y1="8"
                x2="15"
                y2="8"
              ></line>
              <line
                x1="17"
                y1="16"
                x2="23"
                y2="16"
              ></line>
            </svg>
          </button>
          <button
            class="action-btn"
            title="Export color"
          >
            <svg viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7,10 12,15 17,10"></polyline>
              <line
                x1="12"
                y1="15"
                x2="12"
                y2="3"
              ></line>
            </svg>
          </button>
          <button
            class="action-btn"
            title="Copy hex"
          >
            <svg viewBox="0 0 24 24">
              <rect
                width="14"
                height="14"
                x="8"
                y="8"
                rx="2"
                ry="2"
              ></rect>
              <path
                d="m4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
              ></path>
            </svg>
          </button>
          <button
            class="action-btn"
            id="lockBtn"
            title="Lock color"
          >
            <svg viewBox="0 0 24 24">
              <rect
                width="18"
                height="11"
                x="3"
                y="11"
                rx="2"
                ry="2"
              ></rect>
              <path d="m7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </button>
        </div>
  `;

    paletteContainer.appendChild(colorStrip);

    document
      .querySelectorAll('.action-btn[title="Lock color"]')
      .forEach((btn) => {
        btn.addEventListener('click', (event) => {
          console.log('Lock button clicked:', btn);

          const isNowLocked = btn.classList.toggle('locked');
          console.log('Is now locked?', isNowLocked);

          const tile = btn.closest('.color-strip');
          tile.classList.toggle('locked');
        });
      });

    document
      .querySelectorAll('.action-btn[title="Copy hex"]')
      .forEach((btn) => {
        btn.addEventListener('click', (event) => {
          console.log('Copy button clicked:', btn);

          const tile = btn.closest('.color-strip');
          const colorHexText = tile.querySelector('.hex-code').textContent;
          navigator.clipboard.writeText(colorHexText);
        });
      });

    document
      .querySelectorAll('.action-btn[title="Remove color"]')
      .forEach((btn) => {
        btn.addEventListener('click', (event) => {
          console.log('Remove button clicked:', btn);

          const tile = btn.closest('.color-strip');
          tile.remove();
        });
      });

    document
      .querySelectorAll('.action-btn[title="Adjust color"]')
      .forEach((btn) => {
        btn.addEventListener('click', (event) => {
          const tile = btn.closest('.color-strip');
          const colorPicker = btn.querySelector('input[type="color"]');

          console.log('Adjust color button clicked:', btn);

          if (colorPicker) {
            colorPicker.click();

            let debounceTimeout;

            colorPicker.addEventListener('input', (e) => {
              const newColor = e.target.value;
              tile.style.backgroundColor = newColor;

              clearTimeout(debounceTimeout);

              debounceTimeout = setTimeout(async () => {
                console.log('Final color chosen:', newColor);

                const response = await fetch('https://backhendcolorgen.vercel.app/api/chat', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    message: `name this color and do not say anything else! the color in hex: ${newColor}`,
                  }),
                });

                if (!response.ok) {
                  console.error(
                    'Error fetching response:',
                    response.statusText
                  );
                  chat.innerHTML += `<div class="message error-message">Error: Unable to fetch response</div>`;
                  return;
                }

                const data = await response.json();
                console.log(data);
                tile.querySelector('.color-name').textContent = data.response;
                tile.querySelector('.hex-code').textContent = e.target.value;
              }, 1000);
            });
          }
        });
      });
  } else {
    console.log('Too Many Strips!');
  }
}

if (generateBtn) {
  generateBtn.addEventListener('click', generatePalette);
}

if (addBtn) {
  addBtn.addEventListener('click', addColorStrip);
}
