export const isDynamicServerUsageError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const dynamicError = error as {
    digest?: unknown;
    message?: unknown;
    description?: unknown;
  };

  if (dynamicError.digest === "DYNAMIC_SERVER_USAGE") {
    return true;
  }

  const message = typeof dynamicError.message === "string" ? dynamicError.message : "";
  const description =
    typeof dynamicError.description === "string" ? dynamicError.description : "";

  const combinedText = `${message} ${description}`.toUpperCase();

  return (
    combinedText.includes("DYNAMIC SERVER USAGE") ||
    combinedText.includes("COULDN'T BE RENDERED STATICALLY")
  );
};