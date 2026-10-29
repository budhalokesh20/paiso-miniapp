import { h } from '../../jsx';

export function EarnIcon({ index }: { index: number }) {
  return <span className={`earn-art earn-art-${index}`} aria-hidden="true" />;
}
