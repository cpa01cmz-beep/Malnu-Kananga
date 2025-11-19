export const name = 'import-meta-transformer';
export const version = 1;

export function factory() {
  return {
    visitor: {
      MemberExpression(path) {
        if (path.node.object.type === 'MetaProperty' && 
            path.node.object.meta.name === 'import' && 
            path.node.object.property.name === 'meta' &&
            path.node.property.name === 'env') {
          // Replace import.meta.env with process.env
          path.replaceWithSourceString('process.env');
        }
      }
    }
  };
}