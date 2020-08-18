import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import youtube from '../utils/youtube';
import { useSearch } from '../context/searchContext';
import { decode, truncate } from '../utils/helpers';

const VideoList = () => {
    const [search] = useSearch();

    return (
        <div className="container mt-5">
            <div className="row">
                <RenderList search={search} />
            </div>
        </div>
    );
};

const RenderList = (props) => {
    const [videos, setVideos] = useState({});
    const [videoItems, setVideoItems] = useState([]);
    const history = useHistory();

    useEffect(() => {
        async function getVideos() {
            if (props.search) {
                try {
                    const videoList = await youtube.get('/search', {
                        params: {
                            q: props.search,
                            type: 'playlist,video',
                            relevanceLanguage: 'en',
                        },
                    });
                    setVideos(videoList.data);
                    setVideoItems(videoList.data.items);
                    window.scrollTo(0, 0);
                } catch (e) {
                    console.log(e);
                }
            }
        }
        getVideos();
    }, [props]);

    const fetchMore = async () => {
        try {
            const nextVideoList = await youtube.get('/search', {
                params: {
                    q: props.search,
                    type: 'playlist,video',
                    relevanceLanguage: 'en',
                    pageToken: videos.nextPageToken,
                },
            });
            setVideos(nextVideoList.data);
            setVideoItems((videoItems) => [
                ...videoItems,
                ...nextVideoList.data.items,
            ]);
        } catch (e) {
            console.log(e);
        }
    };

    const Button = ({ children, className, id, value, onClick }) => {
        const [click, setClick] = useState(false);

        useEffect(() => {
            setClick(false);
        }, []);

        const interceptClick = () => {
            setClick(true);
            onClick(id, value);
        };

        return (
            <button
                className={className}
                id={id}
                value={value}
                onClick={interceptClick}
                disabled={click}
            >
                {click ? 'Queued' : children}
            </button>
        );
    };

    const handleClick = async (video) => {
        if (video.id.kind === 'youtube#playlist') {
            history.push({
                pathname: '/watch',
                state: {
                    type: video.id.kind.split('#')[1],
                    id:
                        video.id.kind === 'youtube#playlist'
                            ? video.id.playlistId
                            : video.id.videoId,
                },
            });
        } else {
            try {
                axios.get(`/api/add-video/${video.id.videoId}`);
            } catch (e) {
                console.log(e);
            }
        }
    };

    if (videos && videoItems.length) {
        return (
            <InfiniteScroll
                dataLength={videoItems.length}
                next={fetchMore}
                hasMore={videos.nextPageToken ? true : false}
                loader={<p>Loading...</p>}
            >
                {videoItems.map((video, index) => {
                    return (
                        <div
                            className="col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center"
                            key={index}
                        >
                            <div
                                className="card mb-5"
                                style={{ maxWidth: '320px' }}
                            >
                                <Link
                                    to={{
                                        pathname: '/watch',
                                        state: {
                                            type: video.id.kind.split('#')[1],
                                            id:
                                                video.id.kind ===
                                                'youtube#playlist'
                                                    ? video.id.playlistId
                                                    : video.id.videoId,
                                            item: video,
                                        },
                                    }}
                                >
                                    <img
                                        src={
                                            video.snippet.thumbnails
                                                ? video.snippet.thumbnails
                                                      .medium.url
                                                : ''
                                        }
                                        className="card-img-top"
                                        alt={decode(video.snippet.title)}
                                    />
                                </Link>
                                <div className="card-body">
                                    <h5 className="card-title">
                                        <Link
                                            to={{
                                                pathname: '/watch',
                                                state: {
                                                    type: video.id.kind.split(
                                                        '#'
                                                    )[1],
                                                    id:
                                                        video.id.kind ===
                                                        'youtube#playlist'
                                                            ? video.id
                                                                  .playlistId
                                                            : video.id.videoId,
                                                    item: video,
                                                },
                                            }}
                                        >
                                            {truncate(
                                                decode(video.snippet.title),
                                                50
                                            )}
                                        </Link>
                                    </h5>
                                    <p className="card-text">
                                        {video.snippet.channelTitle}
                                    </p>
                                    <Button
                                        className="btn btn-primary"
                                        onClick={() => handleClick(video)}
                                    >
                                        {video.id.kind === 'youtube#playlist'
                                            ? 'View Playlist'
                                            : 'Add to Plex'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </InfiniteScroll>
        );
    }

    return <p>Loading...</p>;
};

export default VideoList;
