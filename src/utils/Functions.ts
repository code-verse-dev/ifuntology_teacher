export const getBasename = () => {
  const { hostname } = window.location;
  let basename = "";
  if (hostname.includes("react.customdev.solutions")) {
    basename = "/ifuntology/teacher";
  }
  return basename;
};

export const ImageUrl = (image: string) => {
  const name = image.replace(/^\/+/, "");
  return `${getBasename()}/images/${encodeURIComponent(name)}`;
};

export const buildCartItems = (
  productId: string,
  cartData: any,
  action: "increment" | "decrement" | "add" | "set" = "add",
  step = 1
) => {
  const existingItems = cartData?.data?.items || [];
  const amount = Number(step) || 0;

  const found = existingItems.find(
    (item: any) =>
      (item.product as any)._id === productId || item.product === productId
  );

  const toLine = (item: any, quantity: number) => ({
    product: (item.product as any)._id || item.product,
    quantity,
  });

  const mapOthers = () =>
    existingItems
      .filter(
        (item: any) =>
          (item.product as any)._id !== productId && item.product !== productId
      )
      .map((item: any) => toLine(item, item.quantity));

  if (action === "set") {
    if (amount <= 0) {
      return mapOthers();
    }
    if (found) {
      return existingItems
        .map((item: any) => {
          if (
            (item.product as any)._id === productId ||
            item.product === productId
          ) {
            return toLine(item, amount);
          }
          return toLine(item, item.quantity);
        })
        .filter(Boolean);
    }
    return [...mapOthers(), { product: productId, quantity: amount }];
  }

  const delta = Math.max(1, amount);

  if (found) {
    return existingItems
      .map((item: any) => {
        if (
          (item.product as any)._id === productId ||
          item.product === productId
        ) {
          let newQty = item.quantity;

          if (action === "increment" || action === "add") {
            newQty = item.quantity + delta;
          } else if (action === "decrement") {
            newQty = item.quantity - delta;
          }

          if (newQty <= 0) return null;

          return toLine(item, newQty);
        }
        return toLine(item, item.quantity);
      })
      .filter(Boolean);
  }

  if (action === "add" || action === "increment") {
    return [...mapOthers(), { product: productId, quantity: delta }];
  }

  return existingItems.map((item: any) => toLine(item, item.quantity));
};
