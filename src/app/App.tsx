import { Experience } from './Experience';
import { PresenterWindow } from '../components/controls/PresenterWindow';

export function App() {
  const isPresenter = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('presenter');
  return isPresenter ? <PresenterWindow /> : <Experience />;
}
