import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import youtube from '../utils/youtube';
import { decode, truncate } from '../utils/helpers';

const RelatedVideos = ({ resource, onVideoSelect }) => {
    const [relatedVideoList, setRelatedVideoList] = useState({});
    const [videoItems, setVideoItems] = useState([]);

    useEffect(() => {
        if (resource && (resource.resourceId || resource.id)) {
            async function getRelatedVideos() {
                try {
                    const res = await youtube.get('/search', {
                        params: {
                            type: 'video',
                            relevanceLanguage: 'en',
                            relatedToVideoId: resource.resourceId
                                ? resource.resourceId.videoId
                                : resource.id.videoId,
                        },
                    });
                    setRelatedVideoList(res.data);
                    setVideoItems(res.data.items);
                } catch (e) {
                    console.log(e);
                }
            }
            getRelatedVideos();
        }
    }, [resource]);

    const fetchMore = async () => {
        try {
            const nextVideoList = await youtube.get('/search', {
                params: {
                    type: 'video',
                    relevanceLanguage: 'en',
                    relatedToVideoId: resource.id.videoId
                        ? resource.id.videoId
                        : resource.id,
                    pageToken: relatedVideoList.nextPageToken,
                },
            });
            setRelatedVideoList(nextVideoList.data);
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
            hasMore={relatedVideoList.nextPageToken ? true : false}
            loader={<p>Loading...</p>}
            height={400}
            style={{ marginBottom: '20px' }}
        >
            {videoItems.map((video, index) => {
                return (
                    <div
                        className="w-100 mb-2"
                        key={index}
                        onClick={() => onVideoSelect(video)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="media">
                            <img
                                src={video.snippet.thumbnails.medium.url}
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
                                    {truncate(decode(video.snippet.title), 60)}
                                </h6>
                                <p style={{ fontSize: '.7rem' }}>
                                    {video.snippet.channelTitle}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </InfiniteScroll>
    );
};

export default RelatedVideos;
