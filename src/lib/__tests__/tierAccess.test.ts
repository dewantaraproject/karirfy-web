import { describe, expect, it } from "vitest";
import {
  computeDailyQuotaStatus,
  formatTierBadge,
  getLaunchOpenWeekStatus,
  hasEffectiveProAccess,
} from "../tierAccess";

describe("Launch Open Week 7 Hari tierAccess", () => {
  it("activates Pro gratis for signed-in Starter accounts between 28 Nov and 5 Des 2026", () => {
    const inside = new Date("2026-11-30T12:00:00+07:00");
    const status = getLaunchOpenWeekStatus(inside);
    expect(status.active).toBe(true);
    expect(status.daysLeft).toBeGreaterThanOrEqual(1);

    expect(hasEffectiveProAccess("Starter", false, null, false, inside)).toBe(true);
    expect(hasEffectiveProAccess("Starter", false, null, true, inside)).toBe(false);
    expect(formatTierBadge("Starter", false, null, false, inside)).toContain("Pro Gratis 7 Hari");

    const quota = computeDailyQuotaStatus({
      rawTier: "Starter",
      isPremium: false,
      isGuest: false,
      attempts: [],
      now: inside,
    });
    expect(quota.isPro).toBe(true);
    expect(quota.isLaunchPromo).toBe(true);
  });

  it("reverts Starter accounts cleanly after 5 Des 2026", () => {
    const after = new Date("2026-12-06T00:05:00+07:00");
    expect(getLaunchOpenWeekStatus(after).active).toBe(false);
    expect(hasEffectiveProAccess("Starter", false, null, false, after)).toBe(false);

    const quota = computeDailyQuotaStatus({
      rawTier: "Starter",
      isPremium: false,
      isGuest: false,
      attempts: [],
      now: after,
    });
    expect(quota.isPro).toBe(false);
    expect(quota.exerciseLimit).toBe(3);
  });
});
