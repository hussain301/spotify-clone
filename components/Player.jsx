import { useSession } from 'next-auth/react';
import { useRecoilState } from 'recoil';
import useSpotify from '../hooks/useSpotify';
import { currentTrackIdState, isPlayingState } from '../atoms/songAtom';
import { useCallback, useEffect, useState } from 'react';
import useSongInfo from '../hooks/useSongInfo';
import {
  ReplyIcon,
  SwitchHorizontalIcon,
  VolumeOffIcon,
} from '@heroicons/react/outline';
import {
  RewindIcon,
  PauseIcon,
  PlayIcon,
  FastForwardIcon,
  VolumeUpIcon,
} from '@heroicons/react/solid';
import { debounce } from 'lodash';

const Player = () => {
  const spotifyApi = useSpotify();
  const { data: session, status } = useSession();
  const [currentTrackId, setCurrentTrackId] =
    useRecoilState(currentTrackIdState);
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
  const [volume, setVolume] = useState(50);
  const songInfo = useSongInfo();

  function fetchCurrentSong() {
    if (!songInfo) {
      spotifyApi.getMyCurrentPlayingTrack().then(data => {
        setCurrentTrackId(data.body?.item?.id);
        spotifyApi.getMyCurrentPlaybackState().then(data => {
          setIsPlaying(data.body?.is_playing);
        });
      });
    }
  }

  useEffect(() => {
    if (spotifyApi.getAccessToken() && !currentTrackId) {
      // fetch current song here
      fetchCurrentSong();
      setVolume(50);
    }
  }, [currentTrackIdState, spotifyApi, session]);

  const handlePlayPause = () => {
    spotifyApi.getMyCurrentPlaybackState().then(data => {
      if (data?.body?.is_playing) {
        spotifyApi.pause();
        setIsPlaying(false);
      } else {
        spotifyApi.play();
        setIsPlaying(true);
      }
    });
  };

  useEffect(() => {
    if (volume > 0 && volume <= 100) {
      debouncedAdjustVolume(volume);
    }
  }, []);

  const debouncedAdjustVolume = useCallback(() => {
    debounce(volume => {
      spotifyApi.setVolume(volume).catch(err => {});
    }, 500);
  }, []);

  return (
    <div className='grid h-24 grid-cols-3 px-2 text-xs text-white bg-gradient-to-b from-black to-gray-900 md:text-base md:px-8'>
      <div className='flex items-center space-x-4 '>
        <img
          className='hidden w-10 h-10 md:inline'
          src={songInfo?.album.images?.[0]?.url}
          alt=''
        />
        <div>
          <h3>{songInfo?.name}</h3>
          <p>{songInfo?.artist?.[0]?.name}</p>
        </div>
      </div>
      <div className='flex items-center justify-evenly'>
        <SwitchHorizontalIcon className='button' />
        <RewindIcon className='button' />
        {isPlaying ? (
          <PauseIcon onClick={handlePlayPause} className='w-10 h-10 button' />
        ) : (
          <PlayIcon onClick={handlePlayPause} className='w-10 h-10 button' />
        )}
        <FastForwardIcon className='button' />
        <ReplyIcon className='button' />
      </div>
      <div className='flex items-center justify-end pr-5 space-x-3 md:space-x-4 '>
        <VolumeOffIcon
          className='button'
          onClick={() => volume > 0 && setVolume(volume - 10)}
        />
        <input
          className='w-14 md:w-28'
          onChange={e => setVolume(Number(e.target.value))}
          type='range'
          min='0'
          max='100'
          value={volume}
        />
        <VolumeUpIcon
          className='button'
          onClick={() => volume < 100 && setVolume(volume + 10)}
        />
      </div>
      <p className='absolute text-xs text-center text-gray-500 bottom-1 right-8'>
        Copyright &copy;2022 Hussain Nariwal
      </p>
    </div>
  );
};

export default Player;
