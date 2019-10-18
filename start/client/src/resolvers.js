import gql from "graphql-tag";
import { GET_CART_ITEMS } from "./pages/cart";

// to build a client schema, we **extend** the types of the server schema
// and wrap it in the gql function
export const typeDefs = gql`
  extend type Query {
    isLoggedIn: Boolean!
    cartItems: [ID!]!
  }

  # adding a local field to the server data by extending the Launch type
  extend type Launch {
    isInCart: Boolean!
  }

  extend type Mutation {
    addOrRemoveFromCart(id: ID!): [Launch]
  }
`;

export const schema = gql`
  extend type Lanuch {
    isInCart: Boolean!
  }
`;

export const resolvers = {
  Launch: {
    isInCart: (launch, _, { cache }) => {
      const { cartItems } = cache.readQuery({ query: GET_CART_ITEMS });
      return cartItems.includes(launch.id);
    }
  },
  // Local resolvers have the same function signature as remote resolvers:
  // (parent, args, context, info) => data
  // except the Apollo cache is automatically added to the context.
  // Inside the resolver, you use the cache to read/write data.
  Mutation: {
    addOrRemoveFromCart: (_, { id }, { cache }) => {
      const { cartItems } = cache.readQuery({ query: GET_CART_ITEMS });
      const data = {
        // remove if included, else add
        cartItems: cartItems.includes(id)
          ? cartItems.filter(i => i !== id)
          : [...cartItems, id]
      };
      cache.writeQuery({ query: GET_CART_ITEMS, data });
      return data.cartItems;
    }
  }
};
