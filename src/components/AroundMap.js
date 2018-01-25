import React from 'react';
import {POS_KEY} from '../constants';
import {AroundMarker} from './AroundMarker';
import {
    withScriptjs,
    withGoogleMap,
    GoogleMap,
} from "react-google-maps";

class AroundMap extends  React.Component {
    reloadMarkers = () => {
        const center = this.map.getCenter();
        const location = {lat: center.lat(), lon: center.lng()};
        const range = this.getRange;
        this.props.loadNearbyPosts(location, range());
    }


    getRange = () => {
        const google = window.google;
        const center = this.map.getCenter();
        const bounds = this.map.getBounds();
        if (center && bounds) {
            const ne = bounds.getNorthEast();
            const right = new google.maps.LatLng(center.lat(), ne.lng());
            return 0.000621371192 * google.maps.geometry.spherical.computeDistanceBetween(center, right);
        }
    }



    getMapRef = (map) => {
        this.map = map;
        window.map = map;
    }
    render() {
        const {lat, lon} = JSON.parse(localStorage.getItem(POS_KEY));
        return(
            <GoogleMap
                ref={this.getMapRef}
                defaultZoom={11}
                defaultCenter={{ lat: lat, lng: lon }}
                onDragEnd={this.reloadMarkers}
            >
                {this.props.post ? this.props.post.map((post) =>
                    <AroundMarker post={post} key = {post.url}/>
                ) : null}
            </GoogleMap>
        );
    }
}
export const WrappedAroundMap = withScriptjs(withGoogleMap(AroundMap));
