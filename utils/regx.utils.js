export const isValidImageUrl = (url) => {
  if (typeof url !== "string") return false;

  const allowedExtensions = ["jpeg", "jpg", "gif", "png"];
  const pattern = new RegExp(
    `^https?:\\/\\/.+\\.(${allowedExtensions.join("|")})$`,
    "i"
  );

  return pattern.test(url);
};
