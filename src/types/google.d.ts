interface Window {
  google?: {
    accounts?: {
      id?: {
        initialize: (config: {
          client_id: string;
          callback: (response: { credential: string }) => void;
          auto_select?: boolean;
          context?: string;
        }) => void;
        renderButton: (
          element: HTMLElement | null,
          config: {
            type?: string;
            theme?: string;
            size?: string;
            text?: string;
            width?: string;
            logo_alignment?: string;
          }
        ) => void;
      };
      oauth2?: {
        revoke: (token: string) => void;
      };
    };
  };
}

declare namespace Google {
  interface User {
    name: string;
    email: string;
    picture: string;
  }
}

export {};
