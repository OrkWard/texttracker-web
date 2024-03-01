import { Inter } from "next/font/google";
import useSWR from "swr";
import type { Middleware } from "swr";

const inter = Inter({ subsets: ["latin"] });

const keepPrevious: Middleware = (useSWRNext) => {
  return (key, fetcher, config) => {
    // hook 运行之前...

    // 处理下一个中间件，如果这是最后一个，则处理 `useSWR` hook。
    const swr = useSWRNext(key, fetcher, config);

    // hook 运行之后...
    return swr;
  };
};

export default function Home() {
  const { data, error, isLoading } = useSWR(
    "http://localhost:8081",
    async (url) => {
      const res = await fetch(url);
      const sentences: string[] = await res.json();
      return sentences;
    },
    {
      refreshInterval: 500,
      use: [keepPrevious],
    }
  );

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-24 ${inter.className}`}
    >
      <div className="rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 w-full">
        <h2 className={`mb-3 text-2xl font-semibold`}>对话：</h2>
        <p>{data}</p>
      </div>
    </main>
  );
}
