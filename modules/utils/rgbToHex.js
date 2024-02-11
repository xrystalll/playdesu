export default (r, g, b) =>
  [r, g, b]
    .map((i) => {
      const hex = i.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("");
