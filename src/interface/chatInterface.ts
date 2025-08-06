
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
  avatar: string;
  gender: string;
  birthday: string;
  country: string;
  Socket: boolean | false;
  banned: number | null;
  unban_request: number | null;
  is_member: number | null;
  role_id: number | null;
  chat_limit: boolean | null;
  manage_mods: boolean | null;
  manage_chat: boolean | null;
  manage_censored: boolean | null;
  ban_user: boolean | null;
  filter_mode: number;
}

export interface ChatOption {
  id: number;
  user_id: number;
  sound_option: number | null;
}

export interface ChatGroup {
  id: number;
  name: string;
  size_mode: 'fixed' | 'responsive';
  frame_width: number;
  frame_height: number;
  creater_id: number;
  creater_name: string;
  members: ChatUser[];
  banned: number | null;
  unban_request: number | null;  
  bg_color:  string | null,
  title_color:  string | null,
  msg_bg_color:  string | null,
  msg_txt_color:  string | null,
  reply_msg_color:  string | null,
  msg_date_color: string | null,
  input_bg_color: string | null,
  show_user_img: boolean | null,
  custom_font_size: boolean | null,
  font_size: number | null,
  round_corners: boolean | null,
  corner_radius: number | null,
  censored_words: string | null
  post_level: number | null,
  url_level: number | null,
  slow_mode: boolean | null,
  slow_time: number | null
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
