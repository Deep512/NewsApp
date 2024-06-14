import axios from 'axios';
export const getHeadlines = async (pageSize: number) => {
  return await axios.get(
    `https://newsapi.org/v2/top-headlines?category=entertainment&pageSize=${pageSize}&apiKey=4bd33317e0db46ea9e7fceb88de7544c`,
  );
};
