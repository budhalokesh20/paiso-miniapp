import { h } from '../../jsx';

export type FeedbackKind = 'success' | 'warning' | 'error' | 'info';
let feedbackTimer: number | undefined;
let feedbackExitTimer: number | undefined;
let feedbackRemaining = 0;
let feedbackDeadline = 0;

function pauseFeedback() {
  if (!feedbackTimer) return;
  if (feedbackTimer) window.clearTimeout(feedbackTimer);
  feedbackTimer = undefined;
  feedbackRemaining = Math.max(0, feedbackDeadline - Date.now());
}

function resumeFeedback() {
  const toast = document.getElementById('toast');
  if (!toast?.classList.contains('show') || feedbackTimer || toast.matches(':hover') || toast.contains(document.activeElement)) return;
  feedbackDeadline = Date.now() + feedbackRemaining;
  feedbackTimer = window.setTimeout(dismissFeedback, feedbackRemaining);
}

export function dismissFeedback() {
  const toast = document.getElementById('toast');
  if (feedbackTimer) window.clearTimeout(feedbackTimer);
  feedbackTimer = undefined;
  toast?.classList.remove('show');
  toast?.setAttribute('aria-hidden', 'true');
  feedbackExitTimer = window.setTimeout(() => {
    if (toast && typeof toast.hidePopover === 'function' && toast.matches(':popover-open')) toast.hidePopover();
  }, 180);
}

export function FeedbackToast() {
  return <div id="toast" className="feedback-toast" popover="manual" role="status" aria-live="polite" aria-atomic="true" aria-hidden="true"
    onMouseEnter={pauseFeedback} onMouseLeave={resumeFeedback} onFocusIn={pauseFeedback} onFocusOut={resumeFeedback}>
    <span id="feedbackIcon" className="feedback-icon" aria-hidden="true" />
    <div className="feedback-copy"><strong id="feedbackTitle" /><p id="feedbackMessage" /></div>
    <button type="button" className="feedback-dismiss" aria-label="Dismiss notification" onClick={dismissFeedback}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
    </button>
  </div>;
}

export function showFeedback(message: string, kind: FeedbackKind = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  if (feedbackTimer) window.clearTimeout(feedbackTimer);
  if (feedbackExitTimer) window.clearTimeout(feedbackExitTimer);
  feedbackTimer = undefined;
  const dialog = document.querySelector<HTMLDialogElement>('dialog[open]');
  const host = dialog || document.body;
  if (toast.parentElement !== host) host.append(toast);
  if (dialog) dialog.addEventListener('close', () => {
    if (toast.parentElement === dialog) { dismissFeedback(); document.body.append(toast); }
  }, { once: true });
  const titles: Record<FeedbackKind, string> = { success: 'Success', warning: 'Please check', error: 'Something went wrong', info: 'Update' };
  const paths: Record<FeedbackKind, string> = { success: 'M6 12l4 4 8-8', warning: 'M12 7v6M12 17h.01', error: 'M8 8l8 8M16 8l-8 8', info: 'M12 11v6M12 7h.01' };
  document.getElementById('feedbackTitle')!.textContent = titles[kind];
  document.getElementById('feedbackMessage')!.textContent = message;
  document.getElementById('feedbackIcon')!.replaceChildren(<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d={paths[kind]} /></svg>);
  toast.className = 'feedback-toast show ' + kind;
  toast.setAttribute('aria-live', kind === 'error' ? 'assertive' : 'polite');
  toast.setAttribute('aria-hidden', 'false');
  if (typeof toast.showPopover === 'function' && !toast.matches(':popover-open')) toast.showPopover();
  feedbackRemaining = kind === 'error' || kind === 'warning' ? 6500 : 4500;
  resumeFeedback();
}
