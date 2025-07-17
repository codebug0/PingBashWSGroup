import { SERVER_URL } from "../const/const";
import io from "socket.io-client";
import ChatConst from "../const/chat_const";
import { makeTextSafe } from "./helpers";

export const socket = io(SERVER_URL);

export const userLoggedIn = (token: string | null) => {
  if (token) { 
    socket.emit(ChatConst.USER_LOGGED, { token }) 
  } else {
    socket.emit(ChatConst.USER_OUT) 
  }

}

export const userRegistered = () => socket.emit(ChatConst.USER_REGISTER)
export const userLoggedOut = () => socket.emit(ChatConst.USER_OUT)

export const getUsers = (token: string | null) => {
  if (token)
    socket.emit(ChatConst.GET_USERS, { token })
}

export const registerAsAnon = (userId: number | null) => {
  if (userId)
    socket.emit(ChatConst.USER_LOGGED_AS_ANNON, { userId })
}

export const loginAsReal = (token: string | null, groupId: number | null, anonId: number | null) => {
  console.log(anonId, "\\", groupId, "\\", token);
  if (token && groupId && anonId)
    socket.emit(ChatConst.USER_LOGGED_WILD_SUB, {token, groupId, anonId})
}

export const getGroups = (token: string | null) => {
  if (token)
    socket.emit(ChatConst.GET_GROUPS, { token })
}

export const sendMsg = (to: number | null | undefined, msg: string, token: string | null) => {
  let message = makeTextSafe(msg)
  socket.emit(ChatConst.SEND_MSG, { to, msg: message, token })
}

export const sendGroupMsg = (
  groupId: number | null | undefined, 
  msg: string, 
  token: string | null, 
  receivers: number[] | null | undefined,
  parent_id: number | null | undefined
) => {
  let message = makeTextSafe(msg);
  socket.emit(ChatConst.SEND_GROUP_MSG, { groupId, msg: message, token, receivers, parent_id })
}

/**
 * Function to request chatting records with selected user
 * @param token my token
 * @param target opposite's Id
 */
export const getMessages = (token: string | null, target: number | null | undefined) => {
  socket.emit(ChatConst.GET_MSG, { token, target })
}

export const getGroupMessages = (token: string | null, groupId: number | null | undefined) => {
  socket.emit(ChatConst.GET_GROUP_MSG, { token, groupId })
}

export const listenGroupMessages = (token: string | null, groupId: string) => {
  console.log("==== groupName ====", groupId);
  console.log("===== socket =====", token);
  if (token && groupId)  
    socket.emit(ChatConst.LISTEN_GROUP_MSG, { groupId })
}

export const getHistory = (token: string | null, target: number | null | undefined, limit: number | null) => {
  if (target && limit && token)
    socket.emit(ChatConst.GET_HISTORY, { token, target, limit })
}

export const getGroupHistory = (token: string | null, target: number | null | undefined, limit: number | null) => {
  if (target && limit && token)
    socket.emit(ChatConst.GET_GROUP_HISTORY, { token, target, limit })
}

export const getGroupHistoryAnon = (target: number | null | undefined, limit: number | null) => {
  if (target && limit)
    console.log("=== GroupId, limit ===", target, limit);
    socket.emit(ChatConst.GET_GROUP_HISTORY_ANON, { target, limit })
}

export const readMsg = (token: string | null, id: number | null) => {
  if (token && id) {
    socket.emit(ChatConst.READ_MSG, { token, id })
  }
}

export const deleteGroupMsg = (token: string | null, msgId: number, groupId: number | null | undefined, receivers: number[] | null | undefined) => {
  if (token && msgId && groupId) {
    socket.emit(ChatConst.DELETE_GROUP_MSG, { token, msgId, groupId, receivers })
  }
}

export const banGroupUser = (token: string | null, groupId: number | null | undefined, userId: number | null | undefined, receivers: number[] | null | undefined) => {
  console.log(token, ",", groupId, ",", userId);
  if (token && groupId && userId) {
    socket.emit(ChatConst.BAN_GROUP_USER, { token, groupId, userId, receivers })
  }
}

export const unbanGroupUser = (token: string | null, groupId: number | null | undefined, userId: number | null | undefined, receivers: number[] | null | undefined) => {
  if (token && groupId && userId) {
    socket.emit(ChatConst.UNBAN_GROUP_USER, { token, groupId, userId, receivers })
  }
}

export const readGroupMsg = (token: string | null, groupId: number | null) => {
  if (token && groupId) {
    socket.emit(ChatConst.READ_GROUP_MSG, { token, groupId })
  }
}

export const updateGroupFavInfo = (token: string | null, groupId: number | null | undefined, isMember: number | null) => {
  console.log(" ===== aaaa ===", groupId, ",", isMember, token);
  if (token && groupId)
    socket.emit(ChatConst.UPDATE_FAV_GROUPS, { token, groupId, isMember })
}