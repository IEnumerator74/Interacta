// types.d.ts
interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string;
          callback: (response: { credential: string }) => void;
          auto_select?: boolean;
          context?: string;
        }) => void;
        renderButton: (
          element: HTMLElement | null,
          options: {
            type?: 'standard' | 'icon';
            theme?: 'outline' | 'filled';
            size?: 'large' | 'medium' | 'small';
            text?: string;
            shape?: string;
            width?: number | string;
            logo_alignment?: string;
          }
        ) => void;
        prompt: () => void;
      };
      oauth2: {
        revoke: (token: string, callback?: () => void) => void;
      };
    };
  };
}