import { geoEqualEarth, geoGraticule10, geoPath, type GeoProjection } from 'd3-geo';
import { feature, merge, mesh } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry, LineString, MultiLineString, MultiPolygon, Polygon } from 'geojson';
import type { GeometryCollection, GeometryObject, MultiPolygon as TopoMultiPolygon, Polygon as TopoPolygon, Topology } from 'topojson-specification';

export type CountryFeature = Feature<Geometry, { name: string }> & { id?: string };
type CountryTopology = Topology<{ countries: GeometryCollection<{ name: string }> }>;

async function loadTopology(): Promise<CountryTopology> {
  return (await import('world-atlas/countries-110m.json')).default as unknown as CountryTopology;
}

/** Natural Earth 110m countries (bundled via world-atlas), loaded lazily as its own chunk. */
export async function loadCountries(): Promise<CountryFeature[]> {
  const topo = await loadTopology();
  const fc = feature(topo, topo.objects.countries) as unknown as FeatureCollection<Geometry, { name: string }>;
  return fc.features as CountryFeature[];
}

/**
 * Borderless geography for the documentary map: all land as one shape, a region as one
 * shape, and country borders only for the countries asked for.
 */
export type World = {
  countries: CountryFeature[];
  land: MultiPolygon;
  region: (ids: string[]) => MultiPolygon;
  borders: (ids: string[]) => MultiLineString;
};

export async function loadWorld(): Promise<World> {
  const topo = await loadTopology();
  const fc = feature(topo, topo.objects.countries) as unknown as FeatureCollection<Geometry, { name: string }>;
  const geometries = topo.objects.countries.geometries as unknown as (TopoPolygon | TopoMultiPolygon)[];
  const pick = (ids: string[]) => geometries.filter((g) => ids.includes(String(g.id)));
  // Antarctica (010) is left out so the map keeps its empty southern ocean.
  const inhabited = geometries.filter((g) => String(g.id) !== '010');
  return {
    countries: fc.features as CountryFeature[],
    land: merge(topo, inhabited) as MultiPolygon,
    region: (ids) => merge(topo, pick(ids)) as MultiPolygon,
    borders: (ids) => {
      const chosen = new Set<GeometryObject>(pick(ids));
      return mesh(topo, topo.objects.countries as unknown as GeometryObject, (a: GeometryObject, b: GeometryObject) => chosen.has(a) && chosen.has(b)) as MultiLineString;
    },
  };
}

export const MAP_W = 1000;
export const MAP_H = 520;

export function makeProjection(): GeoProjection {
  return geoEqualEarth().fitExtent(
    [
      [12, 12],
      [MAP_W - 12, MAP_H - 12],
    ],
    { type: 'Sphere' },
  );
}

export function pathFor(projection: GeoProjection) {
  return geoPath(projection);
}

export const graticule = geoGraticule10();

/** A latitude band as a GeoJSON polygon (dense enough to bend correctly on Equal Earth). */
export function latBand(south: number, north: number): Feature<Polygon> {
  const coords: [number, number][] = [];
  for (let lon = -180; lon <= 180; lon += 4) coords.push([lon, north]);
  for (let lon = 180; lon >= -180; lon -= 4) coords.push([lon, south]);
  coords.push(coords[0]);
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [coords] } };
}

/** A parallel as a line (dense enough to bend correctly on Equal Earth). */
export function latLine(lat: number): Feature<LineString> {
  const coordinates: [number, number][] = [];
  for (let lon = -180; lon <= 180; lon += 4) coordinates.push([lon, lat]);
  return { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } };
}

/** Lon/lat box as a polygon (used to frame small regions such as the Aral Sea). */
export function box(w: number, s: number, e: number, n: number): Feature<Polygon> {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [w, s],
          [w, n],
          [e, n],
          [e, s],
          [w, s],
        ],
      ],
    },
  };
}

/** Camera transform that frames [[x0,y0],[x1,y1]] inside the map with padding. */
export function frame(bounds: [[number, number], [number, number]], maxScale = 7): { k: number; tx: number; ty: number } {
  const [[x0, y0], [x1, y1]] = bounds;
  const dx = Math.max(1, x1 - x0);
  const dy = Math.max(1, y1 - y0);
  const k = Math.min(maxScale, 0.72 / Math.max(dx / MAP_W, dy / MAP_H));
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  return { k, tx: MAP_W / 2 - k * cx, ty: MAP_H / 2 - k * cy };
}
