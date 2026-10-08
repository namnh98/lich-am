import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const expoModulesCoreRoots = [
  resolve(rootDir, "node_modules/expo-modules-core"),
  resolve(rootDir, "apps/mobile/node_modules/expo-modules-core"),
].filter(existsSync);

for (const coreRoot of expoModulesCoreRoots) {
  // 1. Fix ReturnType backward compatibility in expo-modules-core
  const returnTypeFile = resolve(
    coreRoot,
    "android/src/main/java/expo/modules/kotlin/types/ReturnType.kt",
  );
  if (existsSync(returnTypeFile)) {
    let content = readFileSync(returnTypeFile, "utf8");
    if (!content.includes("constructor(kClass: kotlin.reflect.KClass<*>)")) {
      content = content.replace(
        "class ReturnType(\n  private val converter: JSTypeConverter<*>\n) {",
        `class ReturnType(
  private val converter: JSTypeConverter<*>
) {
  constructor(kClass: kotlin.reflect.KClass<*>) : this(
    getDirectConverter(kClass.java) ?: getIndirectConverter(kClass.java, null)
  )

  constructor(klass: Class<*>) : this(
    getDirectConverter(klass) ?: getIndirectConverter(klass, null)
  )`,
      );
      writeFileSync(returnTypeFile, content, "utf8");
      console.log("✓ Applied ReturnType compatibility patch to expo-modules-core");
    }
  }

  // 2. Fix AsyncFunctionComponent abstract -> open in expo-modules-core
  const asyncFuncFile = resolve(
    coreRoot,
    "android/src/main/java/expo/modules/kotlin/functions/AsyncFunctionComponent.kt",
  );
  if (existsSync(asyncFuncFile)) {
    let content = readFileSync(asyncFuncFile, "utf8");
    if (!content.includes("constructor(\n    name: String,")) {
      content = content.replace(
        `abstract class AsyncFunctionComponent(
  name: String,
  desiredArgsTypes: Array<AnyType>
) : BaseAsyncFunctionComponent(name, desiredArgsTypes) {
  internal abstract fun callUserImplementation(args: Array<Any?>, promise: Promise, appContext: AppContext)`,
        `open class AsyncFunctionComponent(
  name: String,
  desiredArgsTypes: Array<AnyType>
) : AsyncFunction(name, desiredArgsTypes) {
  private var legacyBody: ((Array<Any?>) -> Any?)? = null

  constructor(
    name: String,
    desiredArgsTypes: Array<AnyType>,
    body: (Array<Any?>) -> Any?
  ) : this(name, desiredArgsTypes) {
    this.legacyBody = body
  }

  internal open fun callUserImplementation(args: Array<Any?>, promise: Promise, appContext: AppContext) {
    val b = legacyBody
    if (b != null) {
      try {
        val result = b(args)
        promise.resolve(result)
      } catch (t: Throwable) {
        promise.reject(t.toCodedException())
      }
    }
  }`,
      );
      writeFileSync(asyncFuncFile, content, "utf8");
      console.log("✓ Applied AsyncFunctionComponent compatibility patch to expo-modules-core");
    }
  }

  // 2b. Ensure AsyncFunction exists for older modules
  const legacyAsyncFuncFile = resolve(
    coreRoot,
    "android/src/main/java/expo/modules/kotlin/functions/AsyncFunction.kt",
  );
  if (!existsSync(legacyAsyncFuncFile)) {
    writeFileSync(
      legacyAsyncFuncFile,
      `package expo.modules.kotlin.functions

import expo.modules.kotlin.types.AnyType

abstract class AsyncFunction(
  name: String,
  desiredArgsTypes: Array<AnyType>
) : BaseAsyncFunctionComponent(name, desiredArgsTypes)
`,
      "utf8",
    );
    console.log("✓ Created legacy AsyncFunction.kt in expo-modules-core");
  }
}

// 3. Remove "publication" from modules so they compile from source against matching ABI
const modulesToCompileFromSource = [
  "expo-application",
  "expo-file-system",
  "expo-asset",
  "expo-font",
  "expo-keep-awake",
  "expo-sqlite",
  "expo-status-bar",
];

const moduleRoots = [
  resolve(rootDir, "node_modules"),
  resolve(rootDir, "apps/mobile/node_modules"),
].filter(existsSync);

for (const nodeModulesDir of moduleRoots) {
  for (const modName of modulesToCompileFromSource) {
    const configFile = resolve(nodeModulesDir, `${modName}/expo-module.config.json`);
    if (existsSync(configFile)) {
      try {
        const config = JSON.parse(readFileSync(configFile, "utf8"));
        if (config.android && config.android.publication) {
          delete config.android.publication;
          writeFileSync(configFile, `${JSON.stringify(config, null, 2)}\n`, "utf8");
          console.log(`✓ Patched ${modName} to build from source`);
        }
      } catch (e) {
        console.warn(`Could not patch ${modName}:`, e.message);
      }
    }
  }
}
