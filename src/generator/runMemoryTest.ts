import * as ts from "typescript";

/**
 * we probably ned to run a whole compilation of complex sources in a memory or ramdisk file system
 * @param source
 */
export async function runMemoryTest(source: string) {
  let result = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });

  try {
    const testResult = eval(result.outputText);
    return JSON.stringify(testResult, null, "  ");
  } catch (e) {
    const E = new Error(
      "Error on evaluating:" +
        e.message +
        "\n\n Javascript:" +
        result.outputText +
        "\n\n"
    );
    E.stack = e.stack;
    throw E;
  }
}
