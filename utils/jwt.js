
export const sentToken = async (user, statusCode, res) => {
  try {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();

    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Use 'Lax' for localhost
      secure: process.env.NODE_ENV === "production", // False for localhost
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Use 'Lax' for localhost
      secure: process.env.NODE_ENV === "production", // False for localhost
    });
    res.status(statusCode).json({
      success: true,
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error sending tokens:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
