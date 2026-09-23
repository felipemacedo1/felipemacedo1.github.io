import type { Locale } from './profile';
import content from './projects.json';

export const projectNames = content.projectNames;

export function projects(locale: Locale) {
  return content.shared.map((shared, index) => ({
    ...shared,
    ...content.descriptions[locale][index],
    name: content.projectNames[index],
    id: content.repositories[index],
    url: `https://github.com/felipemacedo1/${content.repositories[index]}`,
  }));
}
