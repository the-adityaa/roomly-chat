export function timeAgo(date) {
  if (!date) return "";

  const past = new Date(date);

  if (isNaN(past.getTime())) return "";

  const now = new Date();
  const secondsAgo = Math.floor((now - past) / 1000);

  if (secondsAgo < 60) {
    return `${Math.max(0, secondsAgo)} seconds ago`;
  }

  const minutesAgo = Math.floor(secondsAgo / 60);

  if (minutesAgo < 60) {
    return `${minutesAgo} minutes ago`;
  }

  const hoursAgo = Math.floor(minutesAgo / 60);

  if (hoursAgo < 24) {
    return `${hoursAgo} hours ago`;
  }

  const daysAgo = Math.floor(hoursAgo / 24);

  if (daysAgo < 30) {
    return `${daysAgo} days ago`;
  }

  const monthsAgo = Math.floor(daysAgo / 30);

  if (monthsAgo < 12) {
    return `${monthsAgo} months ago`;
  }

  const yearsAgo = Math.floor(monthsAgo / 12);

  return `${yearsAgo} years ago`;
}

// Example usage
console.log(timeAgo("2023-12-01T14:00:00Z")); // Output depends on the current time