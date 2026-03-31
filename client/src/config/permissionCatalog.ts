export interface PermissionCatalogEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  examples: string[];
}

export type PermissionCatalogByCategory = Record<string, PermissionCatalogEntry[]>;

export const loadPermissionCatalog = async (): Promise<PermissionCatalogByCategory> => {
  const { permissionsByCategory } = await import('./permissions');
  return permissionsByCategory as PermissionCatalogByCategory;
};
