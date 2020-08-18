import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import PlayList from '../components/PlayList';
import RelatedVideos from '../components/RelatedVideos';
import { decode } from '../utils/helpers';

const WatchVideo = () => {
    const history = useHistory();
    const resource = history.location.state;
    const [currentVideo, setCurrentVideo] = useState({});
    const [resourceType, setResourceType] = useState('');

    useMemo(() => {
        setResourceType(resource.type);
    }, [resource]);

    return (
        <div className="container-lg mt-5 d-flex">
            <div className="content w-75 mr-4">
                <RenderVideo
                    video={
                        Object.keys(currentVideo).length > 0
                            ? currentVideo
                            : resource.item
                    }
                    resourceType={resourceType}
                    playlistId={resourceType === 'playlist' ? resource.id : ''}
                />
            </div>
            <div className="w-25 sidebar">
                <div
                    className="mb-3"
                    style={resourceType === 'video' ? { display: 'none' } : {}}
                >
                    <h5 className="mb-3">Playlist Videos</h5>
                    <PlayList
                        resource={resource}
                        onVideoSelect={(onVideoSelect) =>
                            setCurrentVideo(onVideoSelect)
                        }
                    />
                    <hr />
                </div>
                <div>
                    <h5 className="mb-3">Related Videos</h5>
                    <RelatedVideos
                        resource={
                            Object.keys(currentVideo).length > 0
                                ? currentVideo
                                : resource.item
                        }
                        onVideoSelect={(onVideoSelect) => {
                            setCurrentVideo(onVideoSelect);
                            setResourceType('video');
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

const RenderVideo = ({ video, resourceType, playlistId }) => {
    if (!video) {
        return <p>Loading...</p>;
    }

    const videoSrc = `https://www.youtube.com/embed/${
        video.resourceId ? video.resourceId.videoId : video.id.videoId
    }`;

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

    const handleClick = async (id, value) => {
        if (id === 'add-to-plex') {
            try {
                await axios.get(`/api/add-video/${value}`);
            } catch (e) {
                console.log(e);
            }
        } else {
            try {
                await axios.get(`/api/add-playlist/${playlistId}`);
            } catch (e) {
                console.log(e);
            }
        }
    };

    return (
        <div>
            <div className="embed-responsive embed-responsive-16by9 mb-3">
                <iframe
                    className="embed-responsive-item"
                    title="video player"
                    src={videoSrc}
                />
            </div>
            <div>
                <h3>{video.title ? video.title : video.snippet.title}</h3>
                <p>
                    {video.channelTitle
                        ? video.channelTitle
                        : video.snippet.channelTitle}
                </p>
                <div className="d-flex justify-content-end action-buttons">
                    <Button
                        className={`btn btn-primary ${
                            resourceType === 'video' ? 'd-none' : 'd-block'
                        } mr-4`}
                        id="add-to-playlist"
                        value={
                            video.resourceId
                                ? video.resourceId.videoId
                                : video.id.videoId
                        }
                        onClick={handleClick}
                    >
                        Add Playlist to Plex
                    </Button>
                    <Button
                        className="btn btn-primary w-25 d-block"
                        id="add-to-plex"
                        value={
                            video.resourceId
                                ? video.resourceId.videoId
                                : video.id.videoId
                        }
                        onClick={handleClick}
                    >
                        Add to Plex
                    </Button>
                </div>
                <p className="mt-4" style={{ overflowWrap: 'break-word' }}>
                    {video.description
                        ? decode(
                              video.description
                                  ? video.description
                                  : video.snippet.description
                          )
                        : ''}
                </p>
            </div>
        </div>
    );
};

export default WatchVideo;
