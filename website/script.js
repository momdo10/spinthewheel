const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spin');
const resultDiv = document.getElementById('result');
const addItemBtn = document.getElementById('addItem');
const newItemInput = document.getElementById('newItem');
const tickSound = document.getElementById('tickSound');

const popup = document.getElementById('popup');
const popupText = document.getElementById('popup-text');
const removeOptionBtn = document.getElementById('removeOption');
const keepOptionBtn = document.getElementById('keepOption');

let segments = ['Godis', 'Chips', 'Pizza', 'Film', 'Inget', 'Läsk'];
let colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
let angle = 0;
let spinning = false;
let lastSoundAngle = 0;
let chosenIndex = null;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 200;

function drawWheel() {
  const anglePerSegment = (2 * Math.PI) / segments.length;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < segments.length; i++) {
    const startAngle = i * anglePerSegment;
    const endAngle = startAngle + anglePerSegment;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + anglePerSegment / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#000';
    ctx.font = '16px Arial';
    ctx.fillText(segments[i], radius - 10, 10);
    ctx.restore();
  }
}

function rotateWheel() {
  if (spinning || segments.length === 0) return;
  spinning = true;
  resultDiv.textContent = '';

  tickSound.play().catch(() => {}); // Aktiverar ljud

  const randomSpin = Math.random() * 360 + 3600;
  const duration = 5000;
  const start = performance.now();
  lastSoundAngle = -1;

  function animate(now) {
    const elapsed = now - start;
    if (elapsed < duration) {
      const progress = elapsed / duration;
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      angle = (randomSpin * easedProgress) % 360;

      const currentSegment = Math.floor(angle / (360 / segments.length));
      if (currentSegment !== lastSoundAngle) {
        tickSound.currentTime = 0;
        tickSound.play();
        lastSoundAngle = currentSegment;
      }

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(centerX, centerY);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
      drawWheel();
      ctx.restore();

      requestAnimationFrame(animate);
    } else {
      spinning = false;
      const finalAngle = (angle % 360 + 360) % 360;
      chosenIndex = Math.floor(segments.length - (finalAngle / 360) * segments.length) % segments.length;
      showPopup(segments[chosenIndex]);
    }
  }

  requestAnimationFrame(animate);
}

function showPopup(winner) {
  popupText.textContent = `Du vann: ${winner}`;
  popup.classList.remove('hidden');
}

function addNewItem() {
  const newItem = newItemInput.value.trim();
  if (newItem) {
    segments.push(newItem);
    newItemInput.value = '';
    drawWheel();
  }
}

function removeChosen() {
  if (chosenIndex !== null) {
    segments.splice(chosenIndex, 1);
    chosenIndex = null;
    drawWheel();
  }
  popup.classList.add('hidden');
}

function keepChosen() {
  chosenIndex = null;
  popup.classList.add('hidden');
}

// Event Listeners
drawWheel();
spinBtn.addEventListener('click', rotateWheel);
addItemBtn.addEventListener('click', addNewItem);
newItemInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addNewItem();
});
removeOptionBtn.addEventListener('click', removeChosen);
keepOptionBtn.addEventListener('click', keepChosen);
