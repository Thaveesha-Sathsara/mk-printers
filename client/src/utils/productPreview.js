export const DEFAULT_PRINT_ZONE = {
  x: 0.2,
  y: 0.25,
  width: 0.6,
  height: 0.5,
};

export function resolvePrintZone(printZone) {
  if (!printZone) return DEFAULT_PRINT_ZONE;

  return {
    x: printZone.x ?? DEFAULT_PRINT_ZONE.x,
    y: printZone.y ?? DEFAULT_PRINT_ZONE.y,
    width: printZone.width ?? DEFAULT_PRINT_ZONE.width,
    height: printZone.height ?? DEFAULT_PRINT_ZONE.height,
  };
}

export function loadImage(src) {
  if (!src) return Promise.resolve(null);

  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

export function drawImageContain(ctx, image, x, y, width, height) {
  const imgAspect = image.width / image.height;
  const boxAspect = width / height;

  let drawWidth = width;
  let drawHeight = height;
  let drawX = x;
  let drawY = y;

  if (imgAspect > boxAspect) {
    drawHeight = width / imgAspect;
    drawY = y + (height - drawHeight) / 2;
  } else {
    drawWidth = height * imgAspect;
    drawX = x + (width - drawWidth) / 2;
  }

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

export async function renderProductMockup(canvas, options = {}) {
  const {
    baseImageUrl,
    overlayUrl,
    userImageUrl,
    baseColor = '#ffffff',
    printZone,
  } = options;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const size = canvas.width;
  const zone = resolvePrintZone(printZone);

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  const [baseImage, userImage, overlayImage] = await Promise.all([
    loadImage(baseImageUrl),
    loadImage(userImageUrl),
    loadImage(overlayUrl),
  ]);

  if (baseImage && !overlayImage) {
    drawImageContain(ctx, baseImage, 0, 0, size, size);
  }

  if (userImage) {
    const x = zone.x * size;
    const y = zone.y * size;
    const width = zone.width * size;
    const height = zone.height * size;
    drawImageContain(ctx, userImage, x, y, width, height);
  } else if (baseImage && overlayImage) {
    drawImageContain(ctx, baseImage, 0, 0, size, size);
  }

  if (overlayImage) {
    drawImageContain(ctx, overlayImage, 0, 0, size, size);
  }

  return canvas;
}
