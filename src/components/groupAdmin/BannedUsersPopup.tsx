import { ChatUser } from '@/interface/chatInterface';
import React, { useState, useEffect } from 'react';
import ChatUserCard from '../chats/ChatUserCard';
import { SERVER_URL } from '@/resource/const/const';

interface BannedUsersPopupProps {
  users: ChatUser[];
  isOpen: boolean;
  onClose: () => void;
  unbanUsers:(userIds: number[]) => void;
}

const BannedUsersPopup: React.FC<BannedUsersPopupProps> = ({ 
  isOpen, 
  users,
  onClose,
  unbanUsers
 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<ChatUser[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);


  useEffect(() => {
    setIsSelecting(false);
    setSelectedUserIds(new Set());
  }, [users]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  function getAge (birthdate: string) {
    const birth = new Date(birthdate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    // Adjust if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  }

  function getUserInfoString(user: ChatUser)  {
    let str = "";
    if (user.gender) {
      str = user.gender.charAt(0)
    }
    if (user.birthday && getAge(user.birthday) > 0) {
      str = str + (str == "" ? "" : ", ") + getAge(user.birthday)
    }
    if (user.country && user.country != "null") {
      str = str + (str == "" ? "" : ", ") + user.country
    }
    return str;
  }

  const handleSelectToggle = () => {
    if (isSelecting) {
      setIsSelecting(false);
      setSelectedUserIds(new Set());
    } else {
      setIsSelecting(true);
    }
  };

  const handleCheckboxChange = (userId: number) => {
    if (!isSelecting) return
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const handleUnban = () => {
    unbanUsers(Array.from(selectedUserIds));
  };

  const handleUnbanAll = () => {
    unbanUsers(users.map(user => user.id));
  };

  const handleUnbanVerified = () => {
    unbanUsers(users.map(user => user.id));
  };

  if (!isOpen) return null;

  return (
    // Overlay background
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      {/* Modal window */}
      <div className="relative bg-white rounded-lg w-full max-w-xl max-h-[calc(100vh-160px)] overflow-y-auto shadow-lg p-8">

        {/* Close button - top-right corner */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Search box and select toggle */}
        <div className="flex items-center mb-4">
          <input
            type="text"
            placeholder="Search by name"
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button
            className={`ml-2 px-4 py-2 rounded ${
              isSelecting ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
            onClick={handleSelectToggle}
          >
            {isSelecting ? 'Cancel' : 'Select'}
          </button>
        </div>

        {/* Users list */}
        <div className="overflow-y-auto max-h-[calc(100vh-332px)] border border-gray-300 rounded mb-6">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-gray-500">No users found.</div>
          ) : (
            filteredUsers.map((user, idx) => (               
              <div
                key={user.id}
                className="flex items-center px-4 hover:bg-gray-50"
              >
                {isSelecting && (
                  <input
                    type="checkbox"
                    className="mr-2 w-6 h-6"
                    checked={selectedUserIds.has(user.id)}
                    onChange={() => handleCheckboxChange(user.id)}
                  />
                )}
                <ChatUserCard
                    onClick={() => {handleCheckboxChange(user.id)}}
                    key={`user-list-${idx}`}
                    id={user.id}
                    avatar={user.avatar ? `${SERVER_URL}/uploads/users/${user.avatar}` : "/assets/default-user.svg"}
                    alt="user"
                    title={user.name}
                    infoStr={getUserInfoString(user)}
                    // title={user.Opposite_Id == getCurrentUserId()
                    //     ? tabIndex == 0 ? user.Opposite_Name + " (You)" :  user.Opposite_Name
                    //     : user.Opposite_Name}
                    subtitle={user.email}
                    className={""}
                    dateString={""}
                    unread={0} //Number(user.Unread_Message_Count)
                    statusColor={""}
                />
              </div>
            ))
          )}
        </div>

        {/* Bottom Buttons: Ban Selected, Unban All, Unban Verified */}
        <div className="flex justify-center space-x-4 flex justify-evenly">
          {isSelecting && selectedUserIds.size > 0 && (
            <div
              className="text-gray-600 font-bold cursor-pointer"
              onClick={handleUnban}
            >
              Unban Selected
            </div>
          )}
          {/* Unban Buttons as label-style links */}
          <div
            className="text-gray-600 font-bold cursor-pointer"
            onClick={handleUnbanAll}
          >
            Unban All
          </div>
          <div
            className="text-gray-600 font-bold cursor-pointer"
            onClick={handleUnbanVerified}
          >
            Unban Verified
          </div>
        </div>

      </div>
    </div>
  );
};

export default BannedUsersPopup;