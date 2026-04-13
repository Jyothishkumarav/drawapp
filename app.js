const state = {
  mode: "draw",
  category: Object.keys(CATEGORIES)[0],
  drawTemplateIndex: 0,
  colorTemplateIndex: 0,
  drawStep: 0,
  stars: 0,
  selectedColor: "#ff595e",
  colorSectionIndex: 0,
  isPointerDown: false,
  lastPoint: null,
};

const drawModeBtn = document.getElementById("drawModeBtn");
const colorModeBtn = document.getElementById("colorModeBtn");
const categoryList = document.getElementById("categoryList");
const templateGrid = document.getElementById("templateGrid");
const templateTitle = document.getElementById("templateTitle");
const templateHint = document.getElementById("templateHint");
const drawPanel = document.getElementById("drawPanel");
const colorPanel = document.getElementById("colorPanel");
const drawCanvas = document.getElementById("drawCanvas");
const guideCanvas = document.getElementById("guideCanvas");
const drawStatus = document.getElementById("drawStatus");
const colorPrompt = document.getElementById("colorPrompt");
const colorCanvas = document.getElementById("colorCanvas");
const palette = document.getElementById("palette");
const resetBtn = document.getElementById("resetBtn");
const nextBtn = document.getElementById("nextBtn");
const starCount = document.getElementById("starCount");
const celebration = document.getElementById("celebration");

const paletteColors = ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93", "#ff99c8", "#6fffe9", "#f15bb5"];

function pointsToCanvas([x, y]) {
  return [
    (x / 100) * drawCanvas.width,
    (y / 100) * drawCanvas.height,
  ];
}

function currentTemplates() {
  return state.mode === "draw" ? DRAW_TEMPLATES : COLOR_TEMPLATES;
}

function getTemplateByMode() {
  const list = currentTemplates().filter((t) => t.category === state.category);
  const idx = state.mode === "draw" ? state.drawTemplateIndex : state.colorTemplateIndex;
  return list[idx] || list[0];
}

function setMode(mode) {
  state.mode = mode;
  drawModeBtn.classList.toggle("active", mode === "draw");
  colorModeBtn.classList.toggle("active", mode === "color");
  drawPanel.classList.toggle("active", mode === "draw");
  colorPanel.classList.toggle("active", mode === "color");
  state.drawStep = 0;
  state.colorSectionIndex = 0;
  renderTemplateList();
  renderWorkspace();
}

function renderCategories() {
  categoryList.innerHTML = "";
  Object.keys(CATEGORIES).forEach((category) => {
    const btn = document.createElement("button");
    btn.className = `pill ${state.category === category ? "active" : ""}`;
    btn.textContent = `${CATEGORY_ICONS[category]} ${category}`;
    btn.onclick = () => {
      state.category = category;
      state.drawTemplateIndex = 0;
      state.colorTemplateIndex = 0;
      state.drawStep = 0;
      state.colorSectionIndex = 0;
      renderCategories();
      renderTemplateList();
      renderWorkspace();
    };
    categoryList.appendChild(btn);
  });
}

function renderTemplateList() {
  const list = currentTemplates().filter((t) => t.category === state.category);
  templateGrid.innerHTML = "";

  list.forEach((t, index) => {
    const div = document.createElement("button");
    const active = state.mode === "draw" ? state.drawTemplateIndex === index : state.colorTemplateIndex === index;
    div.className = `template-item ${active ? "active" : ""}`;
    div.innerHTML = `<strong>${t.name}</strong><div>${state.mode === "draw" ? "Guided strokes" : "Guided coloring"}</div>`;
    div.onclick = () => {
      if (state.mode === "draw") state.drawTemplateIndex = index;
      else state.colorTemplateIndex = index;
      state.drawStep = 0;
      state.colorSectionIndex = 0;
      renderTemplateList();
      renderWorkspace();
    };
    templateGrid.appendChild(div);
  });
}

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
}

