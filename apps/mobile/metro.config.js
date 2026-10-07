const { getDefaultConfig } = require("expo/metro-config");

/**
 * Expo SDK 52+ discovers package.json workspaces automatically. Keeping this file close
 * to Expo's default is important: manual nodeModulesPaths/extraNodeModules often
 * loads a second React instance and causes invalid-hook-call errors.
 *
 * For older Expo SDKs only, see README.md for the legacy watchFolders setup.
 */
const config = getDefaultConfig(__dirname);

module.exports = config;
