export type EditorQuestionType = 'fill_blank' | 'multiple_choice';

export interface EditorQuestion {
  uid: string;
  type: EditorQuestionType;
  category: string;
  prompt: string;
  answer: string;
  choices: string[];
  answerIdx: number;
  expanded: boolean;
}

export function countBlanks(prompt: string): number {
  return (prompt.match(/_{5,}/g) ?? []).length;
}

let uidCounter = 0;

export function nextUid(): string {
  uidCounter += 1;
  return `q-${uidCounter}`;
}

export function makeEditorQuestion(
  partial: Partial<EditorQuestion> & { type: EditorQuestionType }
): EditorQuestion {
  return {
    uid: nextUid(),
    category: partial.category ?? '',
    prompt: partial.prompt ?? '',
    answer: partial.answer ?? '',
    choices: partial.choices ?? [],
    answerIdx: partial.answerIdx ?? 0,
    expanded: partial.expanded ?? false,
    type: partial.type,
  };
}
