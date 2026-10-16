/**
 * @typedef {'discussion'|'question'|'project'|'achievement'|'opportunity'|'announcement'} PostType
 */

/**
 * Suggest a feed category from explicit text patterns.
 * This is a transparent heuristic, not AI moderation. It never emits "announcement":
 * official announcements must be selected by a trusted role and are checked by RLS.
 * @param {string} text
 * @returns {Exclude<PostType, 'announcement'>|null}
 */
export function suggestPostType(text) {
  const value = text.toLowerCase().trim();
  if (value.length < 12) return null;

  const patterns = [
    { type: 'opportunity', keywords: ['internship', 'job opening', 'hiring', 'scholarship', 'application deadline', 'applications open', 'opportunity', 'apply here', 'call for volunteers', 'volunteer position'] },
    { type: 'project', keywords: ['project', 'prototype', 'built ', 'building ', 'open source', 'github', 'repository', 'launched', 'implemented', 'developed', 'demo of', 'working on'] },
    { type: 'achievement', keywords: ['won ', 'award', 'finalist', 'got selected', 'selected for', 'completed ', 'milestone', 'proud to share', 'placed at', 'ranked ', 'achievement'] },
    { type: 'question', keywords: ['need help', 'anyone know', 'can someone', 'how do i', 'how can i', 'why does', 'what is', 'question:', 'any suggestions', 'looking for advice'] },
  ];

  const scores = patterns.map((pattern) => ({
    type: pattern.type,
    score: pattern.keywords.reduce((sum, keyword) => sum + (value.includes(keyword) ? 1 : 0), 0),
  }));
  if (value.includes('?')) {
    const question = scores.find((item) => item.type === 'question');
    if (question) question.score += 1;
  }

  scores.sort((left, right) => right.score - left.score);
  return scores[0]?.score > 0 ? scores[0].type : null;
}
