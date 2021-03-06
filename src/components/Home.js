import React from 'react';
import $ from 'jquery';
import { Tabs, Spin} from 'antd';
import { Gallery } from './Gallery';
import {API_ROOT, POS_KEY, AUTH_PREFIX, TOKEN_KEY,GEO_OPTIONS} from '../constants';
import {CreatePostButton} from './CreatePostButton';
import {WrappedAroundMap} from './AroundMap';

const TabPane = Tabs.TabPane;
//const operations = <Button>Extra Action</Button>;



export class Home extends React.Component {
    state = {
        loadingGeoLocation: false,
        loadingPosts: false,
        error: '',
        posts: [],
    }
    componentDidMount()  {
        this.setState({ loadingGeoLocation: true, error: '' });
        this.getGeoLocation();

    }
    getGeoLocation = () => {
        if ("geolocation" in navigator) {
            /* geolocation is available */
            navigator.geolocation.getCurrentPosition(
                this.onSuccessLoadGeoLocation,
                this.onFailedLoadGeoLocation,
                GEO_OPTIONS
            );
        } else {
            /* geolocation IS NOT available */
            this.setState({error: 'You browser does not support geolocation!'});
        }
    }
    onSuccessLoadGeoLocation = (position) => {
        console.log(position);
        this.setState({loadingGeoLocation: false, error: ''});
        const { latitude: lat, longitude: lon} = position.coords;
        localStorage.setItem(POS_KEY, JSON.stringify({lat: lat, lon: lon}))
        this.loadNearbyPosts();
    }
    onFailedLoadGeoLocation = () => {
        this.setState({loadingGeoLocation: false, error: 'Failed to load geo location!'});

    }

    loadNearbyPosts = (location, radius) => {
        const {lat, lon} = location ? location : JSON.parse(localStorage.getItem(POS_KEY));
        const range = radius ? radius : 1500;
        //const lat = 37.7915953;
        //const lon = -122.3937977;
        console.log(`${localStorage.getItem(TOKEN_KEY)}`);
        this.setState({loadingPosts: true, error: ''});
        $.ajax({
            url: `${API_ROOT}/search?lat=${lat}&lon=${lon}&range=${range}`,
            method: 'GET',
            headers: {
                Authorization: `${AUTH_PREFIX} ${localStorage.getItem(TOKEN_KEY)}`
            },
        }).then((response) => {
            this.setState({posts: response, loadingPosts: false, error: ''});
            console.log(response);
        }, (error) => {
            this.setState({loadingPosts: false, error: error.responseText});
            //console.log(error);
        }).catch((error) => {
            //console.log(error);
            this.setState({error: error});
        });
    }

    getGalleryPanelContent = () => {
        if (this.state.error) {
            return <div>{this.state.error}</div>;
        } else if (this.state.loadingGeoLocation) {
            return <Spin tip="Loading geo location..."/>;
        } else if (this.state.loadingPosts){
            return <Spin tip="Loading posts..."/>;
        } else if (this.state.posts && this.state.posts.length > 0) {
            const images = this.state.posts.map((post) => {
                return {
                    user: post.user,
                    src: post.url,
                    thumbnail: post.url,
                    thumbnailWidth: 400,
                    thumbnailHeight: 300,
                    caption: post.message,
                };
            });
            return (
                <Gallery images={images} />
            );
        } else {
            return null;
        }

    }


    render() {
        const TabPane = Tabs.TabPane;
        const createPostButton = <CreatePostButton loadNearbyPost = {this.loadNearbyPosts}/>;
        return (
            <Tabs tabBarExtraContent={createPostButton} className="main-tabs">
                <TabPane tab="Posts" key="1">
                    {this.getGalleryPanelContent()}
                </TabPane>
                <TabPane tab="Map" key="2">
                    <WrappedAroundMap
                        googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyC4R6AN7SmujjPUIGKdyao2Kqitzr1kiRg&v=3.exp&libraries=geometry,drawing,places"
                        loadingElement={<div style={{ height: `100%` }} />}
                        containerElement={<div style={{ height: `600px` }} />}
                        mapElement={<div style={{ height: `100%` }} />}
                        post = {this.state.posts}
                        loadNearbyPosts={this.loadNearbyPosts}

                    />
                </TabPane>
            </Tabs>
        );
    }
}