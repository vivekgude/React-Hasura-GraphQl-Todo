import React, { useState, Fragment } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import TodoItem from "./TodoItem";
import TodoFilters from "./TodoFilters";

const FETCH_PRIVATE_TODOS = gql`
query fetchPrivateTodos {
  todos(where: {is_public: {_eq: false}}) {
    id
    title
    is_public
    is_completed
  }
}
`;

const REMOVE_COMPLETED_TODOS = gql`mutation clearCompleted {
  delete_todos(where: {is_completed: {_eq: true}, is_public: {_eq: false}}) {
    affected_rows
  }
}`;

const TodoPrivateList = props => {
  const [state, setState] = useState({
    filter: "all",
    clearInProgress: false,
    todos: [
    ]
  });

  const filterResults = filter => {
    setState({
      ...state,
      filter: filter
    });
  };

  const [removeCompletedTodos] = useMutation(REMOVE_COMPLETED_TODOS);
  const clearCompleted = () => {
    removeCompletedTodos({
      optimisticResponse:true,
      update:(cache)=>{
        const existingTodos = cache.readQuery({query:FETCH_PRIVATE_TODOS})
        const newTodos = existingTodos.todos.filter((t)=>(!t.is_completed))
        cache.writeQuery({
          query:FETCH_PRIVATE_TODOS,
          data:{todos:newTodos}
        })
      }
    })
  };

  const { todos } = props;

  let filteredTodos = todos;
  if (state.filter === "active") {
    filteredTodos = todos.filter(todo => todo.is_completed !== true);
  } else if (state.filter === "completed") {
    filteredTodos = todos.filter(todo => todo.is_completed === true);
  }

  const todoList = [];
  filteredTodos.forEach((todo, index) => {
    todoList.push(<TodoItem key={index} index={index} todo={todo} />);
  });

  return (
    <Fragment>
      <div className="todoListWrapper">
        <ul>{todoList}</ul>
      </div>

      <TodoFilters
        todos={filteredTodos}
        currentFilter={state.filter}
        filterResultsFn={filterResults}
        clearCompletedFn={clearCompleted}
        clearInProgress={state.clearInProgress}
      />
    </Fragment>
  );
};

const TodoPrivateListQuery = () => {
  const { loading, error, data } = useQuery(FETCH_PRIVATE_TODOS);
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error</div>
  }
  return <TodoPrivateList todos={data.todos} />
}

export default TodoPrivateListQuery;
export { FETCH_PRIVATE_TODOS };
