import { extractInterfacesFromFile } from './tsx-ray';

const result = extractInterfacesFromFile('src/Button.tsx');

console.log(JSON.stringify(result,null,'  ' ));