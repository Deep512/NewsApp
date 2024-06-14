// src/services/BackgroundFetchService.ts
import BackgroundTask from 'react-native-background-actions';
import {ArticleType, TaskData} from '../types';
import {sleep} from '../utils';
import {TASK_CONFIG, HEADLINES_KEY} from '../constants';
import {getHeadlines} from '../resources/api';
import {setKeyInAsyncStorage} from '../resources/asyncStorage';

const fetchNewsHeadlines = async (pageSize: number = 100) => {
  try {
    const response = await getHeadlines(pageSize);
    const {articles = {} as ArticleType} = response.data;
    const updatedArticles = articles.map(
      (article: ArticleType, idx: number) => ({
        ...article,
        key: idx + '',
        isPinned: false,
      }),
    );
    await setKeyInAsyncStorage(HEADLINES_KEY, updatedArticles);
    return updatedArticles;
  } catch (error) {
    console.error('Failed to fetch news headlines:', error);
  }
  return [];
};

const backgroundFetchHeadlines = async (
  taskDataArguments: TaskData = {} as TaskData,
) => {
  const {delay, pageSize} = taskDataArguments;
  await new Promise(async resolve => {
    while (BackgroundTask.isRunning()) {
      await fetchNewsHeadlines(pageSize);
      await sleep(delay);
    }
    resolve(null);
  });
};

const startBackgroundFetch = async () => {
  await BackgroundTask.start(backgroundFetchHeadlines, TASK_CONFIG);
};

const stopBackgroundFetch = async () => {
  await BackgroundTask.stop();
};

export {startBackgroundFetch, stopBackgroundFetch, fetchNewsHeadlines};
