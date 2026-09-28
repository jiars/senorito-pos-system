export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    // if laravel returns an error
    if (!response.ok) {
      throw new Error(data.message);
    }

    // if laravel login successful, save token to localstorage
    localStorage.setItem("auth_token", data.token);

    return data;
  } catch (error) {
    console.error("Error logging in:", error.message);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const token = localStorage.getItem("auth_token");

    // Tell Laravel to destroy the token in the database
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Delete the token from the browser
    localStorage.removeItem("auth_token");
  } catch (error) {
    console.error("Error logging out:", error.message);
    throw error;
  }
};
