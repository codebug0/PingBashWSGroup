// GroupOnlineUsersPopup.tsx
import { ChatUser } from "@/interface/chatInterface";
import React, { useState, useEffect } from "react";

type MemberRole = "mod" | "user" | "anon";

interface GroupOnlineUsersPopupProps {
  isOpen: boolean;
  onlineUserIds: number[];
  allCount: number;
  members: ChatUser[];
  onClose: () => void;
}

const GroupOnlineUsersPopup: React.FC<GroupOnlineUsersPopupProps> = ({
  isOpen,
  onlineUserIds,
  members,
  allCount,
  onClose,
}) => {
  const [showMods, setShowMods] = useState(true);
  const [showUsers, setShowUsers] = useState(true);

  const [admins, setAdmins] = useState<ChatUser[]>([])
  const [onlineMods, setOnlineMods] = useState<ChatUser[]>([])
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([])

  useEffect(() => {
    setAdmins(members.filter(user => onlineUserIds.includes(user.id) && user.role_id == 1))
    setOnlineMods(members.filter(user => onlineUserIds.includes(user.id) && user.role_id == 2))
    setOnlineUsers(members.filter(user => onlineUserIds.includes(user.id) && user.role_id != 1 && user.role_id != 2))
  }, [members, onlineUserIds])

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-96 max-w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">People here now</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="flex justify-around gap-4 mt-4">
          <label className="flex items-center gap-1 text-[16px]">
            <input
              type="checkbox"
              checked={showMods}
              onChange={() => setShowMods((prev) => !prev)}
              className="rounded w-4 h-4"
            />
            <span className="text-[16px]">Mods ({onlineMods.length})</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={showUsers}
              onChange={() => setShowUsers((prev) => !prev)}
              className="rounded w-4 h-4"
            />
            <span className="text-[16px]">Users ({onlineUsers.length})</span>
          </label>
          <span className="text-[16px]">Anons ({allCount - onlineMods.length - onlineUsers.length - admins.length})</span>
        </div>

        <hr className="my-3" />

        {/* User List */}
        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {showMods && onlineMods.map((member) => (
            <li key={member.id} className="text-md">
              {member.name}
            </li>
          ))}
          {showMods && <div className="w-full h-[1px] bg-gray-200"></div>}
          {showUsers && onlineUsers.map((member) => (
            <li key={member.id} className="text-md">
              {member.name}
            </li>
          ))}
          {onlineMods.length === 0 && onlineUsers.length === 0 && (
            <li className="text-sm text-gray-500">No one online</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default GroupOnlineUsersPopup;
