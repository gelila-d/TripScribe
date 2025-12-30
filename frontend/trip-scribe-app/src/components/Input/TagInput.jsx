import React, { useState } from 'react';
import { GrMapLocation } from 'react-icons/gr';
import { MdAdd, MdClose } from 'react-icons/md';

const TagInput = ({ tags = [], setTags }) => {
  const [inputValue, setInputValue] = useState("");

  const addNewTag = () => {
    if (inputValue.trim() !== "") {
      
      setTags([...tags, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      addNewTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div>
       
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span 
            key={index} 
            className="flex items-center gap-2 bg-purple-200/40 px-3 py-1 rounded text-sm text-purple-600"
          >
            <GrMapLocation className='text-sm'/>
            {tag}

            <button onClick={() => handleRemoveTag(tag)}>
              <MdClose className="text-slate-500 hover:text-red-500" />
            </button>
          </span>
        ))}
      </div>

      <div className='flex items-center gap-4 mt-3'>
        <input 
          type='text'
          value={inputValue}
          className='text-sm bg-transparent border px-3 py-2 rounded outline-none'
          placeholder='Add Location'
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />

        <button 
          className='w-8 h-8 flex items-center justify-center rounded border border-purple-500 hover:bg-purple-500 group' 
          onClick={addNewTag}
        >
          <MdAdd className='text-2xl text-purple-500 group-hover:text-white'/>
        </button>
      </div>
    </div>
  );
};

export default TagInput;