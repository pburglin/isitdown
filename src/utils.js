export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

export const checkURLStatus = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'cors' });
    const { status } = response;

    if (status === 200 || status === 440) {
      return {
        status: 'success',
        statusCode: status,
        message: `URL is accessible. Status code: ${status}`,
      };
    } else {
      return {
        status: 'error',
        statusCode: status,
        message: `URL is not accessible. Status code: ${status}`,
      };
    }
  } catch (error) {
    return {
      status: 'error',
      message: `Error checking URL: ${error.message}`,
    };
  }
};

export const persistChecks = (checks) => {
  sessionStorage.setItem('recentChecks', JSON.stringify(checks));
};
