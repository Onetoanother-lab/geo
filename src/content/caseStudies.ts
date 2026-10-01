import type { FactId } from './facts';
import type { SourceId } from './sources';

/** UK woodland cover, % of land area. Forest Research, Forestry Statistics (Table 1.2) + Provisional Woodland Statistics 2026. */
export const UK_WOODLAND_SERIES: { year: number; label: string; percent: number; sourceId: SourceId }[] = [
  { year: 1905, label: '1905', percent: 4.7, sourceId: 'uk-forestry-stats-history' },
  { year: 1924, label: '1924', percent: 5.0, sourceId: 'uk-forestry-stats-history' },
  { year: 1947, label: '1947', percent: 5.9, sourceId: 'uk-forestry-stats-history' },
  { year: 1965, label: '1965', percent: 7.4, sourceId: 'uk-forestry-stats-history' },
  { year: 1980, label: '1980', percent: 9.0, sourceId: 'uk-forestry-stats-history' },
  { year: 1997, label: '1995–99', percent: 11.3, sourceId: 'uk-forestry-stats-history' },
  { year: 2022, label: '2022', percent: 13.3, sourceId: 'uk-forestry-stats-history' },
  { year: 2026, label: '2026', percent: 14, sourceId: 'uk-woodland-2026' },
];

export const UK_MILESTONES: { year: number; text: string; factId?: FactId }[] = [
  { year: 1919, text: 'O‘rmon to‘g‘risidagi qonun — davlat o‘rmon ekishni boshladi', factId: 'ukForestryAct' },
];

/** Japan: forest share and planted share (Forestry Agency / World Bank). */
export const JAPAN = {
  forestShareFact: 'japanShare' as FactId,
  plantedFact: 'japanPlanted' as FactId,
  areaFact: 'japanArea' as FactId,
  /** Fraction of land that is forest and fraction of forest that is planted (for the dot visual). */
  forestFraction: 0.68,
  plantedFraction: 0.4,
};

/** World comparison for Japan. */
export const WORLD_FOREST_FRACTION = 0.32;

/** Uzbekistan landscape zones used in the local case (qualitative, no area shares implied). */
export const UZ_ZONES = ['mountains', 'desert', 'aral'] as const;

/** Recovery timeline milestones (Act X). Ages are visual markers for the growing tree; the scientific
 * recovery times come from Poorter et al. 2021 (facts recovery*). */
export const RECOVERY_MARKERS: { at: number; label: string; factId?: FactId }[] = [
  { at: 0.04, label: '1-kun' },
  { at: 0.2, label: '1 yil' },
  { at: 0.36, label: '10 yil', factId: 'recoverySoil' },
  { at: 0.52, label: '25 yil', factId: 'recoveryFunction' },
  { at: 0.7, label: '60 yil', factId: 'recoveryStructure' },
  { at: 0.9, label: '120+ yil', factId: 'recoveryBiomass' },
];

/** Global drivers ring (FAO FRA 2020 Remote Sensing Survey, 2000–2018). Approximate shares: “almost 50” + 38.5 of “almost 90”. */
export const DRIVER_RING: { key: 'cropland' | 'grazing' | 'other'; share: number; factId?: FactId }[] = [
  { key: 'cropland', share: 0.5, factId: 'driverCropland' },
  { key: 'grazing', share: 0.385, factId: 'driverGrazing' },
  { key: 'other', share: 0.115 },
];
