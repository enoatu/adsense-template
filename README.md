# Pixel Art Editor & Animator

This is a simple, browser-based pixel art editor and animator. It's a static web application with no server-side dependencies, making it easy to host on any static hosting service.

## Features

-   **Pixel Art Drawing**: Draw and erase pixels on a customizable canvas.
-   **Color Picker**: Choose any color you like.
-   **Adjustable Canvas Size**: Create art on 16x16, 32x32, or 64x64 canvases.
-   **Animation Creation**: Create frame-by-frame animations.
-   **Adjustable Frame Rate**: Control the speed of your animation.
-   **Live Preview**: See your animation in real-time.
-   **Export Options**: Export your creations as PNG or animated GIF files.

## How to Use

1.  **Drawing**:
    *   Select the "Pen" tool to draw pixels with the chosen color.
    *   Select the "Eraser" tool to erase pixels.
    *   Use the color picker to change the drawing color.
    *   Click "Clear" to clear the entire canvas.

2.  **Animation**:
    *   Click "Add Frame" to add the current canvas image as a new animation frame.
    *   Click on a frame in the frame list to view and edit it.
    *   Click the "x" button on a frame to delete it.
    *   Use the "FPS" slider to adjust the animation's frame rate.
    *   The animation will play in the preview window.

3.  **Exporting**:
    *   Click "Export as PNG" to download the current frame as a PNG image.
    *   Click "Export as GIF" to download the entire animation as a GIF file.

## Local Development

To run this project locally, you can simply open the `public/index.html` file in your web browser. No special build steps or dependencies are required.

## Deployment

This application is a static website, so it can be deployed to any static hosting service like GitHub Pages, Cloudflare Pages, Netlify, or Vercel. Simply upload the contents of the `public` directory to your hosting provider.