// Simple script to generate extension icons
// Run with: node generate-icons.js

const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Purple gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#9333ea');
  gradient.addColorStop(1, '#ec4899');
  ctx.fillStyle = gradient;

  // Rounded rectangle
  const radius = size * 0.2;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // Gift icon (simple box with ribbon)
  ctx.strokeStyle = 'white';
  ctx.fillStyle = 'white';
  ctx.lineWidth = size * 0.08;

  const boxSize = size * 0.5;
  const boxX = (size - boxSize) / 2;
  const boxY = (size - boxSize) / 2 + size * 0.05;

  // Box
  ctx.strokeRect(boxX, boxY, boxSize, boxSize);

  // Vertical ribbon
  const ribbonWidth = size * 0.08;
  ctx.fillRect(size / 2 - ribbonWidth / 2, boxY, ribbonWidth, boxSize);

  // Horizontal ribbon
  ctx.fillRect(boxX, size / 2 - ribbonWidth / 2, boxSize, ribbonWidth);

  // Bow
  const bowSize = size * 0.15;
  ctx.beginPath();
  ctx.arc(size / 2 - bowSize / 2, boxY - bowSize / 3, bowSize / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size / 2 + bowSize / 2, boxY - bowSize / 3, bowSize / 2, 0, Math.PI * 2);
  ctx.fill();

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Created ${filename}`);
}

// Generate all icon sizes
try {
  createIcon(16, './icon-16.png');
  createIcon(48, './icon-48.png');
  createIcon(128, './icon-128.png');
  console.log('All icons generated successfully!');
} catch (error) {
  console.error('Error generating icons:', error.message);
  console.log('\nNote: This script requires the "canvas" package.');
  console.log('Install it with: npm install canvas');
  console.log('\nAlternatively, open create-icons.html in a browser and save the images manually.');
}
