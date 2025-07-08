/*
 A simple SVG optimizer implementing the requirements.
 For production-level use, consider integrating svgo.
*/
import { optimize as svgoOptimize } from 'svgo';

export interface OptimizeResult {
  original: string;
  optimized: string;
  originalBytes: number;
  optimizedBytes: number;
  ratio: number; // 0-100
  error?: string;
}

export function optimizeSvg(svg: string): OptimizeResult {
  const originalBytes = new TextEncoder().encode(svg).length;
  try {
    // Remove XML declaration
    let optimized = svg.replace(/^\s*<\?xml[^>]*\?>/i, "");

    // Remove comments
    optimized = optimized.replace(/<!--([\s\S]*?)-->/g, "");

    // Remove newlines & excessive whitespace between tags
    optimized = optimized.replace(/\s{2,}/g, " ");

    // Remove leading spaces inside attribute values (e.g., stroke=" #000")
    optimized = optimized.replace(/"\s+#/g, '"#');

    // Remove id, class, data-* attributes and editor metadata (inkscape/sketch etc.)
    optimized = optimized.replace(/\s(class|data-[^=]+|inkscape:[^=]+|sodipodi:[^=]+|sketch:[^=]+)="[^"]*"/g, "");

    // Remove unnecessary <g> tags without attributes
    optimized = optimized.replace(/<g>([\s\S]*?)<\/g>/g, "$1");

    // Remove <title> elements (in case SVGO keeps them due to settings)
    optimized = optimized.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, "");

    // Trim whitespace around tags
    optimized = optimized.trim();

    // Run SVGO for deeper optimization
    const svgoResult = svgoOptimize(optimized, {
      multipass: true,
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              // Keep color names as-is
              convertColors: false,
              // Don't modify paths
              convertPathData: false,
              // Don't modify styles
              inlineStyles: false,
              cleanupIDs: false,
              removeUselessDefs: false
            }
          }
        },
        { name: 'removeDimensions' },
        { name: 'removeAttrs', params: { attrs: '(class|data-.*)' } },
      ],
    }) as { data: string };
    optimized = svgoResult.data;

    const optimizedBytes = new TextEncoder().encode(optimized).length;
    const ratio = originalBytes ? +(((1 - optimizedBytes / originalBytes) * 100).toFixed(2)) : 0;

    return { original: svg, optimized, originalBytes, optimizedBytes, ratio };
  } catch (err) {
    return {
      original: svg,
      optimized: svg,
      originalBytes,
      optimizedBytes: originalBytes,
      ratio: 0,
      error: (err as Error).message,
    };
  }
}
