import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { setGlobalError } from '../context/ErrorContext';
import { onError } from '@apollo/client/link/error';

const hostname = window.location.hostname;
const subdomain = hostname.split('.')[0];
// const API_URL = `http://api.zottr.com/shop-api`;
const API_URL = `https://shop-api.zottr.com/`;
// const API_URL = `http://172.18.121.156:3000/shop-api`;
// If using bearer-token based session management, we'll store the token
// in localStorage using this key.
const AUTH_TOKEN_KEY = 'userToken';

let languageCode;

const httpLink = createHttpLink({
  uri: () => {
    if (languageCode) {
      return `${API_URL}?languageCode=${languageCode}`;
    } else {
      return API_URL;
    }
  },
  // This is required if using cookie-based session management,
  // so that any cookies get sent with the request.
  credentials: 'include',
});

// This part is used to check for and store the session token
// if it is returned by the server.
const afterwareLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    const context = operation.getContext();
    const authHeader = context.response.headers.get('vendure-auth-token');
    if (authHeader) {
      // If the auth token has been returned by the Vendure
      // server, we store it in localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, authHeader);
    }
    return response;
  });
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      if (message.includes('Network error')) {
        setGlobalError({
          message: 'Network issue detected. Please check your connection.',
          onRetry: () => window.location.reload(), // Example retry action
        });
      }
    });
  }
  if (networkError) {
    setGlobalError({
      message: 'A network error occurred. Please try again later.',
      onRetry: () => window.location.reload(), // Example retry action
    });
  }
});

/**
 * Used to specify a language for any localized results.
 */
export function setLanguageCode(value) {
  languageCode = value;
}

export const client = new ApolloClient({
  link: ApolloLink.from([
    // If we have stored the authToken from a previous
    // response, we attach it to all subsequent requests.
    setContext((request, operation) => {
      const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
      // let channelToken = import.meta.env.VITE_VENDURE_UH_CHANNEL_TOKEN; //urbana store token
      let channelToken = import.meta.env.VITE_VENDURE_DEMO_CHANNEL_TOKEN; //urbana store token
      if (subdomain === 'urbanahaat') {
        channelToken = import.meta.env.VITE_VENDURE_UH_CHANNEL_TOKEN; //sample store token
      }
      let headers = {};
      if (authToken) {
        headers.authorization = `Bearer ${authToken}`;
      }
      if (channelToken) {
        headers['vendure-token'] = channelToken;
      }
      return { headers };
    }),
    afterwareLink,
    httpLink,
  ]),
  cache: new InMemoryCache({
    typePolicies: {
      Order: {
        fields: {
          lines: {
            merge(existing = [], incoming = []) {
              const mergedLinesMap = new Map();
              existing.forEach((line) => {
                mergedLinesMap.set(line.__ref, line);
              });
              incoming.forEach((line) => {
                mergedLinesMap.set(line.__ref, line);
              });
              return Array.from(mergedLinesMap.values());
            },
          },
          shippingAddress: {
            merge(existing, incoming) {
              return incoming; // Always replace safely
            },
          },
        },
      },
      Product: {
        fields: {
          customFields: {
            merge(existing = {}, incoming) {
              return {
                ...existing,
                ...incoming,
              };
            },
          },
        },
      },
    },
  }),

  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network', // or 'network-only' if you want absolutely fresh data always
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
