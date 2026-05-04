export interface SkillMetadata {
  id: string;
  title: string;
  description: string;
  target_agents: string[];
  required_variables: string[];
  optional_variables: string[];
  safety: string[];
}

export interface SkillFile {
  metadata: SkillMetadata;
  body: string;
  filePath: string;
}
