export type Source = {
  id: string;
  organization: string;
  title: string;
  year?: number;
  url: string;
  accessed?: string;
  /** Short Uzbek note on what the source is used for. */
  usedFor?: string;
};

export type Confidence = 'verified' | 'reported' | 'secondary';

export type Stat = {
  id: string;
  value: string | number;
  unit?: string;
  year?: string;
  region?: string;
  /** Uzbek label shown next to the value. */
  label: string;
  /** Optional definition / nuance shown in the source panel. */
  note?: string;
  sourceId: string;
  confidence: Confidence;
};

export type ResearchGap = {
  claim: string;
  status: string;
  handling: string;
};
