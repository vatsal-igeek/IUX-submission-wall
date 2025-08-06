import { useState } from 'react';

import useOutsideClick from './useOutsideClick';

interface UseDropdownProps {
  options: string[];
  initialValue?: string;
}

const useDropdown = ({ options, initialValue = "" }: UseDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(initialValue);

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectOption = (value: string) => {
    setSelectedValue(value);
    setIsOpen(false);
  };

  const dropdownRef = useOutsideClick(closeDropdown);

  return {
    isOpen,
    selectedValue,
    options,
    dropdownRef,
    toggleDropdown,
    selectOption,
    closeDropdown
  };
};

export default useDropdown; 