export type ArticleType = {
  key: string;
  author: string;
  content: string;
  title: string;
  description: string;
  publishedAt: string;
  source: SourceType;
  url: string;
  urlToImage: string;
  isPinned: boolean;
};

type SourceType = {
  id: string;
  name: string;
};

export type TaskData = {
  pageSize: number;
  isBackgroundFetch: boolean;
  delay: number;
};
