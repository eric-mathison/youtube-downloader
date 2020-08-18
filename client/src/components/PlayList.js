import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import youtube from '../utils/youtube';
import { decode, truncate } from '../utils/helpers';

const PlayList = ({ resource, onVideoSelect }) => {
    const [playListVideos, setPlayListVideos] = useState({});
    const [videoItems, setVideoItems] = useState([]);

    useEffect(() => {
        if (resource && resource.type === 'playlist') {
            const setVideo = (video) => onVideoSelect(video);
            async function getPlaylist() {
                try {
                    const res = await youtube.get('/playlistItems', {
                        params: {
                            playlistId: resource.id,
                        },
                    });
                    setPlayListVideos(res.data);
                    setVideoItems(res.data.items);
                    setVideo(res.data.items[0].snippet);
                } catch (e) {
                    console.log(e);
                }
            }
            getPlaylist();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resource]);

    const fetchMore = async () => {
        try {
            const nextVideoList = await youtube.get('/playlistItems', {
                params: {
                    playlistId: resource.id,
                    pageToken: playListVideos.nextPageToken,
                },
            });
            setPlayListVideos(nextVideoList.data);
            setVideoItems((videoItems) => [
                ...videoItems,
                ...nextVideoList.data.items,
            ]);
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <InfiniteScroll
            dataLength={videoItems.length}
            next={fetchMore}
            hasMore={playListVideos.nextPageToken ? true : false}
            loader={<p>Loading...</p>}
            height={400}
            style={{ marginBottom: '20px' }}
        >
            {videoItems.map((video, index) => {
                if (video.snippet) {
                    return (
                        <div
                            className="w-100 mb-2"
                            key={index}
                            onClick={() => onVideoSelect(video.snippet)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="media">
                                <img
                                    src={
                                        video.snippet.thumbnails.medium
                                            ? video.snippet.thumbnails.medium
                                                  .url
                                            : ''
                                    }
                                    className="align-self-start mr-3"
                                    style={{ maxWidth: '25%' }}
                                    alt={decode(video.snippet.title)}
                                />
                                <div
                                    className="media-body"
                                    style={{ maxWidth: '75%' }}
                                >
                                    <h6
                                        className="my-0"
                                        style={{ fontSize: '.85rem' }}
                                    >
                                        {truncate(
                                            decode(video.snippet.title),
                                            60
                                        )}
                                    </h6>
                                    <p style={{ fontSize: '.7rem' }}>
                                        {video.snippet.channelTitle}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                }

                return <div className="w-100 mb-2" key={index}></div>;
            })}
        </InfiniteScroll>
    );
};

export default PlayList;
