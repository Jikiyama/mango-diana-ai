export interface User {
  id: string;
  email?: string;
  name?: string;
  photoUrl?: string;
  isGuest: boolean;
}

export type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
};