function drawArrow(ctx, from, to) {
  const [x1, y1] = pointsToCanvas(from);
  const [x2, y2] = pointsToCanvas(to);
  ctx.strokeStyle = "#ff5ea2";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 14;
  ctx.fillStyle = "#ff5ea2";
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 7), y2 - head * Math.sin(angle - Math.PI / 7));
  ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 7), y2 - head * Math.sin(angle + Math.PI / 7));
  ctx.closePath();
  ctx.fill();
}

function renderDrawGuide() {
  const template = getTemplateByMode();
  const gctx = guideCanvas.getContext("2d");
  clearCanvas(gctx);

  template.steps.forEach((step, index) => {
    const [x1, y1] = pointsToCanvas(step.from);
    const [x2, y2] = pointsToCanvas(step.to);
    gctx.strokeStyle = index < state.drawStep ? "#7ee8c6" : "rgba(106,125,255,0.2)";
    gctx.lineWidth = 4;
    gctx.beginPath();
    gctx.moveTo(x1, y1);
    gctx.lineTo(x2, y2);
    gctx.stroke();
  });

  if (state.drawStep < template.steps.length) {
    drawArrow(gctx, template.steps[state.drawStep].from, template.steps[state.drawStep].to);
  }
}

function distance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function celebrate(message) {
  for (let i = 0; i < 28; i++) {
    const spark = document.createElement("div");
    spark.className = "spark";
    spark.style.left = `${Math.random() * 100}vw`;
    spark.style.top = `${65 + Math.random() * 20}vh`;
    spark.style.background = paletteColors[i % paletteColors.length];
    spark.style.animationDelay = `${Math.random() * 200}ms`;
    celebration.appendChild(spark);
    setTimeout(() => spark.remove(), 950);
  }
  templateHint.textContent = message;
}

function onDrawPointerDown(e) {
  if (state.mode !== "draw") return;
  state.isPointerDown = true;
  const rect = drawCanvas.getBoundingClientRect();
  state.lastPoint = [
    ((e.clientX - rect.left) / rect.width) * drawCanvas.width,
    ((e.clientY - rect.top) / rect.height) * drawCanvas.height,
  ];
}

function onDrawPointerMove(e) {
  if (!state.isPointerDown || state.mode !== "draw") return;
  const dctx = drawCanvas.getContext("2d");
  const rect = drawCanvas.getBoundingClientRect();
  const point = [
    ((e.clientX - rect.left) / rect.width) * drawCanvas.width,
    ((e.clientY - rect.top) / rect.height) * drawCanvas.height,
  ];

  dctx.strokeStyle = "#2e1f47";
  dctx.lineWidth = 6;
  dctx.lineCap = "round";
  dctx.beginPath();
  dctx.moveTo(state.lastPoint[0], state.lastPoint[1]);
  dctx.lineTo(point[0], point[1]);
  dctx.stroke();
  state.lastPoint = point;
}

function onDrawPointerUp() {
  if (state.mode !== "draw") return;
  state.isPointerDown = false;

  const template = getTemplateByMode();
  const step = template.steps[state.drawStep];
  if (!step || !state.lastPoint) return;
  const target = pointsToCanvas(step.to);

  if (distance(state.lastPoint, target) < 48) {
    state.drawStep += 1;
    state.stars += 1;
    starCount.textContent = state.stars;

    if (state.drawStep >= template.steps.length) {
      celebrate(`Great job! You completed ${template.name}. Next template unlocked!`);
      drawStatus.textContent = "🌟 Awesome! Moving to next template...";
      setTimeout(() => nextTemplate(), 1300);
    } else {
      drawStatus.textContent = `Nice! Move to stroke ${state.drawStep + 1} of ${template.steps.length}.`;
    }
    renderDrawGuide();
  } else {
    drawStatus.textContent = "Try to end near the arrow tip. You can do it!";
  }
}

function renderPalette() {
  palette.innerHTML = "";
  paletteColors.forEach((color) => {
    const swatch = document.createElement("button");
    swatch.className = `swatch ${state.selectedColor === color ? "active" : ""}`;
    swatch.style.background = color;
    swatch.onclick = () => {
      state.selectedColor = color;
      renderPalette();
    };
    palette.appendChild(swatch);
  });
}

