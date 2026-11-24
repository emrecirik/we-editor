/** A reply in a comment thread */
export interface WeEditorCommentReply {
  text: string;
  author?: string;
  /** ISO date-time */
  createdAt: string;
}

/**
 * A comment thread. The document marks the text it is about with the same `id`
 * (`<span data-comment-id>`); everything else lives here, in your data, not in the HTML.
 */
export interface WeEditorComment {
  id: string;
  text: string;
  author?: string;
  /** ISO date-time */
  createdAt: string;
  resolved?: boolean;
  replies?: WeEditorCommentReply[];
}
