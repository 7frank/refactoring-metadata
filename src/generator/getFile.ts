import { Project } from "ts-morph";

export function getFile(src, data: string) {
  const project = new Project({ useInMemoryFileSystem: true });
  //  const fs = project.getFileSystem();

  const sourceFile = project.createSourceFile(src, data);
  project.addDirectoryAtPathIfExists("../fixtures");

  sourceFile.saveSync();
  return sourceFile;
}
