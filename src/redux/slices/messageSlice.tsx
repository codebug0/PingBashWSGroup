// messagesSlice.ts
import { MessageList, selectedUserDetail, User, ChatGroup, selectedGroupDetail } from '@/interface/chatInterface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MessagesState {
  messageList: MessageList[];
  unreadCount: number;
  selectedChatUser: selectedUserDetail | null;
  selectedChatGroup: selectedGroupDetail | null;
  chatUserList: User[];
  chatGroupList: ChatGroup[];
}

const initialState: MessagesState = {
  messageList: [],
  unreadCount: 0,
  selectedChatUser: null,
  selectedChatGroup: null,
  chatUserList: [],
  chatGroupList: []
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessageList: (state, action: PayloadAction<MessageList[]>) => {
      if (Array.isArray(action.payload)) {
        state.messageList = [...action.payload]
      };
    },
    setSelectedChatUser: (state, action: PayloadAction<selectedUserDetail>) => {
      state.selectedChatUser = action.payload
    },
    setSelectedChatGroup: (state, action: PayloadAction<selectedGroupDetail>) => {
      state.selectedChatGroup = action.payload
    },
    setChatUserList: (state, action: PayloadAction<User[]>) => {
      state.chatUserList = [...action.payload]
    },
    setChatGroupList: (state, action: PayloadAction<ChatGroup[]>) => {
      state.chatGroupList = [...action.payload]
    }
  },
});

export const { setMessageList, setSelectedChatUser, setChatUserList, setChatGroupList, setSelectedChatGroup } = messagesSlice.actions;
export default messagesSlice.reducer;
