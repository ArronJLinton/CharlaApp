"use strict";
import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  TouchableOpacity,
  Platform,
  ActivityIndicator
} from "react-native";

import {
  Body,
  Header,
  List,
  ListItem as Item,
  ScrollableTab,
  Tab,
  TabHeading,
  Tabs,
  Title
} from "native-base";

// create a component
import styles from "./styles";
import Comments from "react-native-comments";
import * as commentActions from "./ExampleActions";
import moment from "moment";
import database from "./firebase_db";

class ChatRoom extends Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.actions = commentActions;
    this.state = {
      preload: [],
      comments: [],
      loadingComments: true,
      lastCommentUpdate: null,
      review: props.review ? props.review : null,
      login: null,
      id: props.id
    };

    this.scrollIndex = 0;

    // ============ FIREBASE ON VALUE EVENT LISENTER ============= //
    database.ref("comments/").on("value", snapshot => {
      let data = snapshot.val();
      // console.log(data)
      const comments = [];
      snapshot.forEach(child => {
        // console.log(child.val())
        comments.push(child.val());
      });
      // console.log("FIREBASE:", comments);
      // console.log("======================");
      this.setState({
        comments: comments,
        loadingComments: false,
        lastCommentUpdate: new Date().getTime()
      });
    });
  }

  static navigatorStyle = {};

  componentDidMount() {
    // console.log(this.props)
    //  await this.downloadFromFirebase();
    // this.updateComments();
    // //  console.log('PRELOAD COMMENTS: ', this.state.preload)
    // const c = this.actions.getComments();
    // console.log("SAMPLE: ", c[0]);
    // console.log("===================");
    // console.log("COMPONENT MOUNTED: ", c)
    // this.setState({
    //   comments: c,
    //   loadingComments: false,
    //   lastCommentUpdate: new Date().getTime()
    // });
  }

  extractUsername(c) {
    try {
      return c.email !== "" ? c.email : null;
    } catch (e) {
      console.log(e);
    }
  }

  extractBody(c) {
    try {
      return c.body && c.body !== "" ? c.body : null;
    } catch (e) {
      console.log(e);
    }
  }

  extractImage(c) {
    try {
      return c.image_id && c.user.image_id !== ""
        ? c.user.image_id
        : "https://ireview.live/img/no-user.png";
    } catch (e) {
      console.log(e);
    }
  }

  extractChildrenCount(c) {
    try {
      return c.childrenCount || 0;
    } catch (e) {
      console.log(e);
    }
  }

  extractEditTime(item) {
    try {
      return item.updated_at;
    } catch (e) {
      console.log(e);
    }
  }

  extractCreatedTime(item) {
    try {
      console.log("New Time: ", item.created_at);
      return item.created_at;
    } catch (e) {
      console.log("Error With Time of Post");
      console.log(e);
    }
  }

  likeExtractor(item) {
    return item.liked;
  }

  reportedExtractor(item) {
    return item.reported;
  }

  likesExtractor(item) {
    // console.log("LIKES ITEM: ", item[0].likes);
    if (item.likes !== null) {
      return item.likes.map(like => {
        return {
          image: like.image,
          name: like.username,
          user_id: like.user_id,
          tap: username => {
            console.log("Taped: " + username);
          }
        };
      });
    } else {
      return;
    }
  }

  isCommentChild(item) {
    return item.parentId !== null;
  }
    //  {
    //         this.scrollIndex = event.nativeEvent.contentOffset.y;
    //       }

  render() {
    const review = this.state.review;
    const data = this.state.comments;
    // console.log("RENDER DATA: ", data);
    return (
      /*
      * They should add scroll to end on save action
      *They should not update comments if there are modals opened
      *
      * */
      <View>
      
       <Animated.ScrollView
          style={{backgroundColor: 'white'}}
          // scrollEventThrottle={5}
          // showsVerticalScrollIndicator={false}
          // onScroll={event => {this.props.scroll}}
          // onLayout={({ nativeEvent: { layout: { height } } }) => {
          //   this.props.height[1] = height;
          //   console.log('HEIGHT', height)
          //   this.props.updateHeight(height);
            
          // }}
         
          ref={"scrollView"}
        >
          {this.state.comments.length ? (
            <Comments
              data={data}
              //To compare is user the owner
              viewingUserName={"testUser"}
              //how many comments to display on init
              initialDisplayCount={5}
              //How many minutes to pass before locking for editing
              editMinuteLimit={0}
              //What happens when user taps on username or photo
              usernameTapAction={username => {
                console.log("Taped user: " + username);
              }}
              //Where can we find the children within item.
              //Children must be prepared before for pagination sake
              childPropName={"children"}
              isChild={item => this.isCommentChild(item)}
              //We use this for key prop on flat list (i.e. its comment_id)
              keyExtractor={item => item.commentId}
              //Extract the key indicating comments parent
              parentIdExtractor={item => item.parentId}
              //what prop holds the comment owners username
              usernameExtractor={item => this.extractUsername(item)}
              //when was the comment last time edited
              editTimeExtractor={item => this.extractEditTime(item)}
              //When was the comment created
              createdTimeExtractor={item => this.extractCreatedTime(item)}
              //where is the body
              bodyExtractor={item => this.extractBody(item)}
              //where is the user image
              imageExtractor={item => this.extractImage(item)}
              //Where to look to see if user liked comment
              likeExtractor={item => this.likeExtractor(item)}
              //Where to look to see if user reported comment
              reportedExtractor={item => this.reportedExtractor(item)}
              //Where to find array with user likes
              likesExtractor={item => this.likesExtractor(item)}
              //Where to get nr of replies
              childrenCountExtractor={item => this.extractChildrenCount(item)}
              //what to do when user clicks reply. Usually its header height + position (b/c scroll list heights are relative)
              replyAction={offset => {
                this.refs.scrollView.scrollTo({
                  x: null,
                  y: this.scrollIndex + offset - 300,
                  animated: true
                });
              }}
              //what to do when user clicks submits edited comment
              saveAction={(text, parentCommentId) => {
                console.log("POSTING TO COMMENTS");
                let date = moment().format("YYYY-MM-DD HH:mm:ss");
                let comments = this.actions.save(
                  this.state.comments,
                  text,
                  parentCommentId,
                  date,
                  "theKid"
                );
                // this.setState({
                //   comments: comments
                // });

                if (!parentCommentId) {
                  this.refs.scrollView.scrollToEnd();
                }
              }}
              //what to do when user clicks submits edited comment
              editAction={(text, comment) => {
                let comments = this.actions.edit(
                  this.state.comments,
                  comment,
                  text
                );
                this.setState({
                  comments: comments
                });
              }}
              //what to do when user clicks report submit
              reportAction={comment => {
                let comments = this.actions.report(
                  this.state.comments,
                  comment
                );
                this.setState({
                  comments: comments
                });
              }}
              //what to do when user clicks like
              likeAction={comment => {
                let comments = this.actions.like(this.state.comments, comment);
                this.setState({
                  comments: comments
                });
              }}
              //Must return promise
              paginateAction={(
                from_comment_id,
                direction,
                parent_comment_id
              ) => {
                //Must return array of new comments after pagination

                let newComments = this.actions.paginateComments(
                  this.state.comments,
                  from_comment_id,
                  direction,
                  parent_comment_id
                );

                this.setState({
                  comments: newComments
                });
                let self = this;

                // HANDLES SCROLL ANIMATION
                setTimeout(function() {
                  if (direction == "up") {
                    self.refs.scrollView.scrollTo({
                      x: 0,
                      y: 500,
                      animated: true
                    });
                  } else {
                    self.refs.scrollView.scrollTo({
                      x: 0,
                      y: 0,
                      animated: true
                    });
                  }
                }, 1000);
              }}
            />
          ) : (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <ActivityIndicator style={{flex: 1, marginTop: 200}} size="large" color="#0000ff" />
            </View>
          )}
        </Animated.ScrollView>
      </View>
    );
  }
}

export default ChatRoom;
