import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ChatUser } from '@/interface/chatInterface';
import ChatUserCard from '../chats/ChatUserCard';
import { SERVER_URL } from '@/resource/const/const';

interface Props {
  isOpen: boolean;
  blockedUsers: ChatUser[];
  allMembers: ChatUser[];
  onClose: () => void;
  onSave:(modIds: number[]) => void;
}

const BlockedUsersPopup: React.FC<Props> = ({
  isOpen,
  blockedUsers,
  allMembers,
  onClose,
  onSave
}) => {
  const [groupBlockedUsers, setGroupBlockedUsers] = useState<ChatUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setGroupBlockedUsers(blockedUsers);
  }, [blockedUsers]);

  const isChanged = useMemo(() => {
    const sortById = (list: ChatUser[]) =>
      [...list].sort((a, b) => a.id - b.id).map(u => ({ id: u.id, name: u.name }));
    const original = JSON.stringify(sortById(blockedUsers));
    const current = JSON.stringify(sortById(groupBlockedUsers));
    return original !== current;
  }, [groupBlockedUsers, blockedUsers]);

  const handleAddModerator = (user: ChatUser) => {
    if (!groupBlockedUsers.some(mod => mod.id === user.id)) {
      setGroupBlockedUsers([...groupBlockedUsers, user]);
    }
    setSearchTerm('');
  };

  const handleRemoveUser = (id: number) => {
    setGroupBlockedUsers(groupBlockedUsers.filter(u => u.id !== id));
  };

  const getAge = (birthdate: string) => {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    return age;
  };

  const getUserInfoString = (user: ChatUser) => {
    let str = '';
    if (user.gender) {
      str = user.gender.charAt(0);
    }
    if (user.birthday && getAge(user.birthday) > 0) {
      str = str + (str === '' ? '' : ', ') + getAge(user.birthday);
    }
    if (user.country && user.country !== 'null') {
      str = str + (str === '' ? '' : ', ') + user.country;
    }
    return str;
  };

  const searchResults = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allMembers
      .filter(
        m =>
          m.name.toLowerCase().includes(term) &&
          !groupBlockedUsers.some(mod => mod.id === m.id)
      )
      .slice(0, 5);
  }, [searchTerm, allMembers, groupBlockedUsers]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <FontAwesomeIcon icon={faTimes} className='text-[22px]' />
        </button>
        <h2 className="text-xl font-semibold mb-4">My Block List</h2>

        {/* Moderators List */}
        <div className="max-h-60 overflow-y-auto mb-4">
          {groupBlockedUsers?.length === 0 ? (
            <p className="text-gray-500">No blocked users.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {groupBlockedUsers?.map(user => (
                <li key={user.id} className="flex items-center justify-between">
                  <ChatUserCard
                    onClick={() => {}}
                    key={`mod-list-${user.id}`}
                    id={user.id}
                    avatar={
                      user.avatar
                        ? `${SERVER_URL}/uploads/users/${user.avatar}`
                        : '/assets/default-user.svg'
                    }
                    alt="user"
                    title={user.name}
                    infoStr={getUserInfoString(user)}
                    subtitle={""}
                    className=""
                    dateString=""
                    unread={0}
                    statusColor=""
                  />
                  <div className="flex space-x-2">
                    <button
                      className="text-red-500 hover:text-red-700 text-[22px]"
                      onClick={() => handleRemoveUser(user.id)}
                      title="Remove"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add Moderator Search Input */}
        <div className="flex flex-col gap-2 mt-4">
          <input
            type="text"
            placeholder="Search members to add..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Search Results */}
          {searchTerm && (
            <ul className="bg-gray-100 border rounded p-2 max-h-40 overflow-y-auto">
              {searchResults.length === 0 ? (
                <li className="text-sm text-gray-500">No matching members found.</li>
              ) : (
                searchResults.map(user => (
                  <li
                    key={user.id}
                    className="flex items-center justify-between p-1 hover:bg-gray-200 rounded"
                  >
                    <ChatUserCard
                      onClick={() => {}}
                      key={`mod-search-${user.id}`}
                      id={user.id}
                      avatar={
                        user.avatar
                          ? `${SERVER_URL}/uploads/users/${user.avatar}`
                          : '/assets/default-user.svg'
                      }
                      alt="user"
                      title={user.name}
                      infoStr={getUserInfoString(user)}
                      subtitle={user.email}
                      className=""
                      dateString=""
                      unread={0}
                      statusColor=""
                    />
                    <button
                      className="text-green-600 hover:text-green-800 font-bold text-[16px]"
                      onClick={() => handleAddModerator(user)}
                    >
                      Add
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {/* Save Button */}
        {searchTerm === '' && (
          <div className="mt-6 text-right">
            <button
              onClick={() => {
                const modIds = groupBlockedUsers.map(mod => mod.id)
                onSave(modIds);
              }}
              disabled={!isChanged}
              className={`${
                isChanged
                  ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
              } text-white font-semibold py-2 px-4 rounded`}
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockedUsersPopup;
