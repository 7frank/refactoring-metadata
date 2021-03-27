import {
    Project,
    InterfaceDeclaration,
    SourceFile,
    ImportDeclaration,
    FunctionDeclaration,
  } from "ts-morph";
  import { ParameterDeclaration } from "typescript";
  // eslint-disable-next-line
  import type {
    TypenameToUnresolvedRefsMap,
    InterfaceDefinitions,
    InterfaceDefinition,
    Filepath,
  } from "tsx-ray/dist/types";

  import {
    PrimitiveType,
    ArrayType,
    ParsedType,
    UnionType,
    ObjectType,
  } from "tsx-ray/dist/types";

  import {
    merge,
    isImport,
    getNameFromType,
    convertToArrayRepresentation,
    convertToPrimitiveRepresentation,
    removeQuotesIfLiteral,
  } from "tsx-ray/dist/utils";
  
  export const compileFile = (filepath: Filepath, outDir: string) => {
    const project = new Project({
      compilerOptions: {
        outDir,
        declaration: false,
        jsx: 2,
      },
    });
    const sourceFile = project.addSourceFileAtPath(filepath);
    sourceFile.emitSync();
  };
  
  export const compileSourceSync = (sourceFile: SourceFile) =>
    sourceFile.emitSync();
  
  export const extractInterfaces = (sourceFile: SourceFile) =>
    parseInterfacesFromSourceFile(sourceFile);
  
  export const getDefaultImports = (sourceFile: SourceFile) => {
    return sourceFile
      .getImportDeclarations()
      .filter((imp) => imp.getDefaultImport());
  };
  
  export const extractFunctionsFromFile = (sourceFile:SourceFile) => {
    // const project = new Project({
    //   compilerOptions: {
    //     jsx: 2,
    //   },
    // });
    // const sourceFile = project.addSourceFileAtPath(filepath);
  
    const otherInterfaces = parseInterfacesFromSourceFile(sourceFile);
  
    return parseFunctionsFromSourceFile(sourceFile, otherInterfaces);
    //  return parseInterfacesFromSourceFile(sourceFile);
  };
  
  /**
   * exclude specific imports from parsing any further
   */
  function importFilter(src: SourceFile, array: string[] = []) {
    const path = src.getFilePath();
  
    const found = array.some(function (entry) {
      const reg = new RegExp(`[\\\\/]${entry}[\\\\/]`);
      return reg.test(path);
    });
  
    return !found;
  }
  
  const parseInterfacesFromSourceFile = (
    sourceFile: SourceFile
  ): InterfaceDefinitions => {
    const interfaces = sourceFile.getInterfaces();
    const imports = sourceFile.getImportDeclarations();
  
    const getParsedInterfacesFromImports = (imports: ImportDeclaration[]) => {
      if (imports.length > 0) {
        const importedSources = imports
          .map((i) => i.getModuleSpecifierSourceFile())
          .filter(Boolean) as SourceFile[];
        const importedParsedInterfaces = importedSources
          .filter((src) => importFilter(src))
          .map(parseInterfacesFromSourceFile);
        return importedParsedInterfaces;
      }
      return [];
    };
  
    const interfaceDefinitions: InterfaceDefinitions = {};
    const unresolvedTypes: Set<string> = new Set();
    const typeReferences: TypenameToUnresolvedRefsMap = {};
  
    const importedInterfaces = getParsedInterfacesFromImports(imports);
  
    const allInterfaceDefinitions =
      importedInterfaces.length > 0
        ? importedInterfaces.reduce(
            (acc, current) => merge(acc, current),
            interfaceDefinitions
          )
        : interfaceDefinitions;
  
    const parseInterfaceProperties = (intf: InterfaceDeclaration) => {
      const properties: InterfaceDefinition = {};
      for (const property of intf.getProperties()) {
        const type = property.getType();
  
        if (type.isArray()) {
          const typeArgs = type.getTypeArguments();
          const arrayElementType = convertToArrayRepresentation(typeArgs[0]);
          properties[property.getName()] = arrayElementType;
        } else if (type.isBoolean()) {
          properties[property.getName()] = convertToPrimitiveRepresentation(type);
        } else if (type.isUnion()) {
          const unionTypes = type
            .getUnionTypes()
            .map(removeQuotesIfLiteral) as PrimitiveType[];
  
          properties[property.getName()] = unionTypes;
        } else if (type.isInterface()) {
          const rawText = type.getText();
          const nameOfType = isImport(rawText) ? getNameFromType(type) : rawText;
  
          unresolvedTypes.add(nameOfType);
  
          const unresolvedPropertyRef = {
            ref: properties,
            name: property.getName(),
          };
  
          if (!typeReferences[nameOfType]) {
            typeReferences[nameOfType] = [];
          }
  
          typeReferences[nameOfType].push(unresolvedPropertyRef);
        } else {
          properties[property.getName()] = convertToPrimitiveRepresentation(type);
        }
      }
      return properties;
    };
  
    for (const intf of interfaces) {
      allInterfaceDefinitions[intf.getName()] = parseInterfaceProperties(intf);
    }
  
    for (const unresolvedType of Array.from(unresolvedTypes)) {
      if (!allInterfaceDefinitions[unresolvedType]) {
        console.warn(`No definition found for ${unresolvedType}`);
      }
  
      const unresolvedReferences = typeReferences[unresolvedType];
  
      for (const unresolvedPropertyRef of unresolvedReferences) {
        const ref = unresolvedPropertyRef.ref;
        ref[unresolvedPropertyRef.name] = allInterfaceDefinitions[unresolvedType];
      }
    }
  
    return allInterfaceDefinitions;
  };
  
  // let importSelf = true;
  
  const parseFunctionsFromSourceFile = (
    sourceFile: SourceFile,
    otherInterfaces: InterfaceDefinitions
  ): InterfaceDefinitions => {
    //const interfaces = sourceFile.getInterfaces();
    const imports = sourceFile.getImportDeclarations();
  
    const functions = sourceFile.getFunctions();
  
    // const rFunction=sourceFile.getFunctions()[1]
    // const testReturnType=rFunction.getReturnType()
    // // will be "JSX.Element" our react function
    // const result2= convertToPrimitiveRepresentation(testReturnType)
    // const properties: InterfaceDefinition = {};
    // const testParameterTypes=rFunction.getParameters().forEach(p => properties[p.getName()]=convertToPrimitiveRepresentation(p.getType()))
  
    const getParsedInterfacesFromImports = (imports: ImportDeclaration[]) => {
      if (imports.length > 0) {
        const importedSources = imports
          .map((i) => i.getModuleSpecifierSourceFile())
          .filter(Boolean) as SourceFile[];
  
        // add this sourcefile to import local stuff
        // if (importSelf) {
        //   importSelf = false;
        //   importedSources.push(sourceFile);
        // }
        const importedParsedInterfaces = importedSources
          .filter((src) => importFilter(src, ["prop-types", "csstype"]))
          .map((sourceFile) =>
            parseFunctionsFromSourceFile(sourceFile, otherInterfaces)
          );
        return importedParsedInterfaces;
      }
      return [];
    };
  
    const interfaceDefinitions: InterfaceDefinitions = {};
    const unresolvedTypes: Set<string> = new Set();
    const typeReferences: TypenameToUnresolvedRefsMap = {};
  
    const importedInterfaces = getParsedInterfacesFromImports(imports);
  
    const allInterfaceDefinitions =
      importedInterfaces.length > 0
        ? importedInterfaces.reduce(
            (acc, current) => merge(acc, current),
            interfaceDefinitions
          )
        : interfaceDefinitions;
  
    const parseFunctionInterfaceProperties = (intf: FunctionDeclaration) => {
      const properties: InterfaceDefinition = {};
  
      const params = intf.getParameters();
  
      // add partial return type interface
      const ret = {
        getName: () => "__return__",
        getType: () => intf.getReturnType(),
      };
      params.push(ret as any);
  
      for (const property of params) {
        const type = property.getType();
  
        if (type.isArray()) {
          const typeArgs = type.getTypeArguments();
          const arrayElementType = convertToArrayRepresentation(typeArgs[0]);
          properties[property.getName()] = arrayElementType;
        } else if (type.isBoolean()) {
          properties[property.getName()] = convertToPrimitiveRepresentation(type);
        } else if (type.isUnion()) {
          const unionTypes = type
            .getUnionTypes()
            .map(removeQuotesIfLiteral) as PrimitiveType[];
  
          properties[property.getName()] = unionTypes;
        } else if (type.isInterface()) {
          const rawText = type.getText();
          const nameOfType = isImport(rawText) ? getNameFromType(type) : rawText;
  
          unresolvedTypes.add(nameOfType);
  
          const unresolvedPropertyRef = {
            ref: properties,
            name: property.getName(),
          };
  
          if (!typeReferences[nameOfType]) {
            typeReferences[nameOfType] = [];
          }
  
          typeReferences[nameOfType].push(unresolvedPropertyRef);
        } else {
          properties[property.getName()] = convertToPrimitiveRepresentation(type);
        }
      }
      return properties;
    };
  
    for (const intf of functions) {
      allInterfaceDefinitions[intf.getName()] = parseFunctionInterfaceProperties(
        intf
      );
    }
  
    /**
     * FIXME props and look for pattern like import(\"/home/frank/playground-my-plugin/src/ImportedProp\").ImportedProp
     * and replace those with otherInterfaces[ImportedProp]
     */
  
    for (const unresolvedType of Array.from(unresolvedTypes)) {
      let resolved = allInterfaceDefinitions[unresolvedType];
  
      if (!resolved) {
        console.warn(
          `No definition found for ${unresolvedType} attempting backup`
        );
  
        if (unresolvedType == "JSX.Element") {
          // @ts-ignore
          resolved = "JSX.Element";
        } else if (!otherInterfaces[unresolvedType]) {
          console.warn(`No definition found in backup for ${unresolvedType}`);
        } else {
          resolved = otherInterfaces[unresolvedType];
        }
      }
  
      const unresolvedReferences = typeReferences[unresolvedType];
  
      for (const unresolvedPropertyRef of unresolvedReferences) {
        const ref = unresolvedPropertyRef.ref;
        ref[unresolvedPropertyRef.name] = resolved;
      }
    }
  
    return allInterfaceDefinitions;
  };
  
  export { PrimitiveType, ArrayType, ObjectType, ParsedType, UnionType };