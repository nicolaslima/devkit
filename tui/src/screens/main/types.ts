export interface ConfirmAction {
  title: string;
  details: string[];
  run: () => Promise<void>;
}

export type AsyncAction = () => Promise<void>;
