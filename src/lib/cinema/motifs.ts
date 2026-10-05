/** Shared topology, not geographic or botanical survey data. */
export const LEAF = 'M800,180C1010,230 1100,400 800,700C500,400 590,230 800,180Z';
export const TRUNK = 'M800,820C799,690 803,540 800,420M800,560C750,480 650,380 540,270M800,490C860,410 970,310 1070,190';
export const SEEDLING = 'M800,800C800,760 800,710 800,670M800,726C745,735 725,685 715,671C760,660 797,680 800,726M800,701C850,705 879,656 890,643C841,637 808,661 800,701';
export const RINGS = [45, 90, 135, 180, 225].map((r) => `M${800-r},450a${r},${r} 0 1,0 ${2*r},0a${r},${r} 0 1,0 ${-2*r},0`).join('');
export const ROOTS = 'M800,590C800,670 810,720 800,820M800,660C700,690 650,720 510,760M800,660C920,690 1010,720 1120,770M710,690C690,740 650,770 600,810M960,710C1010,760 1050,790 1060,850';
export const RADIAL = [0,1,2,3,4,5].map((i) => {
  const a = i * Math.PI / 3;
  return `M${800+Math.cos(a)*110},${450+Math.sin(a)*110}L${800+Math.cos(a)*300},${450+Math.sin(a)*300}`;
}).join('');
export const FRACTURES = 'M800,230L770,350L840,440L780,610L830,770M770,350L620,390L470,330M840,440L990,480L1130,410M780,610L610,570L420,650M990,480L1020,650L1170,700';
export const VEINS = [0,1,2,3,4,5,6].map((i) => {
  const y = 285 + i * 48;
  const side = i % 2 ? -1 : 1;
  return `M800,${y+70}C${800+side*35},${y+20} ${800+side*85},${y-5} ${800+side*(100-i*7)},${y-35}`;
});
export const RIVERS = VEINS.map((_, i) => {
  const y = 220 + i * 67;
  const side = i % 2 ? -1 : 1;
  return `M${740+i*11},${y+110}C${800+side*70},${y+12} ${800+side*245},${y+42} ${800+side*420},${y-70}`;
});
export const RIVER_SPINE = `M740,230${VEINS.map((_, i) => `L${740+i*11},${330+i*67}`).join('')}L800,830`;
export const GEO_LINES = VEINS.map((_, i) => `M${240+i*25},${215+i*75}C550,${180+i*75} 1050,${180+i*75} ${1360-i*25},${215+i*75}`);
