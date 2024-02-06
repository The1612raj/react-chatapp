import { useRef, useState } from "react";
import {
  Box,
  Container,
  VStack,
  Button,
  Input,
  HStack,
} from "@chakra-ui/react";
import Message from "./component/Message.jsx";
import {signOut,onAuthStateChanged, GoogleAuthProvider,getAuth,signInWithPopup} from "firebase/auth";
import {app} from './firebase';
import { useEffect } from "react";
import {getFirestore,addDoc, collection, serverTimestamp, onSnapshot, query, orderBy} from 'firebase/firestore';


const db=getFirestore(app);
const q=query(collection(db,"Messages"),orderBy("createdAt","asc"));
const loginHandler=()=>{
  const provider =new GoogleAuthProvider();
  signInWithPopup(auth,provider);
}
const logoutHandler=()=>{
  signOut(auth)
}

const auth=getAuth(app);
function App() {
  const divForScroll = useRef(null);
  const [message,setMessage]=useState("")
  useEffect(()=>{
   const unsubscribe= onAuthStateChanged(auth,(data)=>{
     setUser(data); 
    });
    const unsubscribeForMessages=onSnapshot(q,(snap)=>{
    setMessages(
      snap.docs.map((item)=>{
        const id =item.id;
        return {id,...item.data()};
      })
    );
    });
    return() =>{
      unsubscribe();
      unsubscribeForMessages();
    }
  },[]);
   const [messages,setMessages]=useState([]);
  const [user,setUser]=useState(false);
  const submitHandler= async(e)=>{
    e.preventDefault()
    try {
      setMessage("");
      await addDoc(collection(db,"Messages"),{
        text:message,
        uid: user.uid,
        uri:user.photoURL,
        createdAt: serverTimestamp()
      });
     
      divForScroll.current.scrollIntoView({behavior:"smooth"});
      
    } catch (error) {
      alert(error);
      
    }
  
  }
  return (
    <>
      <Box bg={"red.50"}>
       {
        user?( <Container bg={"white"} h={"100vh"}>
        <VStack h="full" padding={"4"}>
          <Button w={"full"} colorScheme="red" onClick={logoutHandler}>
            logout
          </Button>
          <VStack
            h="full"
            w={"full"}
            overflowY="auto"
            css={{"&::-webkit-scrollbar":{display:"none",}}}
          >
            {
              messages.map(item =>(
                <Message key={item.id} user={item.uid==user.uid?"me":"other"} text={item.text}  uri={item.uri}  />
              ))
            }
            <div ref={divForScroll}></div>
          </VStack>
          
          <form  onSubmit={submitHandler} style={{ width: "100%" }}>
            <HStack>
              <Input value={message} onChange={(e)=>{setMessage(e.target.value)}} placeholder="Enter a message..." />
              <Button colorScheme="purple" type="submit">
                Send
              </Button>
            </HStack>
          </form>
        </VStack>
      </Container>):<VStack bg={"purple"} h={"100vh"} alignItems={"center"} justifyContent={"center"}>
        <Button onClick={loginHandler}>Signin With Google</Button>
      </VStack>
       }
      </Box>
    </>
  );
}

export default App;
