import axios from "axios";
import { loginFailed, loginStart, loginSuccess, registerFailed, registerStart, registerSuccess } from "./authSlice";
import { deleteUserFailed, deleteUserStart, deleteUserSuccess, getUserFailed, getUserSuccess, getUsersStart } from "./userSlice";

export const loginUser = async(user,dispatch,navigate)=>{
    dispatch(loginStart());
    try {
        const res = await axios.post("/v1/auth/login",user);
        dispatch(loginSuccess(res.data));
        navigate("/");
    } catch (error) {
        dispatch(loginFailed);
    }
};

export const registerUser = async(user,dispatch,navigate)=>{
    dispatch(registerStart());
    try {
        await axios.post("v1/auth/register",user);
        dispatch(registerSuccess());
        navigate("/login");
    } catch (error) {
        dispatch(registerFailed());
    }
}

export const getAllUsers = async (accessToken,dispatch)=>{
    dispatch(getUsersStart());
    try {
        const res =await axios.get("/v1/user",{
            headers:{token:`Bearer ${accessToken}`}
        });
        dispatch(getUserSuccess(res.data));
    } catch (error) {
        dispatch(getUserFailed());
    }
}

export const deleteUser =async (accessToken,dispatch,id)=>{
    dispatch(deleteUserStart());
    try {
        const res = await axios.delete("/v1/user/"+id,{
            headers:{token:`Bearer ${accessToken}`}
        });
        dispatch(deleteUserSuccess(res.data));
    } catch (error) {
        dispatch(deleteUserFailed(error.response.data));
    }
}