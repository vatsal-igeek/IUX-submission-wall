import { useState, useRef } from 'react';
import useOutsideClick from './useOutsideClick';

interface UseDropdownProps {
  options: string[];
  initialValue?: string;
}

const useDropdown = ({ options, initialValue = "" }: UseDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(initialValue);
  const [search, setSearch] = useState("");
  const [direction, setDirection] = useState<'down' | 'up'>('down');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropdown = () => {
    setIsOpen(false);
  };

  // Attach outside click to the same ref
  useOutsideClick(dropdownRef, closeDropdown);

  const handleDropdown = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 300 && spaceAbove > spaceBelow) {
        setDirection('up');
      } else {
        setDirection('down');
      }
    }
    setIsOpen((open) => !open);
  };

  const toggleDropdown = handleDropdown;

  const selectOption = (value: string) => {
    setSelectedValue(value);
    setIsOpen(false);
    setSearch("");
  };

  return {
    isOpen,
    selectedValue,
    options,
    dropdownRef,
    toggleDropdown,
    selectOption,
    closeDropdown,
    search,
    setSearch,
    direction,
    filteredOptions: options.filter(opt => opt.toLowerCase().includes(search.toLowerCase())),
  };
};

export default useDropdown; 