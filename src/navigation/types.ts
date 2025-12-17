export type BottomTabParamList = {
  Home: undefined;
  Ticket: {targetUrl?: string};
  Profile: undefined;
  Camera: {mode?: 'scan' | 'photo'; from?: string} | undefined; // ← 추가
};

export type RootStackParamList = {
  Auth: {authRequestId?: string};
  MainTabs: {
    screen: keyof BottomTabParamList;
    params?: Record<string, any>;
  };
  Camera: {mode?: 'scan' | 'photo'; from?: string} | undefined; // 스택에도 등록되어 있으니 유지
};
