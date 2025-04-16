import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import { addTracks, getLocalMusicFiles, setupPlayer } from './src/trackPlayerServices';
import Playlist from './src/Playlist';
import TrackProgress from './src/TrackProgress';
import Header from './src/Header';

function App() {
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  async function defaultMusic() {
    let isSetup = await setupPlayer();
    const queue = await TrackPlayer.getQueue();
    if (isSetup && queue.length <= 0) {
      await addTracks();
    }
    setIsPlayerReady(isSetup);
  }

  async function addLocalTracks() {
    const tracks = await getLocalMusicFiles();
    console.log(tracks)
    if (tracks.length > 0) {
      await TrackPlayer.add(tracks);
    }
  }


  useEffect(() => {
    async function setup() {
      let isSetup = await setupPlayer();
      const queue = await TrackPlayer.getQueue();
      if (isSetup && queue.length <= 0) {
        await addLocalTracks();
      }
      setIsPlayerReady(isSetup);
    }
    setup()
  }, [])




  if (!isPlayerReady) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#bbb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <TrackProgress />
      <Playlist />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#232'
  },
});

export default App;