import { h } from '../../jsx';
import { UiIcon } from '../shared/UiIcon';

export function InviteBanner() {
  return (
    <button type="button" className="invite-strip home-invite" onClick={() => window.showTab('refer')}>
      <span className="invite-people"><UiIcon name="friends" size={38} /></span>
      <span className="invite-copy">
        <b>Invite Friends</b>
        <small>Get extra rewards when your friends join!</small>
      </span>
      <img src="/assets/paiso-gift-v2.webp" alt="" width="56" height="56" decoding="async" />
    </button>
  );
}
