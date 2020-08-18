import React from 'react';
import plexVid from '../assets/PlexVid.png';

const Start = () => {
    return (
        <div className="container-lg mt-5">
            <div className="row justify-content-center">
                <div className="col-sm-8 col-12">
                    <img className="mw-100" src={plexVid} alt="plexvid"></img>
                </div>
            </div>
        </div>
    );
};

export default Start;
