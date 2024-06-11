import { Inter } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import type { Middleware, SWRResponse } from "swr";
import { z } from "zod";
import { Sentences } from "./api/sentences";

const inter = Inter({ subsets: ["latin"] });

const keepPrevious: Middleware = (useSWRNext) => {
  return (key, fetcher, config) => {
    const savedSentences = useRef<(string[] | undefined)[]>([]);

    const swr = useSWRNext(key, fetcher, config);

    useEffect(() => {
      const newSentences = (swr.data || []) as Sentences;
      newSentences.forEach((v) => {
        if (!savedSentences.current[v.id]) savedSentences.current[v.id] = [];
        savedSentences.current[v.id]!.push(v.sentence);
      });
      console.count("middle");
      console.log(newSentences);
    }, [swr.data]);

    return Object.assign({}, swr, { saved: savedSentences.current });
  };
};

export default function Home() {
  const { saved, error } = useSWR(
    "/api/sentences",
    async (url) => {
      const res = await fetch(url);
      const sentences = z
        .array(z.object({ sentence: z.string(), id: z.number() }))
        .parse(await res.json());
      return sentences;
    },
    {
      refreshInterval: 500,
      use: [keepPrevious],
    }
  ) as SWRResponse & { saved: string[][] };

  const [textNumber, setTextNumber] = useState(1);

  const savedTextLength = saved[textNumber]?.length;
  useEffect(() => {
    scrollTo(0, document.body.scrollHeight);
  }, [savedTextLength]);

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-24 ${inter.className}`}
    >
      <div className="rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 w-full">
        <h2 className={`mb-3 text-2xl font-semibold`}>对话：</h2>
        <div className="flex flex-row gap-1">
          {Object.keys(saved).map((num) => (
            <button
              key={num}
              onClick={() => {
                setTextNumber(parseInt(num));
              }}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              {num}
            </button>
          ))}
        </div>
        {saved[textNumber]?.map((sentence, i) => (
          <p key={i}>{sentence}</p>
        ))}
      </div>
    </main>
  );
}
