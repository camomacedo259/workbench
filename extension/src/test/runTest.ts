function runTestEntry(): void {
  // Minimal smoke test entrypoint to keep npm test working.
  console.log("No automated tests configured yet.");
}

try {
  runTestEntry();
} catch (error: unknown) {
  console.error("Test runner failed:", error);
  process.exit(1);
}