function renderColorTemplate() {
  const template = getTemplateByMode();
  const activeSection = template.sections[state.colorSectionIndex];

  colorCanvas.innerHTML = `
    <svg viewBox="${template.viewBox}" role="img" aria-label="Color template ${template.name}">
      ${template.sections
        .map(
          (sec, index) =>
            `<path class="color-region ${index === state.colorSectionIndex ? "active" : ""}" data-id="${sec.id}" d="${sec.path}" fill="${sec.fill || "#fff"}"></path>`
        )
        .join("")}
    </svg>
  `;

  colorPrompt.textContent = `Paint section ${state.colorSectionIndex + 1}/${template.sections.length}. Suggested color: ${activeSection.color}.`;

  colorCanvas.querySelectorAll(".color-region").forEach((node, index) => {
    node.addEventListener("pointerdown", () => paintSection(index));
    node.addEventListener("pointerenter", () => {
      if (state.isPointerDown) paintSection(index);
    });
  });
}

function paintSection(index) {
  if (index !== state.colorSectionIndex) return;
  const template = getTemplateByMode();
  template.sections[index].fill = state.selectedColor;
  state.stars += 1;
  starCount.textContent = state.stars;

  if (state.selectedColor.toLowerCase() === template.sections[index].color.toLowerCase()) {
    colorPrompt.textContent = "Perfect color match!";
  } else {
    colorPrompt.textContent = `Nice coloring! Suggested was ${template.sections[index].color}.`;
  }

  state.colorSectionIndex += 1;

  if (state.colorSectionIndex >= template.sections.length) {
    celebrate(`Fantastic! ${template.name} is colorful now!`);
    setTimeout(() => nextTemplate(), 1300);
    return;
  }

  renderColorTemplate();
}

function resetCurrentTemplate() {
  state.drawStep = 0;
  state.colorSectionIndex = 0;

  const dctx = drawCanvas.getContext("2d");
  const gctx = guideCanvas.getContext("2d");
  clearCanvas(dctx);
  clearCanvas(gctx);

  const colorTemplate = getTemplateByMode();
  if (state.mode === "color") {
    colorTemplate.sections.forEach((sec) => {
      sec.fill = "#fff";
    });
  }

  drawStatus.textContent = "Template reset! Follow the arrow and draw each stroke.";
  renderWorkspace();
}

function nextTemplate() {
  const list = currentTemplates().filter((t) => t.category === state.category);
  if (state.mode === "draw") {
    state.drawTemplateIndex = (state.drawTemplateIndex + 1) % list.length;
    state.drawStep = 0;
  } else {
    state.colorTemplateIndex = (state.colorTemplateIndex + 1) % list.length;
    state.colorSectionIndex = 0;
  }
  renderTemplateList();
  renderWorkspace();
}

function renderWorkspace() {
  const template = getTemplateByMode();
  templateTitle.textContent = `${template.name} (${state.category})`;
  templateHint.textContent =
    state.mode === "draw"
      ? "Draw each arrow step to finish and unlock the next template."
      : "Color each highlighted area and follow the guided order.";

  if (state.mode === "draw") {
    const dctx = drawCanvas.getContext("2d");
    clearCanvas(dctx);
    renderDrawGuide();
    drawStatus.textContent = `Start stroke ${state.drawStep + 1} of ${template.steps.length}.`;
  } else {
    renderPalette();
    renderColorTemplate();
  }
}

function bindEvents() {
  drawModeBtn.onclick = () => setMode("draw");
  colorModeBtn.onclick = () => setMode("color");

  drawCanvas.addEventListener("pointerdown", onDrawPointerDown);
  drawCanvas.addEventListener("pointermove", onDrawPointerMove);
  drawCanvas.addEventListener("pointerup", onDrawPointerUp);
  drawCanvas.addEventListener("pointerleave", onDrawPointerUp);

  colorCanvas.addEventListener("pointerdown", () => {
    state.isPointerDown = true;
  });
  window.addEventListener("pointerup", () => {
    state.isPointerDown = false;
  });

  resetBtn.onclick = resetCurrentTemplate;
  nextBtn.onclick = nextTemplate;
}

renderCategories();
renderTemplateList();
renderWorkspace();
bindEvents();
