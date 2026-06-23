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
  action: "increment" | "decrement" | "add" = "add" // default to "add"
) => {
  const existingItems = cartData?.data?.items || [];

  const found = existingItems.find(
    (item: any) => (item.product as any)._id === productId || item.product === productId
  );

  // If item exists in cart
  if (found) {
    return existingItems
      .map((item: any) => {
        if ((item.product as any)._id === productId || item.product === productId) {
          let newQty = item.quantity;

          if (action === "increment" || action === "add") newQty = item.quantity + 1;
          else if (action === "decrement") newQty = item.quantity - 1;

          // Remove item if quantity <= 0
          if (newQty <= 0) return null;

          return {
            product: (item.product as any)._id || item.product,
            quantity: newQty,
          };
        }
        return {
          product: (item.product as any)._id || item.product,
          quantity: item.quantity,
        };
      })
      .filter(Boolean); // remove nulls
  }

  // Item does NOT exist → add it if action is "add" or "increment"
  if (action === "add" || action === "increment") {
    return [
      ...existingItems.map((item: any) => ({
        product: (item.product as any)._id || item.product,
        quantity: item.quantity,
      })),
      { product: productId, quantity: 1 },
    ];
  }

  // If action is decrement and item doesn't exist → just return existing items
  return existingItems.map((item: any) => ({
    product: (item.product as any)._id || item.product,
    quantity: item.quantity,
  }));
};

