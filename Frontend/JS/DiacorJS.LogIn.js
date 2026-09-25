
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
  import { getAuth , createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js ";
  const firebaseConfig = {
    apiKey: "AIzaSyBdY2t5v-oWRx42aE4_eBG9iw7IM9AP0-o",
    authDomain: "dialogin-d781e.firebaseapp.com",
    projectId: "dialogin-d781e",
    storageBucket: "dialogin-d781e.firebasestorage.app",
    messagingSenderId: "279545325631",
    appId: "1:279545325631:web:0dfb9ff70990a663edb08a",
    measurementId: "G-F56PC9FW28"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  
// change the Nmae of the function and btn when coding html
// html sign up for new user

if(sbtn){
let sbtn = document.getElementById("btn1 ");
btn.addEventListener("click",()=>{


    let email = document.getElementById("SignUpEmail").value;
    let password= document.getElementById("SPassword").value

createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    console.log(user.email)
    window.location.href="Login.html"

    // replace the ref with the actual name of the log in html file 
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ..
  });

})
}

// log in existing user
// please change the naem when coding html

let lbtn = document.getElementById("btn2");
 if (lbtn){
lbtn.addEventListener("click",()=>{

 let email = document.getElementById("LogInEmail").value;
let password= document.getElementById("LPassword").value

signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in  
    const user = userCredential.user;
    console.log(user.email)
    alert("Log in Successfull")
    window.location.href ="homescreen "

// change this ref to the home screen after loading 

  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorMessage)
  });

})
}  
 


