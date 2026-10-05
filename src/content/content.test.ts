import { describe, expect, it } from 'vitest';
import { FACTS, RESEARCH_GAPS } from './facts';
import { SOURCES, sourceById } from './sources';
import { NARRATIVE } from './narrative';
import { CHAPTERS, CHAPTER_IDS } from '../app/chapters';
import { UK_WOODLAND_SERIES, DRIVER_RING, RECOVERY_MARKERS } from './caseStudies';

function strings(value: unknown, path = ''): [string, string][] {
  if (typeof value === 'string') return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
  return [];
}

const ALL_COPY = strings(NARRATIVE);

describe('sources & facts', () => {
  it('every fact cites an existing source', () => {
    for (const f of Object.values(FACTS)) expect(sourceById(f.sourceId), f.id).toBeDefined();
  });

  it('source ids are unique and URLs are absolute https', () => {
    const ids = SOURCES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of SOURCES) expect(s.url, s.id).toMatch(/^https:\/\//);
  });

  it('every fact id matches its key and has a label', () => {
    for (const [k, f] of Object.entries(FACTS)) {
      expect(f.id).toBe(k);
      expect(f.label.length).toBeGreaterThan(3);
    }
  });

  it('official, unverified claims are flagged as reported', () => {
    expect(FACTS.aralPlanted.confidence).toBe('reported');
  });

  it('chapters reference existing sources', () => {
    for (const c of CHAPTERS) for (const s of c.sources) expect(sourceById(s), `${c.id} → ${s}`).toBeDefined();
  });

  it('case-study series cite sources and are ordered', () => {
    for (const p of UK_WOODLAND_SERIES) expect(sourceById(p.sourceId)).toBeDefined();
    const years = UK_WOODLAND_SERIES.map((p) => p.year);
    expect([...years].sort((a, b) => a - b)).toEqual(years);
    expect(DRIVER_RING.reduce((s, r) => s + r.share, 0)).toBeCloseTo(1, 5);
    for (const m of RECOVERY_MARKERS) if (m.factId) expect(FACTS[m.factId]).toBeDefined();
  });

  it('documents research gaps', () => {
    expect(RESEARCH_GAPS.length).toBeGreaterThan(0);
  });
});

describe('Uzbek copy conventions', () => {
  it('uses ‘ (U+2018) for o‘/g‘ and never ASCII quotes, backticks or U+02BB', () => {
    for (const [path, s] of ALL_COPY) {
      expect(s, path).not.toMatch(/[`ʻ]/);
      expect(s, path).not.toMatch(/[oOgG]'/);
      expect(s, path).not.toMatch(/[oOgG]’/);
    }
  });

  it('keeps numbers out of narrative copy (they live in facts.ts)', () => {
    for (const [path, s] of ALL_COPY) {
      const withoutFormulas = s.replace(/\b(CO|O)2\b/g, '');
      expect(withoutFormulas, path).not.toMatch(/\d/);
    }
  });

  it('keeps the large statements short (≤ 12 words)', () => {
    const big = [
      NARRATIVE.intro.once,
      NARRATIVE.intro.notOnly,
      NARRATIVE.intro.notJust,
      NARRATIVE.intro.system,
      NARRATIVE.system.title,
      NARRATIVE.cut.prompt,
      NARRATIVE.causes.title,
      NARRATIVE.consequences.title,
      NARRATIVE.aral.once,
      NARRATIVE.aral.left,
      NARRATIVE.aral.notSea,
      NARRATIVE.futures.end1,
      NARRATIVE.futures.end2,
      NARRATIVE.finale.echoAfter,
    ];
    for (const s of big) expect(s.split(/\s+/).length, s).toBeLessThanOrEqual(12);
  });

  it('includes the required lines from the brief verbatim', () => {
    expect(NARRATIVE.intro.once).toBe('Bir paytlar bu yerda o‘rmon bor edi.');
    expect(NARRATIVE.intro.notOnly).toBe('O‘rmon faqat daraxtlardan iborat emas.');
    expect(NARRATIVE.intro.notJust).toBe('Bir daraxt yo‘qoldi.');
    expect(NARRATIVE.intro.system).toBe('Lekin u yolg‘iz emas edi.');
    expect(NARRATIVE.futures.end1).toBe('O‘rmon kelajagi o‘z-o‘zidan hal bo‘lmaydi.');
    expect(NARRATIVE.futures.end2).toBe('Uni qanday qoldirishimiz bugungi qarorlarimizga bog‘liq.');
    expect(NARRATIVE.simulator.disclaimer).toBe('Bu ilmiy model emas. Bu ekologik bog‘liqliklarni soddalashtirib ko‘rsatadigan interaktiv model.');
  });

  it('has all twelve chapters in order', () => {
    expect(CHAPTER_IDS).toHaveLength(12);
    expect(CHAPTERS.map((c) => c.id)).toEqual([...CHAPTER_IDS]);
  });
});
