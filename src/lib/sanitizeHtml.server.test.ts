import { describe, expect, it } from "vitest";
import { sanitizeStoryHtml } from "./sanitizeHtml.server";

describe("reader HTML", () => {
  it("removes executable markup, unsafe URLs, embedded players and layout overrides", () => {
    const clean = sanitizeStoryHtml(`
      <script>unsafeScript()</script><style>body{display:none}</style>
      <p class="hidden" style="display:none" onclick="unsafeClick()">कथा</p>
      <img src="https://example.com/cover.jpg" onerror="unsafeError()">
      <a href="javascript:unsafeLink()">लिङ्क</a>
      <a href="&#106;avascript:unsafeEntity()">लिङ्क</a>
      <img src="data:image/svg+xml,unsafeSvg()">
      <iframe src="https://example.com"></iframe><form><input name="secret"></form>
    `);
    expect(clean).toContain("<p>कथा</p>");
    expect(clean).toContain('src="https://example.com/cover.jpg"');
    expect(clean).not.toMatch(/unsafe|<script|<style|<iframe|<form|<input|onclick|onerror|class=|style=|javascript:|data:/);
  });

  it("preserves prose, illustrations, lists, tables and footnote anchors", () => {
    const clean = sanitizeStoryHtml('<h1>शीर्षक</h1><p>कथा <em>यहाँ</em><a href="#note">१</a></p><ol start="2"><li>दोस्रो</li></ol><table><tr><td colspan="2">कथा</td></tr></table><p id="note">टिप्पणी</p><img src="https://example.com/a.jpg" alt="चित्र">');
    expect(clean).toContain("<h2>शीर्षक</h2>");
    expect(clean).toContain('<a href="#note">१</a>');
    expect(clean).toContain('<p id="note">टिप्पणी</p>');
    expect(clean).toContain('<ol start="2">');
    expect(clean).toContain('<td colspan="2">');
    expect(clean).toContain('alt="चित्र"');
  });
});
