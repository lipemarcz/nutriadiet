import React from 'react';
import { NavLink } from './types';
import { FoodIcon, InfoIcon } from './components/Icons';

// Navigation labels are in Portuguese (pt-BR) for Brazilian users
// Ensure file is saved in UTF-8 to avoid mojibake
export const NAV_LINKS_ALL: NavLink[] = [
  { id: 'meal-builder', label: 'Inicio', icon: <FoodIcon size={18} /> },
  { id: 'foods', label: 'Alimentos', icon: <FoodIcon size={18} /> },
  { id: 'tutorial', label: 'Tutorial', icon: <InfoIcon size={18} /> },
];

export const NAV_LINKS_BASE: NavLink[] = [
  { id: 'meal-builder', label: 'Inicio', icon: <FoodIcon size={18} /> },
  { id: 'foods', label: 'Alimentos', icon: <FoodIcon size={18} /> },
  { id: 'tutorial', label: 'Tutorial', icon: <InfoIcon size={18} /> },
];

export default NAV_LINKS_ALL;

