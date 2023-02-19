export const getNextTurn = (
  attrib1: number[],
  attrib2: number[],
  spd1: number,
  spd2: number,
  ctr1: number,
  ctr2: number,
) => {
  while (ctr1 < 200 || ctr2 < 200) {
    ctr1 += spd1
    ctr2 += spd2
  }

  if (ctr1 >= 200 && ctr2 >= 200) {
    // by order: ctr, spd, vit, str, int, hp

    if (ctr1 > ctr2) {
      return {
        turn: 1,
        ctr1: ctr1 - 100,
        ctr2,
      }
    } else if (ctr1 < ctr2) {
      return {
        turn: 1,
        ctr1,
        ctr2: ctr2 - 100,
      }
    }
  }
}
