const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const signatureINput = $('#signature-input');
let drawing = false;
canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.moveTo(e.offsetX, e.offsetY);
    draw(e);
});
canvas.addEventListener('mouseup', (e) => {
    drawing = false;
    ctx.closePath();
    signatureINput.val(canvas.toDataURL('image/png'));
    console.log('image', canvas.toDataURL('image/png'));
    console.log('object', signatureINput.val(canvas.toDataURL('image/png')));
});
canvas.addEventListener('mousemove', (e) => {
    draw(e);
});

function draw(e) {
    if (!drawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
}
