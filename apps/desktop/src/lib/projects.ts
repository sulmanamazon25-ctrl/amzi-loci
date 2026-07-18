import type {
  CreateProjectInput,
  ProjectData,
  ProjectSummary,
  SaveProjectInput,
} from "@amzi-loci/shared";
import { invoke } from "@tauri-apps/api/core";

export async function listProjects(): Promise<ProjectSummary[]> {
  return invoke<ProjectSummary[]>("list_projects");
}

export async function createProject(input: CreateProjectInput): Promise<ProjectData> {
  return invoke<ProjectData>("create_project", { input });
}

export async function loadProject(id: string): Promise<ProjectData> {
  return invoke<ProjectData>("load_project", { id });
}

export async function saveProject(input: SaveProjectInput): Promise<ProjectData> {
  return invoke<ProjectData>("save_project", { input });
}

export async function deleteProject(id: string): Promise<void> {
  return invoke<void>("delete_project", { id });
}

export async function getActiveProject(): Promise<ProjectData | null> {
  return invoke<ProjectData | null>("get_active_project");
}

export async function readImagePreview(localPath: string): Promise<string> {
  return invoke<string>("read_image_preview", { path: localPath });
}

export async function exportCreativeBriefFile(
  content: string,
  productName: string,
): Promise<string> {
  return invoke<string>("export_creative_brief_command", { content, productName });
}
