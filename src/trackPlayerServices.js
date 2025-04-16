import TrackPlayer, {
    AppKilledPlaybackBehavior,
    Capability,
    RepeatMode,
    Event
} from 'react-native-track-player';
import RNFS from 'react-native-fs';
import { PermissionsAndroid, Platform } from 'react-native';

export async function setupPlayer() {
    let isSetup = false;
    try {
        await TrackPlayer.getCurrentTrack();
        isSetup = true;
    }
    catch {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
            android: {
                appKilledPlaybackBehavior:
                    AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
                // AppKilledPlaybackBehavior.ContinuePlayback,
            },
            capabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
                Capability.SkipToPrevious,
                Capability.SeekTo,
            ],
            compactCapabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
            ],
            progressUpdateEventInterval: 2,
        });

        isSetup = true;
    }
    finally {
        return isSetup;
    }
}

async function requestStoragePermission() {
    if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
            {
                title: 'Storage Permission',
                message: 'App needs access to your music files',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
}
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.aac', '.flac'];
function isAudioFile(fileName) {
    return AUDIO_EXTENSIONS.some(ext => fileName.toLowerCase().endsWith(ext));
}

export async function getLocalMusicFiles() {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
        console.warn('Permission denied');
        return [];
    }

    // Directories to scan
    const directoriesToScan = [
        RNFS.DownloadDirectoryPath,
        `${RNFS.ExternalStorageDirectoryPath}/Music`, // <- your custom folder
    ];

    let allTracks = [];

    for (const dir of directoriesToScan) {
        try {
            const contents = await RNFS.readDir(dir);
            const audioFiles = contents.filter(file => file.isFile() && isAudioFile(file.name));

            const mappedTracks = audioFiles.map((file, index) => ({
                id: `${dir.split('/').pop()}-${index}`,
                url: `file://${file.path}`,
                title: file.name.replace(/\.[^/.]+$/, ''),
                artist: 'Unknown',
            }));

            allTracks = [...allTracks, ...mappedTracks];
        } catch (e) {
            console.warn(`Failed to read directory ${dir}`, e.message);
        }
    }

    console.log('Found local music files:', allTracks);
    return allTracks;
}

export async function addTracks() {
    await TrackPlayer.add([
        {
            id: '1',
            url: require('./assets/musics/fluidity-100-ig-edit-4558.mp3'),
            title: 'Fluidity',
            artist: 'artist 1',
            duration: 60,
        },
        {
            id: '2',
            url: require('./assets/musics/penguinmusic-modern-chillout-future-calm-12641.mp3'),
            title: 'Penguin Music',
            artist: 'artist 2',
            duration: 60,
        },
        {
            id: '3',
            url: require('./assets/musics/powerful-beat-121791.mp3'),
            title: 'Powerful Beat',
            artist: 'artist 3',
            duration: 60,
        }
    ]);
    await TrackPlayer.setRepeatMode(RepeatMode.Queue);
}

export async function playbackService() {
    TrackPlayer.addEventListener(Event.RemotePause, () => {
        console.log('Event.RemotePause');
        TrackPlayer.pause();
    });

    TrackPlayer.addEventListener(Event.RemotePlay, () => {
        console.log('Event.RemotePlay');
        TrackPlayer.play();
    });

    TrackPlayer.addEventListener(Event.RemoteNext, () => {
        console.log('Event.RemoteNext');
        TrackPlayer.skipToNext();
    });

    TrackPlayer.addEventListener(Event.RemotePrevious, () => {
        console.log('Event.RemotePrevious');
        TrackPlayer.skipToPrevious();
    });
}