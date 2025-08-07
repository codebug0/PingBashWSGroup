// messagesSlice.ts
import { MessageUnit, selectedUserDetail, User, ChatGroup } from '@/interface/chatInterface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MessagesState {
  messageList: MessageUnit[];
  unreadCount: number;
  selectedChatUser: selectedUserDetail | null;
  chatUserList: User[];
  chatGroupList: ChatGroup[];
}

const initialState: MessagesState = {
  messageList: [],
  unreadCount: 0,
  selectedChatUser: null,
  chatUserList: [],
  chatGroupList: []
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessageList: (state, action: PayloadAction<MessageUnit[]>) => {
      if (Array.isArray(action.payload)) {
        state.messageList = [...action.payload]
      };
    },
    setSelectedChatUser: (state, action: PayloadAction<selectedUserDetail>) => {
      state.selectedChatUser = action.payload
    },
    setChatUserList: (state, action: PayloadAction<User[]>) => {
      state.chatUserList = [...action.payload]
    },
    setChatGroupList: (state, action: PayloadAction<ChatGroup[]>) => {
      state.chatGroupList = [...action.payload]
    }
  },
});

export const { setMessageList, setSelectedChatUser, setChatUserList, setChatGroupList } = messagesSlice.actions;
export default messagesSlice.reducer;
