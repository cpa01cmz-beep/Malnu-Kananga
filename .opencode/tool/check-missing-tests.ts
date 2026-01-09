import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Find TypeScript/JavaScript files without corresponding test files",
  args: {},
  async execute() {
    const { execSync } = await import('child_process');
    try {
      const result = execSync(`find src -name "*.ts" -o -name "*.tsx" | grep -v __tests__ | grep -v ".test.ts" | grep -v ".test.tsx" | sort`, {
        encoding: 'utf8'
      }).trim().split('\n').filter(Boolean);
      
      const filesWithoutTests: string[] = [];
      
      for (const file of result) {
        const testFilePaths = [
          file.replace(/(\.ts|\.tsx)$/, '.test.ts'),
          file.replace(/(\.ts|\.tsx)$/, '.test.tsx'),
          file.replace(/(\.ts|\.tsx)$/, '.spec.ts'),
          file.replace(/(\.ts|\.tsx)$/, '.spec.tsx'),
          `${file.substring(0, file.lastIndexOf('/'))}/__tests__/${file.split('/').pop()?.replace(/(\.ts|\.tsx)$/, '.test.ts')}`,
          `${file.substring(0, file.lastIndexOf('/'))}/__tests__/${file.split('/').pop()?.replace(/(\.ts|\.tsx)$/, '.test.tsx')}`
        ];
        
        const { existsSync } = await import('fs');
        const hasTest = testFilePaths.some((testPath: string) => existsSync(testPath));
        
        if (!hasTest) {
          filesWithoutTests.push(file);
        }
      }
      
      if (filesWithoutTests.length === 0) {
        return 'All files have corresponding test files!';
      }
      
      return `Found ${filesWithoutTests.length} files without tests:\n\n${filesWithoutTests.join('\n')}\n\nUse /add-component, /add-service, or /add-hook to create tests automatically.`;
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
})
