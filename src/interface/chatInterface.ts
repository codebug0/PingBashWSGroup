
export interface User {
  Opposite_Id: number;
  Opposite_Photo_Name: string | null;
  Opposite_Name: string;
  Opposite_content: string;
  Opposite_unreadCnt: number;
  Opposite_Socket: boolean;
  Opposite_Profession: string | null;
  Opposite_Email: string;
  Opposite_Address: string;
  Unread_Message_Count: number;
  Socket: boolean | false;
  Content: string | null;
  Send_Time: string | null;
}

export interface ChatUser {
  id: number;
  name: string;
  email: string;
  Socket: boolean | false;
  banned: number | null;
  unban_request: number | null;
}

export interface ChatOption {
  id: number;
  user_id: number;
  sound_option: number | null;
}

export interface ChatGroup {
  id: number;
  name: string;
  creater_id: number;
  creater_name: string;
  members: ChatUser[];
  banned: number | null;
  unban_request: number | null;
}

export interface MessageUnit {
  Opposite_Photo_Name: string | null;
  Content: string | null;
  Send_Time: string | null;
  Receiver_Id?: number | null;
  Id?: number | null;
  Sender_Id: number | null;
  Read_Time: string | null;
  group_id: number | null;
  sender_name: string | null;
  sender_avatar: string | null;
  sender_banned: number | null;
  sender_unban_request: number | null;
  parent_id: number | null; // needed for reply message.
}

export interface selectedUserDetail {
  Id: number | null;
  Name: string | null;
  Socket?: boolean | false;
  Profession: string | null;
  Address: string | null;
  Email: string | null;
  Photo_Name: string | null;
}

export interface selectedGroupDetail {
  id: number | null;
  name: string | null;
  creater_id: number | null;
  creater_name: string | null;
  members: ChatUser[] | null;
}
