export const validateURL = (url) => {
  const pattern = new RegExp('^(https?://)?[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}(/.*)?$');
  return pattern.test(url);
};

export const checkURLStatus = async (url) => {
  try {
    const response = await fetch(url);
    return { up: response.ok };
  } catch {
    return { up: false };
  }
};
