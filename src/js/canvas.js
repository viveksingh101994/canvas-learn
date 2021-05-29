import gsap from 'gsap';
import Dot from './dot';
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const radius = 300;
const img = document.querySelector('img');
let isImage = false;

canvas.width = innerWidth;
canvas.height = innerHeight;

function animateDot(dot, canvas) {
  const rand = Math.random() * Math.PI * 2;
  let x = Math.sin(rand) * radius + canvas.width / 2;
  let y = Math.cos(rand) * radius + canvas.height / 2;
  if (isImage) {
    (x = dot.imageX), (y = dot.imageY);
  }
  gsap.to(dot, {
    x,
    y,
    duration: 1.75 + Math.random(),
    ease: 'cubic.inOut',
    onComplete: () => {
      animateDot(dot, canvas);
    },
  });
}

addEventListener('click', () => {
  isImage = !isImage;
});
addEventListener('load', () => {
  c.drawImage(img, 0, 0);
  const imageData = c.getImageData(
    0,
    0,
    img.naturalWidth,
    img.naturalHeight
  ).data;
  const pixels = [];
  const dots = [];
  for (let i = 0; i < imageData.length; i += 4) {
    if (imageData[i] === 0) continue;
    const x = (i / 4) % img.naturalWidth;
    const y = Math.floor(Math.floor(i / img.naturalWidth) / 4);
    if (x % 5 === 0 && y % 5 === 0) {
      pixels.push({
        x,
        y,
        r: imageData[i],
        g: imageData[i + 1],
        b: imageData[i + 2],
      });
    }
  }

  pixels.forEach((pixel, i) => {
    const imageX = pixel.x + canvas.width / 2 - img.naturalWidth / 2;
    const imageY = pixel.y + canvas.height / 2 - img.naturalHeight / 2;
    const rand = Math.random() * Math.PI * 2;
    const x = Math.sin(rand) * radius + canvas.width / 2;
    const y = Math.cos(rand) * radius + canvas.height / 2;
    dots.push(new Dot(x, y, pixel.r, pixel.g, pixel.b, imageX, imageY));
    animateDot(dots[i], canvas);
  });

  function animate() {
    requestAnimationFrame(animate);

    c.clearRect(0, 0, innerWidth, innerHeight);

    dots.forEach((dot) => {
      dot.draw(c);
      // dot.x++;
    });
  }

  animate();
});
