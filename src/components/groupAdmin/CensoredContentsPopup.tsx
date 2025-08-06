'use client';

import { useState, useEffect } from 'react';
import { 
  faEdit,
  faTrash,
  faClose
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCensoredWordArray } from '@/resource/utils/helpers';

interface Props {
  isOpen: boolean;
  contentsStr: string;
  onClose: () => void;
  onSave: (censoredStr: string) => void;
}

export default function CensoredContentsPopup({ 
  isOpen, 
  contentsStr, 
  onClose,
  onSave
}: Props) {
  const [censoredList, setCensoredList] = useState<string[]>([]);
  const [originalList, setOriginalList] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setOriginalList(censoredList); // save original for comparison
    } else {
      setInputValue('');
      setEditIndex(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const arr = getCensoredWordArray(contentsStr)
    setCensoredList(arr?.filter(content => content != "") ?? []);
  }, [contentsStr]);

  const handleAddOrSave = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    if (editIndex !== null) {
      const updated = [...censoredList];
      updated[editIndex] = trimmed;
      setCensoredList(updated);
      setEditIndex(null);
    } else {
      setCensoredList([...censoredList, trimmed]);
    }

    setInputValue('');
  };

  const handleEdit = (index: number) => {
    setInputValue(censoredList[index]);
    setEditIndex(index);
  };

  const handleDelete = (index: number) => {
    const updated = censoredList.filter((_, i) => i !== index);
    setCensoredList(updated);
    if (editIndex === index) {
      setInputValue('');
      setEditIndex(null);
    }
  };

  const handleSave = () => {
    setOriginalList(censoredList); // persist changes
    setInputValue('');
    setEditIndex(null);
    let res = ""
    censoredList.map(word => res += word + ","); 
    onSave(res);
  };

  const hasChanges =
    JSON.stringify(censoredList) !== JSON.stringify(originalList);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <FontAwesomeIcon icon={faClose} className="text-[18px]" />
        </button>

        <h2 className="text-lg font-semibold mb-4">Censored Content List</h2>

        <ul className="space-y-2 max-h-60 overflow-y-auto mb-4">
          {censoredList.map((item, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-gray-100 rounded-lg px-3 py-2"
            >
              <span>{item}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FontAwesomeIcon icon={faEdit} className="text-[16px]" />
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-[16px]" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded px-3 py-2"
            placeholder="Enter censored word"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button
            onClick={handleAddOrSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editIndex !== null ? 'Save' : 'Add'}
          </button>
        </div>

        <div className="text-right">
          {hasChanges ? (
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save
            </button>
          ) : (
            <button
              onClick={onClose}
              className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
