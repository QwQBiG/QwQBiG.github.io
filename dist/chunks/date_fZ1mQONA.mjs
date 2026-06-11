function formatDate(date) {
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).replace(/\//g, "-");
}
function getYear(date) {
  return date.getFullYear();
}
function groupByYear(items) {
  const groups = /* @__PURE__ */ new Map();
  items.forEach((item) => {
    const year = getYear(item.data.date);
    if (!groups.has(year)) {
      groups.set(year, []);
    }
    groups.get(year).push(item);
  });
  return new Map([...groups.entries()].sort((a, b) => b[0] - a[0]));
}

export { formatDate as f, groupByYear as g };
