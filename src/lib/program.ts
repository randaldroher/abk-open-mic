export type SheetRows = {
  events: unknown[];
  acts: unknown[];
  schedule: unknown[];
};

export type PublicEvent = {
  eventId: string;
  title: string;
  startsAt: string;
  timeZone: string;
  venue: string;
  guidelines: string[];
  updatedAt: string;
};

export type PublicAct = {
  actId: string;
  displayName: string;
  description: string;
  instruments: string;
  durationMinutes: number;
};

export type PublicScheduleSlot = {
  actId: string;
  displayName: string;
  description: string;
  durationMinutes: number;
  startsAt: string;
  order: number;
};

export type PublicProgram = {
  event: PublicEvent | null;
  acts: PublicAct[];
  schedule: PublicScheduleSlot[];
};

type Row = Record<string, unknown>;

function isRow(value: unknown): value is Row {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(row: Row, key: string): string {
  const value = row[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error("Invalid published event data");
  }
  return value.trim();
}

function validId(value: string): string {
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(value)) {
    throw new Error("Invalid published event data");
  }
  return value;
}

function validDate(value: string): string {
  const match = value.match(
    /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/,
  );
  if (!match) {
    throw new Error("Invalid published event data");
  }

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  const maxDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  if (day > maxDay || !Number.isFinite(Date.parse(value))) {
    throw new Error("Invalid published event data");
  }
  return value;
}

function publishedRows(rows: unknown[]): Row[] {
  return rows.flatMap((value) => {
    if (!isRow(value) || typeof value.published !== "boolean") {
      throw new Error("Invalid published event data");
    }
    return value.published ? [value] : [];
  });
}

function parseEvent(row: Row): PublicEvent {
  const timeZone = requiredString(row, "time_zone");
  try {
    new Intl.DateTimeFormat("en", { timeZone });
  } catch {
    throw new Error("Invalid published event data");
  }

  if (!Array.isArray(row.guidelines) || row.guidelines.length === 0) {
    throw new Error("Invalid published event data");
  }

  return {
    eventId: validId(requiredString(row, "event_id")),
    title: requiredString(row, "title"),
    startsAt: validDate(requiredString(row, "starts_at")),
    timeZone,
    venue: requiredString(row, "venue"),
    guidelines: row.guidelines.map((guideline) => {
      if (typeof guideline !== "string" || guideline.trim() === "") {
        throw new Error("Invalid published event data");
      }
      return guideline.trim();
    }),
    updatedAt: validDate(requiredString(row, "updated_at")),
  };
}

function parseAct(row: Row) {
  const durationMinutes = row.duration_minutes;
  if (
    typeof durationMinutes !== "number" ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 1 ||
    durationMinutes > 120
  ) {
    throw new Error("Invalid published event data");
  }
  return {
    actId: validId(requiredString(row, "act_id")),
    eventId: validId(requiredString(row, "event_id")),
    displayName: requiredString(row, "display_name"),
    description: requiredString(row, "description"),
    instruments: requiredString(row, "instruments"),
    durationMinutes,
  };
}

function parseScheduleSlot(row: Row) {
  const order = row.order;
  if (typeof order !== "number" || !Number.isInteger(order) || order < 1) {
    throw new Error("Invalid published event data");
  }
  return {
    eventId: validId(requiredString(row, "event_id")),
    actId: validId(requiredString(row, "act_id")),
    startsAt: validDate(requiredString(row, "starts_at")),
    order,
  };
}

export function buildPublicProgram(rows: SheetRows): PublicProgram {
  const events = publishedRows(rows.events).map(parseEvent);
  if (events.length > 1) {
    throw new Error("Invalid published event data");
  }
  const event = events[0] ?? null;
  if (!event) {
    return { event: null, acts: [], schedule: [] };
  }

  const acts = publishedRows(rows.acts)
    .map(parseAct)
    .filter((act) => act.eventId === event.eventId);
  const seenActIds = new Set<string>();
  for (const act of acts) {
    if (seenActIds.has(act.actId)) {
      throw new Error("Invalid published event data");
    }
    seenActIds.add(act.actId);
  }
  const actById = new Map(acts.map((act) => [act.actId, act]));
  const slots = publishedRows(rows.schedule)
    .map(parseScheduleSlot)
    .filter((slot) => slot.eventId === event.eventId)
    .sort((first, second) => first.order - second.order);

  const seenOrders = new Set<number>();
  const schedule = slots.map((slot) => {
    const act = actById.get(slot.actId);
    if (!act || seenOrders.has(slot.order)) {
      throw new Error("Invalid published event data");
    }
    seenOrders.add(slot.order);
    return {
      actId: act.actId,
      displayName: act.displayName,
      description: act.description,
      durationMinutes: act.durationMinutes,
      startsAt: slot.startsAt,
      order: slot.order,
    };
  });

  return {
    event,
    acts: acts.map((act) => ({
      actId: act.actId,
      displayName: act.displayName,
      description: act.description,
      instruments: act.instruments,
      durationMinutes: act.durationMinutes,
    })),
    schedule,
  };
}
