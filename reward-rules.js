"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SPIN_SETTINGS = void 0;
exports.normalizeBonusCode = normalizeBonusCode;
exports.validateSpinSettings = validateSpinSettings;
exports.spinDecision = spinDecision;
exports.bonusDecision = bonusDecision;
exports.DEFAULT_SPIN_SETTINGS = {
    enabled: true,
    cooldownMs: 24 * 60 * 60 * 1000,
    rewards: [5, 10, 20, 50],
};
function normalizeBonusCode(value) {
    const code = value.trim().toUpperCase();
    return /^[A-Z0-9-]{4,40}$/.test(code) ? code : null;
}
function validateSpinSettings(settings) {
    return typeof settings.enabled === 'boolean'
        && Number.isSafeInteger(settings.cooldownMs) && settings.cooldownMs >= 60_000 && settings.cooldownMs <= 30 * 86_400_000
        && Array.isArray(settings.rewards) && settings.rewards.length >= 1 && settings.rewards.length <= 20
        && settings.rewards.every(value => Number.isSafeInteger(value) && value >= 0 && value <= 1_000_000);
}
function spinDecision(settings, lastSpinAt, now, randomIndex) {
    if (!validateSpinSettings(settings) || !Number.isSafeInteger(now) || now < 0 || !Number.isSafeInteger(lastSpinAt) || lastSpinAt < 0 || !Number.isSafeInteger(randomIndex) || randomIndex < 0 || randomIndex >= settings.rewards.length)
        return { ok: false, reason: 'invalid' };
    if (!settings.enabled)
        return { ok: false, reason: 'disabled' };
    const nextSpinAt = lastSpinAt ? lastSpinAt + settings.cooldownMs : 0;
    if (nextSpinAt > now)
        return { ok: false, reason: 'cooldown', nextSpinAt };
    return { ok: true, points: settings.rewards[randomIndex], nextSpinAt: now + settings.cooldownMs };
}
function bonusDecision(code, alreadyClaimed, now) {
    if (typeof code.enabled !== 'boolean' || typeof alreadyClaimed !== 'boolean' || !Number.isSafeInteger(now) || now < 0
        || !Number.isSafeInteger(code.points) || code.points <= 0 || code.points > 1_000_000
        || !Number.isSafeInteger(code.maxUses) || code.maxUses < 1 || code.maxUses > 1_000_000
        || !Number.isSafeInteger(code.uses) || code.uses < 0
        || (code.expiresAt !== null && (!Number.isSafeInteger(code.expiresAt) || code.expiresAt < 0)))
        return { ok: false, reason: 'invalid' };
    if (!code.enabled)
        return { ok: false, reason: 'disabled' };
    if (alreadyClaimed)
        return { ok: false, reason: 'claimed' };
    if (code.expiresAt !== null && now >= code.expiresAt)
        return { ok: false, reason: 'expired' };
    if (code.uses >= code.maxUses)
        return { ok: false, reason: 'exhausted' };
    return { ok: true, points: code.points };
}
