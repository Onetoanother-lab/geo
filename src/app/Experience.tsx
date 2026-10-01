import { EntryGate } from '../components/layout/EntryGate';
import { ControlBar } from '../components/controls/ControlBar';
import { ProgressRail } from '../components/controls/ProgressRail';
import { ChapterNav } from '../components/controls/ChapterNav';
import { SourcesDialog } from '../components/controls/SourcesDialog';
import { PresenterPanel } from '../components/controls/PresenterPanel';
import { useChapterTracking } from '../hooks/useChapterTracking';
import { useAppEffects } from './useAppEffects';
import { IntroForest } from '../scenes/IntroForest/IntroForest';
import { LivingForest } from '../scenes/LivingForest/LivingForest';
import { DeforestationReveal } from '../scenes/DeforestationReveal/DeforestationReveal';
import { Causes } from '../scenes/Causes/Causes';
import { Consequences } from '../scenes/Consequences/Consequences';
import { WorldMap } from '../scenes/WorldMap/WorldMap';
import { CaseStudies } from '../scenes/CaseStudies/CaseStudies';
import { Aral } from '../scenes/Aral/Aral';
import { RecoveryTimeline } from '../scenes/RecoveryTimeline/RecoveryTimeline';
import { LandSimulator } from '../scenes/LandSimulator/LandSimulator';
import { FutureSplit } from '../scenes/FutureSplit/FutureSplit';
import { Finale } from '../scenes/Finale/Finale';
import '../components/controls/controls.css';

/** The whole presentation: gate → twelve acts → global controls. */
export function Experience() {
  useChapterTracking();
  useAppEffects();
  return (
    <>
      <EntryGate />
      <main id="experience" tabIndex={-1} aria-label="O‘rmon: yo‘qolayotgan nafas">
        <IntroForest />
        <LivingForest />
        <DeforestationReveal />
        <Causes />
        <Consequences />
        <WorldMap />
        <CaseStudies />
        <Aral />
        <LandSimulator />
        <RecoveryTimeline />
        <FutureSplit />
        <Finale />
      </main>
      <ControlBar />
      <ProgressRail />
      <ChapterNav />
      <SourcesDialog />
      <PresenterPanel />
      <div id="cut-overlay" className="cut-overlay" aria-hidden="true" />
      <div id="live-region" className="visually-hidden" aria-live="polite" />
    </>
  );
}
