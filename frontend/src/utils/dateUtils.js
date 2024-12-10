import { format, parseISO } from 'date-fns';

export const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    const date = parseISO(isoString);
    return format(date, 'dd/MM/yyyy'); // Format souhaité : jour/mois/année
  } catch (error) {
    console.error('Error parsing date:', error);
    return '';
  }
};