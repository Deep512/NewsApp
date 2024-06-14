// src/screens/HomeScreen.tsx
import React, {useCallback, useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Linking,
  Alert,
  TouchableHighlight,
  ListRenderItemInfo,
} from 'react-native';
import {RowMap, SwipeListView} from 'react-native-swipe-list-view';
import {SafeAreaView} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import {
  getKeyFromAsyncStorage,
  removeKeyFromAsyncStorage,
} from '../resources/asyncStorage';
import {HEADLINES_KEY} from '../constants';

import {ArticleType} from '../types';
import {fetchNewsHeadlines} from '../services/BackgroundFetchService';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  rowFront: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  articleInfo: {
    borderBottomColor: '#CCC',
    borderBottomWidth: 1,
    flex: 1,
    padding: 10,
    gap: 10,
  },
  title: {
    fontSize: 16,
  },
  authorDate: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: 'gray',
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 100,
  },
  backLeftBtn: {
    backgroundColor: 'blue',
    right: 100,
  },
  backRightBtn: {
    backgroundColor: 'red',
    right: 0,
  },
  backText: {
    fontSize: 14,
    color: '#FFF',
  },
  pinnedIcon: {padding: 10},
});

const HomeScreen = () => {
  const [headlines, setHeadlines] = useState<Array<ArticleType>>([]);
  const headlineIdx = useRef(0);
  const showPreview = useRef(true);

  useEffect(() => {
    showPreview.current = !headlines.length;
  }, [headlines]);

  const reFetchHeadlines = useCallback(
    async (pageSize: number = 100): Promise<Array<ArticleType>> => {
      try {
        const articles = await fetchNewsHeadlines(pageSize);
        headlineIdx.current = 10;
        setHeadlines(articles.slice(0, 10));
      } catch (err) {
        console.error(err);
      }
      return [];
    },
    [],
  );

  const resetHeadlines = useCallback(async () => {
    setHeadlines([]);
    await removeKeyFromAsyncStorage(HEADLINES_KEY);
    reFetchHeadlines();
  }, [reFetchHeadlines]);

  const updateHeadlinesState = (
    headlinesArray: Array<ArticleType>,
    nextBatchCount: number,
  ) => {
    setHeadlines((prevHeadlines: Array<ArticleType>) => {
      let pinnedHeadlines: Array<ArticleType> = [];
      let rest: Array<ArticleType> = [];

      headlinesArray
        .slice(headlineIdx.current, headlineIdx.current + nextBatchCount)
        .concat(prevHeadlines)
        .forEach((article: ArticleType) => {
          article.isPinned ? pinnedHeadlines.push(article) : rest.push(article);
        });
      return [...pinnedHeadlines, ...rest];
    });
    headlineIdx.current = headlineIdx.current + nextBatchCount;
  };

  const fetchHeadlines = useCallback(
    async (nextBatchCount = 10) => {
      try {
        const storedHeadlines = await getKeyFromAsyncStorage(HEADLINES_KEY);
        if (storedHeadlines) {
          const headlinesArray = JSON.parse(storedHeadlines);
          if (headlineIdx.current < headlinesArray.length) {
            updateHeadlinesState(headlinesArray, nextBatchCount);
          } else {
            resetHeadlines();
          }
        } else {
          resetHeadlines();
        }
      } catch (err) {
        console.error(err);
      }
    },
    [resetHeadlines],
  );

  useEffect(() => {
    fetchHeadlines();
  }, [fetchHeadlines]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchHeadlines(5);
    }, 5000);
    return () => clearInterval(interval);
  }, [headlines, fetchHeadlines]);

  const handleDelete = useCallback(
    async (index: number) => {
      const newHeadlines = [...headlines];
      newHeadlines.splice(index, 1);
      setHeadlines(newHeadlines);
    },
    [headlines],
  );

  const handlePin = useCallback(
    (index: number) => {
      const item = headlines[index];
      item.isPinned = !item.isPinned;
      const newHeadlines = headlines.filter((_, i) => i !== index);
      setHeadlines([item, ...newHeadlines]);
    },
    [headlines],
  );

  const handleHeadlinePress = useCallback(async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  }, []);

  const renderItem = useCallback(
    ({item}: {item: ArticleType}) => (
      <TouchableHighlight onPress={() => handleHeadlinePress(item.url)}>
        <View style={styles.rowFront}>
          {item.isPinned ? (
            <Icon name="pushpin" size={25} style={styles.pinnedIcon} />
          ) : null}
          <View style={styles.articleInfo}>
            <Text numberOfLines={3} ellipsizeMode="tail" style={styles.title}>
              {item.title}
            </Text>
            <Text style={styles.authorDate}>
              {item.author ? `${item.author} • ` : ''}
              {item.publishedAt
                .slice(0, item.publishedAt.length - 1)
                .split('T')
                .join(' ')}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    ),
    [handleHeadlinePress],
  );

  const closeRow = (rowMap: RowMap<ArticleType>, rowKey: string) => {
    rowMap && rowMap[rowKey] && rowMap[rowKey].closeRow();
  };

  const renderHiddenItem = useCallback(
    (rowData: ListRenderItemInfo<ArticleType>, rowMap: RowMap<ArticleType>) => (
      <View style={styles.rowBack}>
        <TouchableHighlight
          style={[styles.backBtn, styles.backLeftBtn]}
          onPress={() => {
            closeRow(rowMap, rowData.item.key);
            handlePin(rowData.index);
          }}>
          <Text style={styles.backText}>Pin</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={[styles.backBtn, styles.backRightBtn]}
          onPress={() => {
            closeRow(rowMap, rowData.item.key);
            handleDelete(rowData.index);
          }}>
          <Text style={styles.backText}>Delete</Text>
        </TouchableHighlight>
      </View>
    ),
    [handleDelete, handlePin],
  );

  return (
    <SafeAreaView style={styles.container}>
      {headlines && headlines.length ? (
        <SwipeListView
          data={headlines}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-200}
          closeOnRowBeginSwipe
          previewRowKey={showPreview.current ? headlines[0].key : ''}
          disableRightSwipe
          previewOpenValue={-60}
          previewOpenDelay={1000}
        />
      ) : null}
      <Button title="Fetch Next Batch" onPress={() => fetchHeadlines(5)} />
    </SafeAreaView>
  );
};

export default HomeScreen;
