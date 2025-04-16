export type RootStackParamList = {
  Auth: { authRequestId?: string };
  MainTabs: {
    screen: keyof BottomTabParamList;
    params?: Record<string, any>;
  };
};

export type BottomTabParamList = {
  Home: undefined;
  Ticket: { targetUrl?: string };
  Profile: undefined;
};