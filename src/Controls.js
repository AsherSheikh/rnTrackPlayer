
import { useEffect, useState } from 'react';
import {
  View,
  Pressable, Text
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

export function Controls({ onShuffle }) {
  const playerState = usePlaybackState();

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
    currentVolume = Math.min(volume + 0.1, 1.0);
    await TrackPlayer.setVolume(currentVolume);
    console.log('Volume increased to', currentVolume.toFixed(2));
  }

  async function decreaseTrackPlayerVolume() {
    const volume = await TrackPlayer.getVolume();
    currentVolume = Math.max(volume - 0.1, 0.0);
    await TrackPlayer.setVolume(currentVolume);
    console.log('Volume decreased to', currentVolume.toFixed(2));
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

  return (
    <>
      <View style={{ width: '100%', paddingHorizontal: 20, marginTop: 20 }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 30
        }}>
          <Pressable onPress={seekBackward}>
            <Text style={{ color: '#fff' }}>⏪ 10s</Text>
          </Pressable>

          <View style={{ marginHorizontal: 20 }} />

          <Pressable onPress={seekForward}>
            <Text style={{ color: '#fff' }}>10s ⏩</Text>
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
        marginVertical: 20
      }}>
        <Pressable
          onPress={() => TrackPlayer.skipToPrevious()} >
          <Text style={{ color: '#fff' }}>Previous</Text>
        </Pressable>
        <Pressable style={{ marginHorizontal: 20 }} onPress={handlePlayPress} >
          <Text style={{ color: '#fff' }}>{playerState == State.Playing ? 'pause' : 'play'}</Text>
        </Pressable>
        <Pressable
          onPress={() => TrackPlayer.skipToNext()} >
          <Text style={{ color: '#fff' }}>Next</Text>
        </Pressable>
        <Pressable
          style={{ marginHorizontal: 20 }}
          onPress={onShuffle} >
          <Text style={{ color: '#fff' }}>Shuffle</Text>
        </Pressable>
        <Pressable
          onPress={() => handleStopPress()} >
          <Text style={{ color: '#fff' }}>Stop</Text>
        </Pressable>
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap', alignItems: 'center',
          marginTop: 30
        }}>
          <Pressable
            onPress={() => increaseTrackPlayerVolume()} >
            <Text style={{ color: '#fff' }}>Volume Up</Text>
          </Pressable>
          <View style={{ marginHorizontal: 20 }} />
          <Pressable
            onPress={() => decreaseTrackPlayerVolume()} >
            <Text style={{ color: '#fff' }}>Volume Down</Text>
          </Pressable></View>
      </View>
    </>
  );
}