export const HEADLINES_KEY = 'HEADLINES',
  TASK_CONFIG = {
    taskName: 'Fetch Headlines',
    taskTitle: 'Fetch Headlines',
    taskDesc: 'Fetching top 100 headlines',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#ff00ff',
    parameters: {
      pageSize: 100,
      isBackgroundFetch: true,
      delay: 300,
    },
  };
