import { createAppAuth } from "@octokit/auth-app";

export async function getGithubToken(userToken?: string): Promise<string | undefined> {
  if (userToken) return userToken;
  
  if (!process.env.GITHUB_APP_ID || !process.env.GITHUB_APP_PRIVATE_KEY || !process.env.GITHUB_APP_INSTALLATION_ID) {
    return undefined;
  }
  
  try {
    const auth = createAppAuth({
      appId: process.env.GITHUB_APP_ID,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n'),
      installationId: process.env.GITHUB_APP_INSTALLATION_ID,
    });
    
    const authentication = await auth({ type: "installation" });
    return authentication.token;
  } catch (error) {
    console.error("Failed to generate GitHub App token", error);
    return undefined;
  }
}
