import { describe, expect, it } from "vitest";
import {
  buildQrChannelName,
  createWebLoginQrPayload,
  decryptSessionTokensFromQr,
  encryptSessionTokensForQr,
  isWebDashboardQrExpired,
  parseWebDashboardQr,
  QR_SESSION_TTL_SECONDS,
} from "../webAuthSync";

describe("karirfy-web QR WebAuthSync", () => {
  it("builds a valid QR payload and parses it round-trip", () => {
    const payload = createWebLoginQrPayload("https://karirfy-web.dewantaraproject-id.workers.dev");
    expect(payload.app).toBe("karirfy");
    expect(payload.version).toBe("1.0");
    expect(payload.action).toBe("login");
    expect(payload.channel).toBe(buildQrChannelName(payload.sessionId));

    const parsed = parseWebDashboardQr(JSON.stringify(payload));
    expect(parsed).toEqual(payload);
  });

  it("rejects foreign or tampered QR payloads", () => {
    expect(parseWebDashboardQr("https://example.com")).toBeNull();
    expect(
      parseWebDashboardQr(
        JSON.stringify({
          app: "accrual",
          version: "1.0",
          action: "login",
          sessionId: "abc",
          channel: "accrual-qr-abc",
          origin: "https://accrual.app",
          encKey: "key",
          createdAt: Date.now(),
        }),
      ),
    ).toBeNull();
  });

  it("encrypts and decrypts Supabase session tokens with the ephemeral QR key", async () => {
    const payload = createWebLoginQrPayload("https://karirfy-web.dewantaraproject-id.workers.dev");
    const envelope = await encryptSessionTokensForQr(
      {
        access_token: "acc-token-12345",
        refresh_token: "ref-token-67890",
      },
      payload.encKey,
    );

    expect(envelope.ciphertext).not.toContain("acc-token-12345");
    const decrypted = await decryptSessionTokensFromQr(
      envelope.ciphertext,
      envelope.iv,
      payload.encKey,
    );
    expect(decrypted).toEqual({
      access_token: "acc-token-12345",
      refresh_token: "ref-token-67890",
    });
  });

  it("enforces 120s TTL expiry accurately", () => {
    const baseTime = 1_800_000_000_000;
    const payload = {
      ...createWebLoginQrPayload("https://karirfy-web.dewantaraproject-id.workers.dev"),
      createdAt: baseTime,
    };
    expect(isWebDashboardQrExpired(payload, baseTime + 60_000)).toBe(false);
    expect(
      isWebDashboardQrExpired(payload, baseTime + QR_SESSION_TTL_SECONDS * 1000 + 1),
    ).toBe(true);
  });
});
