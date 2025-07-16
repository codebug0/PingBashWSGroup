import React, { useRef, useState } from 'react';

interface Category {
  Profession: string;
}

interface Props {
  categoryList: Category[];
  selectedCategory: string | null;
  handleCategoryClick: (category: string) => void;
}

const CategoryComponent: React.FC<Props> = ({ categoryList, selectedCategory, handleCategoryClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (containerRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - containerRef.current.offsetLeft);
      setScrollLeft(containerRef.current.scrollLeft);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // The multiplier can be adjusted for sensitivity
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className="category-container px-10 overflow-auto"
      onMouseDown={handleMouseDown}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <ul className="flex gap-5 whitespace-nowrap">
        <li
          className={`py-2 cursor-pointer px-3 border border-gray-400 rounded-lg ${selectedCategory === "All" || !selectedCategory ? "text-white bg-gradient-to-r from-[#0F00D4] to-[#B300C8]" : ""}`}
          onClick={() => handleCategoryClick("All")}
        >
          All
        </li>
        {categoryList.map((cat, idx) => (
          <li
            key={idx}
            className={`py-2 px-3 cursor-pointer border border-gray-400 rounded-lg ${selectedCategory === cat.Profession ? "text-white bg-gradient-to-r from-[#0F00D4] to-[#B300C8]" : ""}`}
            onClick={() => handleCategoryClick(cat.Profession)}
          >
            {cat.Profession}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryComponent;
