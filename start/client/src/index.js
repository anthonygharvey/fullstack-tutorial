import { ApolloProvider, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import React from "react";
import ReactDOM from "react-dom";
import Pages from "./pages";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { resolvers, typeDefs } from "./resolvers";
import Login from "./pages/login";
import injectStyles from "./styles";

const cache = new InMemoryCache();
const link = new HttpLink({
  uri: "http://localhost:4000/"
});

// specifying the headers option on HttpLink lets us read the token from localStorage
// and attach it to the request's headers every time a GraphQL operation is made
const client = new ApolloClient({
  cache,
  link: new HttpLink({
    uri: "http://localhost:4000/graphql",
    headers: {
      authorization: localStorage.getItem("token")
    }
  }),
  typeDefs,
  resolvers
});

const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    # tell Apollo to pull from the cache
    isLoggedIn @client
  }
`;

function IsLoggedIn() {
  // because cached reads are synchronus, there's no need to account for any loading state
  const { data } = useQuery(IS_LOGGED_IN);
  return data.isLoggedIn ? <Pages /> : <Login />;
}

cache.writeData({
  data: {
    isLoggedIn: !!localStorage.getItem("token"),
    cartItems: []
  }
});

injectStyles();
ReactDOM.render(
  <ApolloProvider client={client}>
    <Pages />
  </ApolloProvider>,
  document.getElementById("root")
);
