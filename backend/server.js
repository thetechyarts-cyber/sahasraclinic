/**
 * This is the main entry point for cPanel / Hostinger Node.js deployments.
 * Hostinger's Node.js app runner looks for a server.js or app.js file by default.
 * This simply requires the compiled TypeScript code.
 */
require('./dist/index.js');
