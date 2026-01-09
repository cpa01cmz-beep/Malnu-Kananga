import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Generate TypeScript types from API response examples",
  args: {},
  async execute() {
    return `
This tool generates TypeScript interfaces from JSON data.

Usage:
1. Provide a JSON object or API response example
2. Specify the type name (optional, defaults to 'GeneratedType')

Example input:
{
  "id": "123",
  "name": "John Doe",
  "email": "john@example.com",
  "age": 25,
  "isActive": true,
  "roles": ["admin", "user"],
  "profile": {
    "avatar": "url",
    "bio": "text"
  }
}

Will generate:
export interface Profile {
  avatar: string;
  bio: string;
}

export interface GeneratedType {
  id: string;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  roles: string[];
  profile: Profile;
}

Note: This is a reference tool. Use the component-generator or service-generator skills to automatically generate types when creating new features.
    `;
  }
})
