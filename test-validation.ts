import fs from "fs";
import yaml from "yaml";
import { GlobalSettingsSchema } from "./src/lib/schema.js";

const doc = yaml.parse(fs.readFileSync("./src/data/portfolio.yaml", "utf-8"));
const settings = doc.settings;

const result = GlobalSettingsSchema.safeParse(settings);
console.log("Validation result:", result.success);
if (!result.success) {
  console.log("Errors:", result.error.errors);
}
