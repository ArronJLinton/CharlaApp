  import * as firebase from 'firebase';

  
  const config = {
    apiKey: "AIzaSyBNyJ9Bfd9MW2Tuh-bOEIhWBZasn2MpbGQ",
    authDomain: "chatapp-8d8a7.firebaseapp.com",
    databaseURL: "https://chatapp-8d8a7.firebaseio.com",
    projectId: "chatapp-8d8a7",
    storageBucket: "chatapp-8d8a7.appspot.com",
    messagingSenderId: "733614862412"
  };

  firebase.initializeApp(config);

export default firebase;