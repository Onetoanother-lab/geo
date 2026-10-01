import { setState, useStore } from '../../app/store';
import { Dialog } from './Dialog';
import { SourcesList } from './SourcesList';

export function SourcesDialog() {
  const open = useStore((s) => s.sourcesOpen);
  return (
    <Dialog open={open} onClose={() => setState({ sourcesOpen: false })} label="Manbalar" className="dialog--sources">
      <p className="label">Manbalar</p>
      <p className="title sources-heading">Raqamlar qayerdan olingan</p>
      <p className="body-copy">Har bir raqam yil, hudud va manba bilan berilgan. Rasmiy bayonotlar alohida belgilangan.</p>
      <SourcesList />
    </Dialog>
  );
}
