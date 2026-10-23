import { getCollection } from 'astro:content';
import { createContentIndex } from './content';

export async function loadContent() {
  const [cs, poetry] = await Promise.all([getCollection('cs'), getCollection('poetry')]);
  return createContentIndex({ cs, poetry });
}
