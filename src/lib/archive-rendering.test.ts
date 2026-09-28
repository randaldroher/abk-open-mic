import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PastEventCards from "../components/past-event-cards";
import SongCardsSkeleton from "../components/song-cards-skeleton";
import SiteFrame from "../components/site-frame";
import { PAST_EVENTS } from "./past-events";

test("event cards render every archive with decorative Material SVG arrows", () => {
  const html = renderToStaticMarkup(createElement(PastEventCards));

  for (const { slug, label } of PAST_EVENTS) {
    assert.ok(html.includes(`href="/past-events/${slug}/videos"`));
    assert.ok(html.includes(`aria-label="ABK Open Mic ${label}"`));
  }
  assert.equal((html.match(/<svg /g) ?? []).length, 3);
  assert.equal((html.match(/aria-hidden="true"/g) ?? []).length, 3);
  assert.ok(!html.includes("↗"));
});

test("song skeletons match the card grid and only reserve references for May", () => {
  for (const showReferences of [false, true]) {
    const html = renderToStaticMarkup(createElement(SongCardsSkeleton, { showReferences }));

    assert.ok(html.includes('role="status"'));
    assert.ok(html.includes('aria-label="Loading songs"'));
    assert.equal((html.match(/<div class="MuiCardContent-root /g) ?? []).length, 4);
    assert.ok(html.includes("repeat(2, 1fr)"));
    assert.equal(/aspect-ratio:16\s*\/\s*9/.test(html), showReferences);
  }
});

test("site frame renders content independently of optional freshness metadata", () => {
  const content = createElement("h1", null, "Archive title");
  const html = renderToStaticMarkup(SiteFrame({
    children: content,
    freshness: createElement("span", null, "Last updated: unavailable"),
  }));
  assert.ok(html.includes("Archive title"));
  assert.ok(html.indexOf("Last updated: unavailable") > html.indexOf("<footer"));

  const home = renderToStaticMarkup(SiteFrame({ children: content }));
  assert.ok(!home.includes("Last updated"));
});
