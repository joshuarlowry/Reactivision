export function drawPixelSpeechBubble(ctx, canvas, x, y, text) {
    const padding = 10;
    ctx.font = '20px "Courier New", Courier, monospace';
    ctx.textBaseline = 'top';
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = 24;

    const bubbleWidth = textWidth + padding * 2;
    const bubbleHeight = textHeight + padding * 2;

    // Adjust position if it would overflow right edge
    let drawX = x;
    if (drawX + bubbleWidth > canvas.width) {
        drawX = canvas.width - bubbleWidth - 10;
    }

    // Shift up a bit
    const drawY = y - bubbleHeight + 20;

    // Blocky bubble
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;

    ctx.fillRect(drawX, drawY, bubbleWidth, bubbleHeight);
    ctx.strokeRect(drawX, drawY, bubbleWidth, bubbleHeight);

    // Text
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.fillText(text, drawX + padding, drawY + padding);

    // Simple connecting block (tail)
    if (drawX === x) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(drawX - 8, drawY + bubbleHeight - 20, 10, 10);
        ctx.strokeRect(drawX - 8, drawY + bubbleHeight - 20, 10, 10);

        // Cover the border overlap
        ctx.fillRect(drawX, drawY + bubbleHeight - 20, 4, 10);
    }
}
