export type PostType = 'discussion' | 'question' | 'project' | 'achievement' | 'opportunity' | 'announcement';
export function suggestPostType(text: string): Exclude<PostType, 'announcement'> | null;
