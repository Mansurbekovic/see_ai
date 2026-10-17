export type Locale = 'uz' | 'en' | 'ru';

export interface Translations {
  // App
  app: {
    name: string;
    tagline: string;
  };
  // Auth
  auth: {
    signIn: string;
    signUp: string;
    signOut: string;
    email: string;
    password: string;
    name: string;
    forgotPassword: string;
    noAccount: string;
    hasAccount: string;
    orContinueWith: string;
    google: string;
    invalidCredentials: string;
    emailTaken: string;
    accountCreated: string;
  };
  // Chat
  chat: {
    newChat: string;
    sendMessage: string;
    typeMessage: string;
    stopGenerating: string;
    regenerate: string;
    copy: string;
    copied: string;
    edit: string;
    delete: string;
    rename: string;
    searchConversations: string;
    noConversations: string;
    welcomeTitle: string;
    welcomeSubtitle: string;
    suggestedPrompts: string[];
  };
  // Settings
  settings: {
    title: string;
    theme: string;
    language: string;
    defaultModel: string;
    webSearch: string;
    account: string;
    deleteAccount: string;
    confirmDelete: string;
    dark: string;
    light: string;
    system: string;
  };
  // Common
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    save: string;
    confirm: string;
    back: string;
    close: string;
    search: string;
    noResults: string;
  };
  // Errors
  errors: {
    notFound: string;
    unauthorized: string;
    rateLimited: string;
    serverError: string;
    networkError: string;
    providerError: string;
    missingApiKey: string;
    fileTooLarge: string;
    unsupportedFile: string;
  };
}
