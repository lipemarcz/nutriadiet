import React from 'react';
import { IconProps } from '../types';

/**
 * Icon components using SVG for consistent styling
 * All icons are designed to work with dark and light themes
 */

// Base Icon component
const Icon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => {
  const baseClasses = 'inline-block';
  const iconClasses = `${baseClasses} ${className}`;
  
  return (
    <svg
      width={size}
      height={size}
      className={iconClasses}
      fill="currentColor"
      viewBox="0 0 24 24"
      {...props}
    />
  );
};

// Sun Icon (Light Mode)
export const SunIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
  </Icon>
);

// Moon Icon (Dark Mode)
export const MoonIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
  </Icon>
);

// Plus Icon
export const PlusIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
  </Icon>
);

// Minus Icon
export const MinusIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path fillRule="evenodd" d="M4.25 12a.75.75 0 01.75-.75h14a.75.75 0 010 1.5H5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </Icon>
);

// Edit Icon
export const EditIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
    <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
  </Icon>
);

// Delete Icon
export const DeleteIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
  </Icon>
);

// Chart Icon
export const ChartIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-8.25V3z" clipRule="evenodd" />
  </Icon>
);

// Food Icon
export const FoodIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" />
  </Icon>
);

// Menu Icon
export const MenuIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </Icon>
);

// Close Icon
export const CloseIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
  </Icon>
);

// User Icon
export const UserIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M12 2.25a4.5 4.5 0 100 9 4.5 4.5 0 000-9zM4.5 20.25a7.5 7.5 0 0115 0v.75H4.5v-.75z" />
  </Icon>
);

// Lock Icon
export const LockIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M12 1.5a4.5 4.5 0 00-4.5 4.5v3H6a2.25 2.25 0 00-2.25 2.25v7.5A2.25 2.25 0 006 21h12a2.25 2.25 0 002.25-2.25v-7.5A2.25 2.25 0 0018 9H16.5V6A4.5 4.5 0 0012 1.5zm-3 6V6a3 3 0 116 0v1.5h-6z" />
  </Icon>
);

// Info Icon
export const InfoIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 10-1.5 0v.75a.75.75 0 001.5 0V9zm-1.5 3a.75.75 0 000 1.5h.75v3.75a.75.75 0 001.5 0V12a.75.75 0 00-.75-.75h-1.5z" clipRule="evenodd" />
  </Icon>
);

// Drag Handle Icon (two stacked dots)
export const DragHandleIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="8" cy="8" r="1.25" />
    <circle cx="8" cy="12" r="1.25" />
    <circle cx="12" cy="8" r="1.25" />
    <circle cx="12" cy="12" r="1.25" />
  </Icon>
);

// Refresh/Replace Icon (circular arrow)
export const RefreshIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M12 5V2L8 6l4 4V7a5 5 0 11-4.9 6.2.75.75 0 10-1.45.4A6.5 6.5 0 1012 5z" />
  </Icon>
);

// Arrow Left Icon
export const ArrowLeft: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
  </Icon>
);

export default Icon;
