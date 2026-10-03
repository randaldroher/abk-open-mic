import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import robots from '../app/robots';
import PastEventCards from "../components/past-event-cards";
import EventPlanningCards from '../components/event-planning-cards';
import SiteNavigation from "../components/site-navigation";
import EventPlanningNavigation from '../components/event-planning-navigation';
import PerformersTable from '../components/performers-table';
import SongCardsSkeleton from "../components/song-cards-skeleton";
import SiteFrame from "../components/site-frame";
import {
  PAST_EVENTS,
  PAST_EVENT_VIDEOS,
  getPastEventVideos,
} from './past-events';
import { SIGNUP_URL } from "./site-links";

test("event cards render every archive with decorative Material SVG arrows", () => {
  const html = renderToStaticMarkup(createElement(PastEventCards));

  for (const { slug, label, theme } of PAST_EVENTS) {
    assert.ok(html.includes(`href="/past-events/${slug}/videos"`));
    assert.ok(html.includes(`aria-label="ABK Open Mic ${label}"`));
    assert.ok(html.includes(label));
    assert.ok(html.includes(theme));
  }
  for (const image of [
    'abk-open-mic-may-2026.png',
    'abk-open-mic-december-2025.png',
    'abk-open-mic-july-2025.png',
  ]) {
    assert.ok(html.includes(image));
  }
  assert.equal((html.match(/alt=""/g) ?? []).length, 3);
  assert.equal((html.match(/<svg /g) ?? []).length, 3);
  assert.equal((html.match(/aria-hidden="true"/g) ?? []).length, 3);
  assert.ok(!html.includes("↗"));
});

test('homepage event planning cards link to each October planning tab', () => {
  const html = renderToStaticMarkup(createElement(EventPlanningCards));

  assert.ok(html.includes('href="/event-planning/songs"'));
  assert.ok(html.includes('href="/event-planning/performers"'));
  assert.ok(html.includes('aria-label="October 2026 Songs"'));
  assert.ok(html.includes('aria-label="October 2026 Performers"'));
});

test('past event videos match their actual YouTube playlist contents', () => {
  assert.deepEqual(PAST_EVENT_VIDEOS, [
    {
      eventSlug: 'july-2025',
      videos: [{ videoId: 'nWf3AunfcRU', title: 'Open Mic Jul 2025' }],
    },
    {
      eventSlug: 'december-2025',
      videos: [
        { videoId: 'NEzyw08Ax78', title: 'Astrud Gilberto - Fly to the Moon' },
        { videoId: 'UQZbVKRi-M0', title: 'Rush - Witch Hunt' },
        {
          videoId: 'WhQHlQLAU8k',
          title: 'Vince Guaraldi - Christmas Time is Here',
        },
        { videoId: 's6aCWR8zHTk', title: 'What a Mario World - RRThiel' },
      ],
    },
  ]);
  assert.deepEqual(getPastEventVideos('may-2026'), []);
});

test('song skeletons match the card grid and can reserve space for reference videos', () => {
  for (const showReferences of [false, true]) {
    const html = renderToStaticMarkup(
      createElement(SongCardsSkeleton, { showReferences }),
    );

    assert.ok(html.includes('role="status"'));
    assert.ok(html.includes('aria-label="Loading songs"'));
    assert.equal(
      (html.match(/<div class="MuiCardContent-root /g) ?? []).length,
      4,
    );
    assert.ok(html.includes('repeat(2, 1fr)'));
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

test('site navigation links to event planning and past events without Slack', () => {
  const html = renderToStaticMarkup(createElement(SiteNavigation));

  assert.ok(html.includes('href="/event-planning"'));
  assert.ok(html.includes('aria-label="Event planning"'));
  assert.ok(html.includes('Event </span>Planning</a>'));
  assert.ok(html.includes('href="/past-events"'));
  assert.ok(!html.includes('>Slack</a>'));
  assert.ok(html.includes(`href="${SIGNUP_URL.replaceAll('&', '&amp;')}"`));
  assert.ok(html.includes('>Sign up</a>'));
});

test('event planning navigation uses tabs for songs and performers', () => {
  const html = renderToStaticMarkup(createElement(EventPlanningNavigation));

  assert.ok(html.includes('href="/event-planning/songs"'));
  assert.ok(html.includes('href="/event-planning/performers"'));
  assert.ok(html.includes('role="tab"'));
  assert.ok(html.includes('aria-label="Event planning sections"'));
});

test('performer interests render in one card with a table row per performer', () => {
  const html = renderToStaticMarkup(
    createElement(PerformersTable, {
      performers: [
        {
          name: 'Alex Brown',
          initials: 'RD',
          roles: ['Lead Guitar', 'Keyboard'],
          genres: 'Alt-Rock, K-pop',
        },
        {
          name: 'Jamie Young',
          initials: 'YM',
          roles: ['Vocal'],
          genres: 'Jazz',
        },
      ],
    }),
  );

  assert.ok(
    html.includes('aria-label="Performer names, role interests, and genres"'),
  );
  assert.ok(html.includes('Alex Brown'));
  assert.ok(html.includes('Jamie Young'));
  assert.ok(html.includes('Lead Guitar'));
  assert.ok(html.includes('Keyboard'));
  assert.ok(html.includes('Genres'));
  assert.ok(html.indexOf('Role interests') < html.indexOf('Genres'));
  assert.ok(html.includes('Alt-Rock, K-pop'));
  assert.equal((html.match(/<section\b/g) ?? []).length, 1);
  assert.equal((html.match(/<tr/g) ?? []).length, 3);
});

test('robots excludes all paths from compliant crawlers', () => {
  assert.deepEqual(robots(), {
    rules: { userAgent: '*', disallow: '/' },
  });
});
