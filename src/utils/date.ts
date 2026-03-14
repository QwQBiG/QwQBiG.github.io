export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\//g, '-');
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getYear(date: Date): number {
  return date.getFullYear();
}

export function groupByYear<T extends { data: { date: Date } }>(items: T[]): Map<number, T[]> {
  const groups = new Map<number, T[]>();
  
  items.forEach((item) => {
    const year = getYear(item.data.date);
    if (!groups.has(year)) {
      groups.set(year, []);
    }
    groups.get(year)!.push(item);
  });
  
  // Sort years in descending order
  return new Map([...groups.entries()].sort((a, b) => b[0] - a[0]));
}
