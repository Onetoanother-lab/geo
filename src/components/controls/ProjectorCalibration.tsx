import { useState } from 'react';
import type { PresenterSnapshot } from '../../lib/presenter/channel';

export function ProjectorCalibration({ snapshot, onLift, onAudio }: { snapshot: PresenterSnapshot | null; onLift: (n: number) => void; onAudio: () => void }) {
  const [lift, setLift] = useState(0);
  return <section className="calibration" aria-labelledby="calibration-title" data-local-keys>
    <h2 className="title" id="calibration-title">Proyektor tekshiruvi</h2>
    <p>Bu sinov taqdimotchi oynasida. Proyektorni tekshirish uchun shu oynani vaqtincha proyektorga ko‘chiring.</p>
    <p className="label">Asosiy oyna: {snapshot ? `${snapshot.resolution[0]} × ${snapshot.resolution[1]}` : 'ulanmagan'} · Harakat: {snapshot?.reduced ? 'kamaytirilgan' : 'to‘liq'}</p>
    <div className="calibration-frame">
      <span className="calibration-ratio">16:9</span>
      <div className="calibration-safe"><span>Xavfsiz matn maydoni</span></div>
      <div className="calibration-content">
        <div className="calibration-steps" aria-label="Soyadagi farqlanuvchi olti pog‘ona">
          {['#07100c', '#102019', '#1d3026', '#2c4434', '#46604c', '#6d826c'].map((c, i) => <div key={c} style={{ background: c }}><span>{i + 1}</span></div>)}
        </div>
        <p className="title">Har bir soya ko‘rinsin.</p>
        <p className="calibration-body">O‘rmon. Tuproq. Suv. Oddiy matn ravshan o‘qilishi kerak.</p>
        <p className="calibration-muted">Ikkilamchi matn ham o‘qilsin.</p>
      </div>
      <div className="calibration-lift" style={{ opacity: lift }} />
    </div>
    <label className="calibration-lift-label">Soyalarni yoritish
      <input type="range" min="0" max="14" value={Math.round(lift * 100)} onChange={(e) => { const n = Number(e.target.value) / 100; setLift(n); onLift(n); }} />
    </label>
    <p className="pw-small">Birinchi pog‘onalar qo‘shilib ketsa, proyektor yorqinligini yoki soyalar yoritilishini sozlang. Yoritish asosiy oynaga ham qo‘llanadi.</p>
    <button className="pill-button" type="button" disabled={!snapshot?.soundOn} onClick={onAudio}>Ovoz sinovi</button>
    {!snapshot?.soundOn && <p className="pw-small">Sinov uchun asosiy taqdimotda ovozni yoqing.</p>}
  </section>;
}
