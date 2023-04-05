export const getTimeFromInt = (int) => {
  return (
    ("0" + Math.floor(int / 60)).slice(-2) + ":" + ("0" + (int % 60)).slice(-2)
  );
};
