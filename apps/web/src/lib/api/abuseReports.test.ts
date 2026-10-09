import { beforeEach, describe, expect, it } from "vitest";
import { reportTargets, submitAbuseReport, reviewAbuseReport, visibleAbuseReports } from "./abuseReports";
import { resetDemoData } from "@/mocks/store";
import { demoSession } from "@/lib/auth/demo";
import { setSession } from "@/lib/auth/store";

beforeEach(() => { resetDemoData(); setSession(demoSession("seller")); });
describe("abuse reports", () => {
  it("keeps private notes out of the reporter response", () => {
    const target = reportTargets()[0];
    const record = submitAbuseReport({ target: `${target.type}:${target.id}`, reason: "Suspicious activity", evidence: "Example evidence" });
    setSession(demoSession("admin"));
    reviewAbuseReport({ id: record.id, status: "resolved", internalNote: "Private investigation", publicOutcome: "Reviewed by staff" });
    setSession(demoSession("seller"));
    const visible = visibleAbuseReports().find((item) => item.id === record.id)!;
    expect(visible.publicOutcome).toBe("Reviewed by staff");
    expect(visible.history).toBeUndefined();
    expect(visible.resolution).toBeUndefined();
    expect(JSON.stringify(visible)).not.toContain("Private investigation");
  });
  it("rejects unrelated targets, duplicate reports, and seller moderation", () => {
    expect(() => submitAbuseReport({ target: "buyer:unknown", reason: "Suspicious activity", evidence: "" })).toThrow();
    const target = reportTargets()[0];
    const input = { target: `${target.type}:${target.id}`, reason: "Suspicious activity", evidence: "" };
    const record = submitAbuseReport(input);
    expect(() => submitAbuseReport(input)).toThrow("already exists");
    expect(() => reviewAbuseReport({ id: record.id, status: "dismissed", internalNote: "Hide it", publicOutcome: "Closed" })).toThrow("permission");
    setSession(demoSession("buyer"));
    expect(visibleAbuseReports().some((item) => item.id === record.id)).toBe(false);
  });
});
