function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
}

function nameParts(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().replace(/\s+/g, ' ').split(' ');
  const suffixes = new Set(['jr.', 'sr.', 'ii', 'iii', 'iv', 'v']);
  const lastNameIndex =
    parts.length > 2 && suffixes.has(parts.at(-1)?.toLowerCase() ?? '')
      ? parts.length - 2
      : parts.length - 1;

  return {
    firstName: parts[0] ?? '',
    lastName: lastNameIndex > 0 ? (parts[lastNameIndex] ?? '') : '',
  };
}

export function createPerformerNameFormatter(
  names: readonly string[],
): (name: string) => string {
  const namesByKey = new Map(
    names.map((name) => [normalizeName(name), name.trim().replace(/\s+/g, ' ')]),
  );
  const firstNameCounts = new Map<string, number>();

  for (const name of namesByKey.values()) {
    const firstName = nameParts(name).firstName;
    const firstNameKey = firstName.toLocaleLowerCase('en');
    firstNameCounts.set(firstNameKey, (firstNameCounts.get(firstNameKey) ?? 0) + 1);
  }

  return (name) => {
    const normalizedName = normalizeName(name);
    const canonicalName = namesByKey.get(normalizedName) ?? name.trim();
    const { firstName, lastName } = nameParts(canonicalName);
    if ((firstNameCounts.get(firstName.toLocaleLowerCase('en')) ?? 0) < 2) {
      return firstName;
    }

    const lastInitial = [...lastName][0];
    return lastInitial
      ? `${firstName} ${lastInitial.toLocaleUpperCase('en')}.`
      : firstName;
  };
}
