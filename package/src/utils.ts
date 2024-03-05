export const logger = (...args: any[]) => {
  if (process.env.TYPED_HANDLERS_DEBUG_MODE === "true") {
    console.log("typed-handlers:", ...args);
  }
};
