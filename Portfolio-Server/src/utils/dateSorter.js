const getEndDate = (years) => {
  if (!years || years.trim() === '') {
    return { year: new Date().getFullYear() + 1, month: 12 };
  }
  
  const parts = years.split('—').map(s => s.trim());
  if (parts.length < 2) {
    const year = parseInt(parts[0]) || new Date().getFullYear() + 1;
    return { year, month: 12 };
  }
  
  const end = parts[1];
  if (/present/i.test(end)) {
    return { year: new Date().getFullYear() + 1, month: 12 };
  }
  
  const monthYearMatch = end.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/);
  if (monthYearMatch) {
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const month = monthNames.indexOf(monthYearMatch[1]) + 1;
    const year = parseInt(monthYearMatch[2]);
    return { year, month };
  }
  
  const year = parseInt(end) || new Date().getFullYear() + 1;
  return { year, month: 12 };
};

const compareDates = (dateA, dateB) => {
  if (dateA.year !== dateB.year) {
    return dateB.year - dateA.year;
  }
  return dateB.month - dateA.month;
};

const sortByEndDate = (items, dateField = 'years') => {
  return [...items].sort((a, b) => {
    const dateA = getEndDate(a[dateField]);
    const dateB = getEndDate(b[dateField]);
    return compareDates(dateA, dateB);
  });
};

module.exports = {
  getEndDate,
  compareDates,
  sortByEndDate
};