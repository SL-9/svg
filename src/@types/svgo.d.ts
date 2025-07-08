declare module 'svgo' {
  export interface PluginConfig {
    name: string;
    params?: Record<string, unknown>;
  }
  export interface OptimizeOptions {
    multipass?: boolean;
    plugins?: (string | PluginConfig)[];
    path?: string;
    datauri?: 'base64' | 'enc' | 'unenc';
  }
  export function optimize(svg: string, options?: OptimizeOptions): { data: string };
}
