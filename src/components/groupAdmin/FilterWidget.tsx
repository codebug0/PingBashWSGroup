import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatUser } from '@/interface/chatInterface'

interface FilterOption {
  id: number
  name: string
}

interface Props {
  filterOptions: FilterOption[]
  users: ChatUser[]
  currentMode: number | null
  filteredUser: ChatUser | null
  onFilterModeUpdatede: (id: number) => void
  onUserSelected: (user: ChatUser | null) => void
}

export default function FilterWidget({ 
    filterOptions, 
    users, 
    currentMode, 
    filteredUser,
    onFilterModeUpdatede,
    onUserSelected 
}: Props) {
  const [selectedFilterMode, setSelectedFilterMode] = useState<number>(filterOptions[0]?.id || 0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isOneOnOneMode, setOneOnOneMode] = useState(false)

//   const oneOnOneOption = filterOptions.find(opt => opt.name === '1 on 1 Mode')
//   const isOneOnOneMode = oneOnOneOption?.id === selectedFilterMode

  const handleUserSelect = (user: ChatUser) => {
    setSelectedUser(user)
    onUserSelected(user)
    setSearchTerm('')
    setShowDropdown(false)
  }

  const handleFilterChange = (id: number) => {
    setSelectedFilterMode(id)
    setSelectedUser(null)
    setSearchTerm('')
    setShowDropdown(false)
    onUserSelected(null)
    onFilterModeUpdatede(id)
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  useEffect(() => {
    setSelectedFilterMode(currentMode || 0)    
  }, [currentMode])

  useEffect(() => {
    setOneOnOneMode(selectedFilterMode == 1)
  }, [selectedFilterMode])

  useEffect(() => {
    setSelectedUser(filteredUser)
  }, [filteredUser])

  return (
    <ul className="flex flex-col gap-2 w-full">
      {filterOptions.map((item, idx) => (
        <div className="flex flex-col" key={item.id}>
          <div className="flex items-center mb-2 cursor-pointer">
            <input
              type="radio"
              id={item.id.toString()}
              value={item.id}
              checked={selectedFilterMode === item.id}
              onChange={() => handleFilterChange(item.id)}
              className="mr-2 w-4 h-4 cursor-pointer"
            />
            <label htmlFor={item.id.toString()} className="text-[18px] cursor-pointer">
              {item.name}
            </label>
          </div>

          {/* Only show search box under 1 on 1 Mode */}
          {isOneOnOneMode && idx === 1 && (
            <div className="pl-6 relative">
              <input
                type="text"
                placeholder={selectedUser ? selectedUser.name : 'Search user...'}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                className="p-2 border rounded w-full"
              />

              {/* Combobox dropdown */}
              <AnimatePresence>
                {showDropdown && searchTerm && filteredUsers.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-10 w-full bg-white border rounded shadow mt-1 max-h-48 overflow-y-auto"
                  >
                    {filteredUsers.map(user => (
                      <li
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {user.name}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Selected user shown only in 1 on 1 mode */}
          {isOneOnOneMode && selectedUser && idx == 1 && (
            <motion.div
              key="selected-user"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pl-6 mt-2 text-sm text-gray-700"
            >
              TO: {selectedUser.name}
            </motion.div>
          )}
        </div>
      ))}
    </ul>
  )
}
