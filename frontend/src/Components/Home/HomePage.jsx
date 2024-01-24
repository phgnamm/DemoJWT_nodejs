import { useEffect } from "react";
import "./home.css";
import { deleteUser, getAllUsers } from "../../redux/apiRequest";
import {useDispatch, useSelector} from "react-redux";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { configureStore } from "@reduxjs/toolkit";
import { loginSuccess } from "../../redux/authSlice";
const HomePage = () => {
  const user = useSelector((state)=>state.auth.login?.currentUser);
  const userList = useSelector((state)=>state.users.users?.allUsers);
  const msg = useSelector((state)=>state.users?.msg);
  
  //REFRESHTOKEN
  let axiosJWT = axios.create();
  const handleDelete =(id)=>{
    deleteUser(user?.accessToken,dispatch,id);
  };

  const dispatch = useDispatch();
  const navigate =useNavigate();
  const refreshToken = async()=>{
    try {
      const res = await axios.post("v1/auth/refresh",
      {withCredentials:true},
      )
      return res.data
    } catch (error) {
      console.log(error);
    }

  }

  //REFRESHTOKEN
  axiosJWT.interceptors.request.use(
    async(config) => {
      let date =new Date();
      const decodedToken = jwtDecode(user?.accessToken);
      if(decodedToken.exp < date.getTime/1000){
        const data = await refreshToken();
        const refreshUser = {
          ...user,
          accessToken: data.accessToken
        };
        dispatch(loginSuccess(refreshUser));
        config.headers["token"] = "Bearer"+ data.accessToken;
      }

    },(err)=>{
      return Promise.reject(err);
    }
  );

  useEffect(()=>{
    if(!user){
      navigate("/login");
    }
    if(user?.accessToken){
    getAllUsers(user?.accessToken,dispatch);
    }
  },[]);


  return (
    <main className="home-container">
      <div className="home-title">User List</div>
      <div className="home-role">
        {`Your role :${user?.admin?`Admin`:`User`}`}
      </div>
      <div className="home-userlist">
        {userList?.map((user) => {
          return (
            <div className="user-container">
              <div className="home-user">{user.username}</div>
              <div className="delete-user" onClick={()=>handleDelete(user._id)}>               
              Delete             
               </div>
            </div>
          );
        })}
      </div>
      <div className="errorMsg">{msg}</div>
    </main>
  );
};

export default HomePage;
