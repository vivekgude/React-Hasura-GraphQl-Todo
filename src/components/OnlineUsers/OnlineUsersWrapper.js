import React,{Fragment, useEffect,useState} from "react";
import {gql,useMutation,useSubscription} from '@apollo/client'
import OnlineUser from "./OnlineUser";

const UPDATE_LASTSEEN = gql`mutation updateLastSeen($now:timestamptz!){
  update_users(where:{},_set:{last_seen:$now}){
    affected_rows
  }
}`;

const OnlineUsersWrapper = () => {
  const [isonline,setIsonline] = useState(0);
  let onlineUsersList;
  useEffect(()=>{
    updateLastSeen();
    setIsonline(setInterval(()=>updateLastSeen(),30000))
    return()=>{
      clearInterval(isonline)
    }
  },[]);

  const [updateLastSeenMutation] = useMutation(UPDATE_LASTSEEN)
  const updateLastSeen = ()=>{
    updateLastSeenMutation({
      variables:{now:new Date().toISOString()}
    })
  }

  const onlineUsersSubscription = gql`
  subscription getOnlineUsers {
    online_users(order_by: {user: {name: asc}}) {
      id
      user {
        name
      }
    }
  }`;

  const {loading,error,data} = useSubscription(onlineUsersSubscription)
  if(loading){
    return <div>Loading...</div>
  }

  if(error)
  return <div>Error</div>

  if(data){
    onlineUsersList = data.online_users.map(u=>{
      return <OnlineUser key={u.id} user={u.user}/>
    })
  }

  return (
    <div className="onlineUsersWrapper">
      <Fragment>
      <div className="sliderHeader">Online users - {onlineUsersList.length}</div>
      {onlineUsersList}
      </Fragment>
    </div>
  );
};

export default OnlineUsersWrapper;
