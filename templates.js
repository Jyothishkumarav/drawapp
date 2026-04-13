const CATEGORIES = {
  birds: ["Bird", "Parrot", "Duck", "Peacock", "Owl"],
  animals: ["Cat", "Dog", "Elephant", "Rabbit", "Lion"],
  vegetables: ["Carrot", "Brinjal", "Tomato", "Corn", "Broccoli"],
  fruits: ["Apple", "Mango", "Banana", "Grapes", "Orange"],
  flowers: ["Rose", "Sunflower", "Lily", "Tulip", "Lotus"],
};

const CATEGORY_ICONS = {
  birds: "🕊️",
  animals: "🐾",
  vegetables: "🥕",
  fruits: "🍎",
  flowers: "🌼",
};

const DRAW_TEMPLATES = Object.entries(CATEGORIES).flatMap(([category, names], catIdx) =>
  names.map((name, idx) => {
    const seed = catIdx * 5 + idx + 1;
    const offset = idx * 2;

    return {
      id: `${category}-${name.toLowerCase()}`,
      name,
      category,
      steps: [
        { from: [18 + offset, 70], to: [50, 30 + (seed % 5)] },
        { from: [50, 30 + (seed % 5)], to: [82 - offset, 70] },
        { from: [26, 58], to: [74, 58] },
        { from: [30, 72], to: [42 + (seed % 8), 84] },
        { from: [70, 72], to: [58 - (seed % 8), 84] },
      ],
    };
  })
);

const COLOR_TEMPLATES = Object.entries(CATEGORIES).flatMap(([category, names], catIdx) =>
  names.map((name, idx) => {
    const p = 10 + idx * 2;
    const recommended = ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93"];

    return {
      id: `c-${category}-${name.toLowerCase()}`,
      name,
      category,
      viewBox: "0 0 120 120",
      sections: [
        { id: "head", path: `M60 ${16 + p / 4} L${86 - p / 3} ${36 + p / 6} L60 ${56 - p / 8} L${34 + p / 3} ${36 + p / 6} Z`, color: recommended[(catIdx + idx) % 5] },
        { id: "body", path: `M28 ${56 + p / 8} Q60 ${78 + p / 8} ${92} ${56 + p / 8} L82 98 H38 Z`, color: recommended[(catIdx + idx + 1) % 5] },
        { id: "left", path: `M30 72 L44 92 L20 96 Z`, color: recommended[(catIdx + idx + 2) % 5] },
        { id: "right", path: `M90 72 L76 92 L100 96 Z`, color: recommended[(catIdx + idx + 3) % 5] },
        { id: "base", path: "M26 100 H94 V112 H26 Z", color: recommended[(catIdx + idx + 4) % 5] },
      ],
    };
  })
);
