import { useState, useEffect } from "react";
import { optimizeSvg, OptimizeResult } from "./utils/optimizer";

export default function App() {
  const [input, setInput] = useState<string>("");
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!input) {
      setResult(null);
      setError(null);
      return;
    }

    // Basic syntax check
    const isValid = /<svg[\s\S]*<\/svg>/i.test(input.trim());
    if (!isValid) {
      setError("無効なSVGです。<svg>タグが見つかりません。");
      setResult(null);
      return;
    }

    setError(null);
    setResult(optimizeSvg(input));
  }, [input]);

  const handleClear = () => {
    setInput("");
  };

  const handleCopy = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result.optimized);
        alert("コピーしました！");
      } catch (e) {
        alert("コピーに失敗しました");
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 max-w-7xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-2">SVG Optimizer & Preview</h1>
      <div className="flex flex-col md:flex-row gap-4 flex-1">
        {/* Input Area */}
        <div className="flex-1 flex flex-col">
          <label className="font-semibold mb-1">入力 SVG</label>
          <textarea
            placeholder="ここにSVGコードを貼り付けてください"
            className="flex-1 p-2 rounded-md border border-gray-300 dark:bg-gray-800 dark:border-gray-700 resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={handleClear}
            className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
          >
            クリア
          </button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 flex flex-col items-center">
          <label className="font-semibold mb-1">プレビュー</label>
          <div className="flex-1 w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md flex items-center justify-center p-4 overflow-auto">
            {error ? (
              <span className="text-red-500">{error}</span>
            ) : (
              <div
                className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:h-auto"
                dangerouslySetInnerHTML={{ __html: input }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Output Area */}
      <div className="flex flex-col mt-4">
        <label className="font-semibold mb-1">最適化後 SVG</label>
        <textarea
          readOnly
          className="h-40 p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 resize-none font-mono text-sm"
          value={result?.optimized || ""}
        />
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={handleCopy}
            disabled={!result}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
          >
            コピー
          </button>
          {result && (
            <span className="text-sm">
              {`サイズ: ${result.originalBytes} → ${result.optimizedBytes} bytes  (圧縮率 ${result.ratio}% )`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
