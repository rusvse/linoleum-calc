export function initCalculator() {
  function toMeters(value, units) {
    return units === 'mm' ? value / 1000 : value;
  }

  function calculateRoom(room, allowanceM, rollWidths, mode) {
    const roomLenWithAllowance = room.length + allowanceM * 2;
    const roomWidthWithAllowance = room.width + allowanceM * 2;
    const area = room.length * room.width;

    let best = null;

    rollWidths.forEach((rollWidth) => {
      const options = [
        { rollWidth, length: roomWidthWithAllowance, width: roomLenWithAllowance },
        { rollWidth, length: roomLenWithAllowance, width: roomWidthWithAllowance }
      ];

      options.forEach((opt) => {
        const strips = Math.ceil(opt.width / rollWidth);
        const waste = strips * rollWidth - opt.width;
        const seams = strips - 1;

        const score = mode === 'seams' ? seams : waste;

        if (!best || score < best.score) {
          best = { rollWidth, length: opt.length, width: opt.width, strips, waste, seams, score, area };
        }
      });
    });

    return best;
  }

  window.linoleumCalculator = { toMeters, calculateRoom };
}
