export function darkenColor(hex: string, amount: number = 1.0): string {
    let col = hex.startsWith('#') ? hex.slice(1) : hex;
    if (col.length === 3) {
        col = col.split('').map(c => c + c).join('');
    }

    const num = parseInt(col, 16);
//   const r = Math.max(0, (num >> 16) - 255 * amount);
//   const g = Math.max(0, ((num >> 8) & 0x00FF) - 255 * amount);
//   const b = Math.max(0, (num & 0x0000FF) - 255 * amount);

    let r = Math.max(255 * 0.2, Math.abs(255 * amount - (num >> 16)));
    let g = Math.max(255 * 0.2, Math.abs(255 * amount - ((num >> 8) & 0x00FF)));
    let b = Math.max(255 * 0.2, Math.abs(255 * amount - (num & 0x0000FF)));
    r = Math.min(255* 0.9, r);
    g = Math.min(255* 0.9, g);
    b = Math.min(255* 0.9, b);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b | 0).toString(16).slice(1)}`;
}