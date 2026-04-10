import { Handler } from "@netlify/functions";
import { Octokit } from "@octokit/rest";
import yaml from "js-yaml";

export const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const password = body.password;
    const blogData = body.blogData;

    console.log("Entered password:", password);
    console.log("Expected password:", process.env.ADMIN_PASSWORD);

    // Perform strict validation
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid Password" })
      };
    }

    // Validate the input fields
    if (!blogData || !blogData.title || !blogData.content || !blogData.category) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Bad Request: Missing required blog fields" }),
      };
    }

    // Initialize Octokit with our env token
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const owner = "Shivanshvyas1729";
    const repo = "My_personal_portfolio";
    const path = "src/data/blog.yaml";

    // Step 1: Fetch the existing blog.yaml from the main branch
    let fileSha = "";
    let decodedContent = "";
    try {
      const response = await octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: "main",
      });

      const fileData = response.data as any; // typing assertion
      if (fileData.type !== "file") {
        throw new Error("Target path is not a file");
      }

      fileSha = fileData.sha;
      // Encode base64 into utf8 safely
      decodedContent = Buffer.from(fileData.content, "base64").toString("utf-8");
    } catch (e: any) {
      console.error("Failed to fetch existing blog.yaml", e);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Failed to access GitHub repository data. Status: ${e.status}. Detail: ${e.message}. Token exists: ${!!process.env.GITHUB_TOKEN}` }),
      };
    }

    // Step 2: Parse YAML via js-yaml
    let parsedYaml: any;
    try {
      parsedYaml = yaml.load(decodedContent);
      if (!parsedYaml || typeof parsedYaml !== "object") {
        parsedYaml = { blog: [] };
      }
      if (!Array.isArray(parsedYaml.blog)) {
        parsedYaml.blog = [];
      }
    } catch (e) {
      console.error("YAML Parse Error", e);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to parse existing YAML data safely." }),
      };
    }

    // Duplicate Prevention
    const isDuplicate = parsedYaml.blog.some((post: any) => 
      post.title.toLowerCase() === blogData.title.trim().toLowerCase() && 
      post.date === new Date().toISOString().split("T")[0]
    );

    if (isDuplicate) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: "Duplicate blog entry detected for today." }),
      };
    }

    // Step 3: Compute fields and Insert
    // Find highest ID to avoid duplicates
    let highestId = 0;
    for (const post of parsedYaml.blog) {
      if (post.id && typeof post.id === "number" && post.id > highestId) {
        highestId = post.id;
      }
    }

    const words = blogData.content.trim().split(/\s+/).length;
    const computedReadingTime = Math.max(1, Math.ceil(words / 200));

    // Slug generator
    const rawSlug = blogData.title.trim().toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newPost = {
      id: highestId + 1,
      title: blogData.title.trim(),
      slug: rawSlug,
      readingTime: computedReadingTime,
      content: blogData.content.trim(),
      category: blogData.category.trim(),
      type: Array.isArray(blogData.type) ? blogData.type : [], // Safely parse tags
      link: blogData.link ? blogData.link.trim() : "",
      date: new Date().toISOString().split("T")[0],
      featured: !!blogData.featured,
      draft: !!blogData.draft,
      ...(Array.isArray(blogData.resources) && blogData.resources.length > 0 && { resources: blogData.resources })
    };

    // Prepend to top instead of push, or push to bottom?
    // "Ensure no duplicate IDs", "Find last existing id", "Append new entry"
    // I will append it to the end (push)
    parsedYaml.blog.push(newPost);

    // Step 4: Convert back to YAML
    let updatedYamlContent: string;
    try {
      // js-yaml safe dump formatting options
      updatedYamlContent = yaml.dump(parsedYaml, { indent: 2, lineWidth: -1 });
    } catch (e) {
      console.error("YAML Dump Error", e);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to reconstruct YAML data safely." }),
      };
    }

    // Step 5: Commit back to GitHub
    const encodedContent = Buffer.from(updatedYamlContent, "utf-8").toString("base64");
    
    try {
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: "chore(blog): add new post via CMS",
        content: encodedContent,
        sha: fileSha,
        branch: "main",
      });
    } catch (e: any) {
      console.error("GitHub Commit Error", e);
      // SHA conflict usually triggers 409 Conflict here
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to commit sequence to repository. You may have experienced a collision." }),
      };
    }

    // Success response!
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Blog post successfully committed and deployed!" }),
    };

  } catch (error) {
    console.error("Unhandled Severless Execution Error", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error Processing Request" }),
    };
  }
};
