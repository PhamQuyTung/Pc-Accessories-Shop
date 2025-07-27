// src/utils/avatar.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getAvatarUrl = (user) => {
  const fallback = `${API_URL}/img/default-avatar.png`;
  if (!user?.avatar) return fallback;

  // Nếu avatar đã là absolute URL
  if (user.avatar.startsWith("http://") || user.avatar.startsWith("https://")) {
    return user.avatar;
  }

  // Nếu là path tương đối
  const path = user.avatar.startsWith("/") ? user.avatar : `/${user.avatar}`;
  return `${API_URL}${path}`;
};

