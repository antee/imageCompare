# ImageCompare

A browser-based tool for comparing a reference image against a folder of images. It generates pixel-level diff images highlighting differences in red and displays the results in a table with a bar chart overview.

## Features

- Upload a reference ("before") image and select a folder of images to compare against
- Pixel diff using Euclidean distance in RGB color space
- Adjustable sensitivity slider
- Filter results by maximum allowed difference
- Bar chart visualizing diff percentages
- Download individual diff images as PNG
- Export results as CSV

## Getting started

```bash
npm install
npm run dev
```

To make the app accessible to others on your local network:

```bash
npm run dev -- --host
```
