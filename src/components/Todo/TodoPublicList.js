import React, { Fragment, useState, useEffect } from "react";
import { gql } from "@apollo/client";
import TaskItem from "./TaskItem";
import { useSubscription, useApolloClient } from "@apollo/client";

const NOTIFY_NEW_TODOS_SUBSCRIPTION = gql`
subscription notifyNewPublicTodos {
  todos (where: { is_public: { _eq: true}}, limit: 1, order_by: {created_at: desc }) {
    id
    created_at
  }
}`;

const TodoPublicList = props => {
  const [state, setState] = useState({
    olderTodosAvailable: props.latestTodo ? true : false,
    newTodosCount: 0,
    todos: [],
    error: false
  });

  let numTodos = state.todos.length;
  let oldestTodoId = numTodos ? state.todos[numTodos - 1].id : props.latestTodo ? props.latestTodo.id + 1 : 0;
  let newestTodoId = numTodos ? state.todos[0].id : props.latestTodo ? props.latestTodo.id : 0;

  const client = useApolloClient();

  useEffect(() => {
    loadOlder()
  }, []);

  useEffect(()=>{
    if(props.latestTodo && props.latestTodo.id>newestTodoId){
      setState(prevState=>{
        return {...prevState,newTodosCount:prevState.newTodosCount+1};
      });
      newestTodoId=props.latestTodo.id;
    }
  },[props.latestTodo])

  const loadNew = async() => {
    const GET_NEW_PUBLIC_TODOS = gql`query getNewPublicTodos ($latestVisibleId: Int!) {
      todos(where: { is_public: { _eq: true}, id: {_gt: $latestVisibleId}}, order_by: { created_at: desc }) {
        id
        title
        created_at
        user {
          name
        }
      }
    }`

    const {data} = await client.query({
      query:GET_NEW_PUBLIC_TODOS,
      variables:{latestVisibleId:state.todos.length?state.todos[0].id:null}
    })

    if(data){
      setState(prevState=>{
        return {...prevState,
          todos:[...data.todos,...prevState.todos],
          newTodosCount:0}
      })
      newestTodoId = data.todos[0].id;
    }
  };

  const loadOlder = async () => {
    const GET_OLD_PUBLIC_TODOS = gql`
    query getOldPublicTodos ($oldestTodoId: Int!) {
      todos (where: { is_public: { _eq: true}, id: {_lt: $oldestTodoId}}, limit: 7, order_by: { created_at: desc }) {
        id
        title
        created_at
        user {
          name
        }
      }
    }`;

    const { error, data } = await client.query({
      query: GET_OLD_PUBLIC_TODOS,
      variables: { oldestTodoId }
    })

    if (data.todos.length) {
      setState(prevState => {
        return { ...prevState, todos: [...prevState.todos, ...data.todos] };
      })
      oldestTodoId = data.todos[data.todos.length - 1].id;
    }
    else {
      setState(prevState => {
        return { ...prevState, olderTodosAvailable: false };
      })
    }
  };

  let todos = state.todos;

  const todoList = (
    <ul>
      {todos.map((todo, index) => {
        return <TaskItem key={index} index={index} todo={todo} />;
      })}
    </ul>
  );

  let newTodosNotification = "";
  if (state.newTodosCount) {
    newTodosNotification = (
      <div className={"loadMoreSection"} onClick={loadNew}>
        New tasks have arrived! ({state.newTodosCount.toString()})
      </div>
    );
  }

  const olderTodosMsg = (
    <div className={"loadMoreSection"} onClick={loadOlder}>
      {state.olderTodosAvailable ? "Load older tasks" : "No more public tasks!"}
    </div>
  );

  return (
    <Fragment>
      <div className="todoListWrapper">
        {newTodosNotification}

        {todoList}

        {olderTodosMsg}
      </div>
    </Fragment>
  );
};

const TodoPublicListSubscription = () => {
  const { loading, error, data } = useSubscription(NOTIFY_NEW_TODOS_SUBSCRIPTION)
  if (loading)
    return <div>Loading...</div>
  if (error)
    return <div>Error...</div>
  if (data)
    return <TodoPublicList latestTodo={data.todos.length ? data.todos[0] : null} />
}

export default TodoPublicListSubscription;
