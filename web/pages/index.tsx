import { Inter } from "next/font/google";
import useSWR from "swr";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { data, error, isLoading } = useSWR(
    "http://localhost:8081",
    async (url) => {
      const res = await fetch(url);
      const sentence = await res.blob();
      return sentence.text();
    },
    {
      refreshInterval: 500,
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
