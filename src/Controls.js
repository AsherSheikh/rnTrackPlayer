
import { useEffect, useState } from 'react';
import {
  View,
  Pressable, Text,
  StyleSheet
} from 'react-native';
import TrackPlayer, {
  useTrackPlayerEvents,
  Event,
  State,
  usePlaybackState,
  useProgress
} from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import { getLocalMusicFiles } from './trackPlayerServices';
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Octicons from 'react-native-vector-icons/Octicons'

export function Controls({ onShuffle }) {
  const playerState = usePlaybackState();
  const [volumeLevel, setVolumeLevel] = useState(0)
  async function handlePlayPress() {
    if (await TrackPlayer.getState() == State.Playing) {
      TrackPlayer.pause();
    }
    else {
      TrackPlayer.play();
    }
  }



  async function increaseTrackPlayerVolume() {
    const volume = await TrackPlayer.getVolume();
    const newVolume = Math.min(volume + 0.1, 1.0);
    await TrackPlayer.setVolume(newVolume);
    setVolumeLevel(Math.round(newVolume * 10));
  }

  async function decreaseTrackPlayerVolume() {
    const volume = await TrackPlayer.getVolume();
    const newVolume = Math.max(volume - 0.1, 0.0);
    await TrackPlayer.setVolume(newVolume);
    setVolumeLevel(Math.round(newVolume * 10));
  }



  const { position, duration } = useProgress(250);


  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  async function seekForward() {
    const position = await TrackPlayer.getPosition();
    await TrackPlayer.seekTo(position + 10); // skip forward 10 seconds
    console.log('Seeked forward to', position + 10);
  }

  async function seekBackward() {
    const position = await TrackPlayer.getPosition();
    await TrackPlayer.seekTo(Math.max(position - 10, 0)); // rewind 10 seconds
    console.log('Seeked backward to', Math.max(position - 10, 0));
  }


  async function addLocalTracks() {
    const tracks = await getLocalMusicFiles();
    if (tracks.length > 0) {
      await TrackPlayer.add(tracks);
    }
  }

  async function handleStopPress() {
    await TrackPlayer.reset();  // Resets the track and stops playback

    // Re-add tracks after resetting
    const queue = await TrackPlayer.getQueue();
    if (queue.length <= 0) {
      await addLocalTracks();  // Add tracks again if the queue is empty
    }

    // Start playback from the beginning (first track)
    // await TrackPlayer.play();
    // console.log('Playback stopped, track reset, and started playing again');
  }

  const RenderVolumeBar = () => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 15 }}>
        {Array.from({ length: 10 }, (_, i) =>
          i < volumeLevel ? (
            <Octicons style={{ marginRight: 5 }} key={i} size={20} color={'#fff'} name={'dot-fill'} />
          ) : (
            <Octicons style={{ marginRight: 5 }} key={i} size={20} color={'#fff'} name={'dot'} />
          )
        )}
      </View>
    );
  };
  async function getVolume() {
    const volume = await TrackPlayer.getVolume();
    setVolumeLevel(Math.round(volume * 10)); // scale 0–1 to 0–10
  }

  useEffect(() => { getVolume() }, [])

  return (
    <>
      <View style={{ width: '100%', marginTop: 20 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 30,
          marginBottom: 10
        }}>
          <Pressable style={styles.flexRow} onPress={seekBackward}>
            <AntDesign name={'banckward'} color={'#fff'} size={20} />
            <Text style={styles.time}>10s</Text>
          </Pressable>

          <View style={{ marginHorizontal: 20 }} />

          <Pressable style={styles.flexRow} onPress={seekForward}>
            <Text style={styles.time}>10s</Text>
            <AntDesign name={'forward'} color={'#fff'} size={20} />
          </Pressable>
        </View>
        <Slider
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingComplete={async (value) => {
            await TrackPlayer.seekTo(value);
          }}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#FFF"
          thumbTintColor="#1DB954"
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#fff', fontSize: 12 }}>
            {formatTime(position)}
          </Text>
          <Text style={{ color: '#fff', fontSize: 12 }}>
            {formatTime(duration)}
          </Text>
        </View>
      </View>
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap', alignItems: 'center',
        marginVertical: 20,
        justifyContent: 'space-between'
      }}>
        <View style={styles.flexRow}>
          <Pressable
            onPress={() => TrackPlayer.skipToPrevious()} >
            <AntDesign name={'stepbackward'} color={'#fff'} size={30} />

          </Pressable>
          <Pressable style={{ marginHorizontal: 20 }} onPress={handlePlayPress} >
            <AntDesign name={playerState == State.Playing ? 'pausecircle' : 'play'} color={'#1DB954'} size={40} />
          </Pressable>
          <Pressable
            onPress={() => TrackPlayer.skipToNext()} >
            <AntDesign name={'stepforward'} color={'#fff'} size={30} />
          </Pressable>
        </View>
        <Pressable
          style={{ marginHorizontal: 20 }}
          onPress={onShuffle} >
          <Entypo name={'shuffle'} color={'#fff'} size={30} />
        </Pressable>
        <Pressable
          onPress={() => handleStopPress()} >
          <FontAwesome5 name={'stop-circle'} color={'#F46060'} size={35} />
        </Pressable>
      </View>
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap', alignItems: 'center',
        marginTop: 30,
        justifyContent: 'center'
      }}>
        <Pressable
          onPress={() => decreaseTrackPlayerVolume()} >
          <FontAwesome name={'volume-down'} color={'#1DB954'} size={30} />
        </Pressable>
        <RenderVolumeBar />
        <Pressable
          onPress={() => increaseTrackPlayerVolume()} >
          <FontAwesome name={'volume-up'} color={'#1DB954'} size={25} />
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  flexRow: { flexDirection: 'row', alignItems: 'center' },
  time: { fontSize: 12, color: '#fff', marginHorizontal: 5 }
})