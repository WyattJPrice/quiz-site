import { Filter } from 'bad-words';

const filter = new Filter();

/** Mirrors classlink's check so usernames are filtered the same way. */
export function containsProfanity(text: string): boolean {
  return filter.isProfane(text);
}
