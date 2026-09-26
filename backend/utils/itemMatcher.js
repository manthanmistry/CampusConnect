const normalize = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const words = (value = '') => new Set(normalize(value).split(' ').filter((word) => word.length > 2));

const similarity = (a, b) => {
  const first = words(a);
  const second = words(b);
  if (!first.size || !second.size) return 0;
  const intersection = [...first].filter((word) => second.has(word)).length;
  return intersection / new Set([...first, ...second]).size;
};

const sameText = (a, b) => normalize(a) && normalize(a) === normalize(b);

// A chat is allowed only when a Lost report and a Found report are sufficiently similar.
// Category is mandatory, plus at least two matching details.
const getMatch = (source, candidate) => {
  if (!source || !candidate) return { matched: false, score: 0, reasons: [] };
  if (source.status === candidate.status) return { matched: false, score: 0, reasons: [] };
  if (source.category !== candidate.category) return { matched: false, score: 0, reasons: [] };
  if (source.reportedBy?.toString() === candidate.reportedBy?.toString()) {
    return { matched: false, score: 0, reasons: [] };
  }

  let score = 25; // same category
  const reasons = ['same category'];
  let detailMatches = 0;

  const titleScore = similarity(source.title, candidate.title);
  if (titleScore >= 0.4) {
    score += 25;
    detailMatches += 1;
    reasons.push('similar item name');
  }

  const locationScore = similarity(source.location, candidate.location);
  if (locationScore >= 0.5 || sameText(source.location, candidate.location)) {
    score += 20;
    detailMatches += 1;
    reasons.push('same/similar location');
  }

  if (source.color && candidate.color && sameText(source.color, candidate.color)) {
    score += 10;
    detailMatches += 1;
    reasons.push('same color');
  }

  if (source.brand && candidate.brand && sameText(source.brand, candidate.brand)) {
    score += 10;
    detailMatches += 1;
    reasons.push('same brand');
  }

  const descriptionScore = similarity(source.description, candidate.description);
  if (descriptionScore >= 0.2) {
    score += 10;
    detailMatches += 1;
    reasons.push('similar description');
  }

  return {
    matched: detailMatches >= 2 && score >= 60,
    score,
    reasons,
  };
};

module.exports = { getMatch };
