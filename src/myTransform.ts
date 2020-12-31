import ts from "typescript";

export const myTransformFactory = (
  ts: typeof import("typescript"),
  cb: Function
) => {
  const myTransform: ts.TransformerFactory<ts.SourceFile> = (context) => {
    return (sourceFile) => {
      const visitor = (node: ts.Node): ts.Node => {
       
    //    cb(node)

        // if (ts.isIdentifier(node)) {
        //   cb(node);
        //  // console.log("found",node)
        // }

       if (ts.isTypeReferenceNode(node)) {
          cb(node,"typereference");
         // console.log("found",node)
        }

       
        if (ts.isFunctionDeclaration(node)) {
          cb(node,"functiondeclaration");
         // console.log("found",node)
        }

        return ts.visitEachChild(node, visitor, context);
      };

      return ts.visitNode(sourceFile, visitor);
    };
  };

  return myTransform;
};
