export const resizeImage = (name, base64Str, maxWidth = 1688, maxHeight = 1688) => {
  if (!name) console.log('Having name so actions in web and mobile are the same.');
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width, height;
      if (img.width > maxWidth && img.height > maxHeight) {
        if (img.width > img.height) {
          width = maxWidth;
          height = img.height / img.width * maxWidth;
        } else {
          width = img.width / img.height * maxHeight;
          height = maxHeight;
        }
      } else if (img.width > maxWidth) {
        width = maxWidth;
        height = img.height / img.width * maxWidth;
      } else if (img.height > maxHeight) {
        width = img.width / img.height * maxHeight;
        height = maxHeight;
      } else {
        resolve(base64Str)
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL());
    };
    img.src = base64Str;
  });
};
