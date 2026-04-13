# KidSketch Adventure

Interactive drawing and coloring web app for kids with:

- Draw mode with **25 guided templates** across categories: birds, animals, vegetables, fruits, flowers.
- Color mode with guided section-by-section painting flow.
- Stars + celebration effects, reset current template, auto next template.
- Responsive layout for mobile, tablet, desktop.
- Dockerized for one-command deployment.

## Run locally

Open `index.html` in a browser, or run a simple server:

```bash
python3 -m http.server 8080
```

## Run with Docker

```bash
docker build -t kidsketch .
docker run --rm -p 8080:80 kidsketch
```

Then open `http://localhost:8080`.